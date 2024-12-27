const socket = io();
const usersList = document.getElementById("users");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send-button");

async function fetchConnectedUsers() {
  try {
    const response = await fetch("http://localhost:3000/users");
    const users = await response.json();
    usersList.innerHTML = "";
    users.forEach((user) => {
      const li = document.createElement("li");
      li.textContent = user.email;
      usersList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

fetchConnectedUsers();

socket.on("connect", () => {
  console.log("Connected to server");
});

sendButton.addEventListener("click", () => {
  const message = messageInput.value;
  if (message) {
    socket.emit("chatMessage", message);
    chatBox.innerHTML += `<div class="message">${message}</div>`;
    messageInput.value = "";
  }
});

socket.on("chatMessage", (message) => {
  chatBox.innerHTML += `<div class="message">${message}</div>`;
});
