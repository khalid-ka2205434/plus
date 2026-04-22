const profileUsername = document.getElementById("profileUsername");
const profileEmail = document.getElementById("profileEmail");
const profileBio = document.getElementById("profileBio");
const profileImage = document.getElementById("profileImage");
const profileStats = document.getElementById("profileStats");
const bioForm = document.getElementById("bioForm");
const bioInput = document.getElementById("bioInput");
const myPostsContainer = document.getElementById("myPostsContainer");
const profileLogoutBtn = document.getElementById("profileLogoutBtn");
const savePictureBtn = document.getElementById("savePictureBtn");

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

function renderProfile() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    const allUsers = getUsers();

    profileUsername.textContent = currentUser.username;
    profileEmail.textContent = currentUser.email;
    profileBio.textContent = currentUser.bio ? currentUser.bio : "No bio yet.";
    bioInput.value = currentUser.bio ? currentUser.bio : "";
    profileImage.src = currentUser.profilePicture
        ? currentUser.profilePicture
        : "assets/images/default-avatar.png";

    if (profileStats) {
        const followingCount = (currentUser.following || []).length;
        const followersCount = allUsers.filter(function (user) {
            return user.id !== currentUser.id &&
                   user.following &&
                   user.following.includes(currentUser.id);
        }).length;

        profileStats.innerHTML = `
            <span class="stat-item" id="followingToggle" style="cursor:pointer;">
                <strong>${followingCount}</strong> Following
            </span>
            <span class="stat-divider">·</span>
            <span class="stat-item">
                <strong>${followersCount}</strong> Followers
            </span>
        `;

        const followingToggle = document.getElementById("followingToggle");

        if (followingToggle) {
            followingToggle.addEventListener("click", function () {
                showFollowingList(currentUser, allUsers);
            });
        }
    }
}

function showFollowingList(currentUser, allUsers) {
    const followingIds = currentUser.following || [];

    if (followingIds.length === 0) {
        alert("You are not following anyone yet.");
        return;
    }

    const followingNames = followingIds.map(function (id) {
        const user = allUsers.find(function (u) {
            return u.id === id;
        });

        return user ? user.username : "Unknown";
    });

    alert("You are following:\n" + followingNames.join(", "));
}

function renderMyPosts() {
    const currentUser = getCurrentUser();
    const posts = getPosts();

    myPostsContainer.innerHTML = "";

    const myPosts = posts.filter(function (post) {
        return post.userId === currentUser.id;
    }).reverse();

    if (myPosts.length === 0) {
        myPostsContainer.innerHTML = "<p>You have not created any posts yet.</p>";
        return;
    }

    myPosts.forEach(function (post) {
        const postCard = document.createElement("div");
        postCard.classList.add("post-card");

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

        postCard.appendChild(content);
        postCard.appendChild(time);
        postCard.appendChild(meta);
        postCard.appendChild(detailsBtn);

        myPostsContainer.appendChild(postCard);
    });
}

if (bioForm) {
    bioForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const currentUser = getCurrentUser();
        const users = getUsers();
        const newBio = bioInput.value.trim();

        const updatedUsers = users.map(function (user) {
            if (user.id === currentUser.id) {
                user.bio = newBio;
                currentUser.bio = newBio;
            }
            return user;
        });

        saveUsers(updatedUsers);
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        renderProfile();
        alert("Bio updated successfully!");
    });
}

if (savePictureBtn) {
    savePictureBtn.addEventListener("click", function () {
        const selectedPictureInput = document.querySelector('input[name="editProfilePicture"]:checked');

        if (!selectedPictureInput) {
            alert("Please choose a profile picture first.");
            return;
        }

        const newPicture = selectedPictureInput.value;
        const currentUser = getCurrentUser();
        const users = getUsers();

        const updatedUsers = users.map(function (user) {
            if (user.id === currentUser.id) {
                user.profilePicture = newPicture;
                currentUser.profilePicture = newPicture;
            }
            return user;
        });

        saveUsers(updatedUsers);
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        renderProfile();
        alert("Profile picture updated successfully!");
    });
}

if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}

renderProfile();
renderMyPosts();