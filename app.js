"use strict";
const API_URL = "http://127.0.0.1:5000/predict";
function addMessage(text, type) {
    const chat = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}
// typing animation
function showTyping() {
    const chat = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.className = "msg bot";
    div.innerText = "AI is thinking...";
    div.id = "typing";
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}
function removeTyping() {
    const el = document.getElementById("typing");
    if (el)
        el.remove();
}
async function sendMessage() {
    const input = document.getElementById("input");
    const text = input.value;
    if (!text)
        return;
    addMessage("You: " + text, "user");
    input.value = "";
    showTyping();
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ symptoms: text })
    });
    const data = await res.json();
    removeTyping();
    let output = `Prediction: ${data.prediction}\n\nTop 3:\n`;
    data.top_3.forEach((d) => {
        output += `- ${d.disease}: ${d.confidence.toFixed(3)}\n`;
    });
    if (data.explanation) {
        output += "\nExplanation:\n" + data.explanation;
    }
    addMessage(output, "bot");
}
