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
import { SpielServiceMock } from './mock'