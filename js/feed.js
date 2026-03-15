const welcomeMessage = document.getElementById("welcomeMessage");
const postForm = document.getElementById("postForm");
const postContent = document.getElementById("postContent");
const postsContainer = document.getElementById("postsContainer");
const logoutBtn = document.getElementById("logoutBtn");
const usersContainer = document.getElementById("usersContainer");

function getCurrentUser() {
    const currentUser = localStorage.getItem("currentUser");
    return currentUser ? JSON.parse(currentUser) : null;
}

function getUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getPosts() {
    const posts = localStorage.getItem("posts");
    return posts ? JSON.parse(posts) : [];
}

function savePosts(posts) {
    localStorage.setItem("posts", JSON.stringify(posts));
}

function formatDate() {
    return new Date().toLocaleString();
}

function renderUsers() {
    const currentUser = getCurrentUser();
    const users = getUsers();

    usersContainer.innerHTML = "";

    const otherUsers = users.filter(function (user) {
        return user.id !== currentUser.id;
    });

    if (otherUsers.length === 0) {
        usersContainer.innerHTML = "<p>No other users found.</p>";
        return;
    }

    otherUsers.forEach(function (user) {
        const userCard = document.createElement("div");
        userCard.classList.add("user-card");

        const userInfo = document.createElement("div");
        userInfo.innerHTML = `
            <p><strong>${user.username}</strong></p>
            <p>${user.bio ? user.bio : "No bio yet."}</p>
        `;

        const followButton = document.createElement("button");
        followButton.classList.add("post-btn");

        const followingList = currentUser.following ? currentUser.following : [];
        const isFollowing = followingList.includes(user.id);

        followButton.textContent = isFollowing ? "Unfollow" : "Follow";

        followButton.addEventListener("click", function () {
            toggleFollow(user.id);
        });

        userCard.appendChild(userInfo);
        userCard.appendChild(followButton);

        usersContainer.appendChild(userCard);
    });
}

function toggleFollow(userId) {
    const currentUser = getCurrentUser();
    const users = getUsers();

    const updatedUsers = users.map(function (user) {
        if (user.id === currentUser.id) {
            if (!user.following) {
                user.following = [];
            }

            const isFollowing = user.following.includes(userId);

            if (isFollowing) {
                user.following = user.following.filter(function (id) {
                    return id !== userId;
                });
            } else {
                user.following.push(userId);
            }

            currentUser.following = user.following;
        }

        return user;
    });

    saveUsers(updatedUsers);
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    renderUsers();
    renderPosts();
}

function renderPosts() {
    const currentUser = getCurrentUser();
    const posts = getPosts();
    const users = getUsers();

    postsContainer.innerHTML = "";

    const followingList = currentUser.following ? currentUser.following : [];

    const allowedPosts = posts.filter(function (post) {
        return post.userId === currentUser.id || followingList.includes(post.userId);
    });

    if (allowedPosts.length === 0) {
        postsContainer.innerHTML = "<p>No posts yet.</p>";
        return;
    }

    const sortedPosts = allowedPosts.slice().reverse();

    sortedPosts.forEach(function (post) {
        const postCard = document.createElement("div");
        postCard.classList.add("post-card");

        const postHeader = document.createElement("div");
        postHeader.classList.add("post-header");

        const postAvatar = document.createElement("img");
        postAvatar.classList.add("post-avatar");

        const postUser = users.find(function (user) {
            return user.id === post.userId;
        });

        postAvatar.src = postUser && postUser.profilePicture
            ? postUser.profilePicture
            : "assets/images/default-avatar.png";

        const username = document.createElement("h3");
        username.textContent = post.username;

        postHeader.appendChild(postAvatar);
        postHeader.appendChild(username);

        const content = document.createElement("p");
        content.textContent = post.content;

        const time = document.createElement("div");
        time.classList.add("post-time");
        time.textContent = post.timestamp;

        const actions = document.createElement("div");
        actions.classList.add("post-actions");

        if (!post.likedBy) {
            post.likedBy = [];
        }

        const alreadyLiked = post.likedBy.includes(currentUser.id);

        const likeButton = document.createElement("button");
        likeButton.classList.add("post-btn");
        likeButton.textContent = "Like (" + post.likes + ")";

        likeButton.addEventListener("click", function () {
            toggleLike(post.id);
        });

        actions.appendChild(likeButton);

        const detailsButton = document.createElement("button");
        detailsButton.classList.add("post-btn");
        detailsButton.textContent = "View Details";
        detailsButton.addEventListener("click", function () {
            localStorage.setItem("selectedPostId", post.id);
            window.location.href = "post.html";
        });

        actions.appendChild(detailsButton);

        if (currentUser.id === post.userId) {
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("post-btn");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", function () {
                deletePost(post.id);
            });

            actions.appendChild(deleteButton);
        }

        const commentsSection = document.createElement("div");
        commentsSection.classList.add("comments-section");

        const commentsTitle = document.createElement("h4");
        commentsTitle.textContent = "Comments";
        commentsSection.appendChild(commentsTitle);

        if (post.comments && post.comments.length > 0) {
            post.comments.forEach(function (comment) {
                const commentItem = document.createElement("div");
                commentItem.classList.add("comment-item");
                commentItem.textContent = comment.username + ": " + comment.text;
                commentsSection.appendChild(commentItem);
            });
        } else {
            const noComments = document.createElement("p");
            noComments.classList.add("no-comments");
            noComments.textContent = "No comments yet.";
            commentsSection.appendChild(noComments);
        }

        const commentForm = document.createElement("form");
        commentForm.classList.add("comment-form");

        const commentInput = document.createElement("input");
        commentInput.type = "text";
        commentInput.placeholder = "Write a comment...";
        commentInput.required = true;
        commentInput.classList.add("comment-input");

        const commentButton = document.createElement("button");
        commentButton.type = "submit";
        commentButton.textContent = "Comment";
        commentButton.classList.add("post-btn");

        commentForm.appendChild(commentInput);
        commentForm.appendChild(commentButton);

        commentForm.addEventListener("submit", function (event) {
            event.preventDefault();
            addComment(post.id, commentInput.value.trim());
        });

        postCard.appendChild(postHeader);
        postCard.appendChild(content);
        postCard.appendChild(time);
        postCard.appendChild(actions);
        postCard.appendChild(commentsSection);
        postCard.appendChild(commentForm);

        postsContainer.appendChild(postCard);
    });
}

function toggleLike(postId) {
    const currentUser = getCurrentUser();
    const posts = getPosts();

    const updatedPosts = posts.map(function (post) {
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
    renderPosts();
}

function deletePost(postId) {
    const posts = getPosts();

    const updatedPosts = posts.filter(function (post) {
        return post.id !== postId;
    });

    savePosts(updatedPosts);
    renderPosts();
}

function addComment(postId, commentText) {
    const currentUser = getCurrentUser();

    if (!commentText) {
        return;
    }

    const posts = getPosts();

    const updatedPosts = posts.map(function (post) {
        if (post.id === postId) {
            if (!post.comments) {
                post.comments = [];
            }

            post.comments.push({
                id: Date.now(),
                userId: currentUser.id,
                username: currentUser.username,
                text: commentText
            });
        }

        return post;
    });

    savePosts(updatedPosts);
    renderPosts();
}

if (postForm) {
    postForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const currentUser = getCurrentUser();

        if (!currentUser) {
            alert("Please login first.");
            window.location.href = "login.html";
            return;
        }

        const newPost = {
            id: Date.now(),
            userId: currentUser.id,
            username: currentUser.username,
            content: postContent.value.trim(),
            timestamp: formatDate(),
            likes: 0,
            likedBy: [],
            comments: []
        };

        const posts = getPosts();
        posts.push(newPost);
        savePosts(posts);

        postForm.reset();
        renderPosts();
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}

const currentUser = getCurrentUser();

if (!currentUser) {
    window.location.href = "login.html";
} else {
    if (!currentUser.following) {
        currentUser.following = [];
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        const users = getUsers().map(function (user) {
            if (user.id === currentUser.id) {
                user.following = [];
            }
            return user;
        });

        saveUsers(users);
    }

    welcomeMessage.textContent = "Welcome, " + currentUser.username;
    renderUsers();
    renderPosts();
}