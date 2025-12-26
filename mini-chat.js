(() => {
  const ENDPOINT = window.ROGERS_AI_ENDPOINT || "/api/chat";
  const BOT_NAME = window.ROGERS_AI_NAME || "Mike Rogers AI";
  const SUBTITLE = window.ROGERS_AI_SUBTITLE || "Ask me anything";
  const WELCOME =
    window.ROGERS_AI_WELCOME || `Hi! I'm ${BOT_NAME}. How can I help you today?`;

  const svgChat = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 12c0 3.866-3.582 7-8 7a9.52 9.52 0 0 1-2.27-.27L6 20l.74-3.04A6.8 6.8 0 0 1 4 12c0-3.866 3.582-7 8-7s8 3.134 8 7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M8 12h.01M12 12h.01M16 12h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `;

  const svgSend = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 11.5 21 3l-8.5 18-2.7-7.1L3 11.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>
  `;

  const svgClose = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function")
        node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
    children.forEach((c) => node.appendChild(c));
    return node;
  }

  function createTypingBubble() {
    const dots = el("span", { class: "mc-typing" }, [
      el("span", { class: "mc-dot" }),
      el("span", { class: "mc-dot" }),
      el("span", { class: "mc-dot" }),
    ]);
    return el("div", { class: "mc-bubble mc-bot", "data-typing": "1" }, [dots]);
  }

  function sanitizeText(text) {
    // We show as textContent to avoid injection (user messages).
    return String(text ?? "");
  }

  function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
  }

  // ✅ Convert Markdown to safe HTML for bot messages
  function mdToHtml(md) {
    const raw = String(md ?? "");

    // If the libs aren't loaded, fall back to plain text.
    if (!window.marked || !window.DOMPurify) return raw;

    // GFM markdown + line breaks
    window.marked.setOptions({ gfm: true, breaks: true });

    const html = window.marked.parse(raw);
    return window.DOMPurify.sanitize(html);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Prevent double-injection if the script is included twice.
    if (document.querySelector(".mini-chat-root")) return;

    const root = el("div", { class: "mini-chat-root" });

    const panel = el("div", {
      class: "mini-chat-panel",
      role: "dialog",
      "aria-label": "Chat",
    });
    const header = el("div", { class: "mini-chat-header" });

    const title = el("div", { class: "mini-chat-title" }, [
      el("strong", { html: BOT_NAME }),
      el("span", { html: SUBTITLE }),
    ]);

    const closeBtn = el("button", {
      class: "mini-chat-close",
      type: "button",
      "aria-label": "Close chat",
      html: svgClose,
    });

    header.appendChild(title);
    header.appendChild(closeBtn);

    const messages = el("div", {
      class: "mini-chat-messages",
      "aria-live": "polite",
    });

    const footer = el("div", { class: "mini-chat-footer" });
    const form = el("form", { class: "mini-chat-form" });
    const input = el("input", {
      class: "mini-chat-input",
      type: "text",
      placeholder: "Type a message…",
      autocomplete: "off",
      "aria-label": "Message",
    });
    const send = el("button", {
      class: "mini-chat-send",
      type: "submit",
      "aria-label": "Send",
      html: svgSend,
    });
    send.disabled = true;

    const hint = el("div", {
      class: "mini-chat-hint",
      html: "Tip: Press Enter to send. Closing the bot clears messages.",
    });

    form.appendChild(input);
    form.appendChild(send);
    footer.appendChild(form);
    footer.appendChild(hint);

    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(footer);

    const button = el("button", {
      class: "mini-chat-btn",
      type: "button",
      "aria-label": "Open chat",
      html: svgChat,
    });

    root.appendChild(panel);
    root.appendChild(button);
    document.body.appendChild(root);

    let isOpen = false;

    function addBubble(text, who) {
      const bubble = el("div", {
        class: `mc-bubble ${who === "user" ? "mc-user" : "mc-bot"}`,
      });

      if (who === "bot") {
        // ✅ Render markdown properly (bold, headings, bullets)
        bubble.innerHTML = mdToHtml(text);
      } else {
        // ✅ Keep user content safe
        bubble.textContent = sanitizeText(text);
      }

      messages.appendChild(bubble);
      scrollToBottom(messages);
    }

    function clearAll() {
      messages.innerHTML = "";
      input.value = "";
      send.disabled = true;
    }

    function open() {
      if (isOpen) return;
      isOpen = true;
      panel.classList.add("open");
      button.setAttribute("aria-label", "Close chat");
      if (messages.childElementCount === 0) addBubble(WELCOME, "bot");
      setTimeout(() => input.focus(), 0);
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      panel.classList.remove("open");
      button.setAttribute("aria-label", "Open chat");
      clearAll(); // requirement: clear messages when closed
    }

    button.addEventListener("click", () => {
      if (isOpen) close();
      else open();
    });

    closeBtn.addEventListener("click", close);

    input.addEventListener("input", () => {
      send.disabled = input.value.trim().length === 0;
    });

    document.addEventListener("keydown", (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") close();
    });

    async function sendMessage(text) {
      const userText = text.trim();
      if (!userText) return;

      addBubble(userText, "user");
      input.value = "";
      send.disabled = true;

      const typing = createTypingBubble();
      messages.appendChild(typing);
      scrollToBottom(messages);

      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText }),
        });

        let data = null;
        try {
          data = await res.json();
        } catch (_) {}

        typing.remove();

        if (!res.ok) {
          const msg =
            data && (data.error || data.message)
              ? data.error || data.message
              : `Request failed (${res.status})`;
          addBubble(`Sorry — I hit an error: ${msg}`, "bot");
          return;
        }

        const reply = data && typeof data.reply === "string" ? data.reply : "";
        addBubble(reply || "Sorry — I didn't get a response.", "bot");
      } catch (err) {
        typing.remove();
        addBubble("Sorry — network error. Please try again.", "bot");
      }
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      sendMessage(input.value);
    });
  });
})();
