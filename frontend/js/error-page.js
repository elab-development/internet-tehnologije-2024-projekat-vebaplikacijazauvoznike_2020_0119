document.addEventListener("DOMContentLoaded", () => {
  // === ERROR PAGE: Back i Refresh ponašanje ===
  const backBtn = document.getElementById("goBackBtn");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const ref = document.referrer || "";
      const isSelf = ref && ref === window.location.href;
      const isErrorRef = ref && /(^|\/)error-page\.html(\?|#|$)/i.test(ref);

      // Ako postoji referrer i nije ova ista stranica niti još jedan error-page -> idi tamo
      if (ref && !isSelf && !isErrorRef) {
        window.location.href = ref;
        return;
      }

      // Ako imamo history, pokušaj nazad
      if (history.length > 1) {
        history.back();
        // fallback: ako browser blokira back ili nema gde, nakon kratkog tajmera vodi na home
        setTimeout(() => {
          if (location.pathname.endsWith("/error-page.html") || location.pathname.endsWith("error-page.html")) {
            window.location.href = "./home-importer.html";
          }
        }, 300);
        return;
      }

      // Fallback direktno na home
      window.location.href = "./home-importer.html";
    });
  }

  const refreshLink = document.getElementById("refreshLink");
  if (refreshLink) {
    refreshLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.reload(); // true je deprecated
    });
  }
});