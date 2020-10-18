
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user")
const dotenv = require ("dotenv");
dotenv.config();

module.exports = function (passport) {
    passport.use("google",new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            callbackURL: process.env.GOOGLE_CALLBACK_URL_HEROKU,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            console.log("profile", profile);
          const user =  await User.findOne({ googleId: profile.id })
             
                if (user) {
                  done(null, user);
                } 
                else {
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
                 await newUser.save()
                    done(null, userdetails);
                }
            
          } catch (error) {
            console.log("error", error);
          }
              // .catch((err) => console.log("err",err));
        }
      )
    );
}

