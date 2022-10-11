const express = require('express');
const router = express.Router()
const PassportController = require('../controllers/PassportController')
const AuthMiddleware = require('../middlewares/Auth')
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');

router.post('/', AuthMiddleware, async(req, res) => {
    const username = req.body.username;
    const accessToken = await PassportController.generateAccessToken({"username": username});
    const role = await UserController.checkUsernameExist(username)
    res.send({
        "code": 200,
        "username": username,
        "role": role.role,
        "access_token": accessToken
    })
})
router.post('/check', async(req, res) => {
    const authenState = PassportController.checkAccessToken(req);
    res.send(authenState)
})
router.post('/signup', async (req, res) => {
    const userInput = req.body;
    delete userInput.confirmPassword
    const response = await AuthController.signup(userInput)
    res.send(response)
})

module.exports = router;