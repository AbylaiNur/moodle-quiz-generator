import express from "express"
const app = express()
import { getQuizAiken } from "./helpers/chatgpt.js";
import aikenToMoodleXML from "aiken-to-moodlexml";
import fs from "fs"

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded( { extended: true} ));


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/test', async (req, res) => {
    try {
        let quizAiken = []
        for (let i = 0; i < Math.min(Number(req.query.questionsCount), 100); i += 10) {
            let quiz = ''
            while (quiz.split('ANSWER').length - 1 !== 10) {
                quiz = await getQuizAiken(req.query.topic, 10, req.query.difficulty)
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

app.post('/download', (req, res) => {
    const questions = Object.values(req.body)
    const questionsString = questions.join('\n\n');
    let quizXML = ''
    aikenToMoodleXML(questionsString, (result, error) => {
        quizXML = result
    });
    fs.writeFileSync('public/quiz.xml', quizXML,{encoding:'utf8' ,flag:'w'})

    res.download('public/quiz.xml')

    fs.writeFileSync('public/quiz.xml', '',{encoding:'utf8' ,flag:'w'})
})

app.listen(process.env.PORT || 3000)

