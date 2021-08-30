var express = require('express');
var router = express.Router();
const path = require('path');
const fetch = require('node-fetch');
var admin = require("firebase-admin");
var nodemailer = require('nodemailer');



const yourAPIkey = ''
const yourGMAILcred = {}
const yourFIREBASEcred = {}



var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: yourGMAILcred
    });

admin.initializeApp({
  credential: admin.credential.cert(yourFIREBASEcred)
});


const firestoredb = admin.firestore();
firestoredb.settings({ timestampsInSnapshots: true })


let password_reset_tokens = {}
let reset_attempts = {}

/* GET home page. */
router.get('/', function(req,res){
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});






router.post('/reset/token', function(req,res){

  setTimeout(() => {
    delete delete reset_attempts[req.body.username]
  }, 300000);
  if (reset_attempts[req.body.username] >= 3){
    delete password_reset_tokens[req.body.username]
    setTimeout(() => {
      delete delete reset_attempts[req.body.username]
    }, 180000);
    res.send({response: 2, message: `Max`, attempts: reset_attempts[req.body.username]})
  } else{
      if (password_reset_tokens[req.body.username] == req.body.token){
        console.log('Token accepted')
        delete password_reset_tokens[req.body.username]
        delete reset_attempts[req.body.username]
        res.send({response: 0, message: `OK`})
      } else{
        if (reset_attempts[req.body.username] == undefined){
          console.log('Token refused')
          reset_attempts[req.body.username] = 1
        } else {
          console.log('Token refused')
          reset_attempts[req.body.username]++
        }
      res.send({response: 1, message: `Fail`, attempts: reset_attempts[req.body.username]})
      console.log(`Password reset attempts: ${reset_attempts[req.body.username]}`)
      }
  }
  console.log(password_reset_tokens)

})

router.post('/reset', async function(req, res){
  let presence_by_username = await firestoredb.collection('accounts').where('username', '==', req.body.username).get()
  let presence_by_email = await firestoredb.collection('accounts').where('email', '==', req.body.username).get()







  if (presence_by_username.docs[0] == undefined){
    if (presence_by_email.docs[0] == undefined){
      res.send({response: 1, message: 'No such user'})
    } else{
      let token = getToken()
      password_reset_tokens[presence_by_email.docs[0].data().username] = token
      setTimeout(() => {
        delete password_reset_tokens[presence_by_email.docs[0].data().username]
      }, 300000);
      let mailOptions = {
        from: '****@gmail.com',
        to: presence_by_email.docs[0].data().email,
        subject: 'Password reset',
        text: `Dear ${presence_by_email.docs[0].data().username},\nWe received a password reset request for this account.\nIf you did not request any reset, please ignore this message. Use your token below to update your password on the Moovie Rate website. \n Your token is: ${token}`
        };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
      });
      res.send({response: 0, message: `An email with instructions has been sent`, user: presence_by_email.docs[0].data().username, token: token})
    }
  } else{
    let token = getToken()
    password_reset_tokens[presence_by_username.docs[0].data().username] = token
    setTimeout(() => {
      delete password_reset_tokens[presence_by_username.docs[0].data().username]
    }, 300000);
    let mailOptions = {
      from: '****@gmail.com',
      to: presence_by_username.docs[0].data().email,
      subject: 'Password reset',
      text: `Dear ${presence_by_username.docs[0].data().username},\nWe received a password reset request for this account.\nIf you did not request any reset, please ignore this message. Use your token below to update your password on the Moovie Rate website. \n Your token is: ${token}`
      };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          console.log(error);
      } else {
          console.log('Email sent: ' + info.response);
      }
    });
    res.send({response: 0, message: `An email with instructions has been sent`, user: presence_by_username.docs[0].data().username, token: token})
  }



})

router.get('/movie/:title', async function(req,res){
  try{
    let response = await fetch(`http://www.omdbapi.com/?t=${req.params['title']}&apikey=${yourAPIkey}`);
    let data = await response.json()
    let numbers = await getNumbers(data.Title)
    data.Likes = numbers.likes;
    data.Hearts = numbers.hearts;
    data.Comments = numbers.comments;
    res.send(data)
  } catch(error){
    res.send({response: 1, info: 'No such movie'})
  }
});

module.exports = router;


async function getNumbers(title){

  let comments = await firestoredb.collection('movies').doc(title).collection('comment').get()//
  let likes = await firestoredb.collection('movies').doc(title).collection('like').get()//
  let hearts = await firestoredb.collection('movies').doc(title).collection('love').get()//

  return {comments: comments.docs.length,
          likes: likes.docs.length,
          hearts: hearts.docs.length}
}



function getToken(){
  let token = ''
  for (let i=0;i<6;i++){
    token += Math.floor(Math.random() * 10);
  }
  return token
}