const { MongoClient, ObjectID } = require("mongodb");

function circulationRepo() {
    const url = "mongodb://localhost:27017";
    const dbName = 'circulation';

    function get(query, limit) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);

                let item = db.collection("newspappers").find(query);

                if (limit > 0) {
                    item.limit(limit);
                }

                resolve(await item.toArray());
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function getById(id) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                let item = await db.collection("newspappers").findOne({_id: ObjectID(id)});

                resolve(await item);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function loadData(data) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);

                results = await db.collection('newspappers').insertMany(data);
                resolve(results);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    return { loadData, get, getById }
}

module.exports = circulationRepo();