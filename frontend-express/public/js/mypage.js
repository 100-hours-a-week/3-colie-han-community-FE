document.addEventListener("DOMContentLoaded", async () => {
    const baseUrl = "http://localhost:8080";

    try {
        const check = await fetch(`${baseUrl}/users`, {
            method: "GET",
            credentials: "include",
        });
        if (!check.ok) {
            alert("로그인이 필요합니다.");
            window.location.href = "./login";
            return;
        }
    } catch {
        alert("로그인이 필요합니다.");
        window.location.href = "./login";
        return;
    }

    const emailField = document.getElementById("email");
    const nicknameInput = document.getElementById("nickname");
    const fileInput = document.getElementById("profileImage");
    const preview = document.getElementById("preview");
    const editBtn = document.querySelector(".edit-btn");
    const form = document.querySelector(".profile-form");
    const deleteBtn = document.querySelector(".delete-btn");
    const passwordBtn = document.querySelector(".password-btn");
    const nicknameHelper = form.querySelector(".helper-text");
    const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;

    const setHelper = (helper, message, type = "info") => {
        if (!helper) return;
        helper.textContent = message;
        helper.classList.remove("is-error", "is-success");
        if (type === "error") helper.classList.add("is-error");
        else if (type === "success") helper.classList.add("is-success");
    };

    if (nicknameHelper && !nicknameHelper.dataset.default) {
        nicknameHelper.dataset.default = nicknameHelper.textContent.trim();
    }

    const resetHelper = (helper) => {
        if (!helper) return;
        setHelper(helper, helper.dataset.default || "", "info");
    };

    const validateNickname = (showSuccess = false) => {
        const value = nicknameInput.value.trim();
        if (!value) {
            resetHelper(nicknameHelper);
            return false;
        }
        if (!NICKNAME_REGEX.test(value) || /[\u3130-\u318F]/.test(value)) {
            setHelper(nicknameHelper, "2~10자의 한글 또는 영문, 숫자만 사용할 수 있어요.", "error");
            return false;
        }
        if (showSuccess) {
            setHelper(nicknameHelper, "사용 가능한 닉네임입니다.", "success");
        } else {
            resetHelper(nicknameHelper);
        }
        return true;
    };

    try {
        const res = await fetch(`${baseUrl}/users`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) throw new Error("유저 정보 불러오기 실패");

        const user = await res.json();

        emailField.textContent = user.email;
        nicknameInput.value = user.nickName || "";
        const imagePath = user.profileImageUrl || user.imageUrl;
        preview.src = imagePath
            ? `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`
            : "../default/profile-sample.png";
        validateNickname();
    } catch (err) {
        console.error(err);
        alert("회원 정보를 불러올 수 없습니다.");
    }

    editBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) preview.src = URL.createObjectURL(file);
    });

    nicknameInput.addEventListener("input", () => {
        validateNickname(true);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nickname = nicknameInput.value.trim();

        if (!validateNickname(true)) {
            nicknameInput.focus();
            return;
        }

        try {
            // 닉네임
            if (nickname) {
                await fetch(`${baseUrl}/users/nickname`, {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nickName: nickname }),
                });
            }

            // 이미지
            if (fileInput.files[0]) {
                const formData = new FormData();
                formData.append("file", fileInput.files[0]);

                await fetch(`${baseUrl}/users/profile-image`, {
                    method: "PATCH",
                    credentials: "include",
                    body: formData,
                });
            }

            alert("회원정보가 수정되었습니다.");
            location.reload();
        } catch (err) {
            console.error(err);
            alert("수정 중 오류가 발생했습니다.");
        }
    });

    deleteBtn.addEventListener("click", async () => {
        if (!confirm("정말 탈퇴하시겠습니까?")) return;
        try {
            const res = await fetch(`${baseUrl}/users`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error("탈퇴 실패");
            alert("회원탈퇴가 완료되었습니다.");
            window.location.href = "./landing";
        } catch (err) {
            console.error(err);
            alert("탈퇴 중 오류가 발생했습니다.");
        }
    });

    const titleEl = document.querySelector(".header h1");
    if (titleEl) {
        titleEl.style.cursor = "pointer";
        titleEl.addEventListener("click", () => {
            window.location.href = "./postList";
        });
    }

    if (passwordBtn) {
        passwordBtn.addEventListener("click", () => {
            window.location.href = "./changePassword";
        });
    }
});
