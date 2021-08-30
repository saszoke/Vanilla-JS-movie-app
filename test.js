const fetch = require('node-fetch');
var admin = require("firebase-admin");


admin.initializeApp({
    credential: admin.credential.cert({'cred': 'YourFirebaseCredentials'})
});

const firestoredb = admin.firestore();
firestoredb.settings({ timestampsInSnapshots: true })




// async function commentInspector(movie){
//     let comments = await firestoredb.collection('movies').doc(movie).collection('comment').get()
//     let toBeReturned = await helperFunction(comments, 'like')
//     return toBeReturned
// }


// function helperIterator(toBeIterated){
//     let result = {}
//     toBeIterated.docs.forEach((item, index)=>{
//         result[`${index+1}. felhasználó`] = item.data()
//     })
//     return result
// }


// // commentInspector("The Lord of the Rings: The Return of the King").then((x)=>{
// //     console.log(x)
// // })
// // console.log('--------------------------------------------')
// let x = commentInspector("The Lord of the Rings: The Return of the King")
// console.log(x);

// let y = (async () => {
//     let zzz = await commentInspector("The Lord of the Rings: The Return of the King")
//     return zzz 
// })()

// y.then(()=>{
//     console.log(y)
// })



// async function helperFunction(obj){
//     let returnvalue = {}
//     let commentObjects = {}
//     let counter = 0
//     for (const individual_item of obj.docs){
//         let temp_like = await firestoredb.collection('movies').doc("The Lord of the Rings: The Return of the King").collection('comment').doc(individual_item.id).collection('like').get()
//         let temp_dislike = await firestoredb.collection('movies').doc("The Lord of the Rings: The Return of the King").collection('comment').doc(individual_item.id).collection('dislike').get()

//         let likes = {}
//         let dislikes = {}

//         likes = helperIterator(temp_like)
//         dislikes = helperIterator(temp_dislike)

//         reactions = {}
//         reactions['likes'] = likes
//         reactions['dislikes'] = dislikes
        
//         returnvalue[individual_item.id] = reactions
//         counter++
//     }
//     return returnvalue
// }



//the.movie.blog.app@gmail.com
// WKW!cy<7"$]pQbTT

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {'cred':'yourGmailCredentials'}
    });

//     var mailOptions = {
//     from: '',
//     to: '',
//     subject: 'Sending Email using Node.js',
//     text: 'That was easy!'
//     };

//     transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//         console.log(error);
//     } else {
//         console.log('Email sent: ' + info.response);
//     }
// });




// async function test(x){
//     let presence_by_username = await firestoredb.collection('accounts').where('username', '==', x).get()
//     let presence_by_email = await firestoredb.collection('accounts').where('email', '==', x).get()
    


//     // try{

//     // } catch(error){
//     //     console.log('No such user')
//     // }
//         try{
//         console.log(presence_by_username.docs[0])
//         if (presence_by_username.docs[0] == undefined){
//             console.log('Ez így egy jó nagy undefined...')
//         }
    
//         } catch(error){
//         console.log('Ilyen username nincs.')
//         }
//         try{
//         console.log(presence_by_email.docs[0].data().email)
    
//         } catch(error){
//         console.log('Ilyen email nincs.')
// }
// }

// test('s.zooke@hotmail.com');

function getToken(){
    let token = ''
    for (let i=0;i<6;i++){
      token += Math.floor(Math.random() * 10);
    }
    return token
}

console.log(getToken())

