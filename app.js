const express = require('express');
const path = require('path');
const pug = require('pug');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const methodOverride = require('method-override');
const AWS = require('aws-sdk');
const fs = require('fs');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const admin = require("firebase-admin");

const app = express();
const port = process.env.PORT || 3000;

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

//methodOverride middleware
app.use(methodOverride('_method'));

//aws credentials setting
AWS.config.update({
  'apiVersion': '2012-08-10',
  'accessKeyId': 'AKIAIF3XCU57GP6KMLJQ',
  'secretAccessKey': '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',
  'region': 'ap-south-1'
})
//using s3 of aws
let s3 = new AWS.S3();
let myBucketAssigments = 'gt-assigments';
let myBucketTests = 'gt-tests';
let myKey



//Firebase configrations
// Fetch the service account key JSON file contents
let serviceAccount = require("./config/node-gt-e8e4a-firebase-adminsdk-n3bgj-cb4256870e.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://node-gt-e8e4a.firebaseio.com/"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
let db = admin.database();
// setting reference for assigments db
let ref_assigment = db.ref("assigments");
// setting reference for tests db
let ref_test = db.ref("tests");


//multer uploading file to node server for assigments
app.post('/assigments/upload', upload.single('file'), function (req, res, next) {
  // req.file is the `avatar` file
  console.log(req.file);
  myKey = req.file.filename;
  // req.body will hold the text fields, if there were any

  fs.readFile(req.file.path, function (err, data) {
    if (err) { throw err; }

       params = {Bucket: myBucketAssigments, Key: myKey, Body: data};

       //
       s3.putObject(params, function(err, data) {
           if (err) {
               throw err;
           } else {
             //
             ref_assigment.push({
               title: req.body.title,
               dueDate: req.body.due,
               key: myKey,
               mimetype: req.file.mimetype,
               originalname: req.file.originalname,
               size: req.file.size
             });
               console.log("Successfully uploaded data to myBucket/myKey");

               //removing file from fs destination folder that was uploaded in node server
               fs.unlink(req.file.path, (err) => {
                if (err) throw err;
                console.log('successfully deleted from server that was uploaded');
                res.redirect('/assigments')
              });
           }
        });
  });

})


//multer uploading file to node server for tests
app.post('/tests/upload', upload.single('file'), function (req, res, next) {
  // req.file is the `avatar` file
  console.log(req.file);
  myKey = req.file.filename;
  // req.body will hold the text fields, if there were any

  fs.readFile(req.file.path, function (err, data) {
    if (err) { throw err; }

       params = {Bucket: myBucketTests, Key: myKey, Body: data};

       //
       s3.putObject(params, function(err, data) {
           if (err) {
               throw err;
           } else {
             //
             ref_test.push({
               title: req.body.title,
               key: myKey,
               mimetype: req.file.mimetype,
               originalname: req.file.originalname,
               size: req.file.size
             });
               console.log("Successfully uploaded data to myBucket/myKey");

               //removing file from fs destination folder that was uploaded in node server
               fs.unlink(req.file.path, (err) => {
                if (err) throw err;
                console.log('successfully deleted from server that was uploaded');
                res.redirect('/tests')
              });
           }
        });
  });

})

//Home route
app.get('/', (req, res) => {
  res.render('home')
});

//listing assigments
app.get('/assigments', (req, res) => {
    ref_assigment.on("value", function(snapshot) {
    res.render('index_assigment', {
      data: snapshot.val()
    });
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
});

//downloading Option for assigments
app.get('/download/assigment/:key/:name', (req, res) => {
    let filestream = s3.getObject({
    Bucket: myBucketAssigments,
    Key: req.params.key
  }).createReadStream();
  res.attachment(req.params.name);
  filestream.pipe(res);
})

//listing tests
app.get('/tests', (req, res) => {
    ref_test.on("value", function(snapshot) {
    res.render('index_test', {
      data: snapshot.val()
    });
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
});

//downloading Option for tests
app.get('/download/test/:key/:name', (req, res) => {
    var filestream = s3.getObject({
    Bucket: myBucketTests,
    Key: req.params.key
  }).createReadStream();
  res.attachment(req.params.name);
  filestream.pipe(res);
})

app.get('/assigments/upload',(req, res) => {
  res.render('upload_assigment', {
    title: 'Upload New Assigment'
  });
});

app.get('/tests/upload',(req, res) => {
  res.render('upload_test', {
    title: 'Upload New Test'
  });
});

// app.post('/assigments/upload');

// app.post('/tests/upload');

//starting server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
