import {pool} from "../connection.js"

class User{
    getUsers () {
        return pool.query("SELECT firstname, lastname, email from users");
    }
    findUserById(param){
        return pool.query("SELECT id, firstname, lastname, email from users WHERE id=$1",
            param);
    }
    findUserByEmail(param){
        return pool.query("SELECT id, firstname, lastname, email from users WHERE email=$1",
            param);
    }
    createNewUser(param){
        return pool.query("INSERT INTO users(firstname, lastname, email) VALUES($1, $2, $3) RETURNING id, firstname, lastname, email", 
            param);
    }
}

export{
    User
}
