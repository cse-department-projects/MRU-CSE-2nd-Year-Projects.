/* =========================================
   FITZONE DASHBOARD JAVASCRIPT
========================================= */
/* =========================================
   LOAD USER PROFILE FROM DATABASE
========================================= */

document.addEventListener("DOMContentLoaded", async function () {

    const storedUser = localStorage.getItem("loggedInUser");

    if (!storedUser) {
        console.log("No logged-in user found.");
        window.location.href = "login.html";
        return;
    }

    try {

        const user = JSON.parse(storedUser);

        console.log("Logged-in user:", user);

        const response = await fetch(
            `http://localhost:8080/api/fitness-profile/${user.id}`
        );

        if (!response.ok) {
            throw new Error("Could not load fitness profile");
        }

        const profile = await response.json();

        console.log("Fitness profile:", profile);


        /* USER NAME */

        const userName =
            document.getElementById("userName");

        if (userName) {
            userName.textContent =
                user.name;
        }


        /* WEIGHT */

        const userWeight =
            document.getElementById("userWeight");

        if (userWeight) {
            userWeight.textContent =
                profile.weight + " kg";
        }


        /* GOAL */

        const userGoal =
            document.getElementById("userGoal");

        if (userGoal) {
            userGoal.textContent =
                profile.goal;
        }


        /* ACTIVITY */

        const userActivity =
            document.getElementById("userActivity");

        if (userActivity) {
            userActivity.textContent =
                profile.activityLevel;
        }


        /* SLEEP */

        const userSleep =
            document.getElementById("userSleep");

        if (userSleep) {
            userSleep.textContent =
                profile.sleepHours + " hrs";
        }


        /* HEIGHT */

        const userHeight =
            document.getElementById("userHeight");

        if (userHeight) {
            userHeight.textContent =
                profile.height + " cm";
        }


        /* BMI */

        const bmi =
            calculateBMI(
                profile.weight,
                profile.height
            );

        if (bmi) {

            const bmiNumber =
                document.querySelector(".bmi-number");

            if (bmiNumber) {
                bmiNumber.textContent = bmi;
            }

            const bmiText =
                document.querySelector(".bmi-card p");

            if (bmiText) {
                bmiText.textContent =
                    getBMICategory(
                        parseFloat(bmi)
                    );
            }
        }


    } catch (error) {

        console.error(
            "Error loading profile:",
            error
        );

    }

});

/* =========================================
   0. DISPLAY LOGGED-IN USER NAME
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const userNameElement =
        document.getElementById("userName");

    const loggedInUser =
        localStorage.getItem("loggedInUser");


    // If no user is logged in
    if (!loggedInUser) {

        console.log("No logged-in user found.");

        if (userNameElement) {
            userNameElement.textContent = "User";
        }

        return;
    }


    try {

        const user =
            JSON.parse(loggedInUser);

        console.log("Logged-in user:", user);


        if (userNameElement && user.name) {

            userNameElement.textContent =
                user.name;

        } else {

            userNameElement.textContent =
                "User";

        }


    } catch (error) {

        console.error(
            "Error reading logged-in user:",
            error
        );

        if (userNameElement) {
            userNameElement.textContent = "User";
        }

    }

});


/* =========================================
   1. SEARCH FUNCTION
========================================= */

const searchInput =
    document.querySelector(".search");

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const searchValue =
                this.value
                    .toLowerCase()
                    .trim();

            const cards =
                document.querySelectorAll(
                    ".card, .overview-card, .badge, .item"
                );


            cards.forEach(function (card) {

                const text =
                    card.textContent
                        .toLowerCase();

                if (
                    text.includes(searchValue)
                ) {

                    card.style.display = "";

                } else {

                    card.style.display =
                        "none";

                }

            });

        }
    );

}


/* =========================================
   2. ANIMATE PROGRESS BARS
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const progressBars =
            document.querySelectorAll(
                ".overview-card progress"
            );


        progressBars.forEach(
            function (bar) {

                const finalValue =
                    bar.value;

                bar.value = 0;


                setTimeout(
                    function () {

                        animateProgress(
                            bar,
                            finalValue
                        );

                    },
                    300
                );

            }
        );

    }
);


function animateProgress(
    element,
    targetValue
) {

    let currentValue = 0;

    const increment =
        targetValue / 40;


    const animation =
        setInterval(
            function () {

                currentValue +=
                    increment;


                if (
                    currentValue >=
                    targetValue
                ) {

                    currentValue =
                        targetValue;

                    clearInterval(
                        animation
                    );

                }


                element.value =
                    currentValue;

            },
            20
        );

}


/* =========================================
   3. WEEKLY CHART ANIMATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const bars =
            document.querySelectorAll(
                ".fill"
            );


        bars.forEach(
            function (bar, index) {

                const finalHeight =
                    bar.style.height;

                bar.style.height =
                    "0%";


                setTimeout(
                    function () {

                        bar.style.height =
                            finalHeight;

                    },
                    200 + (index * 100)
                );

            }
        );

    }
);


/* =========================================
   4. BMI CALCULATOR
========================================= */

function calculateBMI(
    weight,
    height
) {

    if (
        weight <= 0 ||
        height <= 0
    ) {

        return null;

    }


    const heightInMeters =
        height / 100;


    const bmi =
        weight /
        (
            heightInMeters *
            heightInMeters
        );


    return bmi.toFixed(1);

}


/* =========================================
   5. BMI CATEGORY
========================================= */

function getBMICategory(bmi) {

    if (bmi < 18.5) {

        return "Underweight";

    } else if (bmi < 25) {

        return "Normal Weight";

    } else if (bmi < 30) {

        return "Overweight";

    } else {

        return "Obesity";

    }

}


/* =========================================
   6. UPDATE BMI
========================================= */

function updateBMI(
    weight,
    height
) {

    const bmi =
        calculateBMI(
            weight,
            height
        );


    if (bmi === null) {

        return;

    }


    const category =
        getBMICategory(
            parseFloat(bmi)
        );


    const bmiNumber =
        document.querySelector(
            ".bmi-number"
        );


    const bmiText =
        document.querySelector(
            ".bmi-card p"
        );


    const bmiProgress =
        document.querySelector(
            ".bmi-card progress"
        );


    if (bmiNumber) {

        bmiNumber.textContent =
            bmi;

    }


    if (bmiText) {

        bmiText.textContent =
            category;

    }


    if (bmiProgress) {

        bmiProgress.value =
            parseFloat(bmi);

    }

}


/* =========================================
   7. QUICK ACCESS CARD CLICK
========================================= */

const quickCards =
    document.querySelectorAll(
        ".card"
    );


quickCards.forEach(
    function (card) {

        card.addEventListener(
            "mouseenter",
            function () {

                this.style.cursor =
                    "pointer";

            }
        );

    }
);


/* =========================================
   8. ACHIEVEMENT MESSAGE
========================================= */

const badges =
    document.querySelectorAll(
        ".badge"
    );


badges.forEach(
    function (badge) {

        badge.addEventListener(
            "click",
            function () {

                const title =
                    this.querySelector("h3");


                if (title) {

                    alert(
                        "Achievement unlocked: " +
                        title.textContent
                    );

                }

            }
        );

    }
);


/* =========================================
   9. TODAY'S GOAL CHECKBOX EFFECT
========================================= */

const goalItems =
    document.querySelectorAll(
        ".goal-card li"
    );


goalItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function () {

                if (
                    this.textContent
                        .includes("✔")
                ) {

                    this.textContent =
                        this.textContent.replace(
                            "✔",
                            "⬜"
                        );


                    this.style.textDecoration =
                        "none";


                    this.style.color =
                        "";

                } else {

                    this.textContent =
                        this.textContent.replace(
                            "⬜",
                            "✔"
                        );


                    this.style.textDecoration =
                        "line-through";


                    this.style.color =
                        "#16a34a";

                }

            }
        );

    }
);


/* =========================================
   10. DISPLAY CURRENT DATE
========================================= */

function getTodayDate() {

    const today =
        new Date();


    return today.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


/* =========================================
   11. DASHBOARD LOADED MESSAGE
========================================= */

console.log(
    "FitZOne Dashboard loaded successfully."
);