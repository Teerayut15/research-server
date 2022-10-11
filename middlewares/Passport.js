const PassportController = require('../controllers/PassportController')
const db = require('../database')

const PassportMiddleware = (req, res, next) => {
    const jwtPayload = PassportController.checkAccessToken(req)
    if(jwtPayload != false){
        db.query("SELECT * FROM users WHERE username = ?", jwtPayload.username, (error, result) => {
            if(error){
                res.send(error)
            }else{
                if(result.length > 0){
                    next();
                }else{
                    res.send("You don't have Permission. !!")
                }
            }
        })
    }else{
        res.send("You don't have Permission. !!")
    }
}

module.exports = PassportMiddleware;