// JavaScript File (script.js)

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let activeChat = "";
let user = null;
let contacts = [];
let messages = {};

// Authentication
firebase.auth().onAuthStateChanged((currentUser) => {
    if (currentUser) {
        user = currentUser;
        loadContacts();
    } else {
        // Redirect to login page
        window.location.href = "login.html";
    }
});

// Load Contacts


function loadContacts() {
    db.collection("contacts").onSnapshot((snapshot) => {
        contacts = snapshot.docs.map(doc => doc.data());
        renderContacts();
    });
}

function renderContacts() {
    const contactList = document.getElementById("contact-list");
    contactList.innerHTML = "";
    contacts.forEach(contact => {
        const li = document.createElement("li");
        li.className = "contact";
        li.innerHTML = `
            <img src="${contact.profilePic}" class="profile-pic">
            <div class="contact-info">
                <span class="contact-name">${contact.name}</span>
                <span class="last-message">${contact.status}</span>
            </div>
        `;
        li.addEventListener("click", () => openChat(contact.name));
        contactList.appendChild(li);
    });
}

// Open Chat
function openChat(contactName) {
    activeChat = contactName;
    document.getElementById("chat-title").innerText = contactName;
    document.getElementById("messages").innerHTML = "";
    loadMessages();
}

// Load Messages
function loadMessages() {
    db.collection("messages").where("chatId", "==", activeChat).orderBy("timestamp").onSnapshot((snapshot) => {
        document.getElementById("messages").innerHTML = "";
        snapshot.docs.forEach(doc => displayMessage(doc.data()));
    });
}

// Send Message
function sendMessage() {
    const input = document.getElementById("message-input");
    const text = input.value.trim();
    if (!text) return;

    const message = {
        chatId: activeChat,
        sender: user.displayName,
        text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection("messages").add(message);
    input.value = "";
}

function displayMessage(message) {
    const messagesDiv = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = message.sender === user.displayName ? "message sent" : "message received";
    messageDiv.innerHTML = `
        <span class="sender">${message.sender}</span>
        <span>${message.text}</span>
    `;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Video and Audio Call
function startVideoCall() {
    alert("Starting Video Call...");
    // WebRTC Implementation
}

function startAudioCall() {
    alert("Starting Audio Call...");
    // WebRTC Implementation
}

// Add Friend
function addFriend() {
    const friendName = prompt("Enter your friend's name:");
    if (friendName) {
        db.collection("contacts").add({ name: friendName, profilePic: "https://via.placeholder.com/50", status: "online" });
    }
}

document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("video-call-btn").addEventListener("click", startVideoCall);
document.getElementById("audio-call-btn").addEventListener("click", startAudioCall);
document.getElementById("add-friend-btn").addEventListener("click", addFriend);

document.getElementById("message-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter") sendMessage();
});

// Enhance UI with Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

document.getElementById("dark-mode-btn").addEventListener("click", toggleDarkMode);