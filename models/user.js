  const mongoose = require("mongoose");
  const Schema = mongoose.Schema;

  const UserSchema = new Schema({
    firstName: {
      type: String,
      required: true,
      min: 3,
      max: 50 
    },
  lastName: {
    type: String,
    required: true,
    min: 3,
    max: 50
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    role: {
      type: String,
      enum: ['Admin', 'User'],
      default: 'User'
    },
    date: {
      type: Date,
      default: Date.now,
    },
  });

  UserSchema.methods.toJSON = function () {
    const user = this;

    const userObject = user.toObject();

    delete userObject.password;

    return userObject;
  };

  module.exports = mongoose.model("User", UserSchema);
