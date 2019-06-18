const { Schema, model } = require('mongoose');
const GuestsSchema = new Schema({
    number: Number,
    pronoun: String,
    name: String,
    email: String,
    address: String,
    zipCode: String,
    cityTown: String,
    country: String,
    brochureDate: Date,
    phone: String,
    mobilePhone: String,
    licensePlate: String,
    unwanted: Boolean,
    firstArrival: Boolean
});

const guests = model('guests', GuestsSchema);

module.exports = {
    schema: GuestsSchema,
    model: guests
};