const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");

const Schema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    lowercase: true,
    uppercase: true,
  },
  password: {
    type: String,
    lowercase: true,
  },
  dpURL: {
    type: String,
    default: "https://sample-1997.s3.us-east-2.amazonaws.com/Defaultimage.jpg",
  },
  biography: {
    type: String,
    default: "Please write your biography......",
  },
});

Schema.pre("save", function (next) {
  const user = this;

  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) {
        return next(err);
      }

      // user.password = hash;
      next();
    });
  });
});

Schema.methods.comparedPassword = (candidatePassword, cb) => {
  if (candidatePassword === this.password) {
    return cb(null, true);
  } else {
    return cb(true);
  }
};

module.exports = mongoose.model("User", Schema);
