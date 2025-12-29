document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".faq-item");

  items.forEach((item) => {
    const btn = item.querySelector(".faq-q");
    const panel = item.querySelector(".faq-a");

    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // Close all (accordion behavior). Remove this loop if you want multiple open.
      items.forEach((other) => {
        const b = other.querySelector(".faq-q");
        const p = other.querySelector(".faq-a");
        if (!b || !p) return;

        b.setAttribute("aria-expanded", "false");
        p.classList.remove("is-open");
        p.hidden = true;
      });

      // Toggle current
      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add("is-open"));
      }
    });
  });
});
