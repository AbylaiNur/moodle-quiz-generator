import express from "express"
import aikenToMoodleXML from "aiken-to-moodlexml";
import fs from "fs"
const app = express()
import { getQuizAikenTopic, getQuizAikenContext } from "./helpers/chatgpt.js";
import { getQuizLimiter } from "./middleware/rateLimiter.js";
import expressSession from "express-session"
import passport from "passport"
import {pool} from "./db/connection.js"

import "./helpers/auth.js";

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



/*  Google AUTH  */

 
app.get('/auth/google', 
    passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/failure' }),
  function(req, res) {
    res.redirect('/protected');
  });


app.get('/protected', isLoggedIn,(req, res) => {
    res.send(`Hello ${req.user.firstname}`)});

app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy();
        res.redirect('/');
      });
});

app.get('/failure', (req, res) => {
    res.send('Failed to authenticate..');
    });

/*  EXPRESS */


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/context', isLoggedIn, (req, res) => {
    res.render('context')
})

app.get('/topic', isLoggedIn, (req, res) => {
    res.render('topic')
})

app.get('/quiz/topic', isLoggedIn, getQuizLimiter, async (req, res) => {
    try {
        let quizAiken = []
        console.log(req);
        for (let i = 0; i < Math.min(Number(req.query.questionsCount), 100); i += 10) {
            let quiz = ''
            while (quiz.split('ANSWER').length - 1 !== 10) {
                quiz = await getQuizAikenTopic(req.query.topic, 10, req.query.difficulty);
            }
            quiz = quiz.replace(/([1-9]. )|([1-9][0-9]. )/gm, '')
            quiz = quiz.trim()
            quiz = quiz.split('\n\n')
            quizAiken = quizAiken.concat(quiz)
        }

        for (let i = 0; i < quizAiken.length; i++) {
            quizAiken[i] = quizAiken[i].split('\n');
        }
        pool.query("INSERT INTO history(user_id, quiz) VALUES($1, $2)", 
            [req.user.id, quizAiken], (error, results)=>{
            if(error) throw error;
            console.log("Hello World!");
            console.log(results.rows);
            return results.rows;
        })
        res.render("quiz",  {data:{questions : quizAiken}})
    } catch (error) {
        console.log(error.message)
        res.redirect('/')
    }
})


app.get('/quiz/topic/history', isLoggedIn, async (req, res) => {
    try {
        const historyList = await pool.query("SELECT id from history WHERE user_id = $1", [req.user.id]);
    
        const quizAiken = await pool.query("SELECT quiz from history WHERE id = $1", [req.query.id || 1]);
        
        res.render("quiz",  {data: { questions : quizAiken.rows[0].quiz , logs: historyList.rows } })
    } catch (error) {
        console.log(error.message)
        res.redirect('/')
    }
})


app.get('/quiz/context', isLoggedIn, getQuizLimiter, async (req, res) => {
    try {
        let quizAiken = []
        for (let i = 0; i < Math.min(Number(req.query.questionsCount), 100); i += 10) {
            let quiz = ''
            while (quiz.split('ANSWER').length - 1 !== 10) {
                quiz = await getQuizAikenContext(req.query.context, 10, req.query.difficulty)
            }
            quiz = quiz.replaceAll(/([1-9]. )|([1-9][0-9]. )/gm, '')
            quiz = quiz.trim()
            quiz = quiz.split('\n\n')
            quizAiken = quizAiken.concat(quiz)
        }

        for (let i = 0; i < quizAiken.length; i++) {
            quizAiken[i] = quizAiken[i].split('\n');
        }
        res.render("quiz",  {questions : quizAiken})
    } catch (error) {
        console.log(error.message)
        res.redirect('/')
    }
})

app.post('/download', async (req, res) => {
    const questions = Object.values(req.body)
    const questionsString = questions.join('\n\n');
    let quizXML = ''
    aikenToMoodleXML(questionsString, (result, error) => {
        quizXML = result
    });
    const name = String((new Date()).getTime())
    fs.writeFile(`${name}.xml`, quizXML, function (err) {
        if (err) throw err;
        console.log("File created")
        res.download(`${name}.xml`, 'quiz.xml', function (err1) {
            if (err1) throw err1;
            fs.unlink(`${name}.xml`, function (err2) {
                if (err2) throw err2;
                console.log('File deleted!');
            });
        })
    })

})

app.listen(process.env.PORT || 3000)

