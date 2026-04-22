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

function renderUsers(searchText) {
    const currentUser = getCurrentUser();
    const users = getUsers();

    usersContainer.innerHTML = "";

    const searchWrapper = document.createElement("div");
    searchWrapper.classList.add("user-search-wrapper");

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search users";
    searchInput.classList.add("user-search-input");
    searchInput.value = searchText ? searchText : "";

    searchInput.addEventListener("input", function () {
        renderUsers(searchInput.value);
    });

    searchWrapper.appendChild(searchInput);
    usersContainer.appendChild(searchWrapper);

    let otherUsers = users.filter(function (user) {
        return user.id !== currentUser.id;
    });

    if (searchText) {
        const text = searchText.toLowerCase().trim();

        otherUsers = otherUsers.filter(function (user) {
            return user.username.toLowerCase().includes(text) ||
                   (user.bio && user.bio.toLowerCase().includes(text));
        });
    }

    if (otherUsers.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No users found.";
        usersContainer.appendChild(message);
        return;
    }

    otherUsers.forEach(function (user) {
        const userCard = document.createElement("div");
        userCard.classList.add("user-card");

        const avatar = document.createElement("img");
        avatar.classList.add("post-avatar");
        avatar.src = user.profilePicture ? user.profilePicture : "assets/images/default-avatar.png";
        avatar.alt = user.username;

        const info = document.createElement("div");
        info.classList.add("user-card-info");

        const followersCount = users.filter(function (u) {
            return u.following && u.following.includes(user.id);
        }).length;

        info.innerHTML = `
            <p><strong>${user.username}</strong></p>
            <p>${user.bio ? user.bio : "No bio yet."}</p>
            <p>${followersCount} follower${followersCount !== 1 ? "s" : ""}</p>
        `;

        const actions = document.createElement("div");
        actions.classList.add("user-card-actions");

        const viewProfileBtn = document.createElement("button");
        viewProfileBtn.classList.add("post-btn");
        viewProfileBtn.textContent = "View Profile";
        viewProfileBtn.addEventListener("click", function () {
            localStorage.setItem("selectedUserId", user.id);
            window.location.href = "user-profile.html";
        });

        const followingList = currentUser.following ? currentUser.following : [];
        const isFollowing = followingList.includes(user.id);

        const followBtn = document.createElement("button");
        followBtn.classList.add("post-btn");
        followBtn.textContent = isFollowing ? "Unfollow" : "Follow";
        followBtn.addEventListener("click", function () {
            toggleFollow(user.id);
        });

        actions.appendChild(viewProfileBtn);
        actions.appendChild(followBtn);

        userCard.appendChild(avatar);
        userCard.appendChild(info);
        userCard.appendChild(actions);

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

            const alreadyFollowing = user.following.includes(userId);

            if (alreadyFollowing) {
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

        const postUser = users.find(function (user) {
            return user.id === post.userId;
        });

        const postAvatar = document.createElement("img");
        postAvatar.classList.add("post-avatar");
        postAvatar.src = postUser && postUser.profilePicture
            ? postUser.profilePicture
            : "assets/images/default-avatar.png";

        const usernameEl = document.createElement("h3");
        usernameEl.textContent = post.username;
        usernameEl.style.cursor = "pointer";

        usernameEl.addEventListener("click", function () {
            if (post.userId === currentUser.id) {
                window.location.href = "profile.html";
            } else {
                localStorage.setItem("selectedUserId", post.userId);
                window.location.href = "user-profile.html";
            }
        });

        postHeader.appendChild(postAvatar);
        postHeader.appendChild(usernameEl);

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

        const detailsButton = document.createElement("button");
        detailsButton.classList.add("post-btn");
        detailsButton.textContent = "View Details";
        detailsButton.addEventListener("click", function () {
            localStorage.setItem("selectedPostId", post.id);
            window.location.href = "post.html";
        });

        actions.appendChild(likeButton);
        actions.appendChild(detailsButton);

        if (currentUser.id === post.userId) {
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("post-btn");
            deleteButton.textContent = "Delete Post";
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

                const commentText = document.createElement("span");
                commentText.innerHTML = "<strong>" + comment.username + ":</strong> " + comment.text;

                commentItem.appendChild(commentText);

                if (comment.userId === currentUser.id) {
                    const deleteCommentBtn = document.createElement("button");
                    deleteCommentBtn.classList.add("comment-delete-btn");
                    deleteCommentBtn.textContent = "Delete";
                    deleteCommentBtn.addEventListener("click", function () {
                        deleteComment(post.id, comment.id);
                    });

                    commentItem.appendChild(deleteCommentBtn);
                }

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
        commentInput.placeholder = "Write a comment";
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
    const confirmDelete = confirm("Are you sure you want to delete this post?");

    if (!confirmDelete) {
        return;
    }

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
    renderPosts();
}

function deleteComment(postId, commentId) {
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

        const text = postContent.value.trim();

        if (!text) {
            return;
        }

        const newPost = {
            id: Date.now(),
            userId: currentUser.id,
            username: currentUser.username,
            content: text,
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