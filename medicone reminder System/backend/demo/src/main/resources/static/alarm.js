(function () {
    "use strict";

    /* =====================================================
       SMART MEDICATION GLOBAL ALARM
       Works on every SmartMedication page
    ===================================================== */

    const ENABLED_KEY = "smartMedicationAlertsEnabled";
    const LAST_ALARM_KEY = "smartMedicationLastAlarmId";
    const ACTIVE_ALARM_KEY = "smartMedicationActiveAlarmId";

    let alarmAudio = null;
    let audioContext = null;
    let oscillator = null;
    let vibrationTimer = null;
    let pollTimer = null;

    let currentReminder = null;


    /* =====================================================
       GET LOGGED-IN USER
    ===================================================== */

    function getUserId() {

        const id = Number(
            localStorage.getItem("loggedInUserId") ||
            localStorage.getItem("userId") ||
            localStorage.getItem("USER_ID")
        );

        return Number.isInteger(id) && id > 0
            ? id
            : null;
    }


    /* =====================================================
       CHECK WHETHER ALERTS ARE ENABLED
    ===================================================== */

    function alertsEnabled() {

        return localStorage.getItem(
            ENABLED_KEY
        ) === "true";
    }


    /* =====================================================
       CREATE ALARM AUDIO
    ===================================================== */

    function getAlarmAudio() {

        if (!alarmAudio) {

            alarmAudio =
                new Audio(
                    "/sounds/medicine-alarm.mp3"
                );

            alarmAudio.loop = true;

            alarmAudio.preload = "auto";

            alarmAudio.volume = 1.0;
        }

        return alarmAudio;
    }


    /* =====================================================
       UNLOCK AUDIO
       Browser requires user interaction
    ===================================================== */

    async function unlockAudio() {

        try {

            const audio =
                getAlarmAudio();

            audio.volume = 0;

            await audio.play();

            audio.pause();

            audio.currentTime = 0;

            audio.volume = 1;

        }
        catch (error) {

            console.warn(
                "Audio unlock was blocked:",
                error
            );

        }
    }


    /* =====================================================
       FALLBACK SOUND
       Used if MP3 playback fails
    ===================================================== */

    function startFallbackTone() {

        try {

            if (oscillator) {
                return;
            }

            audioContext =
                audioContext ||
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

            oscillator =
                audioContext.createOscillator();

            const gain =
                audioContext.createGain();

            oscillator.type = "sine";

            oscillator.frequency.value = 880;

            gain.gain.value = 0.15;

            oscillator.connect(
                gain
            );

            gain.connect(
                audioContext.destination
            );

            oscillator.start();

        }
        catch (error) {

            console.warn(
                "Fallback tone failed:",
                error
            );

        }
    }


    /* =====================================================
       STOP FALLBACK TONE
    ===================================================== */

    function stopFallbackTone() {

        try {

            if (oscillator) {

                oscillator.stop();

                oscillator.disconnect();

                oscillator = null;
            }

        }
        catch (error) {

            oscillator = null;
        }
    }


    /* =====================================================
       VIBRATION
    ===================================================== */

    function startVibration() {

        if (!navigator.vibrate) {
            return;
        }

        navigator.vibrate(
            [700, 350, 700, 350]
        );

        vibrationTimer =
            setInterval(
                function () {

                    navigator.vibrate(
                        [700, 350, 700, 350]
                    );

                },
                2500
            );
    }


    /* =====================================================
       STOP VIBRATION
    ===================================================== */

    function stopVibration() {

        if (vibrationTimer) {

            clearInterval(
                vibrationTimer
            );

            vibrationTimer = null;
        }

        if (navigator.vibrate) {

            navigator.vibrate(0);
        }
    }


    /* =====================================================
       STOP SOUND
    ===================================================== */

    function stopSound() {

        try {

            if (alarmAudio) {

                alarmAudio.pause();

                alarmAudio.currentTime = 0;
            }

        }
        catch (error) {
        }

        stopFallbackTone();

        stopVibration();
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(value) {

        return String(value || "")

            .replaceAll(
                "&",
                "&amp;"
            )

            .replaceAll(
                "<",
                "&lt;"
            )

            .replaceAll(
                ">",
                "&gt;"
            )

            .replaceAll(
                '"',
                "&quot;"
            )

            .replaceAll(
                "'",
                "&#039;"
            );
    }


    /* =====================================================
       CREATE ALARM STYLES
    ===================================================== */

    function addAlarmStyles() {

        if (
            document.getElementById(
                "smartMedicationAlarmStyles"
            )
        ) {

            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "smartMedicationAlarmStyles";


        style.textContent = `

            #smartGlobalMedicationAlarm {

                position: fixed;

                inset: 0;

                z-index: 999999;

            }


            .smart-alarm-overlay {

                position: absolute;

                inset: 0;

                display: flex;

                align-items: center;

                justify-content: center;

                padding: 20px;

                background:
                    rgba(8,28,43,0.82);

                backdrop-filter:
                    blur(8px);

            }


            .smart-alarm-card {

                width: min(460px, 94%);

                padding: 38px 28px;

                text-align: center;

                background: white;

                border-radius: 28px;

                box-shadow:
                    0 30px 100px
                    rgba(0,0,0,0.40);

                animation:
                    smartAlarmPop
                    0.35s ease;

            }


            @keyframes smartAlarmPop {

                from {

                    opacity: 0;

                    transform:
                        scale(0.75);

                }

                to {

                    opacity: 1;

                    transform:
                        scale(1);

                }

            }


            .smart-alarm-bell {

                font-size: 62px;

                margin-bottom: 12px;

                animation:
                    smartBellShake
                    0.7s infinite;

            }


            @keyframes smartBellShake {

                0%,
                100% {

                    transform:
                        rotate(0deg);

                }

                25% {

                    transform:
                        rotate(-13deg);

                }

                75% {

                    transform:
                        rotate(13deg);

                }

            }


            .smart-alarm-title {

                color: #159da5;

                font-size: 13px;

                font-weight: bold;

                letter-spacing: 2px;

                margin-bottom: 14px;

            }


            .smart-alarm-card h2 {

                color: #193653;

                font-size: 29px;

                margin-bottom: 8px;

            }


            .smart-alarm-dosage {

                color: #58758d;

                font-size: 16px;

            }


            .smart-alarm-time {

                margin-top: 15px;

                color: #159da5;

                font-size: 22px;

                font-weight: bold;

            }


            .smart-alarm-instructions {

                margin-top: 15px;

                padding: 12px;

                border-radius: 10px;

                background: #f4fafb;

                color: #718797;

                font-size: 13px;

            }


            .smart-alarm-message {

                margin-top: 18px;

                color: #526d7e;

                line-height: 1.5;

            }


            .smart-alarm-buttons {

                display: flex;

                gap: 12px;

                margin-top: 28px;

            }


            .smart-alarm-buttons button {

                flex: 1;

                padding: 15px;

                border: none;

                border-radius: 12px;

                color: white;

                font-size: 14px;

                font-weight: bold;

                cursor: pointer;

            }


            .smart-taken-button {

                background: #22a861;

            }


            .smart-taken-button:hover {

                background: #188b4e;

            }


            .smart-missed-button {

                background: #e05252;

            }


            .smart-missed-button:hover {

                background: #c83d3d;

            }


            @media(max-width:600px) {

                .smart-alarm-buttons {

                    flex-direction: column;

                }

            }

        `;


        document.head.appendChild(
            style
        );
    }


    /* =====================================================
       BROWSER NOTIFICATION
    ===================================================== */

    async function sendNotification(
        medicineName,
        dosage,
        time
    ) {

        if (
            !("Notification" in window)
        ) {

            return;
        }


        if (
            Notification.permission !==
            "granted"
        ) {

            return;
        }


        try {

            new Notification(
                "🔔 Medication Reminder",
                {
                    body:
                        "Time to take " +
                        medicineName +
                        (dosage
                            ? " - " + dosage
                            : "") +
                        " at " +
                        time,

                    icon:
                        "/favicon.ico"
                }
            );

        }
        catch (error) {

            console.warn(
                "Notification failed:",
                error
            );
        }
    }


    /* =====================================================
       START ALARM SOUND
    ===================================================== */

    async function startSound() {

        try {

            const audio =
                getAlarmAudio();

            audio.currentTime = 0;

            audio.volume = 1;

            await audio.play();

        }
        catch (error) {

            console.warn(
                "MP3 playback failed. Using fallback tone.",
                error
            );

            startFallbackTone();
        }
    }


    /* =====================================================
       SHOW GLOBAL ALARM
    ===================================================== */

    function showAlarm(reminder) {

        currentReminder =
            reminder;


        const medicine =
            reminder.medicine || {};


        const medicineName =
            medicine.name ||
            "Your Medicine";


        const dosage =
            medicine.dosage ||
            "";


        const instructions =
            medicine.instructions ||
            "Follow your prescribed instructions.";


        const time =
            reminder.reminderTime
                ? reminder.reminderTime.substring(
                    0,
                    5
                )
                : "";


        localStorage.setItem(
            ACTIVE_ALARM_KEY,
            String(reminder.id)
        );


        addAlarmStyles();


        const existing =
            document.getElementById(
                "smartGlobalMedicationAlarm"
            );


        if (existing) {

            existing.remove();
        }


        const alarm =
            document.createElement(
                "div"
            );


        alarm.id =
            "smartGlobalMedicationAlarm";


        alarm.innerHTML = `

            <div class="smart-alarm-overlay">

                <div class="smart-alarm-card">

                    <div class="smart-alarm-bell">
                        🔔
                    </div>

                    <div class="smart-alarm-title">
                        MEDICATION REMINDER
                    </div>

                    <h2>
                        💊
                        ${escapeHtml(
                            medicineName
                        )}
                    </h2>

                    <p class="smart-alarm-dosage">
                        ${escapeHtml(
                            dosage
                        )}
                    </p>

                    <p class="smart-alarm-time">
                        🕐
                        ${escapeHtml(
                            time
                        )}
                    </p>

                    <div class="smart-alarm-instructions">

                        📝
                        ${escapeHtml(
                            instructions
                        )}

                    </div>

                    <p class="smart-alarm-message">

                        🔔 It's time to take
                        your scheduled medicine.

                    </p>

                    <div class="smart-alarm-buttons">

                        <button
                            class="smart-taken-button"
                            id="smartTakenButton">

                            ✅ TAKEN

                        </button>

                        <button
                            class="smart-missed-button"
                            id="smartMissedButton">

                            ❌ MISSED

                        </button>

                    </div>

                </div>

            </div>
        `;


        document.body.appendChild(
            alarm
        );


        document
            .getElementById(
                "smartTakenButton"
            )
            .addEventListener(
                "click",
                function () {

                    finishAlarm(
                        "taken"
                    );

                }
            );


        document
            .getElementById(
                "smartMissedButton"
            )
            .addEventListener(
                "click",
                function () {

                    finishAlarm(
                        "missed"
                    );

                }
            );


        startSound();

        startVibration();


        sendNotification(
            medicineName,
            dosage,
            time
        );
    }


    /* =====================================================
       FINISH ALARM
    ===================================================== */

    async function finishAlarm(
        action
    ) {

        if (!currentReminder) {
            return;
        }


        const reminderId =
            currentReminder.id;


        stopSound();


        const alarm =
            document.getElementById(
                "smartGlobalMedicationAlarm"
            );


        if (alarm) {

            alarm.remove();
        }


        try {

            const response =
                await fetch(
                    `/api/reminders/${reminderId}/${action}`,
                    {
                        method: "PUT"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to update reminder"
                );
            }


            localStorage.removeItem(
                ACTIVE_ALARM_KEY
            );


            localStorage.setItem(
                LAST_ALARM_KEY,
                String(reminderId)
            );


            currentReminder =
                null;


        }
        catch (error) {

            console.error(
                "Alarm status update failed:",
                error
            );


            /*
             * Keep the active alarm ID so it
             * can be shown again after navigation.
             */

            localStorage.setItem(
                ACTIVE_ALARM_KEY,
                String(reminderId)
            );
        }
    }


    /* =====================================================
       CHECK TODAY'S REMINDERS
    ===================================================== */

    async function checkReminders() {

        if (!alertsEnabled()) {
            return;
        }


        const userId =
            getUserId();


        if (!userId) {
            return;
        }


        try {

            const response =
                await fetch(
                    `/api/reminders/today/${userId}`,
                    {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {
                return;
            }


            const reminders =
                await response.json();


            const activeAlarmId =
                Number(
                    localStorage.getItem(
                        ACTIVE_ALARM_KEY
                    )
                );


            /*
             * If an alarm is already active,
             * do not create another one.
             */

            if (
                Number.isInteger(
                    activeAlarmId
                ) &&
                activeAlarmId > 0
            ) {

                const activeReminder =
                    reminders.find(
                        reminder =>
                            Number(
                                reminder.id
                            ) ===
                            activeAlarmId
                    );


                if (
                    activeReminder &&
                    activeReminder.status ===
                        "PENDING"
                ) {

                    if (
                        !document.getElementById(
                            "smartGlobalMedicationAlarm"
                        )
                    ) {

                        showAlarm(
                            activeReminder
                        );
                    }

                    return;
                }
            }


            const now =
                new Date();


            const currentTime =
                String(
                    now.getHours()
                ).padStart(
                    2,
                    "0"
                ) +
                ":" +
                String(
                    now.getMinutes()
                ).padStart(
                    2,
                    "0"
                );


            for (
                const reminder
                of reminders
            ) {

                if (
                    reminder.status !==
                    "PENDING"
                ) {

                    continue;
                }


                const reminderTime =
                    reminder.reminderTime
                        ? String(
                            reminder.reminderTime
                          ).substring(
                            0,
                            5
                          )
                        : "";


                if (
                    reminderTime !==
                    currentTime
                ) {

                    continue;
                }


                const reminderId =
                    Number(
                        reminder.id
                    );


                const lastAlarmId =
                    Number(
                        localStorage.getItem(
                            LAST_ALARM_KEY
                        )
                    );


                /*
                 * Prevent the same reminder from
                 * triggering repeatedly.
                 */

                if (
                    reminderId ===
                    lastAlarmId
                ) {

                    continue;
                }


                localStorage.setItem(
                    ACTIVE_ALARM_KEY,
                    String(reminderId)
                );


                showAlarm(
                    reminder
                );


                break;
            }

        }
        catch (error) {

            console.error(
                "Global alarm check failed:",
                error
            );
        }
    }


    /* =====================================================
       ENABLE GLOBAL ALERTS
    ===================================================== */

    async function enableAlerts() {

        localStorage.setItem(
            ENABLED_KEY,
            "true"
        );


        /*
         * Unlock browser audio.
         */

        await unlockAudio();


        /*
         * Ask for notification permission.
         */

        if (
            "Notification" in window &&
            Notification.permission ===
                "default"
        ) {

            try {

                await Notification.requestPermission();

            }
            catch (error) {

                console.warn(
                    "Notification permission failed:",
                    error
                );
            }
        }


        /*
         * Immediately check.
         */

        await checkReminders();


        /*
         * Update buttons on the page.
         */

        updateEnableButtons();


        alert(
            "🔔 Medication alerts are enabled for all SmartMedication pages."
        );
    }


    /* =====================================================
       UPDATE ENABLE BUTTONS
    ===================================================== */

    function updateEnableButtons() {

        const buttons =
            document.querySelectorAll(
                "#enableAlertButton, [data-enable-medication-alerts]"
            );


        buttons.forEach(
            function (button) {

                if (
                    alertsEnabled()
                ) {

                    button.textContent =
                        "✅ Medication Alerts Enabled";

                    button.classList.add(
                        "enabled"
                    );

                }
                else {

                    button.textContent =
                        "🔔 Enable Medication Alerts";

                    button.classList.remove(
                        "enabled"
                    );
                }
            }
        );
    }


    /* =====================================================
       START GLOBAL MONITOR
    ===================================================== */

    function startGlobalAlarm() {

        addAlarmStyles();

        updateEnableButtons();

        checkReminders();


        /*
         * Check every 15 seconds.
         */

        clearInterval(
            pollTimer
        );


        pollTimer =
            setInterval(
                checkReminders,
                15000
            );


        /*
         * Check when user returns
         * to the page.
         */

        window.addEventListener(
            "focus",
            checkReminders
        );


        document.addEventListener(
            "visibilitychange",
            function () {

                if (
                    !document.hidden
                ) {

                    checkReminders();
                }
            }
        );


        /*
         * If an alarm was active before
         * navigation, restore it.
         */

        const activeAlarmId =
            Number(
                localStorage.getItem(
                    ACTIVE_ALARM_KEY
                )
            );


        if (
            Number.isInteger(
                activeAlarmId
            ) &&
            activeAlarmId > 0
        ) {

            setTimeout(
                checkReminders,
                500
            );
        }
    }


    /* =====================================================
       PUBLIC FUNCTIONS
    ===================================================== */

    window.enableMedicationAlerts =
        enableAlerts;

    window.enableGlobalMedicationAlerts =
        enableAlerts;


    /* =====================================================
       PAGE START
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            /*
             * Connect every enable-alert button.
             */

            document
                .querySelectorAll(
                    "#enableAlertButton, [data-enable-medication-alerts]"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            enableAlerts
                        );

                    }
                );


            startGlobalAlarm();

        }
    );

})();