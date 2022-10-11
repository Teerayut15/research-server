const express = require('express');
const router = express.Router()
const ThesisController = require('../controllers/ThesisController')
const AdminMiddleware = require('../middlewares/Admin')
const PassportMiddleware = require('../middlewares/Passport')
const FacultyController = require('../controllers/FacultyController')
const HistoryController = require('../controllers/HistoryController');
const multer = require('multer');
const ResponseController = require('../controllers/ResponseController');
const PassportController = require('../controllers/PassportController')
const UserController = require('../controllers/UserController')


// request all thesis
router.get('/', async (req, res) => {
    const response = await ThesisController.index()
    await res.send(response)
})

// request add thesis
router.post('/', async (req, res) => {
    let {thesisText, filePdfText} = req.body
    thesisText.creator_2 = (thesisText.creator_2 !== "") ? thesisText.creator_2 : null;
    thesisText.creator_3 = (thesisText.creator_3 !== "") ? thesisText.creator_3 : null;
    const response = await ThesisController.store(thesisText, filePdfText, req)
    res.send(response)
})
// request update thesis views
router.put('/', async (req, res) => {
    const thesisInput = req.body;
    const response = await ThesisController.setCount(thesisInput.thesis_id, thesisInput.column, thesisInput.operator)
    res.send(response)
})

// request 1 thesis
router.get('/:thesis_id', async (req, res) => {
    const thesisId = req.params.thesis_id
    const response = await ThesisController.show(thesisId)
    await res.send(response)
})

// request get all file for this thesis
router.get('/:thesis_id/files', async(req, res) => {
    const thesisId = req.params.thesis_id
    const response = await ThesisController.getAllFile(thesisId)
    await res.send(response)
})
// request get file for this thesis
router.get('/:thesis_id/download/:file_id', PassportMiddleware, async(req, res) => {
    const {thesis_id, file_id} = req.params
    const path = "public/upload/pdf/"
    const file = await ResponseController.findById(file_id, "files")
    const filename = file[0].file_name+"."+file[0].file_type

    const passportPayload = PassportController.checkAccessToken(req)
    const user = await UserController.checkUsernameExist(passportPayload.username)
    const today = new Date();
    const historyInput = {
        "user_id": user.id,
        "thesis_id": thesis_id,
        "note": `ดาวน์โหลดไฟล์ : ${filename}`,
        "type": "download",
        "date": `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
        "time": `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
    }
    await HistoryController.store(historyInput)
    await ThesisController.setCount(thesis_id, "downloads", "+")
    await res.download(path+filename)
})

// request update thesis
router.put('/:thesis_id', async (req, res) => {
    const thesisId = req.params.thesis_id
    const note = req.body.note
    delete req.body.note
    req.body.creator_2 = (req.body.creator_2 !== "") ? req.body.creator_2 : null;
    req.body.creator_3 = (req.body.creator_3 !== "") ? req.body.creator_3 : null;
    const response = await ThesisController.update(thesisId, req, note)
    res.send(response)
})

// request delete thesis
router.delete('/:thesis_id', async (req, res) => {
    const thesisId = req.params.thesis_id
    const response = await ThesisController.destroy(thesisId)
    res.send(response)
})



module.exports = router;