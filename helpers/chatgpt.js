import { Configuration, OpenAIApi } from "openai"
import dotenv from "dotenv"
dotenv.config()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);


async function getQuizAikenTopic (topic, questionsCount, difficulty) {
    try {
        const prompt = `
Create ${difficulty} MCQ test with ${questionsCount} questions.
The topic is ${topic}.
Questions form: 
Question 
A. a 
B. a 
C. a 
D. a 
ANSWER: D`

        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 4000 - Math.round(prompt.length / 4),
            temperature: 0.5
        });
        return completion.data.choices[0].text;
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

async function getQuizAikenContext (context, questionsCount, difficulty) {
    try {
        const prompt = `
${context}
Create a ${difficulty} quiz with ${questionsCount} MCQ questions for the article above.
Questions form: 
Question 
A. a 
B. a 
C. a 
D. a 
ANSWER: D`

        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 4000 - Math.round(prompt.length / 4),
            temperature: 0.5
        });
        return completion.data.choices[0].text;
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }
}


export {
    getQuizAikenTopic,
    getQuizAikenContext
}