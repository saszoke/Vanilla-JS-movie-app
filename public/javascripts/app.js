import { SHA256 } from './encrypt.js';
import { Guest } from './guest.js';
import { User } from './user.js';


function main(){
    // declarations

    // declarations - main content
    const search_btn = document.querySelector('.search_btn');
    const search_field = document.querySelector('.search');
    const comment = document.querySelector('#comment')
    const like = document.querySelector('#like')
    const love = document.querySelector('#heart')
    const send_btn = document.querySelector('.send-button')
    const arrow = document.querySelector('#up')
    const dynamic_btn = document.querySelector('#myBtn')
    const welcome = document.querySelector('.welcome')
    let commentsDiv = document.querySelector('.comment-section')
    let comments = document.querySelector('.comment-list')
    const forgot = document.querySelector('.forgot')



    // declarations - sign up
    const signup_button = document.querySelector('#signup-btn')
    const signup_username = document.querySelector('#register_username')
    const signup_email = document.querySelector('#register_email')
    const signup_password = document.querySelector('#register_password')
    const signup_password_repeat = document.querySelector('#register_password_repeat')
    const close_reg_btn = document.querySelector('.close-reg')

    // declarations - log in 
    const login_button = document.querySelector('.login-btn')
    const login_name = document.querySelector('#uname')
    const login_password = document.querySelector('#pass')
    const close_log_btn = document.getElementsByClassName("close")[0];

    // declarations - reset
    const token_input = document.querySelector('#token')
    const reset_button = document.querySelector('.reset-btn')
    const close_reset_btn = document.querySelector('.close-reset')

    //declarations - password reset
    let reset_password = document.querySelector('#reset_password')
    let reset_password_repeat = document.querySelector('#reset_password_repeat')
    const reset_password_button = document.querySelector('.password-reset-btn')
    const close_password_reset_btn = document.querySelector('.close-password-reset')


    // declarations - modals
    const pre_login = document.getElementById("myBtn");
    const modal = document.getElementById("myModal");

    const reg_modal = document.getElementById("myRegisterModal");
    const reg_btn = document.getElementById("register-modal-btn");

    const info_modal = document.querySelector('.infoModal')
    const information = document.querySelector('.information')

    const reset_modal = document.getElementById("resetModal");

    const password_reset_modal = document.getElementById("PasswordResetModal");




    // Guest objektum létrehozás, login után User objektum lesz
    let currentUser = new Guest()

    // Kezdeti search
    currentUser.searchMovie('Vikings').then((data)=>{updateView(data)});

    // Scrollup segítő nyilacska
    arrow.addEventListener('click', ()=>{
        arrow.style.opacity = 0; 
        commentsDiv.style.opacity = 0;
        setTimeout(() => {
            commentsDiv.style.visibility = 'hidden'
            commentsDiv.style.display = 'none'
        }, 1300)
    })



    // token küldés password reset-hez, 3 próba után reset blokkolás
    reset_button.addEventListener('click', async ()=>{
        let tokenAttempt = await currentUser.submitToken(login_name.value, token_input.value)
        if (tokenAttempt.response == 0){
            reset_modal.style.display = 'none'
            token_input.value = ''
            password_reset_modal.style.display = 'block'
        } else if (tokenAttempt.response == 2){
            displayInformation(`Maximum number of attempts reached, try again later`)
        }
        else {
            displayInformation(`Faulty token, attempt ${tokenAttempt.attempts}`)
        }
    })


    // password reset && bejelentkeztetés && refresh view 
    reset_password_button.addEventListener('click', async ()=>{
        let attempt = await currentUser.resetPassword(
            login_name.value,
            SHA256(reset_password.value),
            SHA256(reset_password_repeat.value))
        if (!attempt.response == 1){
            currentUser = new User(attempt.username);
            currentUser.logged_in = true;
            welcome.innerText = currentUser.name
            dynamic_btn.innerText = 'Log out'
            displayInformation(attempt.message)

            
            // refresh view, with user attributes
            password_reset_modal.style.display = 'none';
            let adat = await currentUser.searchMovie(document.querySelector('.title').innerText)
            fillComments(adat)
            updateView(adat)
            adat.Reactions.active_like ? like.style.opacity = '1' : like.style.opacity = '0.55';
            adat.Reactions.active_heart ? love.style.opacity = '1' : love.style.opacity = '0.55';
            adat.Reactions.sent_comment ? comment.style.opacity = '1' : comment.style.opacity = '0.55';
        }

        login_name.value = ''
        login_password.value = ''
        reset_password.value = ''
        reset_password_repeat.value = ''
    })

    // film keresés
        // 1-es response -> nincs találat
        // 3-as response -> üres kereső mező
        // bármi más -> sikeres keresés 
    search_btn.addEventListener('click', async ()=>{
        
        let movieDetails = await currentUser.searchMovie(search_field.value)
        if (movieDetails.response == 1){
            document.querySelector('.search-movie-details').style.display = 'none'
            document.querySelector('.sad-pop').style.display = 'block'
            displayInformation(movieDetails.info)
            search_field.value = '';
        } else if (movieDetails.response == 3){
            displayInformation(movieDetails.info)
        } else {
            search_field.value = '';
            try{
                fillComments(movieDetails)
            } catch(error){
            }
            updateView(movieDetails);
        }
    })

    // password reset kérés kezelés, reset modal nyitás
        // response kód 0 : OK
        // response kód 1 : FAIL
        // response kód 3 : MAX
    forgot.onclick = async function(event){
        let attempt = await currentUser.passwordResetAttempt(login_name.value)
        displayInformation(attempt.message)

        if (attempt.response == 0){
            modal.style.display = "none";
            reset_modal.style.display = "block";
            login_name.value = attempt.user
        } else {
            login_name.value = ''
        }
    }

    // keresünk enterre
    search_field.addEventListener("keyup", function(event) {
        // 13 == enter
        if (event.keyCode === 13) {
        search_btn.click();
        }
    });


    login_button.onclick = userLogIn
    signup_button.onclick = userSignUp


    // lájk kezelés - csak Usernek - refresh view aktív lájk alapján
    like.addEventListener('click', async function(){
        if (currentUser.logged_in){
            let raw = await currentUser.reactMovie(document.querySelector('.title').innerHTML, this.getAttribute('value'))
            raw.active == true ? like.style.opacity = '1' : like.style.opacity = '0.55';
            raw.active == true ? document.querySelector('#like-counter').innerHTML ++ : document.querySelector('#like-counter').innerHTML --;
        } else {
            displayInformation('Login required')
        }
    })

    // láw kezelés - csak Usernek - refresh view aktív láw alapján
    love.addEventListener('click', async function(){
        if (currentUser.logged_in){
            let raw = await currentUser.reactMovie(document.querySelector('.title').innerHTML, this.getAttribute('value'))
            raw.active == true? love.style.opacity = '1' : love.style.opacity = '0.55';
            raw.active == true? document.querySelector('#heart-counter').innerHTML ++ : document.querySelector('#heart-counter').innerHTML --;
        } else {
            displayInformation('Login required')
        }
    })

    // komment kezelés - csak Usernek - komment mező nyitás
    comment.addEventListener('click', async function(){
        if (currentUser.logged_in){
            arrow.style.opacity = 1
            commentsDiv.style.display = 'flex'
            commentsDiv.style.opacity = 1
            commentsDiv.style.visibility = 'visible'
        } else {
            displayInformation('Login required')
        }
    })

    // komment küldés kezelés - küldés után komment lista refresh
    send_btn.addEventListener('click', async function(){
        
        let toBeSent = document.querySelector('.comment-field').value
        if (toBeSent.trim().length > 0 ){
            document.querySelector('.comment-field').value = ''
            let raw = await currentUser.sendComment(document.querySelector('.title').innerHTML, toBeSent)
            try{
                raw.Comments == document.querySelector('#comment-counter').innerHTML ? displayInformation('Comment has not been sent') : document.querySelector('#comment-counter').innerHTML ++
            } catch(error) {
                displayInformation('Comment has not been sent')
            }
            fillComments(raw)
            toBeSent = ''
        } else {
            displayInformation('Empty comment')
        }
    })

    // Login - Logout dinamikus gomb kezelés 
    dynamic_btn.onclick = async function() {
        if (!currentUser.logged_in){
            modal.style.display = "block";
        } else {
            let resp = await currentUser.logout()
            displayInformation(resp.info)
            currentUser = new Guest()       
            like.style.opacity = '0.55';
            love.style.opacity = '0.55';
            comment.style.opacity = '0.55';
            dynamic_btn.innerText = 'Log in'
            welcome.innerText = ''
        }
    }


    // modalok nyitása - zárása
    reg_btn.onclick = function() {
        reg_modal.style.display = "block";
        modal.style.display = "none";
        login_name.value = ''
    }

    close_log_btn.onclick = function() {
        modal.style.display = "none";
        login_name.value = ''
    }

    close_reg_btn.onclick = function() {
        reg_modal.style.display = "none";
        login_name.value = ''
    }

    close_reset_btn.onclick = function(){
        reset_modal.style.display = 'none';
        login_name.value = ''
    }
    close_password_reset_btn.onclick = function(){
        password_reset_modal.style.display = 'none';
        login_name.value = ''
    }
    


    // modalok zárása kikattintásnál is 
    window.onclick = function(event) {
        if (event.target == reg_modal) {
            reg_modal.style.display = "none";
            login_name.value = ''
        }
        else if (event.target == modal) {
            modal.style.display = "none";
            login_name.value = ''
        }
        else if (event.target == reset_modal) {
            reset_modal.style.display = "none";
            login_name.value = ''
        }
        else if (event.target == password_reset_modal) {
            password_reset_modal.style.display = "none";
            login_name.value = ''
        }
    }





    // bejelentkezési kísérlet - password hasheléssel - sikeres login után refresh view
    async function userLogIn(){
            let attempt = await currentUser.attemptLogin(login_name.value, SHA256(login_password.value))
            if (attempt.response == 0){
                displayInformation(attempt.info)
                currentUser = new User(attempt.username);
                currentUser.logged_in = true;
                
                // refresh view, with user attributes

                modal.style.display = "none";
                let adat = await currentUser.searchMovie(document.querySelector('.title').innerText)
                fillComments(adat)
                updateView(adat)
                adat.Reactions.active_like ? like.style.opacity = '1' : like.style.opacity = '0.55';
                adat.Reactions.active_heart ? love.style.opacity = '1' : love.style.opacity = '0.55';
                adat.Reactions.sent_comment ? comment.style.opacity = '1' : comment.style.opacity = '0.55';
                welcome.innerText = currentUser.name
                dynamic_btn.innerText = 'Log out'
                } else {
                    displayInformation(attempt.info)
            }

        login_name.value = ''
        login_password.value = ''
    }


    // regisztráció, refresh view 
    async function userSignUp(){
        let attempt = await currentUser.register(
            signup_username.value,
            signup_email.value,
            SHA256(signup_password.value),
            SHA256(signup_password_repeat.value),
        )
        signup_username.value = '';
        signup_email.value = '';
        signup_password.value = '';
        signup_password_repeat.value = '';
        if (attempt.response == 0){
            displayInformation(attempt.info)
            currentUser = new User(attempt.username);
            currentUser.logged_in = true;
            reg_modal.style.display = "none";
            welcome.innerText = currentUser.name
            dynamic_btn.innerText = 'Log out'

            // refresh view, with user attributes
            let adat = await currentUser.searchMovie(document.querySelector('.title').innerText)
            fillComments(adat)
            updateView(adat)
            adat.Reactions.active_like ? like.style.opacity = '1' : like.style.opacity = '0.55';
            adat.Reactions.active_heart ? love.style.opacity = '1' : love.style.opacity = '0.55';
            adat.Reactions.sent_comment ? comment.style.opacity = '1' : comment.style.opacity = '0.55';
        } else {
            displayInformation(attempt.info)
        }

    }


    function updateView(data){
        // *** Updates the main container widget with the found movie data, or a 404 ***
        if (data.Error){
            document.querySelector('.search-movie-details').style.display = 'none'
            document.querySelector('.sad-pop').style.display = 'block'
        } else {

            document.querySelector('.search-movie-details').style.display = 'flex'
            document.querySelector('.sad-pop').style.display = 'none'
            document.querySelector('.title').innerHTML = data.Title
            document.querySelector('.story').innerHTML = data.Plot
            document.querySelector('#director').innerHTML = data.Director
            document.querySelector('#actors').innerHTML = data.Actors
            document.querySelector('.search-result-image').src = data.Poster
            document.querySelector('#prizes>p').innerHTML = data.Awards
            document.querySelector('#rating>p').innerHTML = data.imdbRating
            // update counters
            document.querySelector('.comment-section').style.display = 'none'
            document.querySelector('#like-counter').innerHTML = data.Likes
            document.querySelector('#heart-counter').innerHTML = data.Hearts
            document.querySelector('#comment-counter').innerHTML = data.Comments
            // update user reactions
            if (data.Reactions){
                data.Reactions.active_like ? like.style.opacity = '1' : like.style.opacity = '0.55';
                data.Reactions.active_heart ? love.style.opacity = '1' : love.style.opacity = '0.55';
                data.Reactions.sent_comment ? comment.style.opacity = '1' : comment.style.opacity = '0.55';
            }
            // update comments (comment likes / comment dislikes)
            try{
                for (let item of data.CommentsCollection){
                    let temp_result = currentUser.checkMyCommentReaction(data.Comment_Likes_Dislikes[item.id])
                    let temp_comment = document.querySelector(`#x${item.id}`)
                    let temp_like = temp_comment.querySelector('.comment_like')

                    let temp_dislike = temp_comment.querySelector('.comment_dislike')
                    if ( temp_result == 'like'){
                        temp_like.style.opacity = '1'
                    } else if (temp_result == 'dislike'){
                        temp_dislike.style.opacity = '1'
                    }
                }
            } catch(error){
                console.log(error)
            }
        }
    }


    let myDate
    let myArray
    // kommentek beillesztése a view-ba
    function fillComments(movie){
        Array.from(comments.children).forEach((x) => {comments.removeChild(x)})
        myArray = []



        movie.CommentsCollection.forEach((komment)=>{
            myArray.push(komment)

        })

        function compare(a, b) {
                return b.date._seconds - a.date._seconds
            }

        myArray.sort(compare);

        myArray.forEach(komment => {
            myDate = new Date(komment.date._seconds * 1000)
            myDate =`${myDate.getFullYear()}/${myDate.getMonth()+1}/${myDate.getDate()}`

            let user_comment = document.createElement('div')
            let comment_details = document.createElement('div')
            let user = document.createElement('span')
            let comment_date = document.createElement('span')
            let text_comment = document.createElement('div')
            let reactions_div = document.createElement('div')
            let user_div = document.createElement('div')
            let like = document.createElement('img')
            let dislike = document.createElement('img')


            like.src = './static/images/like.svg'
            dislike.src = './static/images/dislike.svg'

            user_comment.classList.add('comment')
            user.classList.add('user')
            comment_date.classList.add('tooltip')
            comment_details.classList.add('comment_details')
            reactions_div.classList.add('comment_reactions')
            text_comment.classList.add('the_comment')
            user_div.classList.add('comment_user')
            like.classList.add('comment_like')
            dislike.classList.add('comment_dislike')


            text_comment.innerText = komment.comment
            user.innerText = komment.user
            comment_date.innerText = myDate

            
            comments.appendChild(user_comment)
            user_comment.appendChild(comment_details)
            user_comment.appendChild(text_comment)
            user_div.appendChild(user)
            user_div.appendChild(comment_date)
            comment_details.appendChild(user_div)
            reactions_div.appendChild(like)
            reactions_div.appendChild(dislike)
            comment_details.appendChild(reactions_div)
            user_comment.setAttribute("date", `${myDate}`)
            user_comment.setAttribute("id", `x${komment.id}`)
        })
        // komment lájkok updatelése
        document.querySelectorAll('.comment_like').forEach((instance)=>{
            instance.addEventListener('click', function(){
                
                currentUser.reactComment(this.classList[0], movie.Title, this.parentNode.parentNode.nextElementSibling.innerText)
                // if sibling active : sibling inactive, this active
                if (this.nextElementSibling.style.opacity = '1'){
                    this.nextElementSibling.style.opacity = '.5'
                    this.style.opacity = '1'
                }

                
            })
        })
        // komment diszlájkok updatelése
        document.querySelectorAll('.comment_dislike').forEach((instance)=>{
            instance.addEventListener('click', function(){
                currentUser.reactComment(this.classList[0], movie.Title, this.parentNode.parentNode.nextElementSibling.innerText)
                // if sibling active : sibling inactive, this active
                if (this.previousSibling.style.opacity = '1'){
                    this.previousSibling.style.opacity = '.5'
                    this.style.opacity = '1'
                }
            })
        })
    }

    // infó popup alul
    function displayInformation(info){
        information.innerText = info
        info_modal.style.display = "block"
        setTimeout(()=>{info_modal.style.display = "none"}, 1900)
    }

    // Smooth Scroll
    $(function() {
        $('a[href*=#]:not([href=#])').click(function() {
            if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
                if (target.length) {
                    $('html,body').animate({
                    scrollTop: target.offset().top
                    }, 1000);
                    return false;
                }
                }
            });
        });
}



main()







