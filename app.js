import express from "express"
const app = express()
import { getQuizLimiter } from "./middleware/rateLimiter.js";
import expressSession from "express-session"
import passport from "passport"

import "./helpers/auth.js";
import { google_callback, auth_logout, failure } from "./controllers/authController.js";
import { context_view, download_quiz, quiz_view } from "./controllers/quizController.js"

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded( { extended: true} ));
app.use(express.json());
app.use(expressSession({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SECRET 
}));

app.use(passport.initialize());
app.use(passport.session());
 
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
  }

app.get('/auth/google', 
    passport.authenticate('google', { scope: [ 'email', 'profile' ] })
);
 
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/failure' }),
    google_callback
);

app.get('/logout', auth_logout);

app.get('/failure', failure);

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/context', isLoggedIn, (req, res) => {
    res.render('context')
})

app.get('/topic', isLoggedIn, (req, res) => {
    res.render('topic')
})

app.get('/quiz/topic', isLoggedIn, getQuizLimiter, quiz_view)

app.get('/quiz/context', isLoggedIn, getQuizLimiter, context_view)

app.post('/download', download_quiz)

app.listen(process.env.PORT || 3000)

