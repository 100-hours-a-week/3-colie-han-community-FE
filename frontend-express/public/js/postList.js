document.addEventListener("DOMContentLoaded", async () => {
    const baseUrl = window.API_BASE_URL || `${window.location.origin}/api`;
    const postListContainer = document.querySelector(".post-list");
    const createBtn = document.querySelector(".create-btn");
    const loadMoreBtn = document.querySelector(".load-more-btn");
    const PAGE_SIZE = 10;
    let currentPage = 0;
    let hasNextPage = true;
    let isLoading = false;
    let isNavigatingAway = false;

    window.addEventListener("beforeunload", () => {
        isNavigatingAway = true;
    });

    createBtn.addEventListener("click", () => {
        window.location.href = "./postForm?mode=create";
    });

    const titleEl = document.querySelector(".header h1");

    if (titleEl) {
        titleEl.style.cursor = "pointer";
        titleEl.addEventListener("click", () => {
            window.location.href = "./postList";
        });
    }


    async function ensureLoggedIn() {
        try {
            const res = await fetch(`${baseUrl}/users`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Unauthorized");
        } catch (err) {
            if (!isNavigatingAway) {
                alert("로그인이 필요합니다.");
                window.location.href = "./login";
            }
            return;
        }
    }

    const toggleLoadMoreVisibility = () => {
        if (!loadMoreBtn) return;
        loadMoreBtn.hidden = !hasNextPage || isLoading;
        loadMoreBtn.disabled = isLoading;
    };

    async function loadPosts({ page = 0, append = false } = {}) {
        if (isLoading || !hasNextPage && append) return;
        isLoading = true;
        toggleLoadMoreVisibility();

        try {
            const res = await fetch(`${baseUrl}/posts?page=${page}&size=${PAGE_SIZE}&sort=createdAt,DESC`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) throw new Error("게시글 목록 로드 실패");
            const data = await res.json();

            renderPostList(data.content, append);

            hasNextPage = data.last === undefined
                ? data.content.length === PAGE_SIZE
                : !data.last;
            currentPage = page;
        } catch (err) {
            const message = (err && err.message) || "";
            const isAbort =
                err?.name === "AbortError" ||
                message.includes("AbortError") ||
                message.includes("aborted") ||
                message.includes("ERR_ABORTED");
            if (isAbort || isNavigatingAway) return;
            console.error("게시글 목록 로드 오류:", err);
            postListContainer.innerHTML = `<p class="error">게시글을 불러오는 중 오류가 발생했습니다.</p>`;
            hasNextPage = false;
        } finally {
            isLoading = false;
            toggleLoadMoreVisibility();
        }
    }

    function renderPostList(posts, append = false) {
        if (!append) {
            postListContainer.innerHTML = "";
        }

        if (!posts || posts.length === 0) {
            if (!append) {
                postListContainer.innerHTML = `<p class="no-post">아직 등록된 게시글이 없습니다.</p>`;
            }
            return;
        }

        posts.forEach(post => {
            const postCard = document.createElement("div");
            postCard.classList.add("post-card");

            const createdAt = new Date(post.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

            postCard.innerHTML = `
                <div class="post-header">
                    <h3 class="post-title">${sanitize(post.title)}</h3>
                    <p class="post-date">${createdAt}</p>
                </div>
                <p class="post-info">좋아요 ${post.likeCount ?? 0} · 댓글 ${post.commentCount ?? 0} · 조회수 ${post.viewCount ?? 0}</p>
                <hr class="divider" />
                <div class="writer-info">
                    <div class="profile-img small">
                        <img src="${getProfileUrl(post.user)}" alt="작성자 프로필" />
                    </div>
                    <p class="writer-name">${sanitize(post.user?.nickName ?? "익명")}</p>
                </div>
            `;

            postCard.addEventListener("click", () => {
                window.location.href = `./postDetail?postId=${post.postId}`;
            });

            postListContainer.appendChild(postCard);
        });
    }

    function getProfileUrl(user) {
        if (!user) return "/default/profile-sample.png";
        const url = user.profileImageUrl || user.imageUrl;
        if (!url) return "/default/profile-sample.png";
        if (url.startsWith("http")) return url;
        if (url.startsWith("/files")) return `${baseUrl}${url}`;
        return `${baseUrl}/files/${url}`;
    }

    function sanitize(str) {
        return str
            ?.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    try {
        await ensureLoggedIn();
        loadPosts({ page: 0, append: false });
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener("click", () => {
                if (isLoading || !hasNextPage) return;
                loadPosts({ page: currentPage + 1, append: true });
            });
        }
    } catch (_) {
        
    }
});
