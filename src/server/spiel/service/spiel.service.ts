import * as uuid from 'uuid/v4';
import { Spiel, validateSpiel} from '../model/spiel';
import {
    SpielNotExistsError,
    TitelExistsError,
    ValidationError,
    VersionInvalidError,
} from './exceptions';
import { Document, startSession } from 'mongoose';
import { logger, mockDB, sendMail } from '../../shared';
import { SpielServiceMock } from './mock';
import { remove } from 'fs-extra';

export class SpielService {
    private readonly mock: SpielServiceMock | undefined;

    constructor () {
        if (mockDB) {
            this.mock = new SpielServiceMock();
        }
    }

    async findByID(id: string ) {
        if( this.mock !== undefined) {
            return this.mock.findByID(id);
        }
        logger.debug(`SpielService.findByID(): id= ${id}`);
        return Spiel.findById(id);
    }

    async find(query?: any) {
        if(this.mock !== undefined) {
            return this.mock.find(query);
        }

        logger.debug(`SpielService.find(): query = ${query}`);
        const tmpQuery = Spiel.find();

        // alle buecher Asynchron suchen und nach ihrem titel aufsteigend sortiern 
        if (query === undefined || Object.keys(query).length ===0) {
            return tmpQuery.sort(`title`);
        }

        const { titel, javascript, typescript, ...dbQuery} =query;

        if (titel !== undefined) {
            dbQuery.titel = RegExp(titel, 'iu');
        }

       // if (javascript == 'true') {
       //     dbQuery.schlagwoerter = [''];
       // }
       logger.debug(`SpielService.find(): dbQuery=${dbQuery}`);

       return Spiel.find(dbQuery);
       //Gibt leeres Array zurück falls nichts gefunden wird
       //Wenn ich weiß es kann nur eins gefunden werden findOne()
       // findOne() liefert null zurück falls nichts gerufnden wird
    }

    async create(spiel: Document) {
        if(this.mock !== undefined) {
            return this.mock.create(spiel);
        }

        const err = validateSpiel(spiel);
        if (err !== undefined) {
            const message = JSON.stringify(err);
            logger.debug(
                `SpielService.create(): Validation Message; ${message}`,
            );
            //Ruckgabe eines Promise<void>
            return Promise.reject(new ValidationError(message));
        }

        const session = await startSession();
        session.startTransaction();

        const { titel }: { titel: string } = spiel as any;
        let tmp = await Spiel.findOne({ titel });
        if ( tmp !== null ) {
            return Promise.reject (
                new TitelExistsError(`Der Titel ${titel} exestiert bereits`),
            );
        }

        spiel._id = uuid();
        const spielSaved= await spiel.save();
        
        await session.commitTransaction();
        session.endSession();

        logger.debug(
            `SpielService.create(): spielSaved = ${JSON.stringify(spielSaved)}`,
        );

        const to = `Raphel@Brand.mail`;
        const subject = `Neues Spiel ${spielSaved._id}`;
        const body = `Das Buch mit dem Titel <strong>${titel}<strong> ist angelgt`;
        logger.debug(`sendMAil wird aufgerufen: ${to} / ${subject} /${body}`);
        sendMail(to, subject,body);

        return spielSaved;
    }

    async update(spiel: Document, versionStr: string) {
        if (this.mock !== undefined) {
            return this.mock.update(spiel);
        }

        if(versionStr === undefined ){
            return Promise.reject(
                new VersionInvalidError(`Die Versionsnummer fehlt`),
            );
        }

        const version = Number.parseInt(versionStr,10);
        if (Number.isNaN(version)) {
            return Promise.reject (
                new VersionInvalidError ('Die Versionsnummer ist ungueltig'),
            );
        }
        logger.debug(`BuchService.update(): version= ${version}`);

        logger.debug(`SpielService.update(): spiel= ${JSON.stringify(spiel)}`);
        const err = validateSpiel(spiel);
        if(err !== undefined) {
            const message = JSON.stringify(err);
            logger.debug(
                `BuchService.update(): Validation Message: ${message}`,
            );

            return Promise.reject(new ValidationError(message));
        }

        const { title }: { title: string} = spiel as any;
        const tmp = await Spiel.findOne({ title });
        if (tmp !== null && tmp._id !== spiel._id) {
            return Promise.reject (
                new TitelExistsError(
                    `Der Titel "${title}" existiert bereteis bei ${tmp._id}`,
                ),
            );
        }

        const spielDb = await Spiel.findById(spiel._id);
        if(spielDb === null) {
            return Promise.reject(
                new SpielNotExistsError(`Kein Spiel mit ID ${spiel._id}`),
            );
        }
        if(version < spielDb.toObject().__v) {
            return Promise.reject(
                new VersionInvalidError(
                    `Die Versionsnummer ${version} ist nicht aktuell`,
                ),
            );
        }

        const result = await Spiel.findByIdAndUpdate(spiel._id, spiel);
        if (result === null) {
            return Promise.reject (
                new VersionInvalidError(
                    `Kein Buch mit ID ${spiel._id} und Version ${version}`,
                ),
            );
        }

        logger.debug(`SpielService.update(): resulut = ${JSON.stringify(result)}`);
        
        return Promise.resolve(result);

    }
    
    async remove(id: string) {
        if (this.mock !== undefined) {
            return this.mock.remove(id);
        }

        logger.debug(`SpielService.remove(): id =${id}`);

        //DAs Buch zur gegeben ID asynchron lössschen entspricht findONdAnd REmove{_id:id}
        const speilPromise = Spiel.findByIdAndRemove(id);

        return speilPromise.then(spiel =>
            logger.debug(

                `SpielService.remove(): geloescht= ${JSON.stringify(spiel)}`
            ),
        );

    }
}