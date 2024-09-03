const feelingColorMap = {
    1: ["#4B0082", "#D8BFD8", "#FF00FF"],
    2: ["#402E7A", "#AF47D2", "#402E7A"],  
    3: ["#4B0082", "#D8BFD8", "#FF00FF"] 
};

function updateGradient(feeling) {
    const wrapper = document.querySelector('.wrapper');
    const [a, b, c] = feelingColorMap[feeling];

    wrapper.style.setProperty("--color-a", a);
    wrapper.style.setProperty("--color-b", b);
    wrapper.style.setProperty("--color-c", c);
}

updateGradient(2);

let conversationId = null;

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value;
    userInput.value = '';

    displayMessage('You: ' + message);

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, conversationId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        conversationId = data.conversationId;

        displayMessage('Booking Agent: ' + data.message);
        if (data.message.toLowerCase().includes('happy')) {
            updateGradient(3);
        } else if (data.message.toLowerCase().includes('sorry')) {
            updateGradient(1);
        } else {
            updateGradient(2);
        }
    } catch (error) {
        console.error('Error:', error);
        displayMessage('Error: Unable to get response from the server.');
    }
}

function displayMessage(message) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});
