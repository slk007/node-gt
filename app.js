const express = require('express');
const path = require('path');
const pug = require('pug');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();
const port = process.env.PORT || 3000;

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

//methodOverride middleware
app.use(methodOverride('_method'));

//mongo URI
const mongoURI = 'mongodb://slk007:slk007@ds131137.mlab.com:31137/gt_uploads'

//create mongo connection
const connect = mongoose.createConnection(mongoURI);

//init GridFsStorage
let gfs;
connect.once('open', function () {
  //init stream
  gfs = Grid(connect.db, mongoose.mongo);
  gfs.collection('assigments');
})

//create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }

        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          metadata: {
            title: req.body.title,
            due_date: req.body.due
          },
          bucketName: 'assigments'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });



//2nd collection--------------------------------------------------------------------------
//init GridFsStorage
let gfs2;
connect.once('open', function () {
  //init stream
  gfs2 = Grid(connect.db, mongoose.mongo);
  gfs2.collection('tests');
})
//
// //create storage engine
const storage2 = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        console.log(file);
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          // metadata: {
          //   title: req.body.title,
          //   test_date: req.body.test_date
          // },
          bucketName: 'tests'
        };
        resolve(fileInfo);
      });
    });
  }
});
//
const upload2 = multer({ storage2 });
//---------------------------------------------------------------------

//Home route
app.get('/', (req, res) => {
  res.render('home')
});

app.get('/assigments', (req, res) => {

  gfs.files.find().toArray((err, files) => {

    if(!files || files.length === 0){
      res.render('index_assigment',{files: false});
    } else {
      res.render('index_assigment', {files: files});
    }
  })
});

// app.get('/tests', (req, res) => {
//
//   gfs2.files.find().toArray((err, files) => {
//
//     if(!files || files.length === 0){
//       res.render('index_test',{files: false});
//     } else {
//       res.render('index_test', {files: files});
//     }
//   })
//
//   res.render('index_test')
//
// });

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

app.post('/assigments/upload', upload.single('file'),(req, res) => {
  // res.json({file: req.file});
  res.redirect('/assigments')
});

app.post('/tests/upload', upload2.single('file'),(req, res) => {
  // res.json({file: req.file});
  // console.log(req);
  res.redirect('/tests')
});

//starting server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
