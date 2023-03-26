import {pool} from "../connection.js"


class UserController {
    async getUsers (req, res) {
        pool.query("SELECT firstname, lastname, email from users", (error, results) =>{
            if(error) throw error;
            return results.rows;
        });
    }
    async findUserByEmail(req, res){
        pool.query("SELECT firstname, lastname, email from users WHERE email=$1", [req.user.emails.value], (error, results)=>{
            if(error) throw error;
            console.log(results.rows);
            return results.rows;
        })
    }
    async createNewUser(req, res){
        pool.query("INSERT INTO users(firstname, lastname, email) VALUES($1, $2, $3)", 
            [req.user.firstname, req.user.lastname, req.user.emails.value], 
            (error, results)=>{
                if(error) throw error;
                console.log(results.rows);
                return results.rows;
        })
    }
}





export{
    UserController
}
