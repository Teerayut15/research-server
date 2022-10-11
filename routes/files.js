const express = require('express');
const router = express.Router();
const FileController = require('../controllers/FileController')
const AdminMiddleware = require('../middlewares/Admin')
const multer = require('multer')
const fs = require('fs');
const ResponseController = require('../controllers/ResponseController');

router.get('/', AdminMiddleware, async (req, res) => {
    const response = await FileController.index()
    res.send(response)
})
router.post('/', AdminMiddleware, async (req, res) => {
    const { thesisId, filePdfText } = req.body;
    const response = await FileController.store(thesisId, filePdfText)
    res.send(response)
})
router.get('/:file_id', AdminMiddleware, async (req, res) => {
    const response = await FileController.show(req.params.file_id)
    res.send(response)
})

// request upload image file
router.post('/upload/image', async (req, res) => {
    const imageStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/upload/image')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname )
        }
    })
    const uploadImage = multer({ storage: imageStorage }).single('fileImage')
    uploadImage(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        return res.status(200).send(req.file)
    })
})

// request upload pdf file
router.post('/upload/pdf', async (req, res) => {
    const pdfStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/upload/pdf')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname )
        }
    })
    const uploadPdf = multer({ storage: pdfStorage }).array('filePdf')
    uploadPdf(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        return res.status(200).send(req.files)
    })
})

// request delete file
router.delete('/:file_id', async(req, res) => {
    
    // ลบไฟล์ออกจาก server
    const pathDirectory = "public/upload/pdf/"
    const file = await ResponseController.findById(req.params.file_id, "files")
    const fileDirectory = await fs.readdirSync(pathDirectory)
    const fileExist = fileDirectory.find(filename => filename == `${file[0].file_name}.${file[0].file_type}`)
    if(fileExist == null){
        res.send("sorry, can't find this file. please try again.")
    }else{
        await fs.unlinkSync(`public/upload/pdf/${file[0].file_name}.${file[0].file_type}`)
        const deleteFileResposne = await FileController.destroy(req)
        res.send(deleteFileResposne)
    }
    
})

module.exports = router;