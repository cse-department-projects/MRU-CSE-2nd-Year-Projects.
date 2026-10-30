let loggedInUser = null;

let selectedGlasses = 0;

const dailyGoal = 8;


document.addEventListener(
    "DOMContentLoaded",
    async function () {

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


        // Show user name

        const userName =
            document.getElementById("userName");

        if (userName) {

            userName.textContent =
                loggedInUser.name;
        }


        setupGlassButtons();

        await loadWaterRecords();

    }
);


/* GLASS BUTTONS */

function setupGlassButtons() {

    const glasses =
        document.querySelectorAll(".glass");


    glasses.forEach(function (glass) {

        glass.addEventListener(
            "click",
            function () {

                selectedGlasses =
                    Number(
                        glass.dataset.glass
                    );

                updateGlassSelection();

                updateProgress();

            }
        );

    });
}


/* SELECT GLASSES */

function updateGlassSelection() {

    const glasses =
        document.querySelectorAll(".glass");


    glasses.forEach(function (glass) {

        const number =
            Number(
                glass.dataset.glass
            );

        if (number <= selectedGlasses) {

            glass.classList.add(
                "selected"
            );

        } else {

            glass.classList.remove(
                "selected"
            );
        }

    });
}


/* PROGRESS */

function updateProgress() {

    const progress =
        document.getElementById(
            "waterProgress"
        );

    const text =
        document.getElementById(
            "progressText"
        );


    let percentage =
        (selectedGlasses / dailyGoal) * 100;


    if (percentage > 100) {

        percentage = 100;
    }


    progress.style.width =
        percentage + "%";


    text.textContent =
        selectedGlasses +
        " / " +
        dailyGoal +
        " glasses";


    if (selectedGlasses >= dailyGoal) {

        text.textContent =
            "Daily water goal completed! 🎉";

    }

}


/* SAVE WATER */

const saveButton =
    document.getElementById(
        "saveWater"
    );


if (saveButton) {

    saveButton.addEventListener(
        "click",
        async function () {

            if (selectedGlasses === 0) {

                showMessage(
                    "Please select your water intake.",
                    "red"
                );

                return;
            }


            const waterData = {

                userId:
                    loggedInUser.id,

                glasses:
                    selectedGlasses

            };


            try {

                showMessage(
                    "Saving water intake...",
                    "#166534"
                );


                const response =
                    await fetch(
                        "http://localhost:8080/api/water/save",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    waterData
                                )
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Water could not be saved"
                    );
                }


                const savedWater =
                    await response.json();


                console.log(
                    "Saved water:",
                    savedWater
                );


                showMessage(
                    "Water intake saved successfully! 💧",
                    "#166534"
                );


                await loadWaterRecords();


            } catch (error) {

                console.error(
                    "Water error:",
                    error
                );


                showMessage(
                    "Unable to save water intake.",
                    "red"
                );

            }

        }
    );
}


/* LOAD RECORDS */

async function loadWaterRecords() {

    const waterList =
        document.getElementById(
            "waterList"
        );


    if (!waterList) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:8080/api/water/user/${loggedInUser.id}`
            );


        if (!response.ok) {

            throw new Error(
                "Could not load water records"
            );
        }


        const records =
            await response.json();


        waterList.innerHTML = "";


        if (
            !records ||
            records.length === 0
        ) {

            waterList.innerHTML =
                `<p class="empty">
                    No water records yet.
                </p>`;

            return;
        }


        // Show latest record

        const latest =
            records[0];


        selectedGlasses =
            latest.glasses;


        updateGlassSelection();

        updateProgress();


        // Show records

        records.forEach(
            function (record) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "water-record";


                const date =
                    record.createdAt
                        ? new Date(
                            record.createdAt
                        ).toLocaleString()
                        : "Recently";


                item.innerHTML = `

                    <i class="fa-solid fa-droplet"></i>

                    <div>

                        <h3>
                            ${record.glasses}
                            glasses 💧
                        </h3>

                        <p>
                            ${date}
                        </p>

                    </div>

                `;


                waterList.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading water records:",
            error
        );

    }

}


/* MESSAGE */

function showMessage(
    message,
    color
) {

    const messageElement =
        document.getElementById(
            "message"
        );


    if (!messageElement) {
        return;
    }


    messageElement.textContent =
        message;


    messageElement.style.color =
        color;
}