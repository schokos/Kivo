// â”€â”€ TOAST & CONFIRM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toast(msg) {
  const wrap = document.getElementById("toast-wrap");
  const el = document.createElement("div");
  el.className = "k-toast";
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function confirm2(title, msg) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("confirm-overlay");
    const okBtn = document.getElementById("confirm-ok");
    const cancelBtn = document.getElementById("confirm-cancel");

    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-msg").textContent = msg;
    overlay.classList.add("open");

    const close = (result) => {
      overlay.classList.remove("open");
      okBtn.onclick = null;
      if (cancelBtn) cancelBtn.onclick = null;
      overlay.onclick = null;
      resolve(result);
    };

    okBtn.onclick = () => close(true);
    if (cancelBtn) cancelBtn.onclick = () => close(false);
    overlay.onclick = (e) => {
      if (e.target === overlay) close(false);
    };
  });
}

function openModal(id) {
  document.getElementById(id)?.classList.add("open");
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove("open");
}

// â”€â”€ USER MENU â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toggleUserMenu() {
  document.getElementById("user-menu").classList.toggle("open");
}

function closeUserMenu() {
  document.getElementById("user-menu").classList.remove("open");
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("#avatar-btn") && !e.target.closest("#user-menu")) {
    closeUserMenu();
  }
});

