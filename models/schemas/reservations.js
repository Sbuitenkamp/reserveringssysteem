const { Schema, model } = require('mongoose');
const { red } = require('chalk');
const { schema: GuestSchema, model: guestModel } = require('./guests');
const { schema: ObjectSchema, model: objectModel } = require('./objects');
const ReservationsSchema = new Schema({
    number: Number,
    guestId: String,
    guest: GuestSchema,
    objectIds: [String],
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

ReservationsSchema.pre('save', async function(next) {
    if (this.guestId) {
        const guest = await guestModel.findById(this.guestId).catch(() => console.log(red('Invalid ObjectId')));
        if (guest) this.guest = new guestModel({ ...guest._doc });
        this.guestId = undefined;
    }
    if (this.objectIds) {
        if (this.objectIds.length) {
            this.objects = [];
            for (const key in this.objectIds) {
                if (key === 'validators') continue;
                const object = await objectModel.findById(this.objectIds[key]).catch(() => console.log(red('Invalid ObjectId')));
                if (object) this.objects[key] = new objectModel({ ...object._doc });
            }
        }
        this.objectIds = undefined;
    }
    next();
});

const reservations = model('reservations', ReservationsSchema);

module.exports = {
    schema: ReservationsSchema,
    model: reservations
};