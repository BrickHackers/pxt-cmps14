enum CMPS14_Precision {
    //% block="Whole degrees (0-359°)"
    Degrees = 1,
    //% block="Tenths of degree (0-359.9°)"
    Tenths = 2,
    //% block="Byte range (0-255)"
    Byte = 3
}

/**
 * Custom blocks for CMPS14 navigation sensor
 */
//% weight=100 color=#0fbc11 icon="\uf21d"
//% groups='["Navigation", "Spatial Position", "Settings", "Magnetometer", "Accelerometer", "Gyroscope"]'
namespace CMPS14 {

    /**
     * Reads the current azimuth from the CMPS14 sensor with selected precision.
     */
    //% block="azimuth from CMPS14 with precision %precision || address %addr"
    //% addr.defl=0xC0
    //% precision.defl=CMPS14_Precision.Degrees
    //% group="Navigation"
    //% weight=100
    export function readAzimuth(precision: CMPS14_Precision = CMPS14_Precision.Degrees, addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        if (precision == CMPS14_Precision.Byte) {
            pins.i2cWriteNumber(i2cAddr, 0x01, NumberFormat.Int8LE, true);
            return pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false);
        } else {
            pins.i2cWriteNumber(i2cAddr, 0x02, NumberFormat.Int8LE, true);
            let raw = pins.i2cReadNumber(i2cAddr, NumberFormat.UInt16BE, false);
            if (precision == CMPS14_Precision.Tenths) { return raw / 10; }
            else { return Math.round(raw / 10); }
        }
    }

    /**
     * Calculates heading deviation between target heading and current azimuth.
     */
    //% block="heading deviation to target %targetHeading with precision %precision || address %addr"
    //% addr.defl=0xC0
    //% precision.defl=CMPS14_Precision.Degrees
    //% group="Navigation"
    //% weight=90
    export function getDeviation(targetHeading: number, precision: CMPS14_Precision = CMPS14_Precision.Degrees, addr: number = 0xC0): number {
        let current = readAzimuth(precision, addr);
        let deviation = targetHeading - current;
        while (deviation < -180) deviation += 360;
        while (deviation > 180) deviation -= 360;
        if (precision == CMPS14_Precision.Degrees) { return Math.round(deviation); }
        return Math.round(deviation * 10) / 10;
    }

    /**
     * Reads pitch (X-axis tilt).
     */
    //% block="pitch from CMPS14 || address %addr"
    //% addr.defl=0xC0
    //% group="Spatial Position"
    //% weight=80
    export function readPitch(addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, 0x1A, NumberFormat.Int8LE, true);
        let raw = pins.i2cReadNumber(i2cAddr, NumberFormat.Int16BE, false);
        return raw / 10;
    }

    /**
     * Reads roll (Y-axis tilt).
     */
    //% block="roll from CMPS14 || address %addr"
    //% addr.defl=0xC0
    //% group="Spatial Position"
    //% weight=70
    export function readRoll(addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, 0x1C, NumberFormat.Int8LE, true);
        let raw = pins.i2cReadNumber(i2cAddr, NumberFormat.Int16BE, false);
        return raw / 10;
    }

    /**
     * Reads calibration status.
     */
    //% block="calibration status from CMPS14 || address %addr"
    //% addr.defl=0xC0
    //% group="Settings"
    //% weight=60
    export function readCalibration(addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, 0x1E, NumberFormat.Int8LE, true);
        return pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false);
    }

    /**
     * Stores current calibration profile to flash.
     */
    //% block="store calibration profile to flash || address %addr"
    //% addr.defl=0xC0
    //% group="Settings"
    //% weight=50
    export function storeCalibration(addr: number = 0xC0): void {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, (0x00 << 8) | 0xF0, NumberFormat.UInt16BE, false); basic.pause(20);
        pins.i2cWriteNumber(i2cAddr, (0x00 << 8) | 0xF5, NumberFormat.UInt16BE, false); basic.pause(20);
        pins.i2cWriteNumber(i2cAddr, (0x00 << 8) | 0xF6, NumberFormat.UInt16BE, false); basic.pause(20);
    }

    /**
     * Changes I2C address. 
     */
    //% block="change I2C address from %oldAddr to %newAddr"
    //% oldAddr.defl=0xC0 newAddr.defl=0xC2
    //% group="Settings"
    //% weight=40
    export function changeAddress(oldAddr: number = 0xC0, newAddr: number = 0xC2): void {
        let i2cAddr = oldAddr >> 1;
        pins.i2cWriteNumber(i2cAddr, (0x00 << 8) | 0xA0, NumberFormat.UInt16BE, false); basic.pause(20);
        pins.i2cWriteNumber(i2cAddr, (0x00 << 8) | 0xAA, NumberFormat.UInt16BE, false); basic.pause(20);
        pins.i2cWriteNumber(i2cAddr, (0x00 << 8) | 0xA5, NumberFormat.UInt16BE, false); basic.pause(20);
        pins.i2cWriteNumber(i2cAddr, (0x00 << 8) | newAddr, NumberFormat.UInt16BE, false); basic.pause(20);
    }

    // ==========================================
    // "MORE..." SECTION (ADVANCED) + INDIVIDUAL GROUPS
    // ==========================================

    // --- MAGNETOMETER ---
    /**
     * Raw magnetometer value for X axis.
     */
    //% block="raw magnetometer X || address %addr"
    //% addr.defl=0xC0
    //% group="Magnetometer" advanced=true
    export function rawMagnetometerX(addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, 0x06, NumberFormat.Int8LE, true);
        return pins.i2cReadNumber(i2cAddr, NumberFormat.Int16BE, false);
    }

    /**
     * Raw magnetometer value for Y axis.
     */
    //% block="raw magnetometer Y || address %addr"
    //% addr.defl=0xC0
    //% group="Magnetometer" advanced=true
    export function rawMagnetometerY(addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, 0x08, NumberFormat.Int8LE, true);
        return pins.i2cReadNumber(i2cAddr, NumberFormat.Int16BE, false);
    }

    /**
     * Raw magnetometer value for Z axis.
     */
    //% block="raw magnetometer Z || address %addr"
    //% addr.defl=0xC0
    //% group="Magnetometer" advanced=true
    export function rawMagnetometerZ(addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, 0x0A, NumberFormat.Int8LE, true);
        return pins.i2cReadNumber(i2cAddr, NumberFormat.Int16BE, false);
    }

    // --- ACCELEROMETER ---
    /**
     * Acceleration in X axis compensated for gravity (in m/s²).
     */
    //% block="accelerometer X (m/s²) || address %addr"
    //% addr.defl=0xC0
    //% group="Accelerometer" advanced=true
    export function accelerationX(addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, 0x0C, NumberFormat.Int8LE, true);
        let raw = pins.i2cReadNumber(i2cAddr, NumberFormat.Int16BE, false);
        return raw / 256;
    }

    /**
     * Acceleration in Y axis compensated for gravity (in m/s²).
     */
    //% block="accelerometer Y (m/s²) || address %addr"
    //% addr.defl=0xC0
    //% group="Accelerometer" advanced=true
    export function accelerationY(addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, 0x0E, NumberFormat.Int8LE, true);
        let raw = pins.i2cReadNumber(i2cAddr, NumberFormat.Int16BE, false);
        return raw / 256;
    }

    /**
     * Acceleration in Z axis compensated for gravity (in m/s²).
     */
    //% block="accelerometer Z (m/s²) || address %addr"
    //% addr.defl=0xC0
    //% group="Accelerometer" advanced=true
    export function accelerationZ(addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, 0x10, NumberFormat.Int8LE, true);
        let raw = pins.i2cReadNumber(i2cAddr, NumberFormat.Int16BE, false);
        return raw / 256;
    }

    // --- GYROSCOPE ---
    /**
     * Raw gyro rotation speed value (X axis).
     */
    //% block="gyroscope X || address %addr"
    //% addr.defl=0xC0
    //% group="Gyroscope" advanced=true
    export function rawGyroX(addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, 0x12, NumberFormat.Int8LE, true);
        return pins.i2cReadNumber(i2cAddr, NumberFormat.Int16BE, false);
    }

    /**
     * Raw gyro rotation speed value (Y axis).
     */
    //% block="gyroscope Y || address %addr"
    //% addr.defl=0xC0
    //% group="Gyroscope" advanced=true
    export function rawGyroY(addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, 0x14, NumberFormat.Int8LE, true);
        return pins.i2cReadNumber(i2cAddr, NumberFormat.Int16BE, false);
    }

    /**
     * Raw gyro rotation speed value (Z axis).
     */
    //% block="gyroscope Z || address %addr"
    //% addr.defl=0xC0
    //% group="Gyroscope" advanced=true
    export function rawGyroZ(addr: number = 0xC0): number {
        let i2cAddr = addr >> 1;
        pins.i2cWriteNumber(i2cAddr, 0x16, NumberFormat.Int8LE, true);
        return pins.i2cReadNumber(i2cAddr, NumberFormat.Int16BE, false);
    }
}
