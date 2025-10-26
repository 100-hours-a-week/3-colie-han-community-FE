document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector(".login-form");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const helperText = document.querySelector(".helper-text");
    const signupBtn = document.querySelector(".signup-btn");

    signupBtn.addEventListener("click", () => {
        window.location.href = "./signup";
    });

    const titleEl = document.querySelector(".header h1");
    if (titleEl) {
        titleEl.style.cursor = "pointer";
        titleEl.addEventListener("click", () => {
            window.location.href = "./postList";
        });
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            helperText.textContent = "이메일과 비밀번호를 모두 입력해주세요.";
            helperText.style.color = "red";
            return;
        }

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);

            const response = await fetch("http://localhost:8080/login", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("로그인 실패");
            }

            helperText.textContent = "로그인 성공!";
            helperText.style.color = "green";

            setTimeout(() => {
                window.location.href = "./index.html";
            }, 800);

        } catch (error) {
            console.error("로그인 에러:", error);
            helperText.textContent = "이메일 또는 비밀번호가 올바르지 않습니다.";
            helperText.style.color = "red";
        }
    });
});
