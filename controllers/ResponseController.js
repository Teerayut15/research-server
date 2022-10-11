const db = require('../database')

class ResponseController{
    static createResponse(code, error, message, data){
        return {
            "code": code,
            "error": error,
            "message": message,
            "data": data
        }
    }

    static findById(id, tableName, columnName = 'id'){
        return new Promise(function(resolve, reject){
            db.query(`SELECT * FROM ${tableName} WHERE ${columnName} = ?`, id, (error, result) => {
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

}

module.exports = ResponseController;