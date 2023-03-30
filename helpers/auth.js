import passport from "passport";
import {OAuth2Strategy} from "passport-google-oauth";
import {User} from "../db/models/user.js"

passport.use(new OAuth2Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `http://localhost:${process.env.PORT || 3000}/auth/google/callback`,
        passReqToCallback: true
    },
    function (request, accessToken, refreshToken, profile, done) {
        const user = new User;
        (async () => {
            try {
                const results = await user.findUserByEmail([profile.emails[0].value]);
                if (!results.rows.length) {
                    const results = await user.createNewUser([profile.name.givenName, profile.emails[0].value]);
                    return done(null, results.rows[0]);
                }
                return done(null, results.rows[0]);
            } catch (error) {
                console.error(error);
            }
        })();
    }));


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (user, done) {
    const acc = new User;
    acc.findUserById([user]).then(
        (result) => {
            done(null, result.rows[0]);
        }
    ).catch((e) => console.error(e));
});


