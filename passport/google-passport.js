
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user")
const passport = require("passport")
const dotenv = require ("dotenv");
dotenv.config();

module.exports = function (passport) {
    passport.use("google",new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:"https://middle-man-products.herokuapp.com/auth/google/callback",
            // callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        (accessToken, refreshToken, profile, done) => {
            console.log("profile", profile);
            User.findOne({ googleId: profile.id })
              .then((user) => {
                if (user) {
                  done(null, user);
                } else {
                    const newUser = new User({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        image: profile.photos[0].value,
                        email: profile.emails[0].value,
                        provider: "google",
                        password: profile.id,
                        role: 'User'
                      });
                  newUser.save().then((userdetails) => {
                      console.log("details", userdetails);
                    done(null, userdetails);
                  });
                }
              })
              .catch((err) => console.log("err",err));
  
        }
      )
    );
}

