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
                let item = await db.collection("newspappers").findOne({ _id: ObjectID(id) });

                resolve(await item);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function add(item) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const addItem = await db.collection("newspappers").insertOne(item)

                resolve(addItem.ops[0]);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function update(id, newItem) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const updateItem = await db.collection("newspappers")
                    .findOneAndReplace({ _id: ObjectID(id) }, newItem, { returnOriginal: false })

                resolve(updateItem.value);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function remove(id) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const removed = await db.collection("newspappers").deleteOne({ _id: ObjectID(id) })

                resolve(removed.deletedCount === 1);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function averageFinalists() {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const average = await db.collection("newspappers").aggregate([
                    {
                        $group: {
                            _id: null,
                            avgFinalists: {
                                $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014"
                            }
                        }
                    }
                ]).toArray();

                resolve(average[0].avgFinalists);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function averageFinalistsByChange() {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const average = await db.collection("newspappers").aggregate([
                    {
                        $project: {
                            "Newspapper": 1,
                            "Pulitzer Prize Winners and Finalists, 1990-2014": 1,
                            "Change in Daily Circulation, 2004-2013": 1,
                            overallChange: {
                                $cond: { if: { $gte: ["Change in Daily Circulation, 2004-2013", 0]}, then: "positive", else: "negative"}
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$overallChange",
                            avgFinalists: {
                                $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014"
                            }
                        }
                    }
                ]).toArray();

                resolve(average);
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

                const results = await db.collection('newspappers').insertMany(data);
                resolve(results);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    return { loadData, get, getById, add, update, remove, averageFinalists, averageFinalistsByChange }
}

module.exports = circulationRepo();