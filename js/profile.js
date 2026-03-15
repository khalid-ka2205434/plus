const profileUsername = document.getElementById("profileUsername");
const profileEmail = document.getElementById("profileEmail");
const profileBio = document.getElementById("profileBio");
const profileImage = document.getElementById("profileImage");
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

    profileUsername.textContent = currentUser.username;
    profileEmail.textContent = currentUser.email;
    profileBio.textContent = currentUser.bio ? currentUser.bio : "No bio yet.";
    bioInput.value = currentUser.bio ? currentUser.bio : "";
    profileImage.src = currentUser.profilePicture
        ? currentUser.profilePicture
        : "assets/images/default-avatar.png";
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

        const likes = document.createElement("p");
        likes.textContent = "Likes: " + post.likes;

        postCard.appendChild(content);
        postCard.appendChild(time);
        postCard.appendChild(likes);

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