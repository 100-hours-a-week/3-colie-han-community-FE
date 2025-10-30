document.addEventListener("DOMContentLoaded", async () => {
    const postTitle = document.querySelector(".post-title");
    const postContent = document.querySelector(".post-content");
    const postImageContainer = document.querySelector(".post-image");
    const commentList = document.querySelector(".comment-list");
    const likeToggleBtn = document.querySelector(".like-toggle");
    const likeIconEl = likeToggleBtn ? likeToggleBtn.querySelector(".like-icon") : null;
    const likeCountValue = document.querySelector(".like-count-value");
    const viewCountValue = document.querySelector(".view-count-value");
    const commentCountValue = document.querySelector(".comment-count-value");
    const commentTextarea = document.querySelector(".comment-section textarea");
    const commentSubmitBtn = document.querySelector(".comment-submit");
    const COMMENT_MAX_LENGTH = 5000;

    let isLiked = false;
    let isLikeProcessing = false;
    let canUseLike = true;

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
        window.location.href = `./postForm?postId=${postId}&mode=edit`;
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
            window.location.href = "./postList";
        } catch (err) {
            console.error("게시글 삭제 중 오류:", err);
            alert("서버 통신 오류가 발생했습니다.");
        }
    });

    async function ensureLoggedIn() {
        try {
            const res = await fetch(`${baseUrl}/users`, {
                method: "GET",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Unauthorized");
        } catch (err) {
            alert("로그인이 필요합니다.");
            window.location.href = "./login";
            throw err;
        }
    }

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

    async function fetchCurrentUser() {
        try {
            const response = await fetch(`${baseUrl}/users`, {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) return null;
            const me = await response.json();
            __currentUserId = me?.id ?? null;
        } catch (err) {
            console.error("현재 사용자 정보 조회 실패:", err);
            __currentUserId = null;
        }
    }

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
            const profileUrl = resolveProfileImage(post.user);

            writerProfile.innerHTML = `<img src="${profileUrl}" alt="프로필 이미지">`;
            writerName.textContent = post.user.nickName ?? "익명";
            writerDate.textContent = formatDate(post.createdAt);
        }

        const postActions = document.querySelector(".post-actions");
        const currentUserId = getCurrentUserId();
        const isMine = post.user && currentUserId && Number(currentUserId) === post.user.id;

        if (postActions) {
            if (isMine) {
                postActions.style.display = "flex";
            } else {
                postActions.style.display = "none";
            }
        }

        if (likeToggleBtn) {
            if (isMine) {
                likeToggleBtn.style.display = "none";
                likeToggleBtn.disabled = true;
                canUseLike = false;
            } else {
                likeToggleBtn.style.display = "inline-flex";
                likeToggleBtn.disabled = false;
                canUseLike = true;
            }
        } else {
            canUseLike = false;
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
        if (likeCountValue) {
            likeCountValue.textContent = post.likesCount ?? 0;
        }
        if (viewCountValue) {
            viewCountValue.textContent = post.viewCount ?? 0;
        }
        if (commentCountValue) {
            commentCountValue.textContent = post.commentCount ?? 0;
        }

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

            const profileUrl = resolveProfileImage(comment.user);
            item.innerHTML = `
                <div class="comment-meta">
                    <div class="profile-img small">
                        <img src="${profileUrl}" alt="프로필">
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

    function applyLikeState() {
        if (!likeToggleBtn || !canUseLike) return;
        likeToggleBtn.classList.toggle("is-liked", !!isLiked);
        likeToggleBtn.setAttribute("aria-pressed", isLiked ? "true" : "false");
        if (likeIconEl) {
            likeIconEl.textContent = isLiked ? "♥" : "♡";
        }
    }

    async function loadLikeState() {
        if (!likeToggleBtn || !canUseLike) return;
        try {
            likeToggleBtn.disabled = true;
            const res = await fetch(`${baseUrl}/userlikes/${postId}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("좋아요 상태 확인 실패");

            const contentType = res.headers.get("content-type") || "";
            let data;
            if (contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                try {
                    data = JSON.parse(text);
                } catch (_) {
                    data = text;
                }
            }

            if (typeof data === "boolean") {
                isLiked = data;
            } else if (typeof data === "string") {
                isLiked = data.toLowerCase() === "true";
            } else if (typeof data === "object" && data !== null) {
                const candidates = ["liked", "isLiked", "like", "result", "value", "data"];
                let value = null;
                for (const key of candidates) {
                    if (key in data) {
                        value = data[key];
                        break;
                    }
                }
                isLiked = Boolean(value);
            } else {
                isLiked = false;
            }
        } catch (err) {
            console.error("좋아요 상태 확인 실패:", err);
            isLiked = false;
        } finally {
            applyLikeState();
            likeToggleBtn.disabled = false;
        }
    }

    async function onLikeToggle() {
        if (!likeToggleBtn || !canUseLike || isLikeProcessing) return;
        isLikeProcessing = true;
        likeToggleBtn.disabled = true;
        try {
            const method = isLiked ? "DELETE" : "POST";
            const res = await fetch(`${baseUrl}/userlikes/${postId}`, {
                method,
                credentials: "include",
            });
            if (!res.ok) throw new Error("좋아요 처리 실패");
            await loadPostDetail();
            await loadLikeState();
        } catch (err) {
            console.error("좋아요 처리 중 오류:", err);
            alert("좋아요 처리에 실패했습니다.");
        } finally {
            if (likeToggleBtn) {
                likeToggleBtn.disabled = false;
            }
            isLikeProcessing = false;
        }
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

    if (commentList) {
        commentList.addEventListener("click", async (e) => {
            const target = e.target;
            const commentItem = target.closest(".comment-item");
            if (!commentItem) return;
            const commentId = commentItem.dataset.commentId;

            if (target.classList.contains("edit-btn")) {
                startInlineCommentEdit(commentItem);
                return;
            }

            if (target.classList.contains("save-edit-btn")) {
                await submitInlineCommentEdit(commentItem);
                return;
            }

            if (target.classList.contains("cancel-edit-btn")) {
                cancelInlineCommentEdit(commentItem);
                return;
            }

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
    }

    if (likeToggleBtn) {
        likeToggleBtn.addEventListener("click", onLikeToggle);
    }

    function startInlineCommentEdit(commentItem) {
        if (!commentItem || commentItem.classList.contains("editing")) return;
        const currentEditing = commentList.querySelector(".comment-item.editing");
        if (currentEditing && currentEditing !== commentItem) {
            cancelInlineCommentEdit(currentEditing);
        }

        const textEl = commentItem.querySelector(".comment-text");
        if (!textEl) return;

        const originalText = textEl.textContent || "";
        commentItem.dataset.originalText = originalText;

        const textarea = document.createElement("textarea");
        textarea.className = "comment-edit-inline";
        textarea.value = originalText;
        textarea.maxLength = COMMENT_MAX_LENGTH;
        textarea.setAttribute("aria-label", "댓글 수정");
        textEl.replaceWith(textarea);

        const actions = commentItem.querySelector(".comment-actions");
        if (actions) {
            const editBtn = actions.querySelector(".save-edit-btn, .edit-btn");
            if (editBtn) {
                editBtn.textContent = "저장";
                editBtn.classList.remove("edit-btn");
                editBtn.classList.add("save-edit-btn");
            }

            const deleteBtn = actions.querySelector(".delete-btn");
            if (deleteBtn) {
                deleteBtn.style.display = "none";
            }

            let cancelBtn = actions.querySelector(".cancel-edit-btn");
            if (!cancelBtn) {
                cancelBtn = document.createElement("button");
                cancelBtn.type = "button";
                cancelBtn.className = "cancel-edit-btn";
                cancelBtn.textContent = "취소";
                actions.appendChild(cancelBtn);
            } else {
                cancelBtn.style.display = "inline-flex";
            }
        }

        commentItem.classList.add("editing");
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }

    function cancelInlineCommentEdit(commentItem) {
        if (!commentItem || !commentItem.classList.contains("editing")) return;
        const textarea = commentItem.querySelector(".comment-edit-inline");
        const originalText = commentItem.dataset.originalText || "";

        if (textarea) {
            const textNode = document.createElement("p");
            textNode.className = "comment-text";
            textNode.textContent = originalText;
            textarea.replaceWith(textNode);
        }

        const actions = commentItem.querySelector(".comment-actions");
        if (actions) {
            const saveBtn = actions.querySelector(".save-edit-btn");
            if (saveBtn) {
                saveBtn.textContent = "수정";
                saveBtn.classList.remove("save-edit-btn");
                saveBtn.classList.add("edit-btn");
                saveBtn.disabled = false;
            }
            const cancelBtn = actions.querySelector(".cancel-edit-btn");
            if (cancelBtn) {
                cancelBtn.remove();
            }
            const deleteBtn = actions.querySelector(".delete-btn");
            if (deleteBtn) {
                deleteBtn.style.display = "";
            }
        }

        commentItem.classList.remove("editing");
        delete commentItem.dataset.originalText;
    }

    async function submitInlineCommentEdit(commentItem) {
        const textarea = commentItem.querySelector(".comment-edit-inline");
        if (!textarea) return;

        const newContent = textarea.value.trim();
        if (!newContent) {
            alert("내용을 입력해주세요.");
            textarea.focus();
            return;
        }

        const commentId = commentItem.dataset.commentId;
        const saveBtn = commentItem.querySelector(".save-edit-btn");
        if (saveBtn) saveBtn.disabled = true;

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
            await loadPostDetail();
        } catch (err) {
            console.error("댓글 수정 중 오류 발생", err);
            alert("댓글 수정 중 오류가 발생했습니다.");
            if (saveBtn) saveBtn.disabled = false;
        }
    }

    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    }

    function resolveProfileImage(user) {
        if (!user) return "/default/profile-sample.png";
        const url = user.profileImageUrl || user.imageUrl;
        if (!url) return "/default/profile-sample.png";
        if (url.startsWith("http")) return url;
        if (url.startsWith("/files")) return `${baseUrl}${url}`;
        return `${baseUrl}/files/${url}`;
    }

    try {
        await ensureLoggedIn();
        await fetchCurrentUser();
        await loadPostDetail();
        if (canUseLike) {
            await loadLikeState();
        }
    } catch (_) {
        // already handled in ensureLoggedIn
    }
});
