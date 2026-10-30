let loggedInUser = null;

let fitnessProfile = null;


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


        displayUser();


        await loadFitnessProfile();

    }
);


/* DISPLAY USER */

function displayUser() {

    const name =
        loggedInUser.name || "User";

    const email =
        loggedInUser.email || "-";

    const phone =
        loggedInUser.phone || "-";

    const age =
        loggedInUser.age || "-";

    const gender =
        loggedInUser.gender || "-";


    document.getElementById(
        "userName"
    ).textContent = name;


    document.getElementById(
        "profileName"
    ).textContent = name;


    document.getElementById(
        "profileEmail"
    ).textContent = email;


    document.getElementById(
        "infoName"
    ).textContent = name;


    document.getElementById(
        "infoEmail"
    ).textContent = email;


    document.getElementById(
        "infoPhone"
    ).textContent = phone;


    document.getElementById(
        "infoAge"
    ).textContent =
        age;


    document.getElementById(
        "infoGender"
    ).textContent =
        gender;

}


/* LOAD PROFILE */

async function loadFitnessProfile() {

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


        fillForm();

        calculateBMI();


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

    }

}


/* FILL FORM */

function fillForm() {

    if (!fitnessProfile) {
        return;
    }


    document.getElementById(
        "height"
    ).value =
        fitnessProfile.height || "";


    document.getElementById(
        "weight"
    ).value =
        fitnessProfile.weight || "";


    document.getElementById(
        "fitnessGoal"
    ).value =
        fitnessProfile.goal || "";


    document.getElementById(
        "activityLevel"
    ).value =
        fitnessProfile.activityLevel || "";


    document.getElementById(
        "dietPreference"
    ).value =
        fitnessProfile.diet || "";


    document.getElementById(
        "sleepHours"
    ).value =
        fitnessProfile.sleepHours || "";

}


/* SAVE PROFILE */

const profileForm =
    document.getElementById(
        "profileForm"
    );


if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const height =
                Number(
                    document.getElementById(
                        "height"
                    ).value
                );


            const weight =
                Number(
                    document.getElementById(
                        "weight"
                    ).value
                );


            const goal =
                document.getElementById(
                    "fitnessGoal"
                ).value;


            const activityLevel =
                document.getElementById(
                    "activityLevel"
                ).value;


            const diet =
                document.getElementById(
                    "dietPreference"
                ).value;


            const sleepHours =
                Number(
                    document.getElementById(
                        "sleepHours"
                    ).value
                );


            const profileData = {

                userId:
                    loggedInUser.id,

                height:
                    height,

                weight:
                    weight,

                goal:
                    goal,

                activityLevel:
                    activityLevel,

                diet:
                    diet,

                sleepHours:
                    sleepHours

            };


            const message =
                document.getElementById(
                    "message"
                );


            try {

                message.textContent =
                    "Saving changes...";

                message.style.color =
                    "#166534";


                const response =
                    await fetch(
                        "http://localhost:8080/api/fitness-profile/save",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    profileData
                                )
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Profile could not be saved"
                    );
                }


                fitnessProfile =
                    await response.json();


                message.textContent =
                    "Profile updated successfully! 🌿";

                message.style.color =
                    "#166534";


                calculateBMI();


            } catch (error) {

                console.error(
                    "Save profile error:",
                    error
                );


                message.textContent =
                    "Unable to update profile.";

                message.style.color =
                    "red";

            }

        }
    );

}


/* BMI */

function calculateBMI() {

    if (!fitnessProfile) {
        return;
    }


    const weight =
        Number(
            fitnessProfile.weight
        );


    const height =
        Number(
            fitnessProfile.height
        );


    if (
        weight <= 0 ||
        height <= 0
    ) {

        return;
    }


    const heightMeters =
        height / 100;


    const bmi =
        weight /
        (heightMeters * heightMeters);


    const roundedBMI =
        bmi.toFixed(1);


    document.getElementById(
        "bmiValue"
    ).textContent =
        roundedBMI;


    let category = "";


    if (bmi < 18.5) {

        category =
            "Below the usual healthy BMI range.";

    }

    else if (bmi < 25) {

        category =
            "Within the usual healthy BMI range.";

    }

    else if (bmi < 30) {

        category =
            "Above the usual healthy BMI range.";

    }

    else {

        category =
            "BMI is in the obesity range.";

    }


    document.getElementById(
        "bmiCategory"
    ).textContent =
        category;

}