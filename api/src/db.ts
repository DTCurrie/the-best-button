
import { Db, MongoClient, MongoError } from 'mongodb';

let _client: MongoClient;
export const client = () => _client;

let _db: Db;
export const db = () => _db;

export const connect = async (onError: (error: MongoError) => void): Promise<MongoClient> => {
    try {
        _client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
        _db = _client.db('the-best-button');
        return _client;
    } catch (error) {
        onError(error);
        throw error;
    }
};
