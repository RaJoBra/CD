import 'source-map-support/register';
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';
import {SERVER_CONFIG, connectDB, logger} from './shared';