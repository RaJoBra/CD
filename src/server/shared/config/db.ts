import * as mongoose from 'mongoose';
import { join } from 'path';
import { logger } from '../logger';
import { readFileSync } from 'fs';
import stringfy from 'fast-safe-stringify';

const { DB_HOST, DB_PORT } = process.env;
const host = DB_HOST ?? 'localhost';

const portStr = DB_PORT ?? '27017';
const port = parseInt(portStr,10);

const url = 'mongodb://${host}:${port}';