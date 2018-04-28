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



//Home route
app.get('/', (req, res) => {
  res.render('home')
});

app.get('/assigments');

app.get('/tests');

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

app.post('/assigments/upload');

app.post('/tests/upload');

//starting server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
