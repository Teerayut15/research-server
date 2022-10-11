const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController')
const AdminMiddleware = require('../middlewares/Admin')

router.get('/', async (req, res) => {
    const response = await ReportController.index()
    res.send(response)
})
router.post('/', async (req, res) => {
    const response = await ReportController.store(req)
    res.send(response)
})
router.get('/:report_id', async (req, res) => {
    const response = await ReportController.show(req.params.report_id)
    res.send(response)
})
router.put('/:report_id', async (req, res) => {
    const response = await ReportController.update(req)
    res.send(response)
})

module.exports = router;