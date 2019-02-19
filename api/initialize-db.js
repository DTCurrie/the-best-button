import {
    strictEqual
} from 'assert';
import {
    MongoClient
} from 'mongodb';

import {
    url,
    dbName
} from './dist/config/db';

const client = new MongoClient(url);

function color(_id) {
    return {
        _id,
        votes: 0,
        active: false,
        wins: []
    };
}

const colorDocs = [
    color('red'),
    color('blue'),
    color('green'),
    color('yellow')
];

client.connect((err) => {
    strictEqual(null, err);
    console.log('Connected to database');

    const db = client.db(dbName);

    console.log('Creating collections');

    const colors = db.collection('colors');

    colors.insertMany(colorDocs, (err, result) => {
        strictEqual(err, null);
        strictEqual(4, result.result.n);
        strictEqual(4, result.ops.length);
        console.log("Inserted colors into 'colors' collection");
        client.close();
    });
});