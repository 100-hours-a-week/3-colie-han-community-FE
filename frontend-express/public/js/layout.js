document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 파비콘이 없으면 기본 아이콘을 연결
    const ensureFavicon = () => {
      const head = document.head || document.getElementsByTagName("head")[0];
      if (!head) return;

      const hasFavicon = !!head.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      if (hasFavicon) return;

      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.href = "/favicon.svg";
      head.appendChild(link);
    };

    ensureFavicon();

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
