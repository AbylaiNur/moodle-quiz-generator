import {getQuizAikenTopic, getQuizAikenContext} from "../helpers/chatgpt.js";
import aikenToMoodleXML from "aiken-to-moodlexml";
import fs from "fs";
import {History} from "../db/models/history.js";

const index_home = async (req, res) => {
    res.render('home', {user: req.user});
}

const index_context = async (req, res) => {
    res.render('context', {user: req.user})
}

const index_topic = async (req, res) => {
    res.render('topic', {user: req.user})
}

// const index_quiz_history = async (req, res) => {
//     const history = new History;
//     const historyList = await history.getHistoryByUserId(['topic', req.user.id]);
//     let quizAiken = []
//     quizAiken = await history.getQuizById([req.params.id || historyList.rows[0].id]);
//     quizAiken = quizAiken.rows[0].quiz;
//     res.render("history", { data: { questions: quizAiken, logs: historyList.rows, type: 'topic' } })
// }

const index_quiz_topic = async (req, res) => {
    try {
        let quizAiken = []
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

        const history = new History;
        history.saveHistory([req.user.id, req.query.topic, quizAiken, Number(req.query.questionsCount), 'topic']);
        res.render("quiz", {data: {questions: quizAiken, type: 'topic'}, user: req.user})
    } catch (error) {
        console.log(error.message)
        res.redirect('/')
    }
}

const index_quiz_context = async (req, res) => {
    try {
        let quizAiken = []
        for (let i = 0; i < Math.min(Number(req.query.questionsCount), 100); i += 5) {
            let quiz = ''
            let count = 0;
            while (quiz.split('ANSWER').length - 1 !== 5) {
                if (count > 8) {
                    throw new Error('Prompt caused 8 wrong requests.')
                }
                count++
                quiz = await getQuizAikenContext(req.query.context, 5, req.query.difficulty)
                quiz = quiz.replaceAll('Answer', 'ANSWER')
            }
            quiz = quiz.replaceAll(/([1-9]. )|([1-9][0-9]. )/gm, '')
            quiz = quiz.trim()
            quiz = quiz.split('\n\n')
            quizAiken = quizAiken.concat(quiz)
        }

        for (let i = 0; i < quizAiken.length; i++) {
            quizAiken[i] = quizAiken[i].split('\n');
        }

        const history = new History;
        history.saveHistory([req.user.id, req.query.topic, quizAiken, Number(req.query.questionsCount), 'topic']);
        res.render("quiz", {data: {questions: quizAiken, type: 'context'}, user: req.user})
    } catch (error) {
        console.log(error.message)
        res.redirect('/')
    }
}

const download_quiz = async (req, res) => {
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
}


export {
    index_home,
    index_topic,
    index_context,
    download_quiz,
    index_quiz_topic,
    index_quiz_context,
    // index_quiz_history
}