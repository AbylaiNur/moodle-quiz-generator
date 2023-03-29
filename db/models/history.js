import {pool} from "../connection.js"

class History {
    getHistoryByUserId (param){
        return pool.query("SELECT id, num_questions, topic from history WHERE type = $1 AND user_id = $2", 
            param);
    }
    getQuizById (param){
        return pool.query("SELECT quiz from history WHERE id = $1", param)
    }
    saveHistory(param){
        return pool.query("INSERT INTO history(user_id, topic, quiz, num_questions, type) VALUES($1, $2, $3, $4, $5)",
            param);
    }
    deleteHistory(param){
        return pool.query("DELETE from history WHERE id = $1", 
            param);
    }
}

export{
    History
}
