const strictEqual = require('assert').strictEqual;
const MongoClient = require('mongodb').MongoClient;

const client = new MongoClient('mongodb://localhost:27017', {
    useNewUrlParser: true
});

function createColor(_id) {
    return {
        _id,
        votes: 0,
        active: false,
        wins: []
    };
}

const colorDocs = [
    createColor('red'),
    createColor('blue'),
    createColor('green'),
    createColor('yellow')
];

function startOfWeek(date) {
    const newDate = new Date(date);
    const diff = newDate.getDate() - newDate.getDay() + (newDate.getDay() === 0 ? -7 : 0);
    const dateString = new Date(newDate.setDate(diff)).toLocaleDateString('en-US');
    return dateString;
}

function createWin(week) {
    const color = Object.keys(week.stats).reduce((a, b) => week.stats[a].votes > week.stats[b].votes ? a : b);
    return {
        color,
        votes: week.stats[color].votes,
        week: week._id
    };
}


function createWeek(date) {
    const week = {
        date,
        stats: {
            red: {
                votes: Math.floor(Math.random() * 50)
            },
            blue: {
                votes: Math.floor(Math.random() * 50)
            },
            green: {
                votes: Math.floor(Math.random() * 50)
            },
            yellow: {
                votes: Math.floor(Math.random() * 50)
            },
        }
    };

    return week;
}

client.connect((err) => {
    strictEqual(null, err);
    console.log(' - Connected to database');

    const db = client.db('the-best-button');
    const colors = db.collection('colors');
    const weeks = db.collection('weeks');
    const wins = db.collection('wins');
    const voters = db.collection('voters');

    const current = startOfWeek(new Date());
    const currentWeek = createWeek(current);

    const older = startOfWeek(new Date(current));
    const olderWeek = createWeek(older, true);

    const oldest = startOfWeek(new Date(older));
    const oldestWeek = createWeek(oldest, true);

    console.log(' - Creating collections');

    const insertColors = new Promise((resolve, reject) => {
        console.log(' - - Creating colors');
        colors.insertMany(colorDocs, (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            console.log(" - - - Inserted colors into 'colors' collection");
            resolve(result);
        });
    });

    const insertWeeks = new Promise((resolve, reject) => {
        console.log(' - - Creating weeks');

        const weekDocs = [
            oldestWeek,
            olderWeek,
            currentWeek
        ];

        weeks.insertMany(weekDocs, (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            console.log(" - - - Inserted weeks into 'weeks' collection");
            resolve(result);
        });
    });

    const insertWin = (week) => new Promise((resolve, reject) => {
        console.log("      Adding wins to previous weeks");

        wins.insertOne(createWin(week), (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            console.log(" - - - - Insert win for week ", week.date);
            resolve(result);
        });
    });

    const updateWeek = (week, winResult) => new Promise((resolve, reject) => {
        weeks.findOneAndUpdate({
            date: week.date
        }, {
            $set: {
                win: winResult.insertedId
            }
        }, (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            console.log(" - - - - - Added win to week ", week.date);
            resolve(result);
        });
    })

    const updateWin = (weekResult, winResult) => new Promise((resolve, reject) => {

        wins.findOneAndUpdate({
            _id: winResult.insertedId
        }, {
            $set: {
                week: weekResult.value._id
            }
        }, (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            console.log(" - - - - - Added week to win ", result.value._id);
            resolve(result);
        });
    });

    const handleWin = (week) => insertWin(week).then((winResult) => updateWeek(week, winResult).then((weekResult) => updateWin(weekResult, winResult)));

    const insertVoter = new Promise((resolve, reject) => {
        console.log(' - - Creating current voter');

        voters.insertOne({
            current: true
        }, (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            console.log(" - - - Inserted voter into 'voters' collection");
            resolve(result);
        });
    });

    insertColors.then(() => {
        insertWeeks.then(() => {
            Promise.all([handleWin(olderWeek), handleWin(oldestWeek)]).then(() => {
                insertVoter.then(() => {
                    client.close()
                });

            });
        });
    });

    // insertColors.then(
    //     () => insertWeeks.then(
    //         () => insertWin(olderWeek).then((olderWinResult) => updateWeek(olderWeek, olderWinResult).then((olderWeekResult) => updateWin(olderWeekResult, olderWinResult).then(
    //             () => insertWin(oldestWeek).then((oldestWinResult) => updateWeek(olderWeek, oldestWinResult).then((oldestWeekResult) => updateWin(oldestWeekResult, oldestWinResult).then(
    //                 () => insertVoter.then(() => client.close())))))))));

    // colors.insertMany(colorDocs, (colorsErr, colorsResult) => {
    //     strictEqual(colorsErr, null);
    //     strictEqual(4, colorsResult.result.n);
    //     strictEqual(4, colorsResult.ops.length);
    //     console.log("    Inserted colors into 'colors' collection");

    //     console.log('  Creating weeks');
    //     const weeks = db.collection('weeks');

    //     const current = startOfWeek(new Date());
    //     const currentWeek = createWeek(current);

    //     const older = startOfWeek(new Date(current));
    //     const olderWeek = createWeek(older, true);

    //     const oldest = startOfWeek(new Date(older));
    //     const oldestWeek = createWeek(oldest, true);

    //     const weekDocs = [
    //         oldestWeek,
    //         olderWeek,
    //         currentWeek
    //     ];

    //     weeks.insertMany(weekDocs, (weeksErr, weeksResult) => {
    //         strictEqual(weeksErr, null);
    //         strictEqual(3, weeksResult.result.n);
    //         strictEqual(3, weeksResult.ops.length);
    //         console.log("    Inserted weeks into 'weeks' collection");

    //         console.log("      Adding wins to previous weeks");
    //         const wins = db.collection('wins');

    //         wins.insertOne(createWin(olderWeek), (olderWinErr, olderWinResult) => {
    //             strictEqual(olderWinErr, null);
    //             console.log("        Insert win for week ", olderWeek.date);

    //             weeks.findOneAndUpdate({
    //                 date: olderWeek.date
    //             }, {
    //                 $set: {
    //                     win: olderWinResult.insertedId
    //                 }
    //             }, (olderWeekErr, olderWeekResult) => {
    //                 strictEqual(olderWeekErr, null);
    //                 console.log("          Added win to week ", olderWeek.date);

    //                 wins.findOneAndUpdate({
    //                     _id: olderWinResult.insertedId
    //                 }, {
    //                     $set: {
    //                         week: olderWeekResult.value._id
    //                     }
    //                 }, (olderWinUpdateErr, olderWinUpdateResult) => {
    //                     strictEqual(olderWinUpdateErr, null);
    //                     console.log("          Added week to win ", olderWinUpdateResult.value._id);

    //                     wins.insertOne(createWin(oldestWeek), (oldestWinErr, oldestWinResult) => {
    //                         strictEqual(oldestWinErr, null);
    //                         console.log("        Insert win for week ", oldestWeek.date);

    //                         weeks.findOneAndUpdate({
    //                             date: oldestWeek.date
    //                         }, {
    //                             $set: {
    //                                 win: oldestWinResult.insertedId
    //                             }
    //                         }, (oldestWeekErr, oldestWeekResult) => {
    //                             strictEqual(oldestWeekErr, null);
    //                             console.log("          Added win to week ", oldestWeek.date);

    //                             wins.findOneAndUpdate({
    //                                 _id: oldestWinResult.insertedId
    //                             }, {
    //                                 $set: {
    //                                     week: oldestWeekResult.value._id
    //                                 }
    //                             }, (oldestWinUpdateErr, oldestWinUpdateResult) => {
    //                                 strictEqual(oldestWinUpdateErr, null);
    //                                 console.log("          Added week to win ", oldestWinUpdateResult.value._id);

    //                                 console.log('  Creating current voter');
    //                                 const voters = db.collection('voters');
    //                                 voters.insertOne({
    //                                     current: true
    //                                 }, (voterErr, _voterResult) => {
    //                                     strictEqual(voterErr, null);
    //                                     console.log("    Inserted voter into 'voters' collection");
    //                                 });

    //                                 client.close();
    //                             });
    //                         });
    //                     });
    //                 });
    //             });
    //         });
    //     });
    // });
});