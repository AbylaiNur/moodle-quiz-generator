import express from "express"

const app = express()
import {getQuizLimiter} from "./middleware/rateLimiter.js";
import expressSession from "express-session"
import passport from "passport"
import {History} from "./db/models/history.js"
import "./helpers/auth.js";
import {google_callback, auth_logout, failure} from "./controllers/authController.js";
import {
    download_quiz,
    index_context,
    index_home,
    index_quiz_context,
    // index_quiz_history,
    index_quiz_topic,
    index_topic,
} from "./controllers/controller.js"

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
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


app.get('/', index_home);

app.get('/context', isLoggedIn, index_context)

app.get('/topic', isLoggedIn, index_topic)

app.get('/quiz/topic', isLoggedIn, index_quiz_topic)

app.get('/quiz/context', isLoggedIn, index_quiz_context)

// app.get('/history/:id', isLoggedIn, index_quiz_history)

app.post('/download', isLoggedIn, download_quiz)

// app.get('/settings', isLoggedIn, (req, res) => {
//     res.render('settings', {user: req.user});
// })

app.get('/logout', auth_logout);

app.get('/failure', failure);

app.get('/auth/google',
    passport.authenticate('google', {scope: ['email', 'profile']})
);

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/failure'}),
    google_callback
);

app.listen(process.env.PORT || 3000, () => {
    const history = new History;
    history.createTables().catch((res) => {
        console.error(res)
    });
})


