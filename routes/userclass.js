var encrypt = require('./encrypt.js')
var admin = require("firebase-admin");
const firestoredb = admin.firestore();
const fetch = require('node-fetch');
const { json } = require('express');
var nodemailer = require('nodemailer');


const yourGMAILcred = {}


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: yourGMAILcred
    });
let today = new Date()

module.exports = class User{
    constructor(name){
        this.name = name
    }

    async login(pass){
        let user_coll = await firestoredb.collection('accounts').where('username', '==', `${this.name}`).get()
        let user_instance = await  user_coll.docs[0].data()

        if (pass == user_instance.password){
            return true
        } else {
            return false
        }
    }


    async reset(password){
        let userRef = firestoredb.collection("accounts").doc(this.name);

        userRef.update({
            password: password
        })
        .then(()=>{
            console.log('Document succesfully updated.');
        })
        .catch((error)=>{
            console.log('Error updating document: ', error);
        })
        return {response: 0, username: this.name}
    }

    async register(email, pass){
        let raw = await firestoredb.collection('accounts').where('hash', '==', `${encrypt(this.name)}`).get()
        let mailOptions = {
            from: '*****@gmail.com',
            to: email,
            subject: 'Succesful Registration',
            text: `Welcome on board, ${this.name}`
            };
        try{
            let check = await raw.docs[0].data()
            console.log(check)
            console.log('Registration failed')
            return {response: 1, username: this.name}
            } catch(error){
            firestoredb.collection('accounts').doc(this.name).set(
                {
                hash: encrypt(this.name),
                password: pass,
                username: this.name,
                email: email
                }
            )
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            return {response: 0, username: this.name}
        }
    }

    async getNumbers(title){

        let comments = await firestoredb.collection('movies').doc(title).collection('comment').get()//
        let likes = await firestoredb.collection('movies').doc(title).collection('like').get()//
        let hearts = await firestoredb.collection('movies').doc(title).collection('love').get()//

        return {comments: comments.docs.length,
                likes: likes.docs.length,
                hearts: hearts.docs.length}
        }

    async searchMovie(title){
        let movie_response = await fetch(`http://www.omdbapi.com/?t=${title}&apikey=5f16839e`);
        let movie_data = await movie_response.json()
        let numbers = await this.getNumbers(movie_data.Title)  
        
        let comments = await firestoredb.collection('movies').doc(movie_data.Title).collection('comment').get()//
        let likes = await firestoredb.collection('movies').doc(title).collection('like').get()//
        let hearts = await firestoredb.collection('movies').doc(title).collection('love').get()//
        let user_data = await this.checkUserData(movie_data.Title, this.name)

        let comment_data = await this.commentInspector(movie_data.Title)

        let reactions = []
        let likes_n_dislikes = {}
        
        comments.docs.forEach((x, index) => {

                reactions.push(x.data())
                reactions[index].testCounter = 0
                reactions[index].id = x.id
        })

    
        // merge movie_data & user data
        movie_data.Likes = numbers.likes;
        movie_data.Hearts = numbers.hearts;
        movie_data.Comments = numbers.comments;
    
        movie_data.CommentsCollection = reactions
        
        // use object destructuring
        movie_data.Reactions = user_data

        movie_data.Comment_Likes_Dislikes = comment_data

        return movie_data
    }


    async handleCommentReaction(movie, comment, reaction){

        let comments = await firestoredb.collection('movies').doc(movie).collection('comment').where('comment', '==', comment).get()


        // remove the opposite reaction & check presence
        if (reaction == 'like'){
            let presence = await firestoredb.collection('movies').doc(movie).collection('comment').doc(comments.docs[0].id).collection(reaction).where('user', '==', this.name).get()
            try{
                console.log(presence.docs[0].id)
            } catch(err){
                console.log(err)
                firestoredb.collection('movies').doc(movie).collection('comment').doc(comments.docs[0].id).collection(reaction).add({
                    user: this.name
                    })
            }
            let presence_opposite = await firestoredb.collection('movies').doc(movie).collection('comment').doc(comments.docs[0].id).collection('dislike').where('user', '==', this.name).get()
            
            
            try{
                firestoredb.collection('movies').doc(movie).collection('comment').doc(comments.docs[0].id).collection('dislike').doc(presence_opposite.docs[0].id).delete()
            } catch(err){
                console.log('removing dislike failed')
            }
        } else {
            let presence = await firestoredb.collection('movies').doc(movie).collection('comment').doc(comments.docs[0].id).collection(reaction).where('user', '==', this.name).get()
            try{
                console.log(presence.docs[0].id)
            } catch(err){
                console.log(err)
                firestoredb.collection('movies').doc(movie).collection('comment').doc(comments.docs[0].id).collection(reaction).add({
                    user: this.name
                    })
            }
            let presence_opposite = await firestoredb.collection('movies').doc(movie).collection('comment').doc(comments.docs[0].id).collection('like').where('user', '==', this.name).get()
            try{
                firestoredb.collection('movies').doc(movie).collection('comment').doc(comments.docs[0].id).collection('like').doc(presence_opposite.docs[0].id).delete()
            } catch(err){
                console.log('removing like failed')
            }

        }
        return {response: 'OK'}
        
    }

    async checkUserData(title, user){

            let active_like = await this.checkPresence(title, user, 'like')
            let active_heart = await this.checkPresence(title, user, 'love')
            let sent_comment = await this.checkPresence(title, user, 'comment')
            return {
                active_like: active_like, //await checkPresence('likes'),
                active_heart: active_heart, //await checkPresence('hearts'),
                sent_comment: sent_comment //await checkPresence('comments')
            }
        }
    async checkPresence(title, user, reaction){
        let return_value = false
        let megvarjuk = await firestoredb.collection('movies').doc(title).collection(reaction).get()
    
        if (megvarjuk.docs.some(x => x.data().user == user)){
            return_value = true

        }
        return return_value
        }


    async handleComment(title, comment){
        firestoredb.collection('movies').doc(title).collection('comment').add({
            comment:  comment, //form.nameattribute.value,
            date: admin.firestore.Timestamp.fromDate(today),
            user: this.name
        })
        return {response: 0}        
    }

    async handleReaction(title, reaction){
        let action = 'addition'
        let active = 'false'
        try{
            let moviepres = await this.moviePresence(title)
            let presence = await this.checkPresenceReaction(this.name, title, reaction)
            if (presence){            
                action = 'removal'
                
                let toBeDeleted = await firestoredb.collection('movies').doc(title).collection(reaction).where('user', '==', this.name).get()
                toBeDeleted.forEach(x=>{ firestoredb.collection('movies').doc(title).collection(reaction).doc(x.id).delete()})
            }else{
                if (moviepres){
                    active = true
                    firestoredb.collection('movies').doc(title).collection(reaction).add({
                    user: this.name
                    })
                } else {
                    active = true
                    this.newMovie(title).then(()=>{
                    firestoredb.collection('movies').doc(title).collection(reaction).add({
                        user: this.name
                    })
                })}
            }
        } catch(error){
            console.log(error)
            // create movie
            this.newMovie(title).then(()=>{
            active = true
            firestoredb.collection('movies').doc(title).collection(reaction).add({
                user: this.name
            })
            })}
        return {response: 0, action: action, active: active}
    }


    async moviePresence(title){
        let moviedocs = await firestoredb.collection('movies').get()
        if (moviedocs.docs.some(x => x.data().title == title)){
            return true
            } return false
        }
        
    async newMovie(title){
        return await firestoredb.collection('movies').doc(title).set(
            {title: title})
    }

    async checkPresenceReaction(user, title, reaction){
        let return_value = false
        let megvarjuk = await firestoredb.collection('movies').doc(title).collection(reaction).get()
    
        if (megvarjuk.docs.some(x => x.data().user == user)){
            return_value = true
        }
        return return_value
    }

    
    async commentInspector(movie){
        let comments = await firestoredb.collection('movies').doc(movie).collection('comment').get()
        let toBeReturned = await this.helperFunction(comments, 'like')
        return toBeReturned
    }


    helperIterator(toBeIterated){
        let result = {}
        toBeIterated.docs.forEach((item, index)=>{
            result[`${index+1}. felhasználó`] = item.data()
        })
        return result
    }

    async helperFunction(obj){
        let returnvalue = {}
        let commentObjects = {}
        let counter = 0
        for (const individual_item of obj.docs){
            let temp_like = await firestoredb.collection('movies').doc("The Lord of the Rings: The Return of the King").collection('comment').doc(individual_item.id).collection('like').get()
            let temp_dislike = await firestoredb.collection('movies').doc("The Lord of the Rings: The Return of the King").collection('comment').doc(individual_item.id).collection('dislike').get()
    
            let likes = {}
            let dislikes = {}
    
            likes = this.helperIterator(temp_like)
            dislikes = this.helperIterator(temp_dislike)
    
            let reactions = {}
            reactions['likes'] = likes
            reactions['dislikes'] = dislikes
            
            returnvalue[individual_item.id] = reactions
            counter++
        }
        return returnvalue
    }
}

