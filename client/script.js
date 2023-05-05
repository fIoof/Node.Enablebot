// Import images for user and bot avatars
import bot from './assets/bot.png';
import user from './assets/user.svg';

// Get references to the form and chat container elements in the HTML
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

// Initialize a map to store chat history and a reference to a textarea for displaying chat history
const chatHistory = new Map();
const historyLog = document.querySelector('textarea[name=historyC]');
historyLog.value = '';

// Initialize a variable to store the loading interval
let loadInterval;

// Add loading dots to an element while waiting for the bot's response
function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 500);
}

// Type text in an element with a typing effect
function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

// Generate a unique ID for chat messages
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

// Generate the HTML for a chat message (either user or bot)
function chatStripe(isAi, value, uniqueId) {
    if (isAi) {
        return `
        <div class="wrapper ai">
            <div class="chat">
                <div class="profile">
                    <img src="${bot}" alt="bot" />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>`;
    } else {
        return `
            <div class="wrapper">
                <div class="chat">
                    <div class="profile">
                        <img src="${user}" alt="user" />
                    </div>
                    <div class="message" id="${uniqueId}">${value}</div>
                </div>
            </div>`;
    }
}

// Copy the content of a chat message with the specified ID to the clipboard
window.copyToClipboard = async function (id) {
    try {
        const chatStripe = chatHistory.get(id);
        if (chatStripe) {
            await navigator.clipboard.writeText(chatStripe.value);
            console.log('Content copied to clipboard');
        }
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

// Handle form submission: send a request to the server and handle the response
const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const uniqueId = generateUniqueId();
    const uniqueId2 = generateUniqueId();

    // Add user's chat message to chat history
    chatHistory.set(uniqueId2, {id: uniqueId2, value: data.get('prompt')});

    // Add user's chat message to the chat container
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'), uniqueId2);
    form.reset();

    // Add bot's chat message (empty) to the chat container and start the loader
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    const messageDiv = document.getElementById(uniqueId);
    loader(messageDiv);
    // Fetch data from the server (bot's response)
    const response = await fetch('https://enablebot.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    });

// Clear the loading interval and reset the message div content
    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

// If the response is successful, display the bot's message with a typing effect
    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();

        // Add bot's chat message to chat history
        chatHistory.set(uniqueId, {id: uniqueId, value: parsedData});

        // Display bot's chat message with a typing effect
        typeText(messageDiv, parsedData);
        console.log(chatHistory);
    } else {
        const err = await response.text();

        // Display an error message if the response is unsuccessful
        messageDiv.innerHTML = "Something went wrong";
        alert(err);
    }
};
// Add event listeners to the form for submitting and pressing the Enter key
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
});

// Function to toggle the visibility of a sidebar element and update the chat history in a textarea
export default function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    const historyLog = document.querySelector('textarea[name="historyC"]');
    // Clear the history log
    historyLog.value = '';
    for (const [id, message] of chatHistory) {
        historyLog.value += `${message.value}\n`;
    }
}