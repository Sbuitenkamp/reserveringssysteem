const { Schema, model } = require('mongoose');
const GuestSchema = require('./guests').schema;
const ObjectSchema = require('./objects').schema;
const ReservationsSchema = new Schema({
    number: Number,
    guest: GuestSchema,
    objects: [ObjectSchema],
    dateArrival: Date,
    dateDeparture: Date,
    status: String,
    costTotal: Number,
    costPaid: Number,
    amountUnpaid: Number,
    unpaidSince: Date,
    validationStatus: String,
    bookMethod: String,
    preferredReservation: Boolean,
    reservedPlace: String,
    createdAt: Date
});

const reservations = model('reservations', ReservationsSchema);

module.exports = {
    schema: ReservationsSchema,
    model: reservations
};