const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mariadb = require('mariadb');
const { dbName, dbHost, dbUser, dbPass } = require('../config');

// make sure the database exists before using sequelize
const pool = mariadb.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPass
});
(async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
    }
})();

// sequelize
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    dialect: 'mariadb',
    logging: false,
    // logging: (str) => {
    //     console.log(str + '\n');
    // },
    dialectOptions: {
        timezone: 'Etc/GMT+1',
        useUTC: false
    },
    define: {
        freezeTableName: true
    }
});

// table definitions (will create them if not exists)
const reservations = sequelize.define('reservations', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    number: {
        // the number that the reservations will be grouped by
        type: Sequelize.INTEGER,
        allowNull: false
    },
    guestId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    itemId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    objectId: { type: Sequelize.INTEGER },
    dateArrival: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    dateDeparture: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false
    },
    costTotal: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    costPaid: { type: Sequelize.DECIMAL },
    amountUnpaid: { type: Sequelize.DECIMAL },
    unpaidSince: { type: Sequelize.DATEONLY },
    validationStatus: { type: Sequelize.STRING },
    bookMethod: {
        type: Sequelize.STRING,
        allowNull: false
    },
    preferredReservation: {
        // whether the guest has a preferred place to reserve
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    reservedPlace: {
        // place reserved for guest
        type: Sequelize.STRING,
        allowNull: false
    }
});

const guests = sequelize.define('guests', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    pronoun: { type: Sequelize.STRING },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    address: {
        type: Sequelize.STRING,
        allowNull: false
    },
    zipCode: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cityTown: {
        type: Sequelize.STRING,
        allowNull: false
    },
    country: {
        type: Sequelize.STRING,
        allowNull: false
    },
    brochureDate: { type: Sequelize.DATEONLY },
    phone: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    mobilePhone: { type: Sequelize.INTEGER },
    licensePlate: { type: Sequelize.STRING },
    unwanted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    firstArrival: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

const objectRow = sequelize.define('objectRow', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    code: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: { type: Sequelize.STRING },
    cost: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    method: { type: Sequelize.STRING },
    bill: { type: Sequelize.STRING },
    active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }
});

const objects = sequelize.define('objects', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    code: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    objectKind: {
        type: Sequelize.STRING,
        allowNull: false
    },
    objectType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    baseCost: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    owner: {
        // the owner of the object, null if company owns the object
        type: Sequelize.STRING,
        defaultValue: null
    },
    lendOut: {
        // whether the object is currently lend out
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    lendOutSince: { type: Sequelize.DATEONLY },
    blocked: {
        // whether the object is blocked from rental
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    blockedSince: { type: Sequelize.DATEONLY },
    blockedUntil: { type: Sequelize.DATEONLY },
});

const users = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userName: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    superUser: {
        // if true, user has administrator permissions
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            const salt = await bcrypt.genSaltSync(10);
            user.password = await bcrypt.hashSync(toString(user), salt);
        }
    },
    instanceMethods: {
        validPassword: async password => {
            return await bcrypt.compareSync(password, this.password);
        }
    }
});

const tables = {
    guests,
    objectRow,
    objects,
    reservations,
    users
};

(async () => {
    // sync all tables
    for (const table in tables) await tables[table].sync({ force: false });
    // relations
    tables.reservations.hasOne(guests, { sourceKey: 'guestId', foreignKey: 'id', as: 'reservationGuest' });
    tables.reservations.hasOne(objectRow, { sourceKey: 'itemId', foreignKey: 'id', as: 'reservationObjectRow' });
    tables.reservations.hasOne(objects, { sourceKey: 'objectId', foreignKey: 'id', as: 'reservationObject' });
    tables.objectRow.hasMany(objects, { sourceKey: 'code', foreignKey: 'code', as: 'objectRowObjects' });

    // test data
    await tables.reservations.findOrCreate({
        defaults: {
            number: 1,
            guestId: 1,
            itemId: 1,
            objectId: 1,
            dateArrival: new Date(),
            dateDeparture: new Date(),
            status: 1,
            costTotal: 10,
            costPaid: 5,
            amountUnpaid: 10-5,
            unpaidSince: new Date(),
            validationStatus: null,
            bookMethod: 'email',
            preferredReservation: true,
            reservedPlace: '12'
        },
        where: { id: 1 }
    }).catch(e => console.error(e));

    await tables.guests.findOrCreate({
        defaults: {
            pronoun: 'Dhr.',
            name: 'Buitenkamp, S',
            email: 'buitenkamp.developer@gmail.com',
            address: 'jongebuorren 5',
            zipCode: '8493 LX',
            country: 'Nederland',
            brochureDate: null,
            phone: '0613101625',
            mobilePhone: null,
            licensePlate: '43-lxr-q',
            unwanted: false,
            firstArrival: true,
            cityTown: 'Terherne'
        },
        where: { id: 1 }
    }).catch(e => console.error(e));

    await tables.objectRow.findOrCreate({
        defaults: {
            code: 'fts',
            description: 'fiets',
            cost: 22.50,
            method: 'idk',
            bill: '123456',
            active: true
        },
        where: { id: 1 }
    }).catch(e => console.error(e));

    await tables.objects.findOrCreate({
        defaults: {
            code: 'fts',
            description: 'fiets 1',
            objectKind: 'fiets',
            objectType: 'null',
            baseCost: 200.00,
            owner: null,
            lendOut: false,
            lendOutSince: null,
            blocked: false,
            blockedSince: null,
            blockedUntil: null
        },
        where: { id: 1 }
    }).catch(e => console.error(e));

    await tables.users.findOrCreate({
        defaults: {
            userName: 'sbuik',
            password: 'admin123',
            superUser: true,
            createdAt: null,
            updatedAt: null
        },
        where: { id: 1 }
    }).catch(e => console.error(e));

    await tables.users.findOrCreate({
        defaults: {
            userName: 'tnoor',
            password: 'test',
            superUser: false,
            createdAt: null,
            updatedAt: null
        },
        where: { id: 2 }
    }).catch(e => console.error(e));

    // beam me up Scotty
    for (const table in tables) module.exports[table] = tables[table];
    // module.exports = tables;
})();