import bot from './assets/bot.png'; //Imports Icons for us to use
import user from './assets/user.svg';
import copy from './assets/copy.svg';

const form = document.querySelector('form'); //targets HTML element it being the form
const chatContainer = document.querySelector('#chat_container'); // selects the HTML element "chat_container"
let counter = 0
const chatHistory = new Map();
let loadInterval;

function loader(element){ // Loading dots when thinking about awnswer
    element.textContent = ''; //ensures its empty at the start

    loadInterval = setInterval(() => {
        element.textContent += '.';
        if (element.textContent === '....') {
            element.textContent = '';
        }
    },300) //every 300 miliseconds adds a dot 3 times and then clears the text

}
function typeText(element,text){ // this allows the response of the bot to type out slowly making it seem more human
    let index = 0;

    let interval = setInterval(() => {
        if(index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        }else
            clearInterval(interval)
    },20)
}
function generateUniqueId() { //Creates a unique ID for each bit of text
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`; //creates the random ID
}


function chatStripe(isAi, value, uniqueId) {
    if (isAi) {
        return (             // checks if its ai
            `
        <div class="wrapper ai"> 
            <div class="chat">
                <div class="profile">
                    <Img
                        <img src="${bot}" alt="bot" /> 
        </div> 
         <div class="message" id=${uniqueId}>${value}</div>
         <img class="copyimg" src="${copy}" onclick="copyToClipboard('${uniqueId}')" />      
        </div>
        </div>
        `
            // this creates the message that is generated
        )
    }else{
        return(
            `
            <div class="wrapper">
                <div class="chat">
                    <div class="profile">
                        <img src="${user}" alt="user" />
                    </div>
                    <div class="message" id="${uniqueId}">${value}</div>
                    <img class="copyimg" src="${copy}" onclick="copyToClipboard('${uniqueId2}')">
                </div>
            </div>
        `
        )}

}
window.copyToClipboard = async function(id) {
    try {
        const chatStripe = chatHistory.get(id);
        if (chatStripe) {
            await navigator.clipboard.writeText(chatStripe.value);
            console.log('Content copied to clipboard');
            //text is copied succesfully
        }
    } catch (err){
        console.error('Failed to copy: ', err);
        //rejected and failed to copy
    }
}
const handleSubmit = async (e) => {
    e.preventDefault(); //prevents the default behaviour of the browser

    const data = new FormData(form);
    const uniqueId = generateUniqueId();
    const uniqueId2 = generateUniqueId()
    // User's Chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'),uniqueId2); //if user passes the data from the form
    const usercopyText = () => {
        chatHistory.set(uniqueId, {id: uniqueId2, value: data.get('prompt')});
    }
    usercopyText()
    form.reset(); // resets the data in the form so a new awnswer can be asked.

    //Bot's Chatstripe
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId); // is empty as it is filling up as it is loading

    chatContainer.scrollTop = chatContainer.scrollHeight; //this puts the message in view

    const messageDiv = document.getElementById(uniqueId); //this fetches the message via a unique ID

    loader(messageDiv);
    // fetch data from server -> bot's response
    const response = await fetch('https://enablebot.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt') //this is where the data with the message
        })
    })
    clearInterval(loadInterval)
    messageDiv.innerHTML = ''; //resets the message div to an empty string

    if (response.ok) {
        const data = await response.json(); //this gives us the actual response
        const parsedData = data.bot.trim();
        const copyText = () => {
            counter++
            chatHistory.set(uniqueId, { id: uniqueId, value: parsedData });
        };
        copyText()
        typeText(messageDiv, parsedData); //ParsedData holds the ChatGPT reponse data
        console.log(chatHistory)
    } else {
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong";
        alert(err);
    }

}
form.addEventListener('submit', handleSubmit); //is a listener for a submit event
form.addEventListener('keyup',(e) => { //listens for when we press the enter key
    if (e.keyCode === 13) { // 13 = Enter key
        handleSubmit(e);
    }
})