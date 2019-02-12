'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

const bodyparser = require('body-parser')
const validUrl = require('valid-url');

const UrlFunc = require('./models/UrlModel')

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });

app.use(cors());
app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/shorturl/new', async (req, res) => {
  console.log(`${req.path} ${JSON.stringify(req.body)}`)
  let { url } = req.body
  try {
    if(!validUrl.isWebUri(url))
      return res.json({ error: "invalid URL" })

    let shorted = await UrlFunc.shortThis(url)
    console.log(JSON.stringify(shorted))
    res.json({original_url: shorted.url, short_url: shorted.id, shorted})
    
  } catch (ex) {
    console.error(ex)
  }
})

app.get('/api/shorturl/:id?', async (req, res) => {
  let { id } = req.params, obj
  
  if(!!!id) return res.redirect('/')
  try{
    obj = await UrlFunc[/^\d+$/.test(id)? 'getById':'getByAlias'](id)
    obj = obj || {}
    res.redirect(301, obj.url || '/')
  } catch (ex) {
    console.error(ex)
    res.redirect('/')
  }
})

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
