import * as validator from 'validator';
import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from './httpStatus';
import { inspect } from './util';
import { logger } from './logger';

class SharedRequestHandler {
    private static readonly SPACE = 2;

    logRequestHeader(req: Request, _:Response, next: NextFunction){
        logger.debug(
            `Request: headers=${JSON.stringify(
                req.headers,
                undefined,
                SharedRequestHandler.SPACE,
            )}`,
        );
        logger.debug(
            `Request: protokol=${JSON.stringify(
                req.protocol,
                undefined,
                SharedRequestHandler.SPACE,
            )}`,
        );
        logger.debug(
            `Request: boedy = ${JSON.stringify(
                req.hostname,
                undefined,
                SharedRequestHandler.SPACE,
            )}`,
        );
        if (req.body !== undefined){
            logger.debug(
                `Request: body=${JSON.stringify(
                    req.body,
                    undefined,
                    SharedRequestHandler.SPACE,
                )}`,
            );
        }
        Object.keys(req).forEach(key =>{
            if(Object.prototype.hasOwnProperty.call(req,key)){
                logger.log(`silly`, `Request-Key: ${key}`);
            }
        });

        next();
    }

    validateUUID(_: Request, res: Response, next: NextFunction, id: any){
        if (validator.isUUID(id))
    }

}