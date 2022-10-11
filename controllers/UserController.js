const  db = require('../database');
const bcrypt = require('bcrypt');
const { promise } = require('bcrypt/promises');
const ResponseController = require('./ResponseController');
const PassportController = require('./PassportController');

class UserController{

    static findById(id){
        return new Promise(function(resolve, reject){
            db.query("SELECT * FROM users WHERE id = ?", id, (error, result) => {
                if(error){
                    resolve(error)
                }else{
                    if(result.length > 0){
                        resolve(result)
                    }else{
                        resolve(null)
                    }
                }
            })
        })
    }

    static checkUsernameExist(username){
        return new Promise(function(resolve, reject){
            db.query("SELECT * FROM users WHERE username = ?", username, (error, result) => {
                if(error){
                    resolve(error)
                }else{
                    if(result.length > 0){
                        delete result[0].password
                        resolve(result[0])
                    }else{
                        resolve(null)
                    }
                }
            })
        })
    }

    //=====================================================================//
    //=====================================================================//

    // get all user profile (admin)
    static index(){
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM users", (error, results) => {
                if(error){
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                    resolve(resposne)
                }else{
                    const resposne = ResponseController.createResponse(200,null, "success.", results)
                    resolve(resposne)
                }
            });
        })
    }
    
    // get 1 user profile
    static show(id){
        return new Promise( async (resolve, reject) => {
            const user = await this.findById(id)
            if(user != null){
                const response = ResponseController.createResponse(200, null, "success", user)
                resolve(response)
            }else{
                const resposne = ResponseController.createResponse(406, "CAN'T FIND ID", `sorry. thesis (id: ${id}) doesn't exist.`)
                resolve(resposne)
            }
        })
    }

    static async updateProfile(userId, fullname, role){
        await this.updateFullname(userId, fullname)
        await this.updateRole(userId, role)
        const response = ResponseController.createResponse(200, null, `profile is updated.`)
        return(response)
    }

    // update user profile -> fullname
    static updateFullname(id, fullName){
        return new Promise( async(resolve, reject) => {
            const isExist = await this.findById(id)
            if(isExist != null){
                db.query("UPDATE users SET fullname = ? WHERE id = ?", [fullName, id], (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                        resolve(resposne)
                    }else{
                        const response = ResponseController.createResponse(200, null, `(user: ${id}) fullname is updated.`)
                        resolve( response)
                    }
                })
            }else{
                const resposne = ResponseController.createResponse(406, "CAN'T FIND ID", `sorry. users (id: ${id}) doesn't exist.`)
                resolve(resposne)
            }
        })
    }

    // update user profile -> role (admin)
    static updateRole(id, role){
        return new Promise( async(resolve, reject) => {
            const isExist = await this.findById(id)
            if(isExist != null){
                db.query("UPDATE users SET role = ? WHERE id = ?", [role, id], (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                        resolve(resposne)
                    }else{
                        const response = ResponseController.createResponse(200, null, `(user: ${id}) role is updated.`)
                        resolve( response)
                    }
                })
            }else{
                const resposne = ResponseController.createResponse(406, "CAN'T FIND ID", `sorry. users (id: ${id}) doesn't exist.`)
                resolve(resposne)
            }
        })
    }

    // change passoword
    static changePassword(id, oldPassword, newPassword){
        return new Promise( async (resolve, reject) => {
            const isExist = await this.findById(id)
            const hashedNewPassword = await bcrypt.hash(newPassword, 10)
            if(isExist != null){
                const comparison = await bcrypt.compare(oldPassword, isExist[0].password)
                if(comparison){
                    db.query("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, id], (error, result) => {
                        if(error){ //มีเออเร่อ
                            const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                            resolve(resposne)
                        }else{
                            const response = ResponseController.createResponse(200, null, `(user: ${id}) password is changed.`)
                            resolve( response)
                        }
                    })
                }else{ // พาสเวิร์ดเก่าไม่ตรง
                    const resposne = ResponseController.createResponse(400, "CAN'T FIND ID", `sorry. old password is incorrect.`)
                    resolve(resposne)
                }
            }else{ //หา id ไม่เจอ
                const resposne = ResponseController.createResponse(406, "CAN'T FIND ID", `sorry. users (id: ${id}) doesn't exist.`)
                resolve(resposne)
            }
        })
    }
    
    // delete user (admin)
    static destroy(id){
        return new Promise( async(resolve, reject) => {
            const isExist = await this.findById(id)
            if(isExist != null){
                db.query("DELETE FROM users WHERE id = ?", id, (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                        resolve(resposne)
                    }else{
                        const response = ResponseController.createResponse(200, null, `(user: ${id}) is deleted.`)
                        resolve( response)
                    }
                })
            }else{
                const resposne = ResponseController.createResponse(406, "CAN'T FIND ID", `sorry. users (id: ${id}) doesn't exist.`)
                resolve(resposne)
            }
        })
    }

    // get myprofile
    static async  getMyUserProfile(request){
        const user = PassportController.checkAccessToken(request)
        const userProfile = await ResponseController.findById(user.username, "users", "username");
        delete userProfile[0].password
        const response = ResponseController.createResponse(200, null, `get user profile success`, userProfile[0])
        return response
    }

}

module.exports = UserController;