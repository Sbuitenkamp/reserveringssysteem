const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const UsersSchema = new Schema({
    username: String,
    password: String,
    superUser: Boolean
});

UsersSchema.pre('save', function(next) {
    const salt = bcrypt.genSaltSync(saltRounds);
    this.password = bcrypt.hashSync(this.password, salt);
    next();
});

const users = model('users', UsersSchema);

module.exports = {
    schema: UsersSchema,
    model: users
};