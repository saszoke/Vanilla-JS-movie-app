import { Guest } from './guest.js';

let BASE_URL = ''


export class User extends Guest{
    constructor(name){
        super();
        this.name = name
        this.logged_in = false
    }


    async logout(){
        let x = await fetch(`${BASE_URL}/users/authentication/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user: this.name})})
        let y = await x.json()
        return y
    }


    async searchMovie(title){
        let x = await fetch(`${BASE_URL}/users/searchmovie`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user: this.name, title: title})})
        let y = await x.json()
        return y
    }

    async reactMovie(title, reaction){
        let x = await fetch(`${BASE_URL}/users/reaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user: this.name, movie: title, reaction: reaction})})

        let y = await x.json()
        return y
    }

    async reactComment(type, title, comment){
        if (type == 'comment_like'){
            type = 'like'
        } else {
            type = 'dislike'
        }
        let x = await fetch(`${BASE_URL}/users/movie/comments/reaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user: this.name, movie: title, reaction: type, comment: comment})
        })
        let y = await x.json()
        return y
    }

    async sendComment(title, comment){
        let x = await fetch(`${BASE_URL}/users/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user: this.name, movie: title, comment: comment})})

        let y = await x.json()
        return y
    }

    checkMyCommentReaction(data){
        let reaction = 'neutral'
        for (const [key, value] of Object.entries(data.likes)){
            if (value.user == this.name){reaction = 'like'}
        }
        for (const [key, value] of Object.entries(data.dislikes)){
            if (value.user == this.name){reaction = 'dislike'}
        }

        return reaction
    }
}