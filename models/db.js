const Sequelize = require('sequelize');
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
    logging: false
});

const reservations = sequelize.define('reservations', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    number: {
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
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    location: {
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

const items = sequelize.define('items', {
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
    owner: { type: Sequelize.STRING },
    lendOut: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    lendOutSince: { type: Sequelize.DATEONLY },
    blocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    blockedSince: { type: Sequelize.DATEONLY },
    blockedUntil: { type: Sequelize.DATEONLY },
});

const tables = {
    reservations,
    guests,
    items,
    objects
};

(async () => {
    for (const table in tables) await tables[table].sync({ force: false });
})();

module.exports = tables;