document.addEventListener("DOMContentLoaded", () => {
  // === CHOOSE ACCOUNT: cursor glow (dynamic blur) + active state ===
  const cards = document.querySelectorAll(
    ".CREATE-ACCOUNT-page .card, .CREATE-ACCOUNT-page .content-wrapper, .CREATE-ACCOUNT-page .div-wrapper"
  );
  if (cards.length) {
    const handleMove = (e) => {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const point = e.touches ? e.touches[0] : e;
      const x = point.clientX - rect.left;
      const y = point.clientY - rect.top;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };
    cards.forEach((el) => {
      el.addEventListener("mousemove", handleMove, { passive: true });
      el.addEventListener("touchmove", handleMove, { passive: true });
      el.addEventListener("mouseenter", (e) => handleMove(e));
    });
  }
});