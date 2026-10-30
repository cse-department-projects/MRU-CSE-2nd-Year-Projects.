document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("profileForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        // -----------------------------------------
        // GET LOGGED-IN USER
        // -----------------------------------------

        const storedUser = localStorage.getItem("loggedInUser");

        if (!storedUser) {
            alert("Please login first.");
            window.location.href = "login.html";
            return;
        }

        const loggedInUser = JSON.parse(storedUser);


        // -----------------------------------------
        // GET PROFILE VALUES
        // -----------------------------------------

        const height = Number(
            document.getElementById("height").value
        );

        const weight = Number(
            document.getElementById("weight").value
        );

        const goal =
            document.getElementById("fitnessGoal").value;

        const activityLevel =
            document.getElementById("activityLevel").value;

        const diet =
            document.getElementById("dietPreference").value;

        const sleepHours = Number(
            document.getElementById("sleepHours").value
        );


        // -----------------------------------------
        // CHECK VALUES
        // -----------------------------------------

        if (
            !height ||
            !weight ||
            !goal ||
            !activityLevel ||
            !diet ||
            !sleepHours
        ) {
            message.textContent =
                "Please fill all the fields.";

            message.style.color = "red";
            return;
        }


        // -----------------------------------------
        // PROFILE DATA FOR SPRING BOOT
        // -----------------------------------------

        const profileData = {

            userId: loggedInUser.id,

            height: height,

            weight: weight,

            goal: goal,

            activityLevel: activityLevel,

            diet: diet,

            sleepHours: sleepHours
        };


        console.log("Profile data:", profileData);


        try {

            message.textContent =
                "Creating your personalized plan...";

            message.style.color = "#166534";


            // -----------------------------------------
            // SAVE PROFILE TO SPRING BOOT
            // -----------------------------------------

            const response = await fetch(
                "http://localhost:8080/api/fitness-profile/save",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(profileData)
                }
            );


            if (!response.ok) {
                throw new Error(
                    "Profile could not be saved"
                );
            }


            const savedProfile =
                await response.json();

            console.log(
                "Saved profile:",
                savedProfile
            );


            // -----------------------------------------
            // CALCULATE BMI
            // -----------------------------------------

            const heightInMeters =
                height / 100;

            const bmi =
                weight /
                (heightInMeters * heightInMeters);


            // -----------------------------------------
            // GET AGE AND GENDER
            // -----------------------------------------

            const age =
                Number(loggedInUser.age);

            const gender =
                loggedInUser.gender;


            // -----------------------------------------
            // CALCULATE BMR
            // -----------------------------------------

            let bmr;

            if (
                gender &&
                gender.toLowerCase() === "female"
            ) {

                bmr =
                    (10 * weight) +
                    (6.25 * height) -
                    (5 * age) -
                    161;

            } else {

                bmr =
                    (10 * weight) +
                    (6.25 * height) -
                    (5 * age) +
                    5;
            }


            // -----------------------------------------
            // ACTIVITY MULTIPLIER
            // -----------------------------------------

            let activityMultiplier = 1.2;


            if (activityLevel === "Light") {

                activityMultiplier = 1.375;

            } else if (activityLevel === "Moderate") {

                activityMultiplier = 1.55;

            } else if (activityLevel === "Active") {

                activityMultiplier = 1.725;
            }


            // -----------------------------------------
            // DAILY CALORIES
            // -----------------------------------------

            let calories =
                bmr * activityMultiplier;


            if (goal === "Weight Loss") {

                calories =
                    calories - 300;

            } else if (goal === "Muscle Gain") {

                calories =
                    calories + 300;
            }


            calories =
                Math.max(
                    1200,
                    Math.round(calories)
                );


            // -----------------------------------------
            // PROTEIN REQUIREMENT
            // -----------------------------------------

            let proteinPerKg = 1.2;


            if (goal === "Muscle Gain") {

                proteinPerKg = 1.6;

            } else if (goal === "Weight Loss") {

                proteinPerKg = 1.4;

            } else if (goal === "Improve Fitness") {

                proteinPerKg = 1.3;
            }


            const protein =
                Math.round(
                    weight * proteinPerKg
                );


            // -----------------------------------------
            // WATER REQUIREMENT
            // -----------------------------------------

            let water =
                Math.round(
                    (weight * 35) / 100
                ) / 10;


            if (activityLevel === "Active") {

                water += 0.5;

            } else if (activityLevel === "Moderate") {

                water += 0.3;
            }


            // -----------------------------------------
            // PERSONALIZED DATA
            // -----------------------------------------

            const personalizedData = {

                userId: loggedInUser.id,

                age: age,

                gender: gender,

                height: height,

                weight: weight,

                bmi:
                    Number(
                        bmi.toFixed(1)
                    ),

                goal: goal,

                activityLevel:
                    activityLevel,

                diet: diet,

                sleepHours:
                    sleepHours,

                calories:
                    calories,

                protein:
                    protein,

                water:
                    Number(
                        water.toFixed(1)
                    )
            };


            console.log(
                "Personalized data:",
                personalizedData
            );


            // -----------------------------------------
            // STORE FITNESS PROFILE
            // -----------------------------------------

            localStorage.setItem(
                "fitnessProfile",
                JSON.stringify(
                    personalizedData
                )
            );


            // -----------------------------------------
            // SUCCESS MESSAGE
            // -----------------------------------------

            message.textContent =
                "Your personalized plan is ready! 🌿";

            message.style.color =
                "#166534";


            // -----------------------------------------
            // REDIRECT TO DASHBOARD
            // -----------------------------------------

            setTimeout(function () {

                window.location.href =
                    "dashboard.html";

            }, 800);


        } catch (error) {

            console.error(
                "Profile Error:",
                error
            );


            message.textContent =
                "Unable to create your plan. Please try again.";

            message.style.color =
                "red";
        }

    });

});