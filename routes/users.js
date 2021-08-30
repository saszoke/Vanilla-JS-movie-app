

var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
var admin = require("firebase-admin");

var encrypt = require('./encrypt.js')

var felhasznalo = require('./userclass.js')

const firestoredb = admin.firestore();

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

var nodemailer = require('nodemailer');



let peldany = undefined

let active_users = []



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/reset/token/checker', function(req,res){ // Második resetnél 2 active user a listában
  let index = active_users.indexOf(active_users.find( instance => instance.name == req.body.username))
  if (index >= 0){
    console.log('removing user from active users')
    active_users.splice(index, 1);
  }
  console.log(index)
  peldany = new felhasznalo(req.body.username)
  peldany.reset(req.body.password)
  active_users.push(peldany)
  console.log('active users after reset')
  console.log(active_users)
  res.json({response: 0, username: peldany.name, message: `Password has been reset for ${req.body.username}`})
})

router.post('/registration/', async function(req, res){
  peldany = new felhasznalo(req.body.username)
  let attempt = await peldany.register(req.body.email, req.body.password)

  if (attempt.response == 0){
    res.json({response: 0, username: peldany.name, info: `Welcome on board, ${req.body.username}`})
    console.log('sikeres regisztráció')
    active_users.push(peldany)
  } else {
    res.json({response: 1, username: peldany.name, info: 'Registration failed'}) 
    console.log('sikertelen regisztráció')
    peldany = undefined
  }
})




router.post('/authentication/login', async function(req, res){
  // check for active session first



  peldany = new felhasznalo(req.body.username)
  let attempt = await peldany.login(req.body.password)
  console.log(attempt)
  if (attempt == true){
    console.log('sikeres belépés')
    let index = active_users.indexOf(active_users.find( instance => instance.name == req.body.username))
    console.log(active_users)
    console.log(index)
    if (index > 0){
      console.log('removing user from active users')
      active_users.splice(index, 1);
    }
    res.json({response: 0, username: peldany.name, info: `Welcome back, ${req.body.username}`})
    active_users.push(peldany)
    console.log('active users after all')
    console.log(active_users)
  } else {
    res.json({response: 1, username: 'Guest', info: 'Login failed'})
    peldany = undefined
  }
});

router.post('/authentication/logout', async function(req, res){
  console.log('Received logout request for: ', req.body.user)
  let index = active_users.indexOf(active_users.find( instance => instance.name == req.body.user))
  active_users.splice(index, 1);
  
  console.log(active_users)
  res.json({response: 0, username: req.body.user, info: `Bye ${req.body.user}`})
});

router.post('/searchmovie', async function(req, res){
  let user = active_users.find( instance => instance.name == req.body.user)
  console.log('Searching on behalf of: ', user.name)
  try{
    let movie_data = await user.searchMovie(req.body.title)
    res.json(movie_data)
  }catch(error){
    res.send({response: 1, info: 'No such movie'})
  }
});



router.post('/reaction', async function(req, res){
  let user = active_users.find( instance => instance.name == req.body.user)
  console.log('Reactions of: ', user.name)
  let result = await user.handleReaction(req.body.movie, req.body.reaction)

  res.json(result)
})

router.post('/movie/comments/reaction', async function(req, res){
  let user = active_users.find( instance => instance.name == req.body.user)
  let result = await user.handleCommentReaction(req.body.movie, req.body.comment, req.body.reaction)
  res.json(result)
})

router.post('/comment', async function(req, res){
  let user = active_users.find( instance => instance.name == req.body.user)
  console.log('sending comment on behalf of', user)
  let result = await user.handleComment(req.body.movie, req.body.comment)
  let movie_detail = await user.searchMovie(req.body.movie)
  res.json(movie_detail)
})

module.exports = router;


