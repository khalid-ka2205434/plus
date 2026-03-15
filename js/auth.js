const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

function getUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function saveCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("signupUsername").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value.trim();
        const bio = document.getElementById("signupBio").value.trim();

        const selectedAvatarInput = document.querySelector('input[name="profilePicture"]:checked');
        const selectedAvatar = selectedAvatarInput
            ? selectedAvatarInput.value
            : "assets/images/default-avatar.png";

        const users = getUsers();

        const emailExists = users.find(function (user) {
            return user.email === email;
        });

        if (emailExists) {
            alert("This email is already registered.");
            return;
        }

        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: password,
            bio: bio,
            profilePicture: selectedAvatar,
            following: []
        };

        users.push(newUser);
        saveUsers(users);

        alert("Account created successfully!");
        window.location.href = "login.html";
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        const users = getUsers();

        const foundUser = users.find(function (user) {
            return user.email === email && user.password === password;
        });

        if (!foundUser) {
            alert("Invalid email or password.");
            return;
        }

        saveCurrentUser(foundUser);
        alert("Login successful!");
        window.location.href = "feed.html";
    });
}