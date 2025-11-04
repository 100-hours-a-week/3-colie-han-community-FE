document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector(".login-form");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const helperText = document.querySelector(".helper-text");
    const signupBtn = document.querySelector(".signup-btn");

    const defaultHelperMessage = helperText ? helperText.dataset.default || "" : "";

    const setHelper = (message, type = "info") => {
        if (!helperText) return;
        helperText.textContent = message;
        helperText.classList.remove("is-error", "is-success");
        if (type === "error") helperText.classList.add("is-error");
        else if (type === "success") helperText.classList.add("is-success");
    };

    const resetHelper = () => setHelper(defaultHelperMessage || "", "info");

    if (helperText) {
        helperText.dataset.default = helperText.textContent.trim();
    }
    resetHelper();

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

    const validateFields = () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) {
            setHelper("이메일과 비밀번호를 모두 입력해주세요.", "error");
            return false;
        }
        resetHelper();
        return true;
    };

    emailInput.addEventListener("input", validateFields);
    passwordInput.addEventListener("input", validateFields);

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validateFields()) return;

        const auth = window.auth || {};
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

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

            await auth.captureAuthFromResponse?.(response);

            setHelper("로그인 성공!", "success");

            setTimeout(() => {
                window.location.href = "./postList";
            }, 600);

        } catch (error) {
            console.error("로그인 에러:", error);
            auth.clearAuthToken?.();
            setHelper("이메일 또는 비밀번호가 올바르지 않습니다.", "error");
        }
    });
});
