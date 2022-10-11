const express = require('express');
const app = express();
const cors = require('cors');
const users = require('./routes/user');
const auth = require('./routes/auth')
const thesiss = require('./routes/thesis')
const statics = require('./routes/static')
const historys = require('./routes/history')
const files = require('./routes/files')
const reports = require('./routes/reports')
const bodyParser = require('body-parser');
const ThesisController = require('./controllers/ThesisController');
const FacultyController = require('./controllers/FacultyController');
const FileController = require('./controllers/FileController');
const fs = require('fs');
const ReportController = require('./controllers/ReportController');
const multer = require('multer')

app.use(cors());
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// routes for users
app.use('/users', users);
// routes for auth
app.use('/auth', auth);
// routes for thesis
app.use('/thesis', thesiss);
// routes for static
app.use('/static', statics);
// routes for histories
app.use('/historys', historys);
// routes for files
app.use('/files', files);
// routes for reports
app.use('/reports', reports);

app.use(express.static('public')); 
app.use('/images', express.static('public/upload/image'));

app.get("/faculty/:facultyId", async (req, res) => {
    const response = await FacultyController.getBranchesByFacultyId(req.params.facultyId)
    res.send(response)
})
app.get("/branches/:branchesId", async (req, res) => {
    const response = await FacultyController.getFacultyByBranchesId(req.params.branchesId)
    res.send(response)
})
app.get("/search/:target/:searchText", async (req, res) => {
    const { target, searchText} = req.params
    const response = await ThesisController.search(target, searchText)
    res.send(response)
})

// test
app.get("/test/image", (req, res) => {
    // res.sendFile(__dirname+"/public/upload/image/cover_2.jpg")
    const filePath = __dirname+"/public/upload/image/cover_2.jpg";
    const stat = fs.statSync(filePath);
    fs.readFile(filePath, (err, data) => {
        if(err) throw err;
            const base64Image = Buffer.from(data, 'binary').toString('base64')
            res.end(base64Image)
    })
})
app.get('/test/watermark', async (req, res) => {
    const path = "public/upload/pdf/"
    const filename = 'new-doc.pdf'
    await res.download(path+filename)
});

app.listen('3001', () => {
    console.log('Server is running on port 3001');
})