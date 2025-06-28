const express = require('express');
const app = express()
const path = require('path');
const mongoose = require('mongoose');
const cookie = require('cookie-parser')
const bodyparser = require('body-parser')
const adminroutes = require("./routes/admin.router");

app.use(bodyparser.urlencoded({ extended: true }))
app.use(cookie())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('views','views')

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads',express.static('uploads'))

// routes
app.use('/',adminroutes)


mongoose.connect('mongodb://127.0.0.1:27017/blog')
  .then(() => console.log('Connected! to MongoDB'));
  app.listen(3000,()=>{
   try {
     console.log('Server is running on port 3000')
   } catch (error) {
    console.log('Server crash')
   }
  });