import assert from 'assert';
import express, { Request, Response } from 'express';
import { MongoError } from 'mongodb';

import { db } from '../db';
import { Week } from '../../../core/week';

export const weeks = express.Router();

weeks.get('/', (_req: Request, res: Response) => {
    const collection = db().collection('weeks');

    collection.find({}).toArray((findErr: MongoError, result: Array<Week>) => {
        assert.strictEqual(findErr, null, 'Could not find weeks');
        res.status(200).json(result);
    });
});
