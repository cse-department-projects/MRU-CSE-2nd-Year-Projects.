/* =========================================
   FITZONE WORKOUT JAVASCRIPT
   Personalized Food & Healthy Habits
========================================= */


/* =========================================
   1. GLOBAL USER DATA
========================================= */

let loggedInUser = null;
let fitnessProfile = null;


/* =========================================
   2. PAGE LOAD
========================================= */

document.addEventListener("DOMContentLoaded", async function () {

    const storedUser =
        localStorage.getItem("loggedInUser");

    if (!storedUser) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }

    try {

        loggedInUser =
            JSON.parse(storedUser);

        console.log(
            "Logged-in user:",
            loggedInUser
        );


        /* Show user name */

        const userName =
            document.getElementById("userName");

        if (userName && loggedInUser.name) {

            userName.textContent =
                loggedInUser.name;
        }


        /* Load fitness profile */

        await loadFitnessProfile();


        /* Load previous workouts */

        await loadWorkouts();


    } catch (error) {

        console.error(
            "Page loading error:",
            error
        );

    }

});


/* =========================================
   3. LOAD FITNESS PROFILE
========================================= */

async function loadFitnessProfile() {

    try {

        const response =
            await fetch(
                `http://localhost:8080/api/fitness-profile/${loggedInUser.id}`
            );


        if (!response.ok) {

            throw new Error(
                "Fitness profile could not be loaded"
            );
        }


        fitnessProfile =
            await response.json();


        console.log(
            "Fitness profile:",
            fitnessProfile
        );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

    }

}


/* =========================================
   4. WORKOUT FORM
========================================= */

const workoutForm =
    document.getElementById("workoutForm");


if (workoutForm) {

    workoutForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* Check user */

            const storedUser =
                localStorage.getItem("loggedInUser");


            if (!storedUser) {

                alert("Please login first.");

                window.location.href =
                    "login.html";

                return;
            }


            loggedInUser =
                JSON.parse(storedUser);


            /* Get workout values */

            const workoutType =
                document.getElementById(
                    "workoutType"
                ).value;


            const duration =
                Number(
                    document.getElementById(
                        "duration"
                    ).value
                );


            const intensity =
                document.getElementById(
                    "intensity"
                ).value;


            const notes =
                document.getElementById(
                    "notes"
                ).value;


            /* Create workout object */

            const workoutData = {

                userId:
                    loggedInUser.id,

                workoutType:
                    workoutType,

                duration:
                    duration,

                intensity:
                    intensity,

                notes:
                    notes
            };


            console.log(
                "Workout data:",
                workoutData
            );


            const message =
                document.getElementById(
                    "message"
                );


            try {

                message.textContent =
                    "Saving workout...";

                message.style.color =
                    "#166534";


                /* Save workout */

                const response =
                    await fetch(
                        "http://localhost:8080/api/workouts/save",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    workoutData
                                )
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Workout could not be saved"
                    );
                }


                const savedWorkout =
                    await response.json();


                console.log(
                    "Saved workout:",
                    savedWorkout
                );


                message.textContent =
                    "Workout saved successfully! 💪";

                message.style.color =
                    "#166534";


                /* Clear form */

                workoutForm.reset();


                /* Reload workouts */

                await loadWorkouts();


                /* Generate recommendations */

                generateRecommendations(
                    savedWorkout
                );


            } catch (error) {

                console.error(
                    "Error saving workout:",
                    error
                );


                message.textContent =
                    "Unable to save workout. Please try again.";

                message.style.color =
                    "red";

            }

        }
    );

}


/* =========================================
   5. LOAD PREVIOUS WORKOUTS
========================================= */

async function loadWorkouts() {

    if (!loggedInUser) {
        return;
    }


    const workoutList =
        document.getElementById(
            "workoutList"
        );


    if (!workoutList) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:8080/api/workouts/user/${loggedInUser.id}`
            );


        if (!response.ok) {

            throw new Error(
                "Could not load workouts"
            );
        }


        const workouts =
            await response.json();


        workoutList.innerHTML = "";


        if (
            !workouts ||
            workouts.length === 0
        ) {

            workoutList.innerHTML =
                `<p class="empty">
                    No workouts recorded yet.
                </p>`;

            return;
        }


        workouts.forEach(
            function (workout) {

                const workoutItem =
                    document.createElement(
                        "div"
                    );


                workoutItem.className =
                    "workout-item";


                workoutItem.innerHTML = `

                    <i class="fa-solid fa-dumbbell"></i>

                    <div>

                        <h3>
                            ${workout.workoutType}
                        </h3>

                        <p>
                            ${workout.duration}
                            minutes
                            •
                            ${workout.intensity}
                        </p>

                        ${
                            workout.notes
                            ? `<p>${workout.notes}</p>`
                            : ""
                        }

                    </div>

                `;


                workoutList.appendChild(
                    workoutItem
                );

            }
        );


        /*
         * If there are previous workouts,
         * show recommendations based on
         * the most recent workout.
         */

        if (workouts.length > 0) {

            generateRecommendations(
                workouts[0]
            );

        }


    } catch (error) {

        console.error(
            "Error loading workouts:",
            error
        );

    }

}


/* =========================================
   6. PERSONALIZED RECOMMENDATIONS
========================================= */

function generateRecommendations(workout) {

    const recommendationList =
        document.getElementById(
            "recommendationList"
        );


    if (!recommendationList) {
        return;
    }


    const workoutType =
        workout.workoutType;


    const intensity =
        workout.intensity;


    const duration =
        Number(workout.duration);


    /* Get user's fitness goal */

    const goal =
        fitnessProfile &&
        fitnessProfile.goal
            ? fitnessProfile.goal
            : "";


    /* Get user's diet preference */

    const diet =
        fitnessProfile &&
        fitnessProfile.diet
            ? fitnessProfile.diet
            : "";


    /* Create recommendation list */

    let recommendations = [];


    /* =====================================
       WORKOUT-SPECIFIC FOOD
    ===================================== */

    if (
        workoutType ===
        "Strength Training"
    ) {

        recommendations.push({

            icon: "🥚",

            title:
                "Protein-Rich Food",

            text:
                "Include natural protein sources such as eggs, dal, paneer, curd, beans or sprouts in your meals."

        });


        recommendations.push({

            icon: "🥛",

            title:
                "Recovery Food",

            text:
                "Milk, curd, paneer or other protein-rich foods can be included as part of a balanced meal."

        });

    }


    else if (
        workoutType ===
        "Running" ||
        workoutType ===
        "Cycling"
    ) {

        recommendations.push({

            icon: "🍌",

            title:
                "Natural Energy",

            text:
                "Include fruits such as banana, apple or orange and balanced carbohydrate foods such as oats, rice or whole grains."

        });


        recommendations.push({

            icon: "🥗",

            title:
                "Balanced Meal",

            text:
                "After exercise, include a balanced meal containing vegetables, carbohydrates and a protein source."

        });

    }


    else if (
        workoutType ===
        "Walking"
    ) {

        recommendations.push({

            icon: "🍎",

            title:
                "Fresh Fruits",

            text:
                "Include fresh fruits and vegetables regularly as part of your daily meals."

        });


        recommendations.push({

            icon: "🌾",

            title:
                "Whole Foods",

            text:
                "Choose whole grains, dal, vegetables and other minimally processed foods."

        });

    }


    else if (
        workoutType ===
        "Yoga"
    ) {

        recommendations.push({

            icon: "🥗",

            title:
                "Light Balanced Meals",

            text:
                "Choose balanced meals with vegetables, fruits, whole grains and a suitable protein source."

        });


        recommendations.push({

            icon: "🥜",

            title:
                "Natural Snacks",

            text:
                "Nuts, seeds, fruit or curd can be simple nutritious snack options."

        });

    }


    else {

        recommendations.push({

            icon: "🥗",

            title:
                "Balanced Food",

            text:
                "Include vegetables, fruits, whole grains and a protein-rich food in your daily meals."

        });

    }


    /* =====================================
       INTENSITY
    ===================================== */

    if (
        intensity === "High"
    ) {

        recommendations.push({

            icon: "💧",

            title:
                "Hydration",

            text:
                "Drink water regularly before and after your workout, especially after a high-intensity session."

        });

    }


    else {

        recommendations.push({

            icon: "💧",

            title:
                "Stay Hydrated",

            text:
                "Keep drinking water regularly throughout the day."

        });

    }


    /* =====================================
       LONG WORKOUT
    ===================================== */

    if (
        duration >= 60
    ) {

        recommendations.push({

            icon: "🍌",

            title:
                "Post-Workout Meal",

            text:
                "Since your workout lasted an hour or more, have a balanced meal or snack afterward containing carbohydrates and protein."

        });

    }


    /* =====================================
       FITNESS GOAL
    ===================================== */

    if (
        goal.toLowerCase().includes(
            "weight"
        ) &&
        goal.toLowerCase().includes(
            "loss"
        )
    ) {

        recommendations.push({

            icon: "🥦",

            title:
                "Weight Management Habit",

            text:
                "Prioritize vegetables, fruits, whole grains and protein-rich foods while limiting sugary drinks and highly processed snacks."

        });

    }


    else if (
        goal.toLowerCase().includes(
            "muscle"
        ) ||
        goal.toLowerCase().includes(
            "gain"
        )
    ) {

        recommendations.push({

            icon: "🌱",

            title:
                "Muscle Support",

            text:
                "Include a protein source in your meals such as eggs, dal, beans, paneer, curd or sprouts."

        });

    }


    /* =====================================
       DIET PREFERENCE
    ===================================== */

    if (
        diet.toLowerCase().includes(
            "vegetarian"
        )
    ) {

        recommendations.push({

            icon: "🌱",

            title:
                "Vegetarian Protein",

            text:
                "Good options include dal, beans, chickpeas, sprouts, paneer, milk and curd."

        });

    }


    /* =====================================
       SLEEP
    ===================================== */

    if (
        fitnessProfile &&
        fitnessProfile.sleepHours &&
        Number(
            fitnessProfile.sleepHours
        ) < 7
    ) {

        recommendations.push({

            icon: "😴",

            title:
                "Recovery Habit",

            text:
                "Your recorded sleep is below 7 hours. Try to maintain a consistent sleep schedule and allow enough time for recovery."

        });

    }


    else {

        recommendations.push({

            icon: "😴",

            title:
                "Recovery",

            text:
                "Maintain a consistent sleep routine and give your body enough time to recover between demanding workouts."

        });

    }


    /* =====================================
       DISPLAY
    ===================================== */

    recommendationList.innerHTML = "";


    recommendations.forEach(
        function (item) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "recommendation-item";


            div.innerHTML = `

                <span>
                    ${item.icon}
                </span>

                <div>

                    <h3>
                        ${item.title}
                    </h3>

                    <p>
                        ${item.text}
                    </p>

                </div>

            `;


            recommendationList.appendChild(
                div
            );

        }
    );

}