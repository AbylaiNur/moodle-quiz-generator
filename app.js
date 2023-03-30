import express from "express"
const app = express()
import { getQuizLimiter } from "./middleware/rateLimiter.js";
import expressSession from "express-session"
import passport from "passport"

import "./helpers/auth.js";
import { google_callback, auth_logout, failure } from "./controllers/authController.js";
import {
    context_view,
    download_quiz,
    history_view,
    home_view,
    quiz_context_view,
    quiz_topic_view,
} from "./controllers/quizController.js"

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
    req.user ? next() : res.redirect('/auth/google');
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

app.get('/', home_view);

app.get('/context', isLoggedIn, context_view)

app.get('/topic', isLoggedIn, )

app.get('/quiz/topic', isLoggedIn, quiz_topic_view)

app.get('/quiz/context', isLoggedIn, quiz_context_view)

app.get('/history', isLoggedIn, history_view)

app.post('/download', download_quiz)

app.get('/settings', isLoggedIn ,(req, res) => {
    res.render('settings', { user : req.user });
})

app.listen(process.env.PORT || 3000)

