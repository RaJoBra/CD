import * as mongoose from 'mongoose';
import {
    SpielMultimediaService,
    SpielNotExistsError,
    SpielService,
    TitleExistsError,
    VersionsInvalidError,
} from '../service';
import { HttpStatus, MIME_CONFIG, getBaseUri, logger} from '../../shared';
import { Request, Response} from 'express';
import { Spiel } from '../model/spiel';
import stringify from 'fast-safe-stringify';
import { unlink } from 'fs';