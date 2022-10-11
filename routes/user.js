const express = require('express');
const router = express.Router()
const PassportMiddleware = require('../middlewares/Passport')
const AdminMiddleware = require('../middlewares/Admin');
const UserController = require('../controllers/UserController');
const PassportController = require('../controllers/PassportController');


// request get all user profile (require: admin)
router.get('/', async (req, res) => {
    const response = await UserController.index();
    res.send(response)
})

// request get 1 user profile (require: accessToken)
router.get('/:user_id', async(req, res) => {
    const id = req.params.user_id
    const response = await UserController.show(id);
    res.send(response)
})

// request delete user (require: admin)
router.delete('/:user_id', async(req, res) => {
    const userId = req.params.user_id
    const response = await UserController.destroy(userId);
    res.send(response)
})

// request update fullname (require: admin)
router.put('/profile', async(req, res) => {
    const {userId, fullname, role} = req.body;
    const response = await UserController.updateProfile(userId, fullname, role)
    res.send(response)
})

// request update fullname (require: accessToken)
router.put('/profile/fullname', async(req, res) => {
    const {id, fullname} = req.body;
    const response = await UserController.updateFullname(id, fullname)
    res.send(response)
})

// request update profile for admin (require: admin)
router.put('/role', async(req, res) => {
    const {id, role} = req.body;
    const response = await UserController.updateRole(id, role)
    res.send(response)
})

// request change password (require: accessToken)
router.put('/password', async(req, res) => {
    const {id, oldPassword, newPassword} = req.body;
    const response = await UserController.changePassword(id, oldPassword, newPassword)
    res.send(response)
})

router.get('/my/profile', async(req, res) => {
    const response = await UserController.getMyUserProfile(req);
    res.send(response)
})







module.exports = router
