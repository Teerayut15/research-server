const db = require("../database");
const ResponseController = require ('./ResponseController')
const PassportController = require('./PassportController')
const UserController = require('./UserController')
const HistoryController = require('./HistoryController')

class FileController{

    static store(thesisId, files){
        const sql = `INSERT INTO files (thesis_id, file_name, file_type, file_size)
        VALUES (?, ?, ?, ?)`;
        
        return new Promise( async (resolve, reject) => {
            await files.forEach((file, index) => {
                db.query(sql, [thesisId, file.file_name, file.file_type, file.file_size])
            })
            const response = ResponseController.createResponse(200, null, "new file is created.")
            resolve(response)
        })
    }

    static destroy(request){
        const fileId = request.params.file_id
        // return fileId
        return new Promise( async(resolve, reject) => {
            const file = await ResponseController.findById(fileId, "files")
            if(file != null){
                db.query("DELETE FROM files WHERE id= ?", fileId, async (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                        resolve(resposne)
                    }else{
                        const passportPayload = PassportController.checkAccessToken(request)
                        const user = await UserController.checkUsernameExist(passportPayload.username)
                        const today = new Date();
                        const historyInput = {
                            "user_id": user.id,
                            "thesis_id": file[0].thesis_id,
                            "note": `ลบไฟล์ ${file[0].file_name}.${file[0].file_type}`,
                            "type": "edit",
                            "date": `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
                            "time": `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
                        }
                        const addNewHistory = await HistoryController.store(historyInput)
                        if(addNewHistory.code == 200){
                            const response = ResponseController.createResponse(200, null, "file is deleted.")
                            resolve(response)
                        }
                    }
                })
            }else{
                const resposne = ResponseController.createResponse(406, "failed", `sorry. file (id: ${fileId}) doesn't exist.`)
                resolve(resposne)
            }
        })
    }
    static getFile(thesisId){
        const sql = `SELECT * FROM files WHERE thesis_id = ?`;
        return new Promise((resolve, reject) => {
            db.query(sql, thesisId, (error, results) => {
                if(error){
                    const response = ResponseController.createResponse(400, error, "sorry.")
                    resolve(response)
                }else{
                    const response = ResponseController.createResponse(200, null, "success.", results)
                    resolve(response)
                }
            })
        })
    }

}

module.exports = FileController;