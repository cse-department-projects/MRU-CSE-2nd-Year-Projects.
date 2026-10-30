document.getElementById("signupForm").addEventListener("submit", async function (event) {

    event.preventDefault();

    const message = document.getElementById("message");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;


    // Check passwords
    if (password !== confirmPassword) {

        message.innerText = "Passwords do not match.";
        message.style.color = "red";
        message.style.fontWeight = "600";

        return;
    }


    // User data
    const userData = {
        name: name,
        email: email,
        phone: phone,
        age: Number(age),
        gender: gender,
        password: password
    };


    try {

        const response = await fetch(
            "http://localhost:8080/api/users/signup",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(userData)
            }
        );


        const result = await response.text();


        // Account successfully created
        if (response.ok) {

            message.innerText =
                "Account created successfully! Redirecting to login...";

            message.style.color = "green";
            message.style.fontWeight = "600";


            // Clear form
            document.getElementById("signupForm").reset();


            // Go to login page after 1.5 seconds
            setTimeout(function () {

                window.location.href = "login.html";

            }, 1500);


        } else {

            // Backend error
            message.innerText = result;
            message.style.color = "red";
            message.style.fontWeight = "600";

        }


    } catch (error) {

        console.error("Signup error:", error);

        message.innerText =
            "Unable to connect to server. Please make sure FitZone backend is running.";

        message.style.color = "red";
        message.style.fontWeight = "600";

    }

});