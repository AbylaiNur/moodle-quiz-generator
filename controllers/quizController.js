import {getQuizAikenTopic, getQuizAikenContext} from "../helpers/chatgpt.js";
import aikenToMoodleXML from "aiken-to-moodlexml";
import fs from "fs";
import {History} from "../db/models/history.js";


const context_view = async (req, res) => {
    try {
        console.log(req.user)
        const history = new History;
        const historyList = await history.getHistoryByUserId(['context', req.user.id]);
        console.log(req.user.id)
        let quizAiken = []
        if (!req.query.context) {
            console.log(req.query)
            quizAiken = await history.getQuizById([req.query.id || historyList.rows[0].id]);
            quizAiken = quizAiken.rows[0].quiz;
        } else {
            for (let i = 0; i < Math.min(Number(req.query.questionsCount), 100); i += 10) {
                let quiz = ''
                while (quiz.split('ANSWER').length - 1 !== 10) {
                    quiz = await getQuizAikenContext(req.query.context, 10, req.query.difficulty)
                }
                quiz = quiz.replace(/([1-9]. )|([1-9][0-9]. )/gm, '')
                quiz = quiz.trim()
                quiz = quiz.split('\n\n')
                quizAiken = quizAiken.concat(quiz)
            }
            for (let i = 0; i < quizAiken.length; i++) {
                quizAiken[i] = quizAiken[i].split('\n');
            }
            history.saveHistory([req.user.id, req.query.context, quizAiken, Number(req.query.questionsCount), 'context']);
        }

        res.render("quiz", {data: {questions: quizAiken, logs: historyList.rows, type: 'context'}, user: req.user})
    } catch (error) {
        console.log(error.message)
        res.redirect('/')
    }
}

const quiz_view = async (req, res) => {
    try {
        const history = new History;
        const historyList = await history.getHistoryByUserId(['topic', req.user.id]);
        let quizAiken = []
        if (!req.query.topic) {
            quizAiken = await history.getQuizById([req.query.id || historyList.rows[0].id]);
            quizAiken = quizAiken.rows[0].quiz;
        } else {
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
            history.saveHistory([req.user.id, req.query.topic, quizAiken, Number(req.query.questionsCount), 'topic']);
        }
        res.render("quiz", {data: {questions: quizAiken, logs: historyList.rows, type: 'topic', user: req.user}})
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

const home_view = async (req, res) => {
    res.render('home', {user: req.user});
}

const quiz_context_view = async (req, res) => {
    res.render('context', {user: req.user});
}

const quiz_topic_view = async (req, res) => {
    res.render('topic', {user: req.user});
}

const history_view = async (req, res) => {

}

export {
    download_quiz,
    context_view,
    quiz_view,
    home_view,
    quiz_context_view,
    quiz_topic_view,
    history_view
}