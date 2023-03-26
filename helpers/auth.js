import passport from "passport";
import {OAuth2Strategy} from "passport-google-oauth";
import {pool} from "../db/connection.js"

passport.use(new OAuth2Strategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `http://localhost:${process.env.PORT || 3000}/auth/google/callback`,
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {

    const param = [profile.name.givenName, profile.name.familyName, profile.emails[0].value];
    (async () => {
      try {
        const results = await pool.query("SELECT id, firstname, lastname, email from users WHERE email=$1",[profile.emails[0].value]);
        if(!results.rows.length){
          const user = await pool.query("INSERT INTO users(firstname, lastname, email) VALUES($1, $2, $3) RETURNING id, firstname, lastname, email", param);
          return done(null, user.rows[0]);
        }
        return done(null, results.rows[0]);
      } catch (error) {
        console.error(error);
      }
    })();
  }));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});
 
passport.deserializeUser(function(user, done) {
  pool.query("SELECT id, firstname, lastname, email from users WHERE id=$1",[user]).then(
    (result) =>{
      done(null, result.rows[0]);
    }
  ).catch((e)=>console.error(e));
});


