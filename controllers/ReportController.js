const db = require('../database')
const ResponseController = require('./ResponseController');
const UserController = require('./UserController');

class ReportController{
    
    static index(){
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM reports WHERE status != 'success' ORDER BY id DESC", async(error, results) => {
                if(error){ 
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                    resolve(resposne)
                }else{
                    const resultsSize = Object.keys(results).length
                    for(let index=0; index< resultsSize; index++){
                        const thesisData = await ResponseController.findById(results[index].thesis_id, "thesiss")
                        const monthArray = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
                        const year = results[index].date.getFullYear()+543
                        const date = results[index].date.getDate()
                        const month = monthArray[results[index].date.getMonth()]
                        results[index].thesis_title = thesisData[0].title
                        results[index].date = `${date}  ${month}  ${year}`
                    }
                    const response = ResponseController.createResponse(200, null, `(success.`, results)
                    resolve( response)
                }
            })
        })
    }
    static store(request){
        // const reportInput = req.body
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO reports SET ?", request.body, (error, result) => {
                if(error){ 
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                    resolve(resposne)
                }else{
                    const response = ResponseController.createResponse(200, null, `(success report is stored.`)
                    resolve( response)
                }
            })
        })
    }
    static async show(id){
        
        return new Promise(async(resolve, reject) => {
            db.query("SELECT * FROM reports WHERE id = ?", id, async (error, result) => {
                if(error){ 
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                    resolve(resposne)
                }else{
                    if(result.length > 0){
                        const userData = await ResponseController.findById(result[0].user_id, "users")
                        const thesisData = await ResponseController.findById(result[0].thesis_id, "thesiss")
                        const monthArray = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
                        const year = result[0].date.getFullYear()+543
                        const date = result[0].date.getDate()
                        const month = monthArray[result[0].date.getMonth()]
                        result[0].reporter = userData[0].username
                        result[0].thesis_title = thesisData[0].title
                        result[0].date = `${date}  ${month}  ${year}`
                        const response = ResponseController.createResponse(200, null, `success.`, result)
                        resolve(response)
                    }else{
                        const resposne = ResponseController.createResponse(406, "CAN'T FIND ID", `sorry. report (id: ${id}) doesn't exist.`)
                        resolve(resposne)
                    }
                    
                }
            })
           
            
        })
    }

    static update(request){
        const reportId = request.params.report_id
        const reportInput = request.body
        return new Promise( async(resolve, reject) => {
            const report = await ResponseController.findById(reportId, "reports")
            if(report != null){
                db.query("UPDATE reports SET ? WHERE id = ?", [reportInput, reportId], (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                        resolve(resposne)
                    }else{
                        const response = ResponseController.createResponse(200, null, "report is updated.")
                        resolve(response)
                    }
                })
            }
            
        })
    }

}

module.exports = ReportController;