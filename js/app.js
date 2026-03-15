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

function renderPostDetails() {
    if (!postDetailsContainer) {
        return;
    }

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    const selectedPostId = localStorage.getItem("selectedPostId");
    const posts = getPosts();

    const selectedPost = posts.find(function (post) {
        return post.id === Number(selectedPostId);
    });

    if (!selectedPost) {
        postDetailsContainer.innerHTML = "<p>Post not found.</p>";
        return;
    }

    let commentsHTML = "";

    if (selectedPost.comments && selectedPost.comments.length > 0) {
        selectedPost.comments.forEach(function (comment) {
            commentsHTML += `
                <div class="comment-item">
                    ${comment.username}: ${comment.text}
                </div>
            `;
        });
    } else {
        commentsHTML = `<p class="no-comments">No comments yet.</p>`;
    }

    postDetailsContainer.innerHTML = `
        <h1>Post Details</h1>
        <div class="post-card">
            <h3>${selectedPost.username}</h3>
            <p>${selectedPost.content}</p>
            <div class="post-time">${selectedPost.timestamp}</div>
            <p><strong>Likes:</strong> ${selectedPost.likes}</p>

            <div class="comments-section">
                <h4>Comments</h4>
                ${commentsHTML}
            </div>
        </div>

        <p class="form-footer">
            <a href="feed.html">Back to Feed</a>
        </p>
    `;
}

if (postLogoutBtn) {
    postLogoutBtn.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}
renderPostDetails();