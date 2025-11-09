document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/html/layout.html");
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const header = doc.querySelector("header");
    const footer = doc.querySelector("footer");

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
