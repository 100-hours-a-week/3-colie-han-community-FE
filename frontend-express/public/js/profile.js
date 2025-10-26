// public/js/profile.js
document.addEventListener("click", (e) => {
  const toggle = document.getElementById("profile-dd-toggle");
  const dropdown = document.querySelector(".profile-dropdown");

  // 드롭다운 외부 클릭 시 닫기
  if (!dropdown.contains(e.target) && !e.target.classList.contains("profile-btn")) {
    toggle.checked = false;
  }
});
