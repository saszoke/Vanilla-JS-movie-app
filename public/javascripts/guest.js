let BASE_URL = ''

export class Guest {
    constructor(){
        this.name = 'Guest'
        this.logged_in = false
    }


    async searchMovie(title){
        if (title.length > 0){
            let x = await fetch(`${BASE_URL}/movie/${title}`)
            let y = await x.json()
            return y
        } else{
            return {response: 3, info: 'Enter a title'}
        }

    }


    async register(username, email, password, password_repeat){
        if (email.includes('@') && password === password_repeat){
            let x = await fetch(`${BASE_URL}/users/registration/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email: email, username: username, password: password})})
            let y = await x.json()
            return y
        } else {
            return { response: 1, info: 'Registration failed' }
        }
    }


    async attemptLogin(username, password){
        if (username.length > 0 && password.length > 0){
            let x = await fetch(`${BASE_URL}/users/authentication/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username: username, password: password})})
            let y = await x.json()
            return y
        } else {
            return {response: 1, username: username, info: 'Username & Password cannot be empty'}
        }

    }

    async resetPassword(username,password,repeat){
        if (!password == repeat){
            return {response: 1, message: 'Passwords do not match'}
        } else {
            let x = await fetch(`${BASE_URL}/users/reset/token/checker`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username: username, password: password})})
            let y = await x.json()
            return y
        }
    }


    async passwordResetAttempt(username){
        if (username.length > 0){
            let attempt = await fetch(`${BASE_URL}/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username: username})
            })
            let x = await attempt.json()
            return x
        } else {
            return {message: 'Enter your username or email address'}
        }
    }

    async submitToken(username,token){
        let attempt = await fetch(`${BASE_URL}/reset/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username: username, token: token})
            })
        let x = await attempt.json()
        return x
    }
}
