document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".signup-form");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const passwordConfirm = document.getElementById("passwordConfirm");
    const nickname = document.getElementById("nickname");
    const profile = document.getElementById("profile");
    const profileCircle = document.querySelector(".profile-circle");

    const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;
    const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;

    const helpers = {
        email: getHelper(email),
        password: getHelper(password),
        passwordConfirm: getHelper(passwordConfirm),
        nickname: getHelper(nickname),
        profile: document.querySelector(".profile-section .helper-text"),
    };

    function getHelper(input) {
        if (!input) return null;
        const helper = input.nextElementSibling;
        if (helper && helper.classList.contains("helper-text")) {
            if (!helper.dataset.default) helper.dataset.default = helper.textContent.trim();
            return helper;
        }
        return null;
    }

    const setHelper = (helper, message, type = "info") => {
        if (!helper) return;
        helper.textContent = message;
        helper.classList.remove("is-error", "is-success");
        if (type === "error") helper.classList.add("is-error");
        else if (type === "success") helper.classList.add("is-success");
    };

    const resetHelper = (helper) => {
        if (!helper) return;
        setHelper(helper, helper.dataset.default || "", "info");
    };

    profile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profileCircle.style.backgroundImage = `url(${event.target.result})`;
                profileCircle.textContent = "";
            };
            reader.readAsDataURL(file);
            setHelper(helpers.profile, "프로필이 적용되었습니다.", "success");
        } else {
            profileCircle.style.backgroundImage = "";
            profileCircle.textContent = "+";
            setHelper(helpers.profile, "프로필 이미지를 선택해주세요.", "error");
        }
    });

    const titleEl = document.querySelector(".header h1");
    if (titleEl) {
        titleEl.style.cursor = "pointer";
        titleEl.addEventListener("click", () => {
            window.location.href = "./postList";
        });
    }

    const validatePassword = (showSuccess = false) => {
        const value = password.value.trim();
        if (!value) {
            resetHelper(helpers.password);
            return false;
        }
        if (!PASSWORD_REGEX.test(value)) {
            setHelper(helpers.password, "영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.", "error");
            return false;
        }
        if (showSuccess) {
            setHelper(helpers.password, "사용 가능한 비밀번호입니다.", "success");
        } else {
            resetHelper(helpers.password);
        }
        return true;
    };

    const validatePasswordConfirm = (showSuccess = false) => {
        const value = passwordConfirm.value.trim();
        if (!value) {
            resetHelper(helpers.passwordConfirm);
            return false;
        }
        if (value !== password.value.trim()) {
            setHelper(helpers.passwordConfirm, "비밀번호가 일치하지 않습니다.", "error");
            return false;
        }
        if (showSuccess) {
            setHelper(helpers.passwordConfirm, "비밀번호가 일치합니다.", "success");
        } else {
            resetHelper(helpers.passwordConfirm);
        }
        return true;
    };

    const validateNickname = (showSuccess = false) => {
        const value = nickname.value.trim();
        if (!value) {
            resetHelper(helpers.nickname);
            return false;
        }
        if (!NICKNAME_REGEX.test(value) || /[\u3130-\u318F]/.test(value)) {
            setHelper(helpers.nickname, "2~10자의 한글 또는 영문, 숫자만 사용할 수 있어요.", "error");
            return false;
        }
        if (showSuccess) {
            setHelper(helpers.nickname, "사용 가능한 닉네임입니다.", "success");
        } else {
            resetHelper(helpers.nickname);
        }
        return true;
    };

    email.addEventListener("input", () => {
        const value = email.value.trim();
        if (!value) {
            resetHelper(helpers.email);
            return;
        }
        if (!email.validity.valid) {
            setHelper(helpers.email, "유효한 이메일 주소를 입력해주세요.", "error");
        } else {
            setHelper(helpers.email, "사용 가능한 이메일입니다.", "success");
        }
    });

    password.addEventListener("input", () => {
        validatePassword(true);
        if (passwordConfirm.value.trim()) validatePasswordConfirm(true);
    });

    passwordConfirm.addEventListener("input", () => {
        validatePasswordConfirm(true);
    });

    nickname.addEventListener("input", () => {
        validateNickname(true);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailValue = email.value.trim();
        let isValid = true;

        if (!emailValue || !email.validity.valid) {
            setHelper(helpers.email, "유효한 이메일 주소를 입력해주세요.", "error");
            if (isValid) email.focus();
            isValid = false;
        } else {
            setHelper(helpers.email, "사용 가능한 이메일입니다.", "success");
        }

        if (!validatePassword(true)) {
            if (isValid) password.focus();
            isValid = false;
        }

        if (!validatePasswordConfirm(true)) {
            if (isValid) passwordConfirm.focus();
            isValid = false;
        }

        if (!validateNickname(true)) {
            if (isValid) nickname.focus();
            isValid = false;
        }

        if (!profile.files[0]) {
            setHelper(helpers.profile, "프로필 이미지를 선택해주세요.", "error");
            if (isValid) profileCircle.focus();
            isValid = false;
        } else {
            setHelper(helpers.profile, "프로필이 적용되었습니다.", "success");
        }

        if (!isValid) return;

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
