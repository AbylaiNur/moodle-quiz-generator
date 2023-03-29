import {pool} from "../connection.js"

class User{
    getUsers () {
        return pool.query("SELECT firstname, email from users");
    }
    findUserById(param){
        return pool.query("SELECT id, firstname, email from users WHERE id=$1",
            param);
    }
    findUserByEmail(param){
        return pool.query("SELECT id, firstname, email from users WHERE email=$1",
            param);
    }
    createNewUser(param){
        return pool.query("INSERT INTO users(firstname, email) VALUES($1, $2) RETURNING id, firstname, email", 
            param);
    }
}

export{
    User
}
