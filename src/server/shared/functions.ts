import { IncomingMessage, ServerResponse } from 'http';
import { logger } from './logger';
import { promisify } from 'util';
import { readFile } from 'fs';

// Prüfen ist Objekt ein String
export const isString = (obj: unknown) => typeof obj === 'string';

//Function readFile ist Asynchron und erfordert Callback
// wird deshlab in einem Promise gekapsel -> async, await dadruch machbar
export const readFileAsyn = promisify(readFile);

export const responseTimeFn: (
    req: IncomingMessage,
    res: ServerResponse,
    time: number,
) => void = (_, __, time) => logger.debug(`Respnose time: ${time} ms`);