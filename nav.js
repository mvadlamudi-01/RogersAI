// Handles the Sunny AI Coaches dropdown behaviour (click to open/close)
document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.querySelector(".nav-item.dropdown");
  const toggleBtn = dropdown?.querySelector(".dropdown-toggle");
  const menu = dropdown?.querySelector(".dropdown-menu");

  if (!dropdown || !toggleBtn || !menu) return;

  // Open / close on click
  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  // Let links work, don’t close before navigation
  menu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Click anywhere else closes menu
  document.addEventListener("click", () => {
    dropdown.classList.remove("open");
  });
});
