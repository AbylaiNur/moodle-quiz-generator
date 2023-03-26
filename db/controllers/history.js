import {pool} from "../connection.js"


class HistoryController {
    async getHistory (req, res) {
        pool.query("SELECT quiz from history WHERE user_id = $1", [],
        (error, results) =>{
            if(error) throw error;
            return results.rows;
        });
    }
    async saveHistory(req, res){
        pool.query("INSERT INTO history(user_id, quiz) VALUES($1, $2)", 
            [req.user.emails.value], (error, results)=>{
            if(error) throw error;
            console.log(results.rows);
            return results.rows;
        })
    }
    async deleteHistory(req, res){
        pool.query("DELETE from history WHERE id = $1", 
            [req.user.firstname], 
            (error, results)=>{
                if(error) throw error;
                console.log(results.rows);
                return results.rows;
        })
    }
}

export{
    HistoryController
}
