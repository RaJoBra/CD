import * as gridFsStream from 'gridfs-stream';
import * as mongo from 'mongodb';
import { HttpStatus, downloadDir, getExtension, logger } from '../../shared';
import { createReadStream, createWriteStream, unlink } from 'fs-extra';
import { Spiel } from '../model/spiel';
import { connection } from 'mongoose';
import { join } from 'path';
import stringify from 'fast-safe-stringify';

export class SpielMultimediaService {
    async save(id: string, filePath: string, mimetype: string) {
       logger.debug(
           `SpielMultimediaService.sabe(): id = ${id} ,` +
           `filePath=${filePath}, mimetype = ${mimetype}`,
       ) ;

       if (filePath === undefined ) {
           return false;
       }

       const spiel = await Spiel.findById(id);
       if (spiel === null) {
           return false;
       }

       const gfs = gridFsStream(connection.db, mongo);
       gfs.remove({ filename: id }, err => {
           if (err !== undefined) {
                logger.error(
                    `SpielMuldimediaSerice.save(): Error: ${stringify(err)}`,
                );
                throw err;
           }
           logger.debug(
               `SpielMultimediaService.save(): IN GridFS geloescht: ${id}`
           );
       });

       const writestream = gfs.createWriteStream({
           filename: id,
           content_type: mimetype,
       });

       createReadStream(filePath).pipe(writestream);

       const closeFn = (file: any) => {
           logger.debug(
               `SpielMultimediaService.save(): ` +
               `In GridFS gespeicher: ${file.filename}`,
           );
           unlink(filePath)
            .then(() =>
                logger.debug (
                    `SpielMultimediaService.save: ${filePath} geloescht`,
                ),    
            )
            .catch(() =>
                logger.error(
                    `SpielMultimediaService.save(): Fehler beim Loeschen von ${filePath}`,
                ),
            );
       };
       writestream.on('close', closeFn);

       return true;
    }

    async findMedia(
        filename: string,
        sendFileCb: (pathname: string) => void,
        sendErrCb: (statuscode: number) => void,
    ) {
        logger.debug(`SpielMultimediaService.findMedia(): filename${filename}`);
        if (filename === undefined ) {
            sendErrCb(HttpStatus.NOT_FOUND);
            return;
        }

        const spiel = await Spiel.findById(filename);
        if(spiel === null) {
            sendErrCb(HttpStatus.NOT_FOUND);
            return;
        }
        logger.debug(
            `SpielMultimediaService.findMedia(): spiel=${JSON.stringify(spiel)}`,
        );

        const gfs = gridFsStream(connection.db, mongo);
        
        const readstream = gfs.createReadStream({  filename });
        readstream.on('error', (err: any) =>{
            if (
                err.name === 'MongoError' &&
                err.message ===
                `file with id ${filename} not opend for writing`
            ) {
                sendErrCb(HttpStatus.NOT_FOUND);
            } else {
                logger.error(
                    `SpielMultimediaService.findMedia(): Error: ${stringify(
                        err,
                    )}`,
                );
                sendErrCb(HttpStatus.INTERNAL_ERROR);
            }
        });

        const cbReadFile = (_: Error, file: any) => {
            const mimeType: string = file.cointentType;
            logger.debug(
                `BuchMultimediaService.findMedia(): mimeType = ${mimeType}`,
            );
            const pathname = join(downloadDir, filename);
            const pathnameExt = `${pathname}.${getExtension(mimeType)}`;

            // schreiben in temporärer Datein
            const writestream = createWriteStream(pathnameExt);
            writestream.on('close', () => {
                logger.debug(
                    `SpielMultimediaService: cbReadFile(): ${pathnameExt}`,
                );
                sendFileCb(pathnameExt);
            });
            readstream.pipe(writestream);
        };

        gfs.findOne( {filename }, cbReadFile);
    }
}