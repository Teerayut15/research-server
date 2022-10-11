const express = require('express');
const router = express.Router();
const HistoryController = require('../controllers/HistoryController')
const AdminMiddleware = require('../middlewares/Admin')

router.get('/', AdminMiddleware, async (req, res) => {
    const response = await HistoryController.index()
    res.send(response)
})
router.get('/lastest', AdminMiddleware, async (req, res) => {
    const response = await HistoryController.getLastHistoreis()
    res.send(response)
})

module.exports = router;