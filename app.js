const MongoClient = require("mongodb").MongoClient;
const assert = require('assert');
const circulationRepo = require('./repositories/circulationRepo');
const data = require('./circulation.json');

const url = "mongodb://localhost:27017";
const dbName = 'circulation';
async function main() {
    const client = new MongoClient(url);
    await client.connect();
    try {
        const results = await circulationRepo.loadData(data);
        assert.equal(data.length, results.insertedCount);

        const getData = await circulationRepo.get();
        assert.equal(data.length, getData.length);

        const filterData = await circulationRepo.get(getData[4]);
        assert.deepEqual(filterData[0], getData[4]);

        const limitData = await circulationRepo.get({}, 3);
        assert.equal(limitData.length, 3);

        const id = getData[4]._id.toString()
        const byId = await circulationRepo.getById(id);
        assert.deepEqual(byId, getData[4])

        const newItem = {
            "Newspaper": "My paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
        }

        const addItem = await circulationRepo.add(newItem);
        assert(addItem._id);
        const addItemQuery = await circulationRepo.getById(addItem._id);
        assert.deepEqual(addItemQuery, newItem);

        const updateItem = await circulationRepo.update(addItem._id, {
            "Newspaper": "My updated paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
        });
        assert.equal(updateItem.Newspaper, "My updated paper");

        const updatedAddItemQuery = await circulationRepo.getById(addItem._id);
        assert.equal(updatedAddItemQuery.Newspaper, "My updated paper");

        const removed = await circulationRepo.remove(addItem._id);
        assert(removed);
        const removedItem = await circulationRepo.getById(addItem._id);
        assert.equal(removedItem, null);

        const avgFinalists = await circulationRepo.averageFinalists();
        console.log("avgFinalists", avgFinalists)

        const avgFinalistsByChange = await circulationRepo.averageFinalistsByChange();
        console.log("avgFinalists by change:", avgFinalistsByChange)

        // console.log("getData", getData.length)
    } catch (error) {
        console.log(error)
    } finally {
        const admin = client.db(dbName).admin();
        await client.db(dbName).dropDatabase();
        console.log(await admin.listDatabases())
        client.close();
    }
}

main();