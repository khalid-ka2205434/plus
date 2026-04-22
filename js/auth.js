const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("signupPassword");
const passwordStrengthEl = document.getElementById("passwordStrength");

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

// Password Strength 
function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak – add uppercase, numbers & symbols", cls: "strength-weak" };
    if (score <= 2) return { label: "Medium – add more variety", cls: "strength-medium" };
    if (score === 3) return { label: "Good", cls: "strength-good" };
    return { label: "Strong", cls: "strength-strong" };
}

if (passwordInput && passwordStrengthEl) {
    passwordInput.addEventListener("input", function () {
        const val = passwordInput.value;
        if (!val) {
            passwordStrengthEl.textContent = "";
            passwordStrengthEl.className = "password-strength";
            return;
        }
        const result = getPasswordStrength(val);
        passwordStrengthEl.textContent = "Strength: " + result.label;
        passwordStrengthEl.className = "password-strength " + result.cls;
    });
}

//  Sign Up
if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("signupUsername").value.trim();
        const email    = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value.trim();
        const bio      = document.getElementById("signupBio").value.trim();

        const selectedAvatarInput = document.querySelector('input[name="profilePicture"]:checked');
        const selectedAvatar = selectedAvatarInput
            ? selectedAvatarInput.value
            : "assets/images/default-avatar.png";

        const users = getUsers();

        if (users.find(u => u.email === email)) {
            alert("This email is already registered.");
            return;
        }

        if (users.find(u => u.username === username)) {
            alert("This username is already taken.");
            return;
        }

        const strength = getPasswordStrength(password);
        if (strength.cls === "strength-weak") {
            if (!confirm("Your password is weak. It's recommended to use at least 8 characters, an uppercase letter, a number, and a symbol.\n\nContinue anyway?")) {
                return;
            }
        }

        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            bio,
            profilePicture: selectedAvatar,
            following: []
        };

        users.push(newUser);
        saveUsers(users);

        alert("Account created successfully!");
        window.location.href = "login.html";
    });
}

// Login
if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email    = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();
        const users    = getUsers();

        const foundUser = users.find(u => u.email === email && u.password === password);

        if (!foundUser) {
            alert("Invalid email or password.");
            return;
        }

        saveCurrentUser(foundUser);
        alert("Login successful!");
        window.location.href = "feed.html";
    });
}