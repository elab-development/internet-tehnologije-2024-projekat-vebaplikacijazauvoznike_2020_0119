document.addEventListener("DOMContentLoaded", () => {
  // === CREATE ACCOUNT: Validation + Eye toggle + API poziv ===

  // *** PODESI OVO PO POTREBI ***
  const API_BASE = "http://127.0.0.1:8000";

  const regForm = document.getElementById("registrationForm");
  if (!regForm) return;

  // Input polja (neke stranice imaju fullName, druge companyName/country)
  const fullNameInput = document.getElementById("fullName");
  const companyNameInput = document.getElementById("companyName");
  const countryInput = document.getElementById("country");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const createAccountBtn = document.getElementById("createAccountBtn");

  // Ikonice (valid/invalid + eye)
  const passwordToggleIcon = document.getElementById("passwordToggleIcon");
  const nameValidationIcon = document.getElementById("nameValidationIcon");
  const companyValidationIcon = document.getElementById("companyValidationIcon");
  const countryValidationIcon = document.getElementById("countryValidationIcon");
  const emailValidationIcon = document.getElementById("emailValidationIcon");
  const passwordValidationIcon = document.getElementById("passwordValidationIcon");

  // Putanje do ikonica (relativno u odnosu na HTML stranicu)
  const iconTruePath = "./images/transio_icon_02.01.png";
  const iconFalsePath = "./images/transio_icon_02.02.png";
  const iconEyeShow = "./images/transio_icon_03.01.png";
  const iconEyeHide = "./images/transio_icon_03.02.png";

  // Stanje validnosti
  const validityState = {
    ...(fullNameInput ? { fullName: false } : {}),
    ...(companyNameInput ? { companyName: false } : {}),
    email: false,
    password: false,
    ...(countryInput ? { country: false } : {}),
  };

  // Regex validacije
  const nameRegex =
    /^([A-ZČĆŽŠĐ][a-zčćžšđ]{1,49})([ -][A-ZČĆŽŠĐ][a-zčćžšđ]{1,49})*$/;
  const companyRegex = /^[A-Za-zČĆŽŠĐčćžšđ\d\s-]{2,50}$/;
  const countryRegex = /^[A-ZČĆŽŠĐ][A-Za-zČĆŽŠĐčćžšđ\s-]{1,49}$/;
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  // ispravljeno: dodata zvezdica u lookahead-ovima
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const validateName = (v) => nameRegex.test(String(v).trim());
  const validateCompany = (v) => companyRegex.test(String(v).trim());
  const validateCountry = (v) => countryRegex.test(String(v).trim());
  const validateEmail = (v) => emailRegex.test(String(v).trim());
  const validatePassword = (v) => passwordRegex.test(String(v));

  const updateValidationUI = (iconEl, isValid, inputEl) => {
    if (!iconEl || !inputEl) return;
    const empty = (inputEl.value || "").trim() === "";
    if (empty) {
      iconEl.classList.remove("visible");
      return;
    }
    iconEl.src = isValid ? iconTruePath : iconFalsePath;
    iconEl.alt = isValid ? "Valid" : "Invalid";
    iconEl.classList.add("visible");
  };

  const checkFormValidity = () => {
    const allValid = Object.values(validityState).every(Boolean);
    if (createAccountBtn) {
      createAccountBtn.disabled = !allValid;
      createAccountBtn.classList.toggle("active", allValid);
    }
  };

  // Input listeners
  if (fullNameInput)
    fullNameInput.addEventListener("input", () => {
      const ok = validateName(fullNameInput.value);
      validityState.fullName = ok;
      updateValidationUI(nameValidationIcon, ok, fullNameInput);
      checkFormValidity();
    });

  if (companyNameInput)
    companyNameInput.addEventListener("input", () => {
      const ok = validateCompany(companyNameInput.value);
      validityState.companyName = ok;
      updateValidationUI(companyValidationIcon, ok, companyNameInput);
      checkFormValidity();
    });

  if (countryInput)
    countryInput.addEventListener("input", () => {
      const ok = validateCountry(countryInput.value);
      validityState.country = ok;
      updateValidationUI(countryValidationIcon, ok, countryInput);
      checkFormValidity();
    });

  if (emailInput)
    emailInput.addEventListener("input", () => {
      const ok = validateEmail(emailInput.value);
      validityState.email = ok;
      updateValidationUI(emailValidationIcon, ok, emailInput);
      checkFormValidity();
    });

  if (passwordInput)
    passwordInput.addEventListener("input", () => {
      const ok = validatePassword(passwordInput.value);
      validityState.password = ok;
      updateValidationUI(passwordValidationIcon, ok, passwordInput);
      checkFormValidity();
    });

  // Eye toggle
  if (passwordToggleIcon && passwordInput) {
    passwordToggleIcon.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      passwordToggleIcon.src = isPassword ? iconEyeHide : iconEyeShow;
      passwordToggleIcon.alt = isPassword ? "Hide password" : "Show password";
    });
    passwordToggleIcon.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") passwordToggleIcon.click();
    });
  }

  // Detekcija uloge po URL-u stranice (admin/importer/supplier)
  const role = (() => {
    const p = (location.pathname || "").toLowerCase();
    if (p.includes("admin")) return "admin";
    if (p.includes("supplier")) return "supplier";
    return "importer";
  })();

  // Submit → poziv backend API-ja
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!Object.values(validityState).every(Boolean)) return;

    // mapiraj payload na backend očekivanja
    const payload = {
      role, // backend očekuje ulogu
      name:
        (fullNameInput ? fullNameInput.value.trim() : "") ||
        (companyNameInput ? companyNameInput.value.trim() : ""),
      company_name: companyNameInput ? companyNameInput.value.trim() : "",
      country: countryInput ? countryInput.value.trim() : "",
      email: emailInput.value.trim(),
      password: passwordInput.value,
      password_confirmation: passwordInput.value, // ako je uključeno potvrđivanje
    };

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // ostavi ako koristiš cookie (npr. Sanctum)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Register failed:", err);
        if (window.openNotice) window.openNotice("error");
        return;
      }

      const data = await res.json().catch(() => ({}));
      // ako backend vraća token:
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      // čuvamo ime kompanije za pozdrav (samo ako postoji)
      if (payload.company_name) {
        sessionStorage.setItem("importerCompany", payload.company_name);
      }

      // post-auth modal
      sessionStorage.setItem(
        "postAuthNotice",
        JSON.stringify({ variant: "signup", ts: Date.now() })
      );

      // redirect (trenutno svi idu na home-importer.html)
      window.location.href = "./home-importer.html";
    } catch (err) {
      console.error(err);
      if (window.openNotice) window.openNotice("error");
    }
  });
});