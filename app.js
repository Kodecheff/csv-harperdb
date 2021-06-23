require('dotenv').config()
const fs = require('fs')
const path = require('path')
const neatCsv = require('neat-csv')
const express = require('express');
const multer = require('multer')
const app = express()
const db = require('./config/db')


// Configure static files
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: false}))



// Form page (index)
app.get('/', async (req, res) => { 

  res.render('index',{
    pageTitle: "Form"
  })

})


// get all records from database
app.get('/record', (req, res) => { 

  db.searchByValue({
    schema: process.env.SCHEMA,
    table: "csv",
    searchValue: "*",
    searchAttribute: '_id',
    attributes: ["*"]
  }, (err, response) => {
    if (err) return res.status(500).json({message: "Operation failed"})

    console.log(response.data)

    res.render('record',{
      pageTitle: "csv",
      records: response.data
    })
  })

})

// configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

// configure file filter
const fileFilter = function(req, file, cb) {
  if(file.mimetype.split('/')[1] === 'csv'){
    return cb(null, true)
  }else{
    return cb(new Error('Only csv files are allowed'), false)
  }
}

// Calling multer function
const upload = multer({storage: storage, fileFilter: fileFilter})



// upload data to database
app.post('/upload', upload.single('file'), async (req, res) => {

  try{
    const data = await db.dropTable({
      schema: process.env.SCHEMA,
      table: 'csv'
    })
  }catch(e){
    console.log('Failed to drop table')
  }

  try{
    const data = await db.createTable({
      schema: process.env.SCHEMA,
      table: 'csv',
      hashAttribute: '_id'
    })
  }catch(e){
    console.log('Failed to create table')
  }


  // read file from system
  fs.readFile(req.file.path, async (err, data) => {
  const csvData = await neatCsv(data)

    // insert file
    db.insert({
      schema: process.env.SCHEMA,
      table: "csv",
      records: csvData
    }, (err, response) => {
      if (err) return res.status(500).json(err)

      res.redirect(302, "/record")
    })
  })
})



module.exports = app;