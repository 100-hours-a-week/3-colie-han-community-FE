document.addEventListener("DOMContentLoaded", async () => {
    const postTitle = document.querySelector(".post-title");
    const postContent = document.querySelector(".post-content");
    const postImageContainer = document.querySelector(".post-image");
    const commentList = document.querySelector(".comment-list");
    const viewCountBox = document.querySelector(".post-stats .stat-box:nth-child(2)");
    const likeCountBox = document.querySelector(".post-stats .stat-box:nth-child(1)");
    const commentCountBox = document.querySelector(".post-stats .stat-box:nth-child(3)");
    const commentTextarea = document.querySelector(".comment-section textarea");
    const commentSubmitBtn = document.querySelector(".comment-submit");

    const baseUrl = "http://localhost:8080";
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("postId");

    if (!postId) {
        alert("잘못된 접근입니다.");
        return;
    }

    const titleEl = document.querySelector(".header h1");
    if (titleEl) {
        titleEl.style.cursor = "pointer";
        titleEl.addEventListener("click", () => {
            window.location.href = "./postList";
        });
    }

    document.querySelector(".edit-btn").addEventListener("click", () => {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get("postId");
        window.location.href = `./postEdit?postId=${postId}&mode=edit`;
    });

    const deleteBtn = document.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", async () => {
        if (!confirm("정말 게시글을 삭제하시겠습니까?")) return;

        try {
            const response = await fetch(`${baseUrl}/posts/${postId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("게시글 삭제 실패:", errorText);
                alert("게시글 삭제에 실패했습니다.");
                return;
            }

            alert("게시글이 삭제되었습니다.");
            window.location.href = "./index";
        } catch (err) {
            console.error("게시글 삭제 중 오류:", err);
            alert("서버 통신 오류가 발생했습니다.");
        }
    });

    async function loadPostDetail() {
        try {
            const res = await fetch(`${baseUrl}/posts/${postId}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("게시글 로드 실패");
            const post = await res.json();
            renderPostDetail(post);
        } catch (err) {
            console.error(err);
            alert("게시글을 불러오는 중 오류가 발생했습니다.");
        }
    }


    let __currentUserId = null;
    (async function bootstrapCurrentUser() {
        try {
            const r = await fetch(`${baseUrl}/users`, {
                method: "GET",
                credentials: "include",
            });
            if (r.ok) {
                const me = await r.json();
                __currentUserId = me?.id ?? null;
            }
        } catch (_) { /* ignore */ }
    })();

    function getCurrentUserId() {
        return __currentUserId;
    }

    function renderPostDetail(post) {
        postTitle.textContent = post.title;
        postContent.textContent = post.content;

        // 이미지
        postImageContainer.innerHTML = "";
        const baseUrl = "http://localhost:8080";

        const writerProfile = document.querySelector(".writer-info .profile-img");
        const writerName = document.querySelector(".writer-info .writer-name");
        const writerDate = document.querySelector(".writer-info .post-date");

        if (post.user) {
            const profileUrl = post.user.imageUrl
                ? (post.user.imageUrl.startsWith("/files")
                    ? `${baseUrl}${post.user.imageUrl}`
                    : `${baseUrl}/files/${post.user.imageUrl}`)
                : "/assets/default-profile.png";

            writerProfile.innerHTML = `<img src="${profileUrl}" alt="프로필 이미지">`;
            writerName.textContent = post.user.nickName ?? "익명";
            writerDate.textContent = formatDate(post.createdAt);
        }

        const postActions = document.querySelector(".post-actions");
        if (post.user && postActions) {
            const currentUserId = getCurrentUserId();
            if (currentUserId && Number(currentUserId) === post.user.id) {
                postActions.style.display = "flex"; // 내 글이면 표시
            } else {
                postActions.style.display = "none"; // 남의 글이면 숨김
            }

        }

        post.postImages?.sort((a, b) => a.sortOrder - b.sortOrder).forEach(img => {
            const imgEl = document.createElement("img");
            imgEl.src = img.imageUrl.startsWith("/files")
                ? `${baseUrl}${img.imageUrl}`
                : `${baseUrl}/files/${img.imageUrl}`;
            imgEl.alt = "게시글 이미지";
            imgEl.classList.add("post-img");
            postImageContainer.appendChild(imgEl);
        });

        // 통계
        likeCountBox.innerHTML = `${post.likesCount}<br><span>좋아요수</span>`;
        viewCountBox.innerHTML = `${post.viewCount}<br><span>조회수</span>`;
        commentCountBox.innerHTML = `${post.commentCount}<br><span>댓글</span>`;

        renderComments(post.comments);
    }

    function renderComments(comments) {
        commentList.innerHTML = "";
        if (!comments || comments.length === 0) {
            commentList.innerHTML = `<p class="no-comment">아직 댓글이 없습니다.</p>`;
            return;
        }

        const currentUserId = getCurrentUserId();

        comments.forEach(comment => {
            const item = document.createElement("div");
            item.classList.add("comment-item");
            item.dataset.commentId = comment.commentId;

            const isMine = currentUserId && Number(currentUserId) === comment.user.id;

            const baseUrl = "http://localhost:8080";
            item.innerHTML = `
                <div class="comment-meta">
                    <div class="profile-img small">
                        <img src="${baseUrl}${comment.user.imageUrl}" alt="프로필">
                    </div>
                    <div class="comment-info">
                        <p class="comment-writer">${comment.user.nickName}</p>
                        <p class="comment-date">${formatDate(comment.createdAt)}</p>
                    </div>
                </div>
                <p class="comment-text">${comment.commentContent}</p>
                ${isMine ? `
                <div class="comment-actions">
                    <button class="edit-btn">수정</button>
                    <button class="delete-btn">삭제</button>
                </div>` : ""}
            `;

            commentList.appendChild(item);
        });
    }


    commentSubmitBtn.addEventListener("click", async () => {
        const content = commentTextarea.value.trim();
        if (!content) {
            alert("댓글 내용을 입력하세요.");
            return;
        }

        try {
            const res = await fetch(`${baseUrl}/posts/${postId}/comments`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ postId, content: content })
            });
            if (!res.ok) throw new Error("댓글 등록 실패");
            commentTextarea.value = "";
            loadPostDetail();
        } catch (err) {
            console.error(err);
            alert("댓글 등록 중 오류가 발생했습니다.");
        }
    });

    commentList.addEventListener("click", async (e) => {
        const target = e.target;
        const commentItem = target.closest(".comment-item");
        if (!commentItem) return;
        const commentId = commentItem.dataset.commentId;

        // 수정
        if (target.classList.contains("edit-btn")) {
            const textEl = commentItem.querySelector(".comment-text");
            const originalText = textEl.textContent;
            const newContent = prompt("댓글을 수정하세요:", originalText);
            if (newContent === null || newContent.trim() === "" || newContent === originalText) return;

            try {
                const res = await fetch(`${baseUrl}/comments/${commentId}`, {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content: newContent })
                });
                if (!res.ok) throw new Error("댓글 수정 실패");
                loadPostDetail();
            } catch (err) {
                console.error(err);
                alert("댓글 수정 중 오류 발생");
            }
        }

        // 삭제
        if (target.classList.contains("delete-btn")) {
            if (!confirm("정말 삭제하시겠습니까?")) return;
            try {
                const res = await fetch(`${baseUrl}/posts/${postId}/comments/${commentId}`, {
                    method: "DELETE",
                    credentials: "include",
                });
                if (!res.ok) throw new Error("댓글 삭제 실패");
                loadPostDetail();
            } catch (err) {
                console.error(err);
                alert("댓글 삭제 중 오류 발생");
            }
        }
    });

    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    }

    loadPostDetail();
});
