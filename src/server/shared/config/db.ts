import * as mongoose from 'mongoose';
import { join } from 'path';
import { logger } from '../logger';
import { readFileSync } from 'fs';
import stringify from 'fast-safe-stringify';

export const mockDB = process.env.DB_MOCK === 'true';

const { DB_HOST, DB_PORT } = process.env;
const host = DB_HOST ?? 'localhost';

const portStr = DB_PORT ?? '27017';
const port = parseInt(portStr,10);

const url = 'mongodb://${host}:${port}';
const dbName = 'hska';
const user = 'admin';
const pass = 'p';
const authSource = 'admin';
const replicaSet = 'replicaSet';
const ssl = true;
const sslCert = readFileSync(join(__dirname, 'certificate.cer'));

const useNewUrlParser = true;
const useFindAndModify = false;
const useCreateIndex = true;
const useUnifiedTopology = true;

mongoose.pluralize(undefined);

export const connectDB = async () =>{
    if (mockDB){
        console.warn('Mocking: Keine DB-Verbindung');
        return;
    }

    const { connection } = mongoose;
    console.info(`URL fuer mongoose: ${url}`);
    
    //shorthand Feaute
    const options: mongoose.ConnectionOptions = {
        user,
        pass,
        authSource,
        dbName,
        replicaSet,
        ssl,
        sslCert,
        useNewUrlParser,
        useFindAndModify,
        useCreateIndex,
        useUnifiedTopology,
    };

    try {
        await mongoose.connect(url, options);
    } catch ( err ){
        logger.error(`${stringify(err)}`);
        logger.error(`FEHLER beim Aufbau der DB-Verbindung ${err.message}\n`);
        process.exit(0);
    } 
    logger.info(`DB-Verbindung zu ${connection.db.databaseName} ist aufgebaut`);

    connection.on(`disconnecting`, () =>
        logger.warn(`DB-Verbindung wir geschlossen...`),
    );
    connection.on(`disconnected`, () =>
        logger.warn('DB-Verbindung ist geschlossen.'),
    );
    connection.on('error', () => logger.error(`Fehlerhafte DB-Verbindung`));
};
