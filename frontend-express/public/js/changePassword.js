document.addEventListener("DOMContentLoaded", () => {
    const baseUrl = "http://localhost:8080";
    const form = document.querySelector(".password-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("password-confirm").value.trim();

        if (!password || !confirmPassword) return alert("비밀번호를 모두 입력해주세요.");
        if (password !== confirmPassword) return alert("비밀번호가 일치하지 않습니다.");

        try {
            const res = await fetch(`${baseUrl}/users/password`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password, confirmPassword }),
            });

            if (!res.ok) {
                const err = await res.text();
                console.error("응답 오류:", err);
                alert("비밀번호 변경 실패 (" + res.status + ")");
                return;
            }

            alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
            window.location.href = "./login.html";
        } catch (err) {
            console.error("요청 오류:", err);
            alert("서버 오류가 발생했습니다.");
        }
    });
});
