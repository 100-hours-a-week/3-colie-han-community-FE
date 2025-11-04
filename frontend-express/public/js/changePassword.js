document.addEventListener("DOMContentLoaded", () => {
    const baseUrl = "http://localhost:8080";
    const form = document.querySelector(".password-form");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("password-confirm");
    const [passwordHelper, confirmHelper] = form.querySelectorAll(".helper-text");
    const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;

    const setHelper = (helper, message, type = "info") => {
        if (!helper) return;
        helper.textContent = message;
        helper.classList.remove("is-error", "is-success");
        if (type === "error") helper.classList.add("is-error");
        else if (type === "success") helper.classList.add("is-success");
    };

    if (passwordHelper && !passwordHelper.dataset.default) passwordHelper.dataset.default = passwordHelper.textContent.trim();
    if (confirmHelper && !confirmHelper.dataset.default) confirmHelper.dataset.default = confirmHelper.textContent.trim();

    const resetHelper = (helper) => {
        if (!helper) return;
        setHelper(helper, helper.dataset.default || "", "info");
    };

    const validatePassword = (showSuccess = false) => {
        const value = passwordInput.value.trim();
        if (!value) {
            resetHelper(passwordHelper);
            return false;
        }
        if (!PASSWORD_REGEX.test(value)) {
            setHelper(passwordHelper, "영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.", "error");
            return false;
        }
        if (showSuccess) setHelper(passwordHelper, "사용 가능한 비밀번호입니다.", "success");
        else resetHelper(passwordHelper);
        return true;
    };

    const validateConfirm = (showSuccess = false) => {
        const value = confirmInput.value.trim();
        if (!value) {
            resetHelper(confirmHelper);
            return false;
        }
        if (value !== passwordInput.value.trim()) {
            setHelper(confirmHelper, "비밀번호가 일치하지 않습니다.", "error");
            return false;
        }
        if (showSuccess) setHelper(confirmHelper, "비밀번호가 일치합니다.", "success");
        else resetHelper(confirmHelper);
        return true;
    };

    passwordInput.addEventListener("input", () => {
        validatePassword(true);
        if (confirmInput.value.trim()) validateConfirm(true);
    });

    confirmInput.addEventListener("input", () => {
        validateConfirm(true);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        let valid = true;
        if (!validatePassword(true)) {
            passwordInput.focus();
            valid = false;
        }
        if (!validateConfirm(true)) {
            if (valid) confirmInput.focus();
            valid = false;
        }

        if (!valid) return;

        try {
            const res = await fetch(`${baseUrl}/users/password`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password: passwordInput.value.trim(), confirmPassword: confirmInput.value.trim() }),
            });

            if (!res.ok) {
                const err = await res.text();
                console.error("응답 오류:", err);
                alert("비밀번호 변경 실패 (" + res.status + ")");
                return;
            }

            alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
            window.location.href = "./login";
        } catch (err) {
            console.error("요청 오류:", err);
            alert("서버 오류가 발생했습니다.");
        }
    });
});
