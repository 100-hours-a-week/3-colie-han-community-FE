// ../js/index.js
document.addEventListener("DOMContentLoaded", async () => {
  const baseUrl = "http://localhost:8080";

  // 로그인 상태 확인
  try {
    const res = await fetch(`${baseUrl}/users`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error();
  } catch {
    alert("로그인이 필요합니다.");
    window.location.href = "./login";
    return;
  }

  // 헤더 타이틀 클릭 시 새로고침
  const titleEl = document.querySelector(".header h1");
  if (titleEl) {
    titleEl.style.cursor = "pointer";
    titleEl.addEventListener("click", () => {
      window.location.href = "./index";
    });
  }

  // 버튼 이동
  document.querySelector(".go-board-btn").addEventListener("click", () => {
    window.location.href = "./postList";
  });

  document.querySelector(".go-profile-btn").addEventListener("click", () => {
    window.location.href = "./mypage";
  });
});
