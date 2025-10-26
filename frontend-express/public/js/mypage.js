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

    try {
        const res = await fetch(`${baseUrl}/users`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) throw new Error("유저 정보 불러오기 실패");

        const user = await res.json();

        emailField.textContent = user.email;
        nicknameInput.value = user.nickName || "";
        preview.src = user.profileImageUrl
            ? `${baseUrl}${user.profileImageUrl.startsWith("/") ? "" : "/"}${user.profileImageUrl}`
            : "../default/profile-sample.png";
    } catch (err) {
        console.error(err);
        alert("회원 정보를 불러올 수 없습니다.");
    }

    editBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) preview.src = URL.createObjectURL(file);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nickname = nicknameInput.value.trim();

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
            window.location.href = "./index";
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
});
