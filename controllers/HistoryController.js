const db = require('../database');
const PassportController = require('./PassportController');
const ResponseController = require('./ResponseController');
const ThesisController = require('./ThesisController');
const UserController = require('./UserController')

class HistoryController{
    
    static index(){
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM histories",async (error, results) => {
                if(error){
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (histories.store)")
                    resolve(resposne)
                }else{
                    const resultsSize = Object.keys(results).length
                    for(let index=0; index< resultsSize; index++){
                        const userId = results[index].user_id;
                        const userData = await ResponseController.findById(userId, "users")
                        const thesisData = await ResponseController.findById(results[index].thesis_id, "thesiss")
                        const monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                        const year = results[index].date.getFullYear()
                        const date = results[index].date.getDate()
                        const month = monthArray[results[index].date.getMonth()]
                        results[index].user_name = userData[0].username
                        results[index].thesis_title = thesisData[0].title
                        results[index].date = `${date}  ${month}  ${year}`
                    }
                    const response = ResponseController.createResponse(200, null, "success", results)
                    resolve(response)
                }
            })
        })
    }
    static store(historyInput){
        return new Promise( async(resolve, reject) => {
            const isThesisExist = await ResponseController.findById(historyInput.thesis_id, "thesiss");
            if(isThesisExist != null){
                db.query(`INSERT INTO histories SET ?`, historyInput, (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (histories.store)")
                        resolve(resposne)
                    }else{
                        const response = ResponseController.createResponse(200, null, "new history is updated.")
                        resolve(response)
                    }
                })
            }else{
                const resposne = ResponseController.createResponse(406, "failed", `sorry. thesis (id: ${historyInput.thesis_id}) doesn't exist.`)
                resolve(resposne)
            }
        })
    }
    static getLastHistoreis(){
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM histories ORDER BY id DESC LIMIT 6",async (error, results) => {
                if(error){
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (histories.store)")
                    resolve(resposne)
                }else{
                    const resultsSize = Object.keys(results).length
                    for(let index=0; index< resultsSize; index++){
                        const userId = results[index].user_id;
                        const userData = await ResponseController.findById(userId, "users")
                        const thesisData = await ResponseController.findById(results[index].thesis_id, "thesiss")
                        const monthArray = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
                        const year = results[index].date.getFullYear()+543
                        const date = results[index].date.getDate()
                        const month = monthArray[results[index].date.getMonth()]
                        results[index].user_name = userData[0].username
                        results[index].thesis_title = thesisData[0].title
                        results[index].date = `${date}  ${month}  ${year}`
                    }
                    const response = ResponseController.createResponse(200, null, "success", results)
                    resolve(response)
                }
            })
        })
    }
    static async setLiked(request){
        const passportPayload = await PassportController.checkAccessToken(request)
        const user = await UserController.checkUsernameExist(passportPayload.username)
        const thesisId = request.body.thesis_id
        const today = new Date();
        const historyInput = {
            "user_id": user.id,
            "thesis_id": thesisId,
            "type": "like",
            "date": `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`,
            "time": `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
        }
        return new Promise( async(resolve, reject) => {
            const isThesisExist = await ResponseController.findById(thesisId, "thesiss");
            if(isThesisExist != null){
                db.query("SELECT * FROM histories WHERE user_id = ? and thesis_id = ? and type = 'like'", [userId, thesisId], async (error, result) => {
                    if(error){
                        resolve(error)
                    }else{
                        if(result.length > 0){
                            await this.destroy(result[0].id)
                            const response = ResponseController.createResponse(200, null, "unliked")
                            resolve(response)
                        }else{
                            await this.store(historyInput)
                            const response = ResponseController.createResponse(200, null, "liked")
                            resolve(response)
                        }
                    }
                })
            }else{
                const resposne = ResponseController.createResponse(406, "failed", `sorry. thesis (id: ${thesisId}) doesn't exist.`)
                resolve(resposne)
            }
        })
    }
    static destroy(historyId){
        return new Promise( async(resolve, reject) => {
            const isHistoryExist = await ResponseController.findById(historyId, "histories")
            if(isHistoryExist != null){
                db.query("DELETE FROM histories WHERE id = ?", historyId, (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                        resolve(resposne)
                    }else{
                        const response = ResponseController.createResponse(200, null, ` (id: ${historyId}) is deleted.`)
                        resolve( response)
                    }
                })
            }else{
                const resposne = ResponseController.createResponse(406, "failed", `sorry.  (id: ${historyId}) doesn't exist.`)
                resolve(resposne)
            }
        })
    }
    static getTotalThesis(staticName, period = null){
        if(period == null){
            return new Promise((resolve, reject) => {
                db.query("SELECT * FROM histories WHERE type = ?",staticName, (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (static.get total thesis)")
                        resolve(resposne)
                    }else{
                        const totalThesis = {
                            total: result.length
                        }
                        const response = ResponseController.createResponse(200, null, "success", totalThesis)
                        resolve(response)
                    }
                })
            })
        }else{
            return new Promise((resolve, reject) => {
                db.query("SELECT * FROM histories WHERE type = ? AND date = ?", [staticName, period], (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (static.get total thesis)")
                        resolve(resposne)
                    }else{
                        const totalThesis = {
                            total: result.length
                        }
                        const response = ResponseController.createResponse(200, null, "success", totalThesis)
                        resolve(response)
                    }
                })
            })
        }
        
    }
    static getTotalDownload(period = null){

    }
    
}

module.exports = HistoryController;