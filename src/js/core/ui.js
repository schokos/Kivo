function toast(msg) {
  const wrap = document.getElementById("toast-wrap");
  const el = document.createElement("div");
  el.className = "k-toast";
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function confirm2(title, msg, onConfirm) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("confirm-overlay");
    const okBtn = document.getElementById("confirm-ok");
    const cancelBtn = document.getElementById("confirm-cancel");
    const finalTitle = msg === undefined ? "Bestätigen" : title;
    const finalMsg = msg === undefined ? title : msg;

    document.getElementById("confirm-title").textContent = finalTitle;
    document.getElementById("confirm-msg").textContent = finalMsg;
    overlay.classList.add("open");

    const close = (result) => {
      overlay.classList.remove("open");
      okBtn.onclick = null;
      if (cancelBtn) cancelBtn.onclick = null;
      overlay.onclick = null;
      resolve(result);
    };

    okBtn.onclick = async () => {
      if (typeof onConfirm === "function") {
        try {
          await onConfirm();
        } catch (error) {
          console.error(error);
        }
      }
      close(true);
    };
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

function toggleUserMenu() {
  const menu = document.getElementById("user-menu");
  if (!menu) return;
  menu.classList.toggle("open");
}

function closeUserMenu() {
  const menu = document.getElementById("user-menu");
  if (!menu) return;
  menu.classList.remove("open");
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("#avatar-btn") && !e.target.closest("#user-menu")) {
    closeUserMenu();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const avatarBtn = document.getElementById("avatar-btn");
  if (!avatarBtn) return;
  avatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleUserMenu();
  });
});

