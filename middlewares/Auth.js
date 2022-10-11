const AuthController = require('../controllers/AuthController');

const AuthMiddleware = async (req, res, next) => {
    const {username, password} = req.body;
    const auth = await AuthController.signIn(username, password)
    if(auth){
        next()
    }else{
        res.send({
            "code": 400,
            "error": "error",
            "message": "username or password is incorrect."
        })
    }
}

module.exports = AuthMiddleware;