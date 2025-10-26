document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".signup-form");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const passwordConfirm = document.getElementById("passwordConfirm");
    const nickname = document.getElementById("nickname");
    const profile = document.getElementById("profile");
    const profileCircle = document.querySelector(".profile-circle");

    profile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            profileCircle.style.backgroundImage = `url(${event.target.result})`;
            profileCircle.textContent = "";
        };
        reader.readAsDataURL(file);
    });

    const titleEl = document.querySelector(".header h1");
    if (titleEl) {
        titleEl.style.cursor = "pointer";
        titleEl.addEventListener("click", () => {
            window.location.href = "./postList";
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (password.value !== passwordConfirm.value) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
        if (!profile.files[0]) {
            alert("프로필 사진을 추가해주세요!");
            return;
        }

        const formData = new FormData();
        formData.append("email", email.value);
        formData.append("password", password.value);
        formData.append("confirmPassword", passwordConfirm.value);
        formData.append("nickName", nickname.value);
        formData.append("profileImage", profile.files[0]);

        try {
            const response = await fetch("http://localhost:8080/users", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("회원가입이 완료되었습니다.");
                window.location.href = "login";
            } else {
                try {
                    const errorData = await response.json();
                    alert(errorData.message || "회원가입 실패: 입력값을 확인해주세요");
                } catch {
                    alert("회원가입 실패: 서버 응답이 비정상입니다.");
                }
            }
        } catch (error) {
            console.error("서버 오류:", error);
            alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    });
});
