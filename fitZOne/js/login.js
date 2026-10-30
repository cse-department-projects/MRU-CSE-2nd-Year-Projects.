document.getElementById("loginForm").addEventListener("submit", async function (event) {

    event.preventDefault();

    const message = document.getElementById("message");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;


    // Clear previous message
    message.innerText = "";


    const loginData = {
        email: email,
        password: password
    };


    try {

        const response = await fetch(
            "http://localhost:8080/api/users/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(loginData)
            }
        );


        const result = await response.text();


        // LOGIN SUCCESS
        if (response.ok) {

            message.innerText = "Login successful!";
            message.style.color = "green";
            message.style.fontWeight = "600";


            // Save logged-in user information
            localStorage.setItem("loggedInUser", result);


            // Go to dashboard after 1 second
            setTimeout(function () {

               window.location.href = "profile-setup.html";

            }, 1000);

        }


        // LOGIN FAILED
        else {

            message.innerText = "Invalid email or password.";
            message.style.color = "red";
            message.style.fontWeight = "600";

        }


    } catch (error) {

        console.error("Login error:", error);

        message.innerText =
            "Unable to connect to server. Please make sure FitZone backend is running.";

        message.style.color = "red";
        message.style.fontWeight = "600";

    }

});