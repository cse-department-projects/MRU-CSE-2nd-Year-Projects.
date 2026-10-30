let loggedInUser = null;

let workouts = [];
let waterRecords = [];


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


        // User name

        const userName =
            document.getElementById(
                "userName"
            );


        if (userName) {

            userName.textContent =
                loggedInUser.name;
        }


        await loadProgress();

    }
);


/* LOAD PROGRESS */

async function loadProgress() {

    try {

        const workoutResponse =
            await fetch(
                `http://localhost:8080/api/progress/workouts/${loggedInUser.id}`
            );


        const waterResponse =
            await fetch(
                `http://localhost:8080/api/progress/water/${loggedInUser.id}`
            );


        if (
            !workoutResponse.ok ||
            !waterResponse.ok
        ) {

            throw new Error(
                "Could not load progress"
            );
        }


        workouts =
            await workoutResponse.json();


        waterRecords =
            await waterResponse.json();


        calculateSummary();

        displayWorkoutProgress();

        displayWaterProgress();

        updateMotivation();


    } catch (error) {

        console.error(
            "Progress error:",
            error
        );

    }
}


/* SUMMARY */

function calculateSummary() {

    let totalCalories = 0;

    let totalDuration = 0;

    let totalWater = 0;


    workouts.forEach(
        function (workout) {

            totalCalories +=
                Number(
                    workout.calories
                );

            totalDuration +=
                Number(
                    workout.duration
                );

        }
    );


    waterRecords.forEach(
        function (record) {

            totalWater +=
                Number(
                    record.glasses
                );

        }
    );


    document.getElementById(
        "totalWorkouts"
    ).textContent =
        workouts.length;


    document.getElementById(
        "totalCalories"
    ).textContent =
        totalCalories;


    document.getElementById(
        "totalDuration"
    ).textContent =
        totalDuration;


    document.getElementById(
        "totalWater"
    ).textContent =
        totalWater;

}


/* WORKOUT PROGRESS */

function displayWorkoutProgress() {

    const container =
        document.getElementById(
            "workoutProgress"
        );


    container.innerHTML = "";


    if (
        !workouts ||
        workouts.length === 0
    ) {

        container.innerHTML =
            `<p class="empty">
                No workouts recorded yet.
            </p>`;

        return;
    }


    workouts
        .slice(0, 10)
        .forEach(
            function (workout) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "progress-item";


                item.innerHTML = `

                    <div class="progress-item-icon">
                        💪
                    </div>

                    <div class="progress-item-info">

                        <h3>
                            ${workout.workoutType}
                        </h3>

                        <p>
                            ${workout.duration}
                            minutes
                            •
                            ${workout.intensity}
                            intensity
                        </p>

                    </div>

                    <div class="progress-item-value">

                        🔥
                        ${workout.calories}
                        kcal

                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );

}


/* WATER PROGRESS */

function displayWaterProgress() {

    const container =
        document.getElementById(
            "waterProgress"
        );


    container.innerHTML = "";


    if (
        !waterRecords ||
        waterRecords.length === 0
    ) {

        container.innerHTML =
            `<p class="empty">
                No water records recorded yet.
            </p>`;

        return;
    }


    waterRecords
        .slice(0, 10)
        .forEach(
            function (record) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "progress-item";


                const date =
                    record.createdAt
                        ? new Date(
                            record.createdAt
                        ).toLocaleString()
                        : "Recently";


                item.innerHTML = `

                    <div class="progress-item-icon">
                        💧
                    </div>

                    <div class="progress-item-info">

                        <h3>
                            Water Intake
                        </h3>

                        <p>
                            ${date}
                        </p>

                    </div>

                    <div class="progress-item-value">

                        ${record.glasses}
                        glasses

                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );

}


/* MOTIVATION */

function updateMotivation() {

    const text =
        document.getElementById(
            "motivationText"
        );


    if (!text) {
        return;
    }


    if (workouts.length === 0) {

        text.textContent =
            "Start recording your workouts to see your progress here.";

    }

    else if (workouts.length < 3) {

        text.textContent =
            "Great start! Keep recording your workouts and healthy habits.";

    }

    else if (workouts.length < 7) {

        text.textContent =
            "You're building a healthy routine. Keep going! 💪";

    }

    else {

        text.textContent =
            "Amazing consistency! Keep taking care of yourself every day. 🌱";

    }

}