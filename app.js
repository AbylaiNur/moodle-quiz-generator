import express from "express"
import aikenToMoodleXML from "aiken-to-moodlexml";
import fs from "fs"
const app = express()
import { getQuizAikenTopic, getQuizAikenContext } from "./helpers/chatgpt.js";
import { getQuizLimiter } from "./middleware/rateLimiter.js";

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded( { extended: true} ));


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/context', (req, res) => {
    res.render('context')
})

app.get('/topic', (req, res) => {
    res.render('topic')
})

app.get('/quiz/topic', getQuizLimiter, async (req, res) => {
    try {
        let quizAiken = []
        for (let i = 0; i < Math.min(Number(req.query.questionsCount), 100); i += 10) {
            let quiz = ''
            while (quiz.split('ANSWER').length - 1 !== 10) {
                quiz = await getQuizAikenTopic(req.query.topic, 10, req.query.difficulty)
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


app.get('/quiz/context', getQuizLimiter, async (req, res) => {
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
            fs.unlink(`${name}.xml`, function (err) {
                if (err2) throw err2;
                console.log('File deleted!');
            });
        })
    })




})

app.listen(process.env.PORT || 3000)

