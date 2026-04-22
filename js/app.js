const postDetailsContainer = document.getElementById("postDetailsContainer");
const postLogoutBtn = document.getElementById("postLogoutBtn");

function getCurrentUser() {
    const currentUser = localStorage.getItem("currentUser");
    return currentUser ? JSON.parse(currentUser) : null;
}

function getPosts() {
    const posts = localStorage.getItem("posts");
    return posts ? JSON.parse(posts) : [];
}

function savePosts(posts) {
    localStorage.setItem("posts", JSON.stringify(posts));
}

function getUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
}

function addCommentToPost(postId, commentText) {
    const currentUser = getCurrentUser();

    if (!commentText) {
        return;
    }

    const updatedPosts = getPosts().map(function (post) {
        if (post.id === postId) {
            if (!post.comments) {
                post.comments = [];
            }

            post.comments.push({
                id: Date.now(),
                userId: currentUser.id,
                username: currentUser.username,
                text: commentText,
                timestamp: new Date().toLocaleString()
            });
        }

        return post;
    });

    savePosts(updatedPosts);
    renderPostDetails();
}

function deleteCommentFromPost(postId, commentId) {
    const confirmDelete = confirm("Delete this comment?");

    if (!confirmDelete) {
        return;
    }

    const updatedPosts = getPosts().map(function (post) {
        if (post.id === postId) {
            post.comments = (post.comments || []).filter(function (comment) {
                return comment.id !== commentId;
            });
        }

        return post;
    });

    savePosts(updatedPosts);
    renderPostDetails();
}

function toggleLikeOnDetail(postId) {
    const currentUser = getCurrentUser();

    const updatedPosts = getPosts().map(function (post) {
        if (post.id === postId) {
            if (!post.likedBy) {
                post.likedBy = [];
            }

            const alreadyLiked = post.likedBy.includes(currentUser.id);

            if (alreadyLiked) {
                post.likedBy = post.likedBy.filter(function (id) {
                    return id !== currentUser.id;
                });
                post.likes = Math.max(0, post.likes - 1);
            } else {
                post.likedBy.push(currentUser.id);
                post.likes += 1;
            }
        }

        return post;
    });

    savePosts(updatedPosts);
    renderPostDetails();
}

function renderPostDetails() {
    if (!postDetailsContainer) {
        return;
    }

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    const selectedPostId = Number(localStorage.getItem("selectedPostId"));
    const posts = getPosts();
    const users = getUsers();

    const selectedPost = posts.find(function (post) {
        return post.id === selectedPostId;
    });

    if (!selectedPost) {
        postDetailsContainer.innerHTML = "<p>Post not found.</p>";
        return;
    }

    const postUser = users.find(function (user) {
        return user.id === selectedPost.userId;
    });

    const avatarSrc = postUser && postUser.profilePicture
        ? postUser.profilePicture
        : "assets/images/default-avatar.png";

    const alreadyLiked = (selectedPost.likedBy || []).includes(currentUser.id);

    let commentsHTML = "";

    if (selectedPost.comments && selectedPost.comments.length > 0) {
        selectedPost.comments.forEach(function (comment) {
            const canDelete = comment.userId === currentUser.id;

            commentsHTML += `
                <div class="comment-item">
                    <div>
                        <strong>${comment.username}:</strong> ${comment.text}
                    </div>
                    ${canDelete ? `<button class="comment-delete-btn" onclick="deleteCommentFromPost(${selectedPost.id}, ${comment.id})">Delete</button>` : ""}
                </div>
            `;
        });
    } else {
        commentsHTML = `<p class="no-comments">No comments yet.</p>`;
    }

    const profileLink = selectedPost.userId === currentUser.id ? "profile.html" : "user-profile.html";
    const profileAction = selectedPost.userId !== currentUser.id
        ? `onclick="localStorage.setItem('selectedUserId', ${selectedPost.userId})"`
        : "";

    postDetailsContainer.innerHTML = `
        <h1>Post Details</h1>

        <div class="post-card">
            <div class="post-header">
                <img class="post-avatar" src="${avatarSrc}" alt="${selectedPost.username}">
                <h3>
                    <a href="${profileLink}" ${profileAction} class="username-link">${selectedPost.username}</a>
                </h3>
            </div>

            <p>${selectedPost.content}</p>
            <div class="post-time">${selectedPost.timestamp}</div>

            <p><strong>Likes:</strong> ${selectedPost.likes}</p>
            <p><strong>Comments:</strong> ${selectedPost.comments ? selectedPost.comments.length : 0}</p>

            <div class="post-actions" style="margin-top: 12px;">
                <button class="post-btn" onclick="toggleLikeOnDetail(${selectedPost.id})">
                    Like (${selectedPost.likes})
                </button>
            </div>

            <div class="comments-section">
                <h4>Comments</h4>
                ${commentsHTML}
            </div>

            <form class="comment-form" onsubmit="event.preventDefault(); handleDetailComment(${selectedPost.id});">
                <input type="text" id="detailCommentInput" class="comment-input" placeholder="Write a comment" required>
                <button type="submit" class="post-btn">Comment</button>
            </form>
        </div>

        <p class="form-footer" style="margin-top: 16px;">
            <a href="feed.html">Back to Feed</a>
        </p>
    `;
}

function handleDetailComment(postId) {
    const input = document.getElementById("detailCommentInput");
    const text = input ? input.value.trim() : "";
    addCommentToPost(postId, text);
}

if (postLogoutBtn) {
    postLogoutBtn.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}

renderPostDetails();