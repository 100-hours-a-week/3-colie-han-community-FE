const PROFILE_BASE_URL = window.API_BASE_URL
  || (window.auth && window.auth.API_BASE_URL)
  || `${window.location.origin}/api`;
let profileAreaInitialized = false;

async function initProfileArea() {
  if (profileAreaInitialized) return;

  const path = window.location.pathname || "";
  if (path.includes("login") || path.includes("signup")) {
    return;
  }

  const profileBtn = document.querySelector(".profile-btn");
  const profileImg = profileBtn ? profileBtn.querySelector(".profile-img") : null;
  const logoutBtn = document.querySelector(".logout-btn");
  const logoTitle = document.querySelector(".header h1");

  if (logoutBtn) {
    logoutBtn.style.display = "none";
  }

  if (!profileBtn || !profileImg) {
    return;
  }

  profileAreaInitialized = true;

  const fallbackImage = "/default/profile-sample.png";
  profileImg.src = fallbackImage;
  profileImg.alt = "프로필 이미지";

  profileBtn.addEventListener("click", () => {
    window.location.href = "./mypage";
  });

  if (logoTitle) {
    logoTitle.style.cursor = "pointer";
    logoTitle.addEventListener("click", () => {
      window.location.href = "./postList";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (!confirm("로그아웃 하시겠어요?")) return;
      const attempts = [
        { url: `${PROFILE_BASE_URL}/logout`, options: { method: "POST", credentials: "include" } },
        { url: `${PROFILE_BASE_URL}/logout`, options: { method: "GET", credentials: "include" } },
        { url: `${PROFILE_BASE_URL}/auth/logout`, options: { method: "POST", credentials: "include" } }
      ];

      let success = false;
      for (const attempt of attempts) {
        try {
          const res = await fetch(attempt.url, attempt.options);
          if (res.ok) {
            success = true;
            break;
          }
        } catch (err) {
          console.error("로그아웃 시도 실패:", err);
        }
      }

      if (!success) {
        alert("로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      window.auth?.clearAuthToken?.();
      window.location.href = "./login";
    });
  }

  try {
    const res = await fetch(`${PROFILE_BASE_URL}/users`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      return;
    }

    const user = await res.json();
    const imagePath = user.profileImageUrl || user.imageUrl;

    if (logoutBtn) {
      logoutBtn.style.display = "";
    }

    if (imagePath) {
      const absoluteUrl = imagePath.startsWith("http")
        ? imagePath
        : `${PROFILE_BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
      profileImg.src = absoluteUrl;
    }
  } catch (err) {
    console.error("프로필 이미지 불러오기 실패:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initProfileArea();
});

document.addEventListener("layout:ready", () => {
  initProfileArea();
});
