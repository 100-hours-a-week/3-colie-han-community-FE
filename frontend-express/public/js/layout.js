document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/html/layout.html");
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const header = doc.querySelector("header");
    const footer = doc.querySelector("footer");

    const path = window.location.pathname || "";
    const isAuthPage = path.includes("login") || path.includes("signup");

    if (isAuthPage && header) {
      const profileArea = header.querySelector(".profile-area");
      if (profileArea) {
        profileArea.style.display = "none";
      }
    }

    // body에 주입
    document.body.prepend(header);
    document.body.append(footer);
    document.dispatchEvent(
      new CustomEvent("layout:ready", { detail: { header, footer } })
    );
  } catch (err) {
    console.error("layout load error:", err);
  }
});
