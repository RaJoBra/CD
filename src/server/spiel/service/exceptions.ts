import { logger } from '../../shared';

export class ValidationError implements Error {
    name = 'validationError';
    //readonly code = 4711 ?? Bedeutung

    constructor(public message: string) {
        logger.debug(`ValidationError.constructor(): ${message}`);
    }
}

export class TitelExistsError implements Error {
    name = `TitelExistsError`;

    constructor(public message: string) {
        logger.debug(`TitelExitsError.constructor (): ${message}`);
    }
}

export class VersionInvalidError implements Error {
    name = `VersionInvalidError`;

    constructor(public  message: string) {
        logger.debug(`VersionINvalidError.constructor(): ${message}`);
    }
}

export class SpielNotExistsError implements Error {
    name = `SpielNotExitstError`;

    constructor(public message: string) {
        logger.debug(`SpielNotExistsError.constructor (): ${message}`);
    }
}