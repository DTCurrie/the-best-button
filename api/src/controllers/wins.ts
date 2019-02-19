import assert from 'assert';
import express, { Request, Response } from 'express';
import { MongoError } from 'mongodb';

import { db } from '../db';
import { Win } from '../../../core/win';

export const wins = express.Router();

wins.get('/', (_req: Request, res: Response) => {
    const collection = db().collection('wins');

    collection.find({}).toArray((findErr: MongoError, result: Array<Win>) => {
        assert.strictEqual(findErr, null, 'Could not find wins');
        res.status(200).json(result);
    });
});
