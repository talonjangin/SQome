var express = require('express');
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(3000, function(){
    console.log("Express server has started on port 3000")
});

////////////////////////////////////////////////////






//////////////////////////////////////

app.use('/main', function(req, res){
    res.render('main');
  })

  app.use('/login', function(req, res){
    res.render('login');
  }) 
  app.use('/signup', function(req, res){
    res.render('signup');
  }) 

  app.use('/index', function(req, res){
    res.render('index');
  }) 
  app.use('/mypage', function(req, res){
    res.render('mypage');
  })
  app.use('/moreinfo', function(req, res){
    res.render('moreinfo');
  })

  app.use('/showQr', function(req, res){
    res.render('showQr');
  })

  app.use('/new', function(req, res){
    res.render('new');
  })
  app.use('/upload', function(req, res){
    res.render('upload');
  })


/////////////////////////////////////////////
app.use(express.static('public'));
app.use(express.static('build/contracts'));