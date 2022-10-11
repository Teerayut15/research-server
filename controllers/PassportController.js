const jwt = require('jsonwebtoken');
const SECRET = "I4ymiCode";

class PassportController{

    static generateAccessToken(payload){
        return jwt.sign(payload, SECRET, {"expiresIn": "24h"})
    }
    
    static checkAccessToken(request){
        try {
            const accessToken = request.headers.authorization.split(" ")[1];
            const jwtResposne = jwt.verify(String(accessToken), SECRET);
            return jwtResposne;
        } catch (error) {
            return false;
        }
    }
}

module.exports = PassportController;