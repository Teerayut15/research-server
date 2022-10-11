const db = require('../database')
const ResponseController = require('./ResponseController')

class FacultyController{

    static findById(id){
        return new Promise(function(resolve, reject){
            db.query("SELECT * FROM faculties WHERE id = ?", id, (error, result) => {
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
    //=====================================================================//
    //=====================================================================//

    static getAllFaculty(){
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM faculties", (error, results) => {
                if(error){
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                    resolve(resposne)
                }else{
                    const response = ResponseController.createResponse(200, null, "success", results)
                    resolve( response)
                }
            })
        })
    }
    static getAllBranches(){
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM branches", (error, results) => {
                if(error){
                    const resposne = ResponseController.createResponse(400, error, "sorry. please try again.")
                    resolve(resposne)
                }else{
                    const response = ResponseController.createResponse(200, null, "success", results)
                    resolve( response)
                }
            })
        })
    }
    static getBranchesByFacultyId(facultyId){
        // หาชื่อสาขาวิชาทั้งหมดจากไอดีคณะ
            // คืน ไอดีและชื่อสาขาวิชา
        return new Promise((resolve, reject) => {
            db.query(`SELECT branches.id, branches_name FROM faculties JOIN branches 
            ON faculties.id = branches.faculty_id WHERE faculties.id = ?`, facultyId, async(error, results) => {
                if(error){
                    resolve(error)
                }else{
                    const isExist = await ResponseController.findById(facultyId, "faculties")
                    if(isExist != null){
                        const response = ResponseController.createResponse(200, null, "success", results)
                        resolve( response)
                    }else{
                        const resposne = ResponseController.createResponse(406, "failed", `sorry. faculty (id: ${facultyId}) doesn't exist.`)
                        resolve(resposne)
                    }
                }
            })
        })
    }

    static getFacultyByBranchesId(branchesId){
        // หาชื่อคณะจากไอดีสาขา
            // คืน ชื่อคณะ
        return new Promise((resolve, reject) => {
            db.query(`SELECT faculty_id, faculty_name FROM branches JOIN faculties 
            ON branches.faculty_id = faculties.id WHERE branches.id = ?`, branchesId, async(error, result) => {
                if(error){
                    resolve(error)
                }else{
                    const isExist = await ResponseController.findById(branchesId, "branches")
                    if(isExist != null){
                        const response = ResponseController.createResponse(200, null, "success", result)
                        resolve( response)
                    }else{
                        const resposne = ResponseController.createResponse(406, "failed", `sorry. branches (id: ${branchesId}) doesn't exist.`)
                        resolve(resposne)
                    }
                }
            })
        })
    }

    static setFacultyAndBranchesName(thesisId){
        return new Promise( async(resolve, reject) => {
            const thesis = await ResponseController.findById(thesisId, "thesiss")
            const branchesData = await ResponseController.findById(thesis[0].branches_id, "branches")
            const facultiesData = await ResponseController.findById(branchesData[0].faculty_id, "faculties")
            thesis[0].faculty_name = facultiesData[0].faculty_name
            thesis[0].branches_name = branchesData[0].branches_name
            resolve(thesis)
        })
    }
    
}

module.exports = FacultyController;