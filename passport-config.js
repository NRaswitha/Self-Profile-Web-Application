const UserModel = require("./model-mvc");

const LocalStrategy = require("passport-local").Strategy;

function initialize(passport) {
  const authenticateUser = (email, password, done) => {
    UserModel.findOne({ email }, (err, user) => {
      if (err) {
        return done(err);
      } else if (!user) {
        // Invalid email
        return done(null, false, { message: "No user with this email" });
      } else if (password !== user.password) {
        // Invalid password
        return done(null, false, { message: "Password doesn't match" });
      }
      return done(null, user);
    });
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    UserModel.findOne({ _id: id }, (err, user) => {
      if (err) {
        return done(err);
      } else if (!user) {
        // Invalid email
        return done(null, false, { message: "No user with this email" });
      }
      // console.log(user);
      return done(null, user);
    });
  });
}

module.exports = initialize;
