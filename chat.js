/* =========================================
   Full-page Chat Logic (SunnyAI)
   ========================================= */

const ENDPOINT = "/api/chat";

const messagesEl = document.getElementById("chatMessages");
const inputEl = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

/* ---------- Helpers ---------- */

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function mdToHtml(md) {
  if (!window.marked || !window.DOMPurify) {
    return md;
  }
  const html = marked.parse(String(md), { breaks: true });
  return DOMPurify.sanitize(html);
}

function addMessage(text, role) {
  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role === "user" ? "user" : "assistant"}`;

  if (role === "assistant") {
    bubble.innerHTML = mdToHtml(text);
  } else {
    bubble.textContent = text;
  }

  row.appendChild(bubble);
  messagesEl.appendChild(row);
  scrollToBottom();
}

function addTyping() {
  const row = document.createElement("div");
  row.className = "message-row assistant";
  row.id = "typingRow";

  const bubble = document.createElement("div");
  bubble.className = "bubble assistant";
  bubble.textContent = "Typing…";

  row.appendChild(bubble);
  messagesEl.appendChild(row);
  scrollToBottom();
}

function removeTyping() {
  const typing = document.getElementById("typingRow");
  if (typing) typing.remove();
}

/* ---------- Core Send Logic ---------- */

async function sendMessage(text) {
  const message = text.trim();
  if (!message) return;

  addMessage(message, "user");
  inputEl.value = "";
  sendBtn.disabled = true;

  addTyping();

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    removeTyping();

    if (!res.ok) {
      addMessage(
        data?.error || "Sorry — something went wrong.",
        "assistant"
      );
      return;
    }

    addMessage(data.reply, "assistant");
  } catch (err) {
    removeTyping();
    addMessage("Network error. Please try again.", "assistant");
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

/* ---------- Event Wiring ---------- */

sendBtn.addEventListener("click", () => {
  sendMessage(inputEl.value);
});

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage(inputEl.value);
  }
});

/* ---------- Quick Prompts ---------- */

window.sendQuick = function (text) {
  sendMessage(text);
};

/* ---------- Initial Greeting ---------- */

addMessage(
  "Hi! I’m RogersAI — how can I help you today?",
  "assistant"
);
