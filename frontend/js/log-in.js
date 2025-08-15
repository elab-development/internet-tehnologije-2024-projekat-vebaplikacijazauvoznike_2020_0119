document.addEventListener("DOMContentLoaded", () => {
  // === LOG IN: Validation + Eye toggle + API poziv ===

  // PODESI po potrebi (ako ti je backend na drugom portu/domeni)
  const API_BASE = "http://127.0.0.1:8000";

  // DOM
  const logInForm = document.getElementById("logInForm");
  if (!logInForm) {
    console.warn("[login] #logInForm not found");
    return;
  }
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const logInBtn = document.getElementById("logInBtn");
  const emailValidationIcon = document.getElementById("emailValidationIcon");
  const passwordValidationIcon = document.getElementById("passwordValidationIcon");
  const passwordToggleIcon = document.getElementById("passwordToggleIcon");

  // Ikonice (putanje relativne prema HTML fajlu)
  const iconTruePath = "./images/transio_icon_02.01.png";
  const iconFalsePath = "./images/transio_icon_02.02.png";
  const iconEyeShow = "./images/transio_icon_03.01.png";
  const iconEyeHide = "./images/transio_icon_03.02.png";

  // Regex
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  // dovoljno: najmanje 8, bar 1 slovo i 1 cifra (ne forsiramo velika slova)
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

  const updateIcon = (el, ok, inputEl) => {
    if (!el || !inputEl) return;
    const empty = (inputEl.value || "").trim() === "";
    if (empty) {
      el.classList.remove("visible");
      return;
    }
    el.src = ok ? iconTruePath : iconFalsePath;
    el.alt = ok ? "Valid" : "Invalid";
    el.classList.add("visible");
  };

  const computeValidity = () => {
    const emailOk = emailRegex.test((emailInput?.value || "").trim());
    const passOk = passwordRegex.test(passwordInput?.value || "");
    updateIcon(emailValidationIcon, emailOk, emailInput);
    updateIcon(passwordValidationIcon, passOk, passwordInput);
    if (logInBtn) {
      const allOk = emailOk && passOk;
      logInBtn.disabled = !allOk;
      logInBtn.classList.toggle("active", allOk);
    }
    return { emailOk, passOk };
  };

  // Live validacija
  emailInput?.addEventListener("input", computeValidity);
  passwordInput?.addEventListener("input", computeValidity);

  // Eye toggle
  if (passwordToggleIcon && passwordInput) {
    passwordToggleIcon.addEventListener("click", () => {
      const isPw = passwordInput.type === "password";
      passwordInput.type = isPw ? "text" : "password";
      passwordToggleIcon.src = isPw ? iconEyeHide : iconEyeShow;
      passwordToggleIcon.alt = isPw ? "Hide password" : "Show password";
    });
    passwordToggleIcon.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") passwordToggleIcon.click();
    });
  }

  // Prvo računanje stanja (ako su polja već popunjena autofill-om)
  computeValidity();

  // Submit → login na backend
  logInForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // UVEK ponovo proveri validnost ovde (ne oslanjamo se na prethodno stanje)
    const { emailOk, passOk } = computeValidity();
    if (!emailOk || !passOk) {
      console.warn("[login] invalid form – not sending request");
      return;
    }

    const payload = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
    };

    console.log("[login] sending request to:", `${API_BASE}/api/login`, payload);

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        // ako koristiš BEARER tokene, nije ti potreban credentials: 'include'
        // credentials: "include",
      });

      console.log("[login] status:", res.status);
      const data = await res.json().catch(() => ({}));
      console.log("[login] response:", data);

      if (!res.ok) {
        if (window.openNotice) window.openNotice("error");
        return;
      }

      // sačuvaj token (bilo `token` ili `access_token`)
      const token = data.token || data.access_token;
      if (token) {
        localStorage.setItem("auth_token", token);
      }

      sessionStorage.setItem(
        "postAuthNotice",
        JSON.stringify({ variant: "login", ts: Date.now() })
      );
      window.location.href = "./home-importer.html";
    } catch (err) {
      console.error("[login] fetch error:", err);
      if (window.openNotice) window.openNotice("error");
    }
  });
});