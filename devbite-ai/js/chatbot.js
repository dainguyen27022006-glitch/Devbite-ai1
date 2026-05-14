function addMessage(text, sender) {
    let chatBox = document.getElementById("chatBox");

    let msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.innerHTML = text;

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
    let input = document.getElementById("userInput");
    let text = input.value.trim();

    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    addMessage("Đang nhập...", "bot");

    setTimeout(() => {
        let messages = document.querySelectorAll(".bot");
        messages[messages.length - 1].remove();

        let intent = detectIntent(text);
        let reply = handleIntent(intent, text);

        addMessage(reply, "bot");
    }, 1000);
}

// Enter để gửi
document.getElementById("userInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
});