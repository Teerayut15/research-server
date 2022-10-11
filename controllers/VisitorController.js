const db = require('../database');
const ResponseController = require('./ResponseController');
const TimeController = require('./TimeController');

class VisitorController{
    static async index(){
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM visitors", (error, results) => {
                if(error){
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (static.index)")
                    resolve(resposne)
                }else{
                    const response = ResponseController.createResponse(200, null, "success", results)
                    resolve(response)
                }
            })
        })
    }
    static async store(request){
        const ip = request.ip.split(':')[3];
        const nowFullTime = TimeController.getNowTime()
        const nowFullDate = TimeController.getNowDate()
        const ipExists = await ResponseController.findById(ip, "visitors", "ip");
        const ipVisited = ipExists.filter(visitor => {
            return `${visitor.date.getFullYear()}-${visitor.date.getMonth()+1}-${visitor.date.getDate()}` == nowFullDate
        })
        
        return new Promise((resolve, reject) => {
            if(ipVisited.length > 0){
                const response = ResponseController.createResponse(200, null, "this ip has already visited.")
                resolve(response)
            }else{
                db.query("INSERT INTO visitors (ip, date, time) VALUES (?,?,?)",[ip, nowFullDate, nowFullTime ], (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (static.store)")
                        resolve(resposne)
                    }else{
                        const response = ResponseController.createResponse(200, null, "new visitor is counted.")
                        resolve(response)
                    }
                })
            }
            
        })
    }
    static show(id){
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM visitors WHERE id = ?",id, (error, result) => {
                if(error){
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (static.show)")
                    resolve(resposne)
                }else{
                    const response = ResponseController.createResponse(200, null, "success", result)
                    resolve(response)
                }
            })
        })
    }

    static getTotalVisit(period = null){
        if(period == null){
            return new Promise((resolve, reject) => {
                db.query("SELECT * FROM visitors", (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (static.get total visit)")
                        resolve(resposne)
                    }else{
                        const totalVisitor = {
                            total: result.length
                        }
                        const response = ResponseController.createResponse(200, null, "success", totalVisitor)
                        resolve(response)
                    }
                })
            })
        }else{
            return new Promise((resolve, reject) => {
                db.query("SELECT * FROM visitors WHERE date = ?", period, (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (static.get total visit)")
                        resolve(resposne)
                    }else{
                        const totalVisitor = {
                            total: result.length
                        }
                        const response = ResponseController.createResponse(200, null, "success", totalVisitor)
                        resolve(response)
                    }
                })
            })
        }
        
    }
    
}

module.exports = VisitorController;