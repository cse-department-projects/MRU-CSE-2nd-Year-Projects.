let loggedInUser = null;

let fitnessProfile = null;

let latestWorkout = null;


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const storedUser =
            localStorage.getItem(
                "loggedInUser"
            );


        if (!storedUser) {

            alert("Please login first.");

            window.location.href =
                "login.html";

            return;
        }


        loggedInUser =
            JSON.parse(storedUser);


        const userName =
            document.getElementById(
                "userName"
            );


        if (userName) {

            userName.textContent =
                loggedInUser.name;
        }


        await loadProfile();

        await loadLatestWorkout();

        generateFoodRecommendations();

    }
);


/* LOAD FITNESS PROFILE */

async function loadProfile() {

    try {

        const response =
            await fetch(
                `http://localhost:8080/api/fitness-profile/${loggedInUser.id}`
            );


        if (!response.ok) {

            throw new Error(
                "Profile could not be loaded"
            );
        }


        fitnessProfile =
            await response.json();


        displayProfile();


    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

    }

}


/* DISPLAY PROFILE */

function displayProfile() {

    if (!fitnessProfile) {
        return;
    }


    const goal =
        document.getElementById(
            "userGoal"
        );


    const diet =
        document.getElementById(
            "userDiet"
        );


    const activity =
        document.getElementById(
            "userActivity"
        );


    if (goal) {

        goal.textContent =
            fitnessProfile.goal ||
            "Not specified";
    }


    if (diet) {

        diet.textContent =
            fitnessProfile.diet ||
            "Not specified";
    }


    if (activity) {

        activity.textContent =
            fitnessProfile.activityLevel ||
            "Not specified";
    }

}


/* LOAD LATEST WORKOUT */

async function loadLatestWorkout() {

    try {

        const response =
            await fetch(
                `http://localhost:8080/api/workouts/user/${loggedInUser.id}`
            );


        if (!response.ok) {

            throw new Error(
                "Workout could not be loaded"
            );
        }


        const workouts =
            await response.json();


        if (
            workouts &&
            workouts.length > 0
        ) {

            latestWorkout =
                workouts[0];

            const workoutText =
                document.getElementById(
                    "latestWorkout"
                );


            if (workoutText) {

                workoutText.textContent =
                    latestWorkout.workoutType;
            }

        }

    } catch (error) {

        console.error(
            "Workout error:",
            error
        );

    }

}


/* GENERATE FOOD */

function generateFoodRecommendations() {

    const container =
        document.getElementById(
            "foodRecommendations"
        );


    if (!container) {
        return;
    }


    let recommendations = [];


    const goal =
        fitnessProfile &&
        fitnessProfile.goal
            ? fitnessProfile.goal.toLowerCase()
            : "";


    const diet =
        fitnessProfile &&
        fitnessProfile.diet
            ? fitnessProfile.diet.toLowerCase()
            : "";


    const activity =
        fitnessProfile &&
        fitnessProfile.activityLevel
            ? fitnessProfile.activityLevel.toLowerCase()
            : "";


    /* GOAL BASED */

    if (
        goal.includes("muscle") ||
        goal.includes("gain")
    ) {

        recommendations.push({

            icon: "🥚",

            title:
                "Protein-Rich Breakfast",

            text:
                "Try eggs, milk, curd, oats or sprouts as part of a balanced breakfast.",

            tag:
                "Muscle Support"

        });


        recommendations.push({

            icon: "🫘",

            title:
                "Dal, Beans & Sprouts",

            text:
                "Include dal, chickpeas, beans or sprouts with your regular meals.",

            tag:
                "Natural Protein"

        });


        recommendations.push({

            icon: "🧀",

            title:
                "Paneer or Curd",

            text:
                "Paneer or curd can be included as convenient protein-rich food options.",

            tag:
                "Recovery"

        });

    }

    else if (
        goal.includes("weight") &&
        goal.includes("loss")
    ) {

        recommendations.push({

            icon: "🥦",

            title:
                "Vegetable-Rich Meals",

            text:
                "Include plenty of vegetables along with a suitable protein source and whole-food carbohydrates.",

            tag:
                "Balanced Meal"

        });


        recommendations.push({

            icon: "🍎",

            title:
                "Fresh Fruits",

            text:
                "Choose whole fruits such as apples, oranges, guava or other seasonal fruits.",

            tag:
                "Natural Snack"

        });


        recommendations.push({

            icon: "🌾",

            title:
                "Whole Grains",

            text:
                "Choose foods such as oats, brown rice or other whole grains as part of balanced meals.",

            tag:
                "Whole Food"

        });

    }

    else {

        recommendations.push({

            icon: "🥗",

            title:
                "Balanced Plate",

            text:
                "Build meals around vegetables, fruits, whole grains and a suitable protein source.",

            tag:
                "Healthy Choice"

        });


        recommendations.push({

            icon: "🍎",

            title:
                "Fresh Fruits",

            text:
                "Include a variety of whole fruits as part of your daily food choices.",

            tag:
                "Natural Food"

        });


        recommendations.push({

            icon: "🥜",

            title:
                "Healthy Snack",

            text:
                "Nuts, seeds, fruit or curd can be simple nutritious snack choices.",

            tag:
                "Smart Snack"

        });

    }


    /* DIET */

    if (
        diet.includes("vegetarian")
    ) {

        recommendations.push({

            icon: "🌱",

            title:
                "Vegetarian Protein",

            text:
                "Dal, beans, chickpeas, sprouts, paneer, milk and curd are useful vegetarian protein sources.",

            tag:
                "Vegetarian"

        });

    }

    else if (
        diet.includes("non")
    ) {

        recommendations.push({

            icon: "🍗",

            title:
                "Lean Protein",

            text:
                "Eggs, fish or lean meat can be included according to your dietary preference and balanced meal plan.",

            tag:
                "Protein"

        });

    }


    /* WORKOUT BASED */

    if (latestWorkout) {

        const type =
            latestWorkout.workoutType
                ? latestWorkout.workoutType.toLowerCase()
                : "";


        if (
            type.includes("running") ||
            type.includes("cycling") ||
            type.includes("walking")
        ) {

            recommendations.push({

                icon: "🍌",

                title:
                    "Workout Energy Foods",

                text:
                    "Banana, oats, whole grains and other carbohydrate-rich whole foods can complement endurance activities.",

                tag:
                    "Workout Support"

            });

        }


        if (
            type.includes("strength")
        ) {

            recommendations.push({

                icon: "🥛",

                title:
                    "Post-Workout Protein",

                text:
                    "Include a protein source such as eggs, dal, paneer, curd or beans in a balanced post-workout meal.",

                tag:
                    "Post Workout"

            });

        }

    }


    /* ACTIVITY */

    if (
        activity.includes("high")
    ) {

        recommendations.push({

            icon: "💧",

            title:
                "Hydration",

            text:
                "Keep water available and drink regularly throughout the day, especially around exercise.",

            tag:
                "Hydration"

        });

    }


    /* DISPLAY */

    container.innerHTML = "";


    recommendations.forEach(
        function (item) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "food-card";


            card.innerHTML = `

                <div class="food-card-icon">
                    ${item.icon}
                </div>

                <h3>
                    ${item.title}
                </h3>

                <p>
                    ${item.text}
                </p>

                <span class="food-tag">
                    ${item.tag}
                </span>

            `;


            container.appendChild(
                card
            );

        }
    );


    updatePersonalizedMessage();

}


/* PERSONALIZED MESSAGE */

function updatePersonalizedMessage() {

    const message =
        document.getElementById(
            "personalizedMessage"
        );


    if (!message) {
        return;
    }


    const goal =
        fitnessProfile &&
        fitnessProfile.goal
            ? fitnessProfile.goal
            : "your fitness goal";


    const diet =
        fitnessProfile &&
        fitnessProfile.diet
            ? fitnessProfile.diet
            : "your diet preference";


    if (latestWorkout) {

        message.textContent =
            `Based on your goal of ${goal}, ${diet} preference, and your latest ${latestWorkout.workoutType} workout, FitZone has prepared these natural food suggestions for you.`;

    }

    else {

        message.textContent =
            `Based on your goal of ${goal} and ${diet} preference, FitZone has prepared these natural food suggestions for you.`;

    }

}