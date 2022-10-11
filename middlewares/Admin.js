const PassportController = require('../controllers/PassportController')
const db = require('../database')

const AdminMiddleware = (req, res, next) => {
    // -1 เช็ค token (ใช้ฟังก์ชัน check ใน PassportController)
    const jwtPayload = PassportController.checkAccessToken(req)
    // -2 เอา username มาหาใน db
    if(jwtPayload){
        db.query("SELECT * FROM users WHERE username = ?", jwtPayload.username, (error, result) => {
            if(error){
                res.send(error)
            }else{
                if(result.length > 0){
                    if(result[0].role === "admin"){
                        next();
                    }else{
                        res.send({
                            "code": 403,
                            "error": "Forbidden",
                            "message": "You don't have permission."
                        })
                    }
                }else{
                    res.send({
                        "code": 406,
                        "error": "Not Acceptable",
                        "message": "You are not a member. !!"
                    })
                }
            }
        })
    }else{
        res.send({
            "code": 403,
            "error": "Forbidden",
            "message": "You don't have permission."
        })
    }
   
}

module.exports = AdminMiddleware;