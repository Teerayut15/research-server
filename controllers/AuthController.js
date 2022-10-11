const db = require("../database");
const bcrypt = require('bcrypt');
const UserController = require("./UserController");
const ResponseController = require('./ResponseController');

class AuthController{

    // signin
    static signIn(username, password){
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE username = ?", username, async (error, result) => {
                if(error){
                    resolve(false)
                }else{
                    if(result.length > 0){
                        const comparison = await bcrypt.compare(password, result[0].password)
                        if(comparison){
                            resolve(true)
                        }else{
                            resolve(false)
                        }
                    }else{
                        resolve(false)
                    }
                }
            })
        })
    }
    // signout -> ลบ token ออกจาก localStorage

    // signup
    static signup(userInput){
        return new Promise( async(resolve, reject) => {
            
            const hashedPassword = await bcrypt.hash(userInput.password, 10);
            userInput.password = hashedPassword;
            // เช็ค username ซ้ำ
            const isUsernameExist = await UserController.checkUsernameExist(userInput.username)
            if(isUsernameExist != null){ /* ถ้าซ้ำ */
                const response = ResponseController.createResponse(409, null, "this username has already used.")
                resolve(response)
            }else{ /* ถ้าไม่ซ้ำ */
                db.query("INSERT INTO users SET ?", userInput, (error, result) => {
                    if(error){
                        resolve(error)
                    }else{
                        const response = ResponseController.createResponse(200, null, "new user is created.")
                        resolve(response)
                    }
                })
            }
            
        })
    }

}

module.exports = AuthController;