const express = require('express');
const router = express.Router();
const VisitorController = require('../controllers/VisitorController');
const TimeController = require('../controllers/TimeController');
const HistoryController = require('../controllers/HistoryController')
const AdminMiddleware = require('../middlewares/Admin')

router.get('/visit', async (req, res) => {
    const response = await VisitorController.index()
    res.send(response)
})
router.post('/visit', (req, res) => {
    const response = VisitorController.store(req)
    res.send(response)
})
router.get('/:static/:period', async (req, res) => {
    const { static, period } = req.params
    let periodDate = null
    let controllerName = null
    
    if(period == "yesterday"){
        periodDate = await TimeController.getYesterdayDate()
    }else if(period == "tomorrow"){
        periodDate = await TimeController.getTomorrowDate()
    }else if(period == "today"){
        periodDate = await TimeController.getNowDate()
    }else if(period == "all"){
        periodDate = null
    }

    if(static == "visit"){
        controllerName = await VisitorController.getTotalVisit(periodDate)
    }else if(static == "add"){
        controllerName = await HistoryController.getTotalThesis(static, periodDate)
    }else if(static == "download"){
        controllerName = await HistoryController.getTotalThesis(static, periodDate)
    }
    res.send(controllerName)
})


module.exports = router;