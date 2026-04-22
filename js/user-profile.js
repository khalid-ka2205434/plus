const userProfileContainer = document.getElementById("userProfileContainer");
const userPostsContainer = document.getElementById("userPostsContainer");
const userPostsTitle = document.getElementById("userPostsTitle");
const upLogoutBtn = document.getElementById("upLogoutBtn");

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

function toggleFollow(targetUserId) {
    const currentUser = getCurrentUser();
    const users = getUsers();

    const updatedUsers = users.map(function (user) {
        if (user.id === currentUser.id) {
            if (!user.following) {
                user.following = [];
            }

            const alreadyFollowing = user.following.includes(targetUserId);

            if (alreadyFollowing) {
                user.following = user.following.filter(function (id) {
                    return id !== targetUserId;
                });
            } else {
                user.following.push(targetUserId);
            }

            currentUser.following = user.following;
        }

        return user;
    });

    saveUsers(updatedUsers);
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    renderUserProfile();
}

function renderUserProfile() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    const selectedUserId = Number(localStorage.getItem("selectedUserId"));
    const users = getUsers();

    const targetUser = users.find(function (user) {
        return user.id === selectedUserId;
    });

    if (!targetUser) {
        userProfileContainer.innerHTML = "<p>User not found.</p>";
        return;
    }

    if (targetUser.id === currentUser.id) {
        window.location.href = "profile.html";
        return;
    }

    const avatarSrc = targetUser.profilePicture
        ? targetUser.profilePicture
        : "assets/images/default-avatar.png";

    const isFollowing = (currentUser.following || []).includes(targetUser.id);

    const followingCount = (targetUser.following || []).length;

    const followersCount = users.filter(function (user) {
        return user.following && user.following.includes(targetUser.id);
    }).length;

    userProfileContainer.innerHTML = `
        <div class="profile-image-box">
            <img src="${avatarSrc}" alt="${targetUser.username}" class="profile-image">
        </div>

        <h1 style="text-align:center;">${targetUser.username}</h1>
        <p style="text-align:center; color:#6b7280; margin-bottom:12px;">
            ${targetUser.bio ? targetUser.bio : "No bio yet."}
        </p>

        <div class="profile-stats">
            <span class="stat-item"><strong>${followingCount}</strong> Following</span>
            <span class="stat-divider">·</span>
            <span class="stat-item"><strong>${followersCount}</strong> Followers</span>
        </div>

        <div style="display:flex; justify-content:center; margin-top:16px;">
            <button id="followToggleBtn" class="primary-btn" onclick="toggleFollow(${targetUser.id})">
                ${isFollowing ? "Unfollow" : "Follow"}
            </button>
        </div>
    `;
}

function renderUserPosts() {
    const selectedUserId = Number(localStorage.getItem("selectedUserId"));
    const users = getUsers();
    const posts = getPosts();

    const targetUser = users.find(function (user) {
        return user.id === selectedUserId;
    });

    if (!targetUser) {
        userPostsContainer.innerHTML = "<p>User not found.</p>";
        return;
    }

    const theirPosts = posts.filter(function (post) {
        return post.userId === targetUser.id;
    }).reverse();

    userPostsTitle.textContent = targetUser.username + "'s Posts";
    userPostsContainer.innerHTML = "";

    if (theirPosts.length === 0) {
        userPostsContainer.innerHTML = "<p>This user has not posted anything yet.</p>";
        return;
    }

    theirPosts.forEach(function (post) {
        const card = document.createElement("div");
        card.classList.add("post-card");

        const content = document.createElement("p");
        content.textContent = post.content;

        const time = document.createElement("div");
        time.classList.add("post-time");
        time.textContent = post.timestamp;

        const meta = document.createElement("p");
        meta.textContent = "Likes: " + post.likes + " | Comments: " + (post.comments ? post.comments.length : 0);

        const detailsBtn = document.createElement("button");
        detailsBtn.classList.add("post-btn");
        detailsBtn.textContent = "View Details";
        detailsBtn.style.marginTop = "10px";

        detailsBtn.addEventListener("click", function () {
            localStorage.setItem("selectedPostId", post.id);
            window.location.href = "post.html";
        });

        card.appendChild(content);
        card.appendChild(time);
        card.appendChild(meta);
        card.appendChild(detailsBtn);

        userPostsContainer.appendChild(card);
    });
}

if (upLogoutBtn) {
    upLogoutBtn.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}

renderUserProfile();
renderUserPosts();