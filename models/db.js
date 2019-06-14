const { connect, connection } = require('mongoose');
const { green, yellow, red, blue } = require('chalk');
const fs = require('fs');
const { dbName, dbHost, dbUser, dbPass } = require('../config');
const schemaFiles = fs.readdirSync(`${__dirname}/schemas`);
const models = {};
connect(`mongodb://${dbHost}/${dbName}`, { useNewUrlParser: true });
connection.once('open', () => console.log(green(`${blue(new Date())} | successfully connected to database`)));
connection.on('error', e => {
    console.log(yellow(`${blue(new Date())} | database connection error:`));
    console.error(red(e));
});
(async () => {
    // use await so the schemas aren't empty
    for (const schemaFile of schemaFiles) {
        const model = schemaFile.substr(0, schemaFile.length - 3);
        models[model] = await require(`${__dirname}/schemas/${schemaFile}`).model;
    }
    // const reservation1 = new schemas.reservations({
    //     number: 1,
    //     guestId: 1,
    //     objectId: 1,
    //     dateArrival: new Date(),
    //     dateDeparture: new Date(),
    //     status: 1,
    //     costTotal: 10,
    //     costPaid: 5,
    //     amountUnpaid: 10-5,
    //     unpaidSince: new Date(),
    //     validationStatus: null,
    //     bookMethod: 'email',
    //     preferredReservation: true,
    //     reservedPlace: '12',
    //     createdAt: new Date()
    // });

    // await reservation1.save().then(() => console.log('saved reservation1'));

    // const guest1 = new schemas.guests({
    //     pronoun: 'Dhr.',
    //     name: 'Buitenkamp, S',
    //     email: 'buitenkamp.developer@gmail.com',
    //     address: 'jongebuorren 5',
    //     zipCode: '8493 LX',
    //     country: 'Nederland',
    //     brochureDate: null,
    //     phone: '0613101625',
    //     mobilePhone: null,
    //     licensePlate: '43-lxr-q',
    //     unwanted: false,
    //     firstArrival: true,
    //     cityTown: 'Terherne'
    // });
    //
    // guest1.save().then(() => console.log('done'));

    // const user1 = new schemas.users({
    //     username: 'sbuik',
    //     password: 'admin123',
    //     superUser: true
    // });
    // const user2 = new schemas.users({
    //     username: 'tnoor',
    //     password: 'test',
    //     superUser: false
    // });
    // await user1.save().then(() => console.log('user created'));
    // await user2.save().then(() => console.log('user created'));

    // because module.exports = schema; doesn't work...
    for (const model in models) module.exports[model] = models[model];
})();


