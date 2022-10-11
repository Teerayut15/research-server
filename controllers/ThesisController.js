const db = require('../database');
const ResponseController = require('./ResponseController');
const FacultyController = require('./FacultyController')
const HistoryController = require('./HistoryController');
const PassportController = require('./PassportController');
const UserController = require('./UserController')
const FileController = require('./FileController')

class ThesisController{
    
    static findById(id){
        return new Promise(function(resolve, reject){
            db.query("SELECT * FROM thesiss WHERE id = ?", id, (error, result) => {
                if(error){
                    reject(new Error(error))
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

    //=====================================================================//
    //=====================================================================//
    
    // get all thesis
    static index(){
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM thesiss", async(error, results) => {
                if(error){
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                    resolve(resposne)
                }else{
                    // const branchesId = results[0].branches_id;
                    // const branchesData = await ResponseController.findById(branchesId, "branches")
                    // const facultiesData = await ResponseController.findById(branchesData[0].faculty_id, "faculties")
                    // resolve(facultiesData)
                    const resultsSize = Object.keys(results).length
                    for(let index=0; index< resultsSize; index++){
                        const thesisId = results[index].id;
                        const branchesId = results[index].branches_id;

                        const branchesData = await ResponseController.findById(branchesId, "branches")
                        const facultiesData = await ResponseController.findById(branchesData[0].faculty_id, "faculties")
                        // const historiesData = await ResponseController.findById(thesisId, "histories", "thesis_id")
                        
                        // const year = historiesData[0].date.getFullYear()+543
                        // const date = historiesData[0].date.getDate()
                        // const monthArray = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
                        // const month = monthArray[historiesData[0].date.getMonth()]
                        results[index].branches_name = branchesData[0].branches_name
                        results[index].faculty_name = facultiesData[0].faculty_name
                        // results[index].date = `${date}  ${month}  ${year}`
                    }
                    const response = ResponseController.createResponse(200, null, "success", results)
                    resolve(response)
                }
            })
        })
    }
    
    // add new thesis
    static store(thesisInput, filesInput, request){
        // return thesisInput.title;
        return new Promise((resolve, reject) => {
            // เพิ่มข้อมูลลงในตารางปริญญานิพนธ์
            db.query("INSERT INTO thesiss SET ?", thesisInput, async (error, result) => {
                if(error){
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (thesiss.store)")
                    resolve(resposne)
                }else{
                    const passportPayload = PassportController.checkAccessToken(request)
                    const user = await UserController.checkUsernameExist(passportPayload.username)
                    const thesisId = result.insertId;
                    const userId = user.id
                    const today = new Date();
                    const historyInput = {
                        "user_id": userId,
                        "thesis_id": thesisId,
                        "note": `เพิ่มปริญญานิพนธ์ : ${thesisInput.title}`,
                        "type": "add",
                        "date": `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
                        "time": `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
                    }
                    const addNewHistory = await HistoryController.store(historyInput)
                    const addFile = await FileController.store(thesisId, filesInput)
                    if(addNewHistory.code == 200){
                        if(addFile.code == 200){
                            const response = ResponseController.createResponse(200, null, "new thesis is created.")
                            resolve(response)
                        }
                    }
                    
                }
            })
        })
    }

    // get 1 thesis
    static show(id){
        return new Promise( async (resolve, reject) => {
            const thesis = await ResponseController.findById(id, "thesiss")
            if(thesis != null){
                const branchesData = await ResponseController.findById(thesis[0].branches_id, "branches")
                const facultiesData = await ResponseController.findById(branchesData[0].faculty_id, "faculties")
                thesis[0].faculty_id = facultiesData[0].id
                thesis[0].faculty_name = facultiesData[0].faculty_name
                thesis[0].branches_name = branchesData[0].branches_name
                const response = ResponseController.createResponse(200, null, "success", thesis)
                resolve(response)
            }else{
                const resposne = ResponseController.createResponse(406, "CAN'T FIND ID", `sorry. thesis (id: ${id}) doesn't exist.`)
                resolve(resposne)
            }
        })
    }

    // update thesis
    static update(id, request, note){
        const thesisInput = request.body
        return new Promise( async(resolve, reject) => {
            const thesis = await ResponseController.findById(id, "thesiss")
            if(thesis != null){
                db.query("UPDATE thesiss SET ? WHERE id = ?", [thesisInput, id], async (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                        resolve(resposne)
                    }else{
                        const passportPayload = PassportController.checkAccessToken(request)
                        const user = await UserController.checkUsernameExist(passportPayload.username)
                        const today = new Date();
                        const historyInput = {
                            "user_id": user.id,
                            "thesis_id": id,
                            "note": note,
                            "type": "edit",
                            "date": `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
                            "time": `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
                        }
                        const addNewHistory = await HistoryController.store(historyInput)
                        if(addNewHistory.code == 200){
                            const response = ResponseController.createResponse(200, null, "thesis is updated.")
                            resolve(response)
                        }
                    }
                })
            }else{
                const resposne = ResponseController.createResponse(406, "CAN'T FIND ID", `sorry. thesis (id: ${id}) doesn't exist.`)
                resolve(resposne)
            }
        })
    }

    // delete thesis
    static destroy(id){
        return new Promise( async(resolve, reject) => {
            const isExist = await this.findById(id)
            if(isExist != null){
                db.query("DELETE FROM thesiss WHERE id= ?", id, (error, result) => {
                    if(error){
                        const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                        resolve(resposne)
                    }else{
                        const response = ResponseController.createResponse(200, null, `thesis (id: ${id}) is deleted.`)
                        resolve( response)
                    }
                })
            }else{
                const resposne = ResponseController.createResponse(406, "CAN'T FIND ID", `sorry. thesis (id: ${id}) doesn't exist.`)
                resolve(resposne)
            }
        })
    }

    static getAllFile(thesisId){
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM files WHERE thesis_id = ?", thesisId, (error, results) => {
                if(error){
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (thesis.get all file)")
                    resolve(resposne)
                }else{
                    const response = ResponseController.createResponse(200, null, "success.",results)
                    resolve(response)
                }
            })
        })
    }

    static setCount(thesisId, countColumn, operator){
        return new Promise((resolve, reject) => {
            db.query(`UPDATE thesiss SET ${countColumn} = ${countColumn} ${operator} 1 WHERE id = ?`, thesisId, async (error, result) => {
                if(error){
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again. (static.countStatic)")
                    resolve(resposne)
                }else{
                    const updateThesis = await FacultyController.setFacultyAndBranchesName(thesisId);
                    const response = ResponseController.createResponse(200, null, "thesis static is counted.",updateThesis[0])
                    resolve(response)
                }
            })
        })
    }

    static search(target, text){
        let sqlTitle = `SELECT * FROM thesiss WHERE title LIKE '%${text}%' ORDER BY id DESC`;
        let sqlAdvisor = `SELECT * FROM thesiss WHERE advisor LIKE '%${text}%' ORDER BY id DESC`;
        let sqlCreators = `SELECT * FROM thesiss WHERE creator_1 LIKE '%${text}%'
        OR creator_2 LIKE '%${text}%'
        OR creator_3 LIKE '%${text}%'
        ORDER BY id DESC`;
        let sqlDefault = `SELECT * FROM thesiss WHERE title LIKE '%${text}%'
        OR advisor LIKE '%${text}%'
        OR creator_1 LIKE '%${text}%'
        OR creator_2 LIKE '%${text}%'
        OR creator_3 LIKE '%${text}%'
        ORDER BY id DESC`;

        if(target == "title"){
            sqlDefault = sqlTitle;
        }else if(target == "advisor"){
            sqlDefault = sqlAdvisor;
        }else if(target == "creators"){
            sqlDefault = sqlCreators;
        }

        return new Promise((resolve, reject) => {
            db.query(sqlDefault,async (error, results) => {
                if(error){
                    resolve(error)
                }else{
                    if(results.length > 0){
                        const resultsSize = Object.keys(results).length
                        for(let index=0; index< resultsSize; index++){
                            const thesisId = results[index].id;
                            const branchesId = results[index].branches_id;
    
                            const branchesData = await ResponseController.findById(branchesId, "branches")
                            const facultiesData = await ResponseController.findById(branchesData[0].faculty_id, "faculties")
    
                            results[index].branches_name = branchesData[0].branches_name
                            results[index].faculty_name = facultiesData[0].faculty_name
                            results[index].faculty_eng_name = facultiesData[0].faculty_eng_name
                            
                        }
                        const response = ResponseController.createResponse(200, null, "success", results)
                        resolve(response)
                    }else{
                        const response = ResponseController.createResponse(200, null, "Not Found !!")
                        resolve(response)
                    }
                }
            })
        })
        
        
    }
    
}

module.exports = ThesisController;