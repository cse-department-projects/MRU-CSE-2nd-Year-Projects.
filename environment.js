/**
 * ENVIORA — Location-Based Environmental Intelligence Engine (environment.js)
 * "Your Environment, Your Solution"
 *
 * Integrates Open-Meteo Weather, Air Quality, and Geocoding APIs.
 * Supports configurable API keys / custom endpoints via window.ENVIORA_ENV_CONFIG.
 * Automatically detects user location and evaluates real-time environmental conditions (Good / Moderate / Poor).
 * Displays prominent interactive alerts, metric cards, 5-day micro-forecasts, and mitigation solutions.
 */

// =========================================================================
// Global Environmental API Configuration
// Can be customized via window.ENVIORA_ENV_CONFIG or environment variables
// =========================================================================
window.ENVIORA_ENV_CONFIG = Object.assign({
    apiKey: "", // Optional API key for third-party weather/air-quality providers
    weatherApiEndpoint: "https://api.open-meteo.com/v1/forecast",
    aqiApiEndpoint: "https://air-quality-api.open-meteo.com/v1/air-quality",
    reverseGeocodeEndpoint: "https://api.bigdatacloud.net/data/reverse-geocode-client",
    geocodingSearchEndpoint: "https://geocoding-api.open-meteo.com/v1/search"
}, window.ENVIORA_ENV_CONFIG || {});

document.addEventListener('DOMContentLoaded', () => {

    // Default Monitored Location (Hyderabad, India)
    let currentCoords = {
        lat: 17.3850,
        lon: 78.4867,
        name: "Hyderabad, Telangana, India"
    };

    // Tracking state for floating notifications to avoid duplicate spam
    let lastAlertState = {
        locationName: null,
        conditionLevel: null,
        dismissed: false
    };

    // DOM Elements
    const detectBtn = document.getElementById('btn-detect-location');
    const searchInput = document.getElementById('env-search-input');
    const searchDropdown = document.getElementById('env-search-dropdown');
    const quickCityPills = document.querySelectorAll('.quick-city-pill');
    const locationNameEl = document.getElementById('env-location-name');
    const timestampEl = document.getElementById('env-timestamp');

    // Metrics Elements
    const tempValEl = document.getElementById('metric-temp-val');
    const tempFeelEl = document.getElementById('metric-temp-feel');
    const tempBadgeEl = document.getElementById('metric-temp-badge');

    const humidityValEl = document.getElementById('metric-humidity-val');
    const humidityStatusEl = document.getElementById('metric-humidity-status');
    const humidityBadgeEl = document.getElementById('metric-humidity-badge');

    const weatherValEl = document.getElementById('metric-weather-val');
    const weatherIconEl = document.getElementById('metric-weather-icon');
    const weatherRainEl = document.getElementById('metric-weather-rain');

    const aqiValEl = document.getElementById('metric-aqi-val');
    const aqiBadgeEl = document.getElementById('metric-aqi-badge');
    const aqiPmEl = document.getElementById('metric-aqi-pm');

    // Score & Status Elements
    const scoreValEl = document.getElementById('env-score-number');
    const scoreRingEl = document.getElementById('env-score-progress-ring');
    const scoreHeadlineEl = document.getElementById('env-score-headline');
    const scoreAirFactorEl = document.getElementById('score-factor-air');
    const scoreTempFactorEl = document.getElementById('score-factor-temp');
    const scoreHumidityFactorEl = document.getElementById('score-factor-humidity');
    const scoreRainFactorEl = document.getElementById('score-factor-rain');

    const statusTitleEl = document.getElementById('env-status-title');
    const statusDescEl = document.getElementById('env-status-desc');
    const statusBadgeEl = document.getElementById('env-status-badge');

    // Containers
    const alertsContainer = document.getElementById('env-alerts-container');
    const floatingAlertContainer = document.getElementById('env-floating-alert-container');
    const issuesCardsGrid = document.getElementById('env-issues-cards-grid');
    const personalizedActionsGrid = document.getElementById('personalized-actions-grid');
    const forecastDaysGrid = document.getElementById('forecast-days-grid');
    const tempRangeItems = document.querySelectorAll('.temp-range-item');

    // =========================================================================
    // 1. WMO Weather Code Interpreter
    // =========================================================================
    function interpretWmoCode(code) {
        const table = {
            0: { text: "Clear Sky", icon: "☀️", class: "sunny" },
            1: { text: "Mainly Clear", icon: "🌤️", class: "mostly-sunny" },
            2: { text: "Partly Cloudy", icon: "⛅", class: "partly-cloudy" },
            3: { text: "Overcast", icon: "☁️", class: "cloudy" },
            45: { text: "Foggy", icon: "🌫️", class: "fog" },
            48: { text: "Rime Fog", icon: "🌫️", class: "fog" },
            51: { text: "Light Drizzle", icon: "🌦️", class: "drizzle" },
            53: { text: "Moderate Drizzle", icon: "🌦️", class: "drizzle" },
            55: { text: "Dense Drizzle", icon: "🌧️", class: "rain" },
            61: { text: "Slight Rain", icon: "🌧️", class: "rain" },
            63: { text: "Moderate Rain", icon: "🌧️", class: "rain" },
            65: { text: "Heavy Rain", icon: "🌧️", class: "heavy-rain" },
            71: { text: "Slight Snow", icon: "🌨️", class: "snow" },
            73: { text: "Moderate Snow", icon: "🌨️", class: "snow" },
            75: { text: "Heavy Snow", icon: "❄️", class: "snow" },
            80: { text: "Rain Showers", icon: "🌦️", class: "rain" },
            81: { text: "Moderate Showers", icon: "🌧️", class: "heavy-rain" },
            82: { text: "Violent Showers", icon: "⛈️", class: "storm" },
            95: { text: "Thunderstorm", icon: "⚡", class: "thunderstorm" },
            96: { text: "Thunderstorm & Hail", icon: "⛈️", class: "thunderstorm" },
            99: { text: "Severe Thunderstorm", icon: "⛈️", class: "thunderstorm" }
        };
        return table[code] || { text: "Variable Skies", icon: "⛅", class: "variable" };
    }

    // =========================================================================
    // 2. Fetch Environmental Data from Real-time Telemetry APIs
    // =========================================================================
    async function loadEnvironmentalData(lat, lon, locationName) {
        // Update Location Header
        if (locationNameEl) locationNameEl.innerHTML = `📍 ${locationName}`;
        if (timestampEl) {
            const now = new Date();
            timestampEl.textContent = `Live Telemetry Synchronized • ${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        try {
            const config = window.ENVIORA_ENV_CONFIG;
            const weatherUrl = `${config.weatherApiEndpoint}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
            const aqiUrl = `${config.aqiApiEndpoint}?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone&timezone=auto`;

            const [weatherRes, aqiRes] = await Promise.all([
                fetch(weatherUrl).then(r => (r.ok ? r.json() : null)).catch(() => null),
                fetch(aqiUrl).then(r => (r.ok ? r.json() : null)).catch(() => null)
            ]);

            // Handle API failure / unavailable data gracefully
            if (!weatherRes && !aqiRes) {
                renderUnavailableState(locationName);
                return;
            }

            const current = weatherRes?.current || {};
            const daily = weatherRes?.daily || {};
            const aqiCurrent = aqiRes?.current || {};

            // Extract real metrics safely
            const temp = typeof current.temperature_2m === 'number' ? Math.round(current.temperature_2m) : null;
            const feelsLike = typeof current.apparent_temperature === 'number' ? Math.round(current.apparent_temperature) : temp;
            const humidity = typeof current.relative_humidity_2m === 'number' ? current.relative_humidity_2m : 50;
            const weatherCode = typeof current.weather_code === 'number' ? current.weather_code : 1;
            const precip = typeof current.precipitation === 'number' ? current.precipitation : 0;
            const windSpeed = typeof current.wind_speed_10m === 'number' ? Math.round(current.wind_speed_10m) : 10;
            
            const aqi = typeof aqiCurrent.us_aqi === 'number' ? Math.round(aqiCurrent.us_aqi) : null;
            const pm25 = typeof aqiCurrent.pm2_5 === 'number' ? Math.round(aqiCurrent.pm2_5) : null;
            const pm10 = typeof aqiCurrent.pm10 === 'number' ? Math.round(aqiCurrent.pm10) : null;

            const weatherInfo = interpretWmoCode(weatherCode);

            // 1. Update UI Metric Cards
            renderCurrentMetrics({ 
                temp: temp !== null ? temp : '--', 
                feelsLike: feelsLike !== null ? feelsLike : '--', 
                humidity, 
                weatherInfo, 
                precip, 
                aqi: aqi !== null ? aqi : '--', 
                pm25: pm25 !== null ? pm25 : '--', 
                pm10: pm10 !== null ? pm10 : '--', 
                windSpeed 
            });

            // 2. Calculate Overall Composite Score & Status
            const scoreData = calculateEnvironmentalScore({ 
                temp: temp !== null ? temp : 24, 
                humidity, 
                aqi: aqi !== null ? aqi : 50, 
                precip 
            });
            renderScoreAndStatus(scoreData);

            // 3. Generate Dynamic Issues & Personalized Actions
            renderDynamicIssues({ 
                temp: temp !== null ? temp : 24, 
                humidity, 
                aqi: aqi !== null ? aqi : 50, 
                precip, 
                windSpeed, 
                locationName 
            });
            renderPersonalizedActions({ 
                temp: temp !== null ? temp : 24, 
                humidity, 
                aqi: aqi !== null ? aqi : 50, 
                precip, 
                score: scoreData.score 
            });

            // 4. Highlight Temperature Range
            if (temp !== null) {
                highlightActiveTempRange(temp);
            }

            // 5. Render 5-Day Forecast
            if (daily && daily.time) {
                renderForecastCards(daily);
            }

            // 6. Render In-Page Alerts Banner
            renderAlerts({ temp, aqi, precip, windSpeed });

            // 7. Evaluate Environmental Condition Level (Good / Moderate / Poor)
            const condition = evaluateEnvironmentalCondition({ aqi, pm25, temp, precip, windSpeed });

            // 8. Render Floating Location-based Alert Toast Notification
            renderFloatingEnvironmentalAlert({ 
                condition, 
                locationName, 
                aqi, 
                temp, 
                pm25 
            });

        } catch (error) {
            console.error("Error loading environmental data:", error);
            renderUnavailableState(locationName);
        }
    }

    // =========================================================================
    // 3. Render Current Metric Cards
    // =========================================================================
    function renderCurrentMetrics({ temp, feelsLike, humidity, weatherInfo, precip, aqi, pm25, pm10, windSpeed }) {
        // Temperature
        if (tempValEl) tempValEl.textContent = temp;
        if (tempFeelEl) tempFeelEl.textContent = `Feels like ${feelsLike}°C • Wind ${windSpeed} km/h`;
        if (tempBadgeEl) {
            if (typeof temp === 'number' && temp > 35) {
                tempBadgeEl.textContent = "High Heat";
                tempBadgeEl.className = "metric-badge badge-danger";
            } else if (typeof temp === 'number' && temp < 15) {
                tempBadgeEl.textContent = "Cool / Cold";
                tempBadgeEl.className = "metric-badge badge-info";
            } else {
                tempBadgeEl.textContent = "Comfort Zone";
                tempBadgeEl.className = "metric-badge";
            }
        }

        // Humidity
        if (humidityValEl) humidityValEl.textContent = `${humidity}%`;
        if (humidityStatusEl) {
            if (humidity > 70) {
                humidityStatusEl.textContent = "High moisture in air";
                if (humidityBadgeEl) {
                    humidityBadgeEl.textContent = "Humid";
                    humidityBadgeEl.className = "metric-badge badge-warning";
                }
            } else if (humidity < 30) {
                humidityStatusEl.textContent = "Dry air conditions";
                if (humidityBadgeEl) {
                    humidityBadgeEl.textContent = "Arid";
                    humidityBadgeEl.className = "metric-badge badge-warning";
                }
            } else {
                humidityStatusEl.textContent = "Balanced humidity";
                if (humidityBadgeEl) {
                    humidityBadgeEl.textContent = "Optimal";
                    humidityBadgeEl.className = "metric-badge";
                }
            }
        }

        // Weather
        if (weatherValEl) weatherValEl.textContent = weatherInfo.text;
        if (weatherIconEl) weatherIconEl.textContent = weatherInfo.icon;
        if (weatherRainEl) {
            weatherRainEl.textContent = precip > 0 ? `Rain: ${precip} mm` : `No active rainfall`;
        }

        // AQI
        if (aqiValEl) aqiValEl.textContent = aqi;
        if (aqiPmEl) {
            const pmText = pm25 !== '--' ? `PM2.5: ${pm25} µg/m³ • PM10: ${pm10}` : 'Air particulate sensor live';
            aqiPmEl.textContent = pmText;
        }
        if (aqiBadgeEl) {
            if (typeof aqi === 'number') {
                if (aqi <= 50) {
                    aqiBadgeEl.textContent = "Good Quality";
                    aqiBadgeEl.className = "metric-badge";
                } else if (aqi <= 100) {
                    aqiBadgeEl.textContent = "Moderate";
                    aqiBadgeEl.className = "metric-badge badge-warning";
                } else if (aqi <= 150) {
                    aqiBadgeEl.textContent = "Sensitive Caution";
                    aqiBadgeEl.className = "metric-badge badge-warning";
                } else {
                    aqiBadgeEl.textContent = "Unhealthy AQI";
                    aqiBadgeEl.className = "metric-badge badge-danger";
                }
            } else {
                aqiBadgeEl.textContent = "Monitored";
                aqiBadgeEl.className = "metric-badge";
            }
        }
    }

    // =========================================================================
    // 4. Calculate Informational Environmental Score (0 - 100)
    // =========================================================================
    function calculateEnvironmentalScore({ temp, humidity, aqi, precip }) {
        let score = 100;

        // AQI Impact (up to 40 pts)
        if (aqi > 150) score -= 35;
        else if (aqi > 100) score -= 22;
        else if (aqi > 50) score -= 10;

        // Temperature Deviation from optimal 22°C (up to 30 pts)
        const tempDiff = Math.abs(temp - 22);
        if (tempDiff > 16) score -= 25; // >38C or <6C
        else if (tempDiff > 10) score -= 15;
        else if (tempDiff > 5) score -= 8;

        // Humidity Deviation from optimal 50% (up to 20 pts)
        const humDiff = Math.abs(humidity - 50);
        if (humDiff > 35) score -= 16;
        else if (humDiff > 20) score -= 8;

        // Severe Precipitation impact (up to 10 pts)
        if (precip > 15) score -= 10;

        score = Math.max(15, Math.min(100, Math.round(score)));

        let status = "Good";
        let headline = "Favorable Environmental Balance";
        let desc = "Current environmental indicators reflect safe air purity and manageable thermal conditions for outdoor stewardship.";
        let ringColor = "#2E7D32";

        if (score < 45) {
            status = "Critical";
            headline = "Elevated Ecological Stress";
            desc = "Substantial environmental strain detected. High heat, poor air quality, or extreme humidity require personal precautions.";
            ringColor = "#E53935";
        } else if (score < 65) {
            status = "Needs Attention";
            headline = "Moderate Ecological Burden";
            desc = "Certain indicators such as air particulate or temperature warrant mindful resource use and reduced emissions.";
            ringColor = "#FFA000";
        } else if (score < 80) {
            status = "Moderate";
            headline = "Acceptable Living Conditions";
            desc = "Local parameters are within manageable ranges with light environmental considerations.";
            ringColor = "#29B6F6";
        }

        return { score, status, headline, desc, ringColor, temp, humidity, aqi };
    }

    // Render Score Ring & Status Card
    function renderScoreAndStatus(scoreData) {
        if (scoreValEl) scoreValEl.textContent = scoreData.score;
        if (scoreHeadlineEl) scoreHeadlineEl.textContent = scoreData.headline;

        // Animate SVG Stroke Dashoffset (Circumference of r=60 is ~377)
        if (scoreRingEl) {
            const circumference = 377;
            const offset = circumference - (scoreData.score / 100) * circumference;
            scoreRingEl.style.strokeDashoffset = offset;
            scoreRingEl.style.stroke = scoreData.ringColor;
        }

        // Breakdown factors
        if (scoreAirFactorEl) {
            scoreAirFactorEl.textContent = scoreData.aqi <= 50 ? "Air Purity: Optimal" : scoreData.aqi <= 100 ? "Air Purity: Moderate" : "Air Purity: Strained";
        }
        if (scoreTempFactorEl) {
            scoreTempFactorEl.textContent = scoreData.temp >= 18 && scoreData.temp <= 28 ? "Thermal Index: Balanced" : scoreData.temp > 35 ? "Thermal Index: Heat Stress" : "Thermal Index: Varied";
        }
        if (scoreHumidityFactorEl) {
            scoreHumidityFactorEl.textContent = scoreData.humidity >= 40 && scoreData.humidity <= 65 ? "Moisture: Optimal" : "Moisture: Variable";
        }
        if (scoreRainFactorEl) {
            scoreRainFactorEl.textContent = "Precipitation: Normal";
        }

        // Status Card
        if (statusTitleEl) statusTitleEl.textContent = `${scoreData.status} Status`;
        if (statusDescEl) statusDescEl.textContent = scoreData.desc;
        if (statusBadgeEl) {
            statusBadgeEl.textContent = `Overall Score: ${scoreData.score} / 100`;
        }
    }

    // =========================================================================
    // 5. Dynamic Environmental Issues Generator
    // =========================================================================
    function renderDynamicIssues({ temp, humidity, aqi, precip, locationName }) {
        if (!issuesCardsGrid) return;

        const issues = [];

        // 1. Heat Stress
        if (temp >= 33) {
            issues.push({
                emoji: "🔥",
                name: "High Heat Stress",
                desc: `Current temperatures around ${temp}°C drive increased electrical grid loads, strain urban vegetation, and elevate dehydration rates.`,
                actions: ["Support municipal shade trees", "Reduce peak appliance power use", "Provide outdoor water for urban fauna"]
            });
        }

        // 2. Air Pollution
        if (aqi >= 80) {
            issues.push({
                emoji: "🌫️",
                name: "Air Quality Degradation",
                desc: `Particulate matter (AQI ${aqi}) detected. Elevated airborne pollutants bypass natural pulmonary sieves and diminish urban biodiversity.`,
                actions: ["Choose active transit or public metro lines", "Refrain from burning yard debris", "Maintain household indoor green plants"]
            });
        }

        // 3. Water / Drought Stress
        if (temp > 28 && humidity < 35 && precip < 1) {
            issues.push({
                emoji: "💧",
                name: "Arid & Water Stress",
                desc: `Dry atmospheric levels combined with sustained warm temperatures accelerate moisture loss in soils and local reservoirs.`,
                actions: ["Adopt drip-irrigation for home gardens", "Fix household faucet leaks promptly", "Harvest greywater for non-potable uses"]
            });
        }

        // 4. Flood / Water Management
        if (precip > 5) {
            issues.push({
                emoji: "🌧️",
                name: "Precipitation & Drainage Risk",
                desc: `Active or recent rain (${precip} mm) increases stormwater runoff, which may overload street catch basins and wash debris into waterways.`,
                actions: ["Clear street leaf debris from drain grates", "Avoid plastic disposal near storm drains", "Maintain rainwater harvesting pits"]
            });
        }

        // 5. Biodiversity / Habitat Preservation (Standard Baseline)
        const cityShort = locationName ? locationName.split(',')[0] : 'your region';
        issues.push({
            emoji: "🦋",
            name: "Urban Habitat Preservation",
            desc: `Local ecosystems around ${cityShort} require continuous micro-corridors for native pollinators and migrating bird populations.`,
            actions: ["Plant native flowering species", "Install balcony bird-friendly perches", "Avoid chemical yard pesticides"]
        });

        // 6. Energy Intensity (Baseline)
        if (issues.length < 3) {
            issues.push({
                emoji: "⚡",
                name: "Energy & Carbon Intensity",
                desc: `Every kilowatt conserved relieves stress on power generation infrastructure and directly decreases regional emissions.`,
                actions: ["Unplug vampire electronic loads", "Upgrade home fixtures to high-efficiency LEDs", "Support regional clean energy co-ops"]
            });
        }

        // Render Cards
        issuesCardsGrid.innerHTML = issues.slice(0, 3).map(issue => `
            <div class="local-issue-card">
                <div class="issue-card-top">
                    <span class="issue-emoji-badge">${issue.emoji}</span>
                    <h4 class="issue-card-name">${issue.name}</h4>
                </div>
                <p class="issue-card-body">${issue.desc}</p>
                <div class="issue-suggested-actions">
                    <div class="issue-actions-title">Recommended Local Actions:</div>
                    <ul class="issue-actions-list">
                        ${issue.actions.map(act => `<li>${act}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // 6. "What You Can Do Today" — 5 Dynamic Personalized Solutions
    // =========================================================================
    function renderPersonalizedActions({ temp, humidity, aqi }) {
        if (!personalizedActionsGrid) return;

        const allActions = [
            {
                icon: "🌳",
                title: "Plant & Shade",
                desc: "Plant native seedlings or nurture existing trees to lower ambient ground heat and sequester carbon."
            },
            {
                icon: "💡",
                title: "Energy Efficiency",
                desc: temp > 30 ? "Raise thermostat by 1°C to alleviate peak electrical grid burden during high heat." : "Power down idle appliances to eliminate vampire electricity draw."
            },
            {
                icon: "🚲",
                title: "Sustainable Transit",
                desc: aqi > 80 ? "Take public transit or carpool to reduce vehicle particulate emissions." : "Walk or bicycle for short errands under 2 kilometers."
            },
            {
                icon: "💧",
                title: "Water Conservation",
                desc: humidity < 40 ? "Practice smart watering during early mornings to reduce evaporative loss." : "Turn off taps while brushing to save up to 8 gallons of clean water daily."
            },
            {
                icon: "♻️",
                title: "Zero-Plastic Habit",
                desc: "Carry your reusable bottle and canvas tote to eliminate single-use synthetic plastics."
            }
        ];

        personalizedActionsGrid.innerHTML = allActions.map(action => `
            <div class="personalized-action-card">
                <div class="action-icon-circle">${action.icon}</div>
                <h5 class="action-card-title">${action.title}</h5>
                <p class="action-card-desc">${action.desc}</p>
            </div>
        `).join('');
    }

    // =========================================================================
    // 7. Temperature Range Guide Highlighting
    // =========================================================================
    function highlightActiveTempRange(temp) {
        tempRangeItems.forEach(item => item.classList.remove('active-range'));

        let activeRangeClass = '';
        if (temp < 15) activeRangeClass = 'range-cold';
        else if (temp <= 25) activeRangeClass = 'range-comfortable';
        else if (temp <= 35) activeRangeClass = 'range-warm';
        else if (temp <= 40) activeRangeClass = 'range-heat';
        else activeRangeClass = 'range-extreme';

        const matchingEl = document.querySelector(`.temp-range-item.${activeRangeClass}`);
        if (matchingEl) {
            matchingEl.classList.add('active-range');
        }
    }

    // =========================================================================
    // 8. Render 5-Day Environmental & Weather Forecast
    // =========================================================================
    function renderForecastCards(daily) {
        if (!forecastDaysGrid || !daily.time) return;

        const days = daily.time.slice(0, 5);
        const maxTemps = daily.temperature_2m_max || [];
        const minTemps = daily.temperature_2m_min || [];
        const rainProbs = daily.precipitation_probability_max || [];
        const weatherCodes = daily.weather_code || [];

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        forecastDaysGrid.innerHTML = days.map((dateStr, idx) => {
            const date = new Date(dateStr);
            const isToday = idx === 0;
            const dayName = isToday ? 'Today' : dayNames[date.getDay()];
            const weather = interpretWmoCode(weatherCodes[idx]);
            const max = typeof maxTemps[idx] === 'number' ? Math.round(maxTemps[idx]) : 28;
            const min = typeof minTemps[idx] === 'number' ? Math.round(minTemps[idx]) : 20;
            const rainProb = typeof rainProbs[idx] === 'number' ? rainProbs[idx] : 0;

            return `
                <div class="forecast-day-box ${isToday ? 'is-today' : ''}">
                    <span class="forecast-day-name">${dayName}</span>
                    <span class="forecast-icon">${weather.icon}</span>
                    <span class="forecast-temp-high">${max}°</span>
                    <span class="forecast-temp-low">${min}°</span>
                    <span class="forecast-rain-prob">💧 ${rainProb}%</span>
                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // 9. In-Dashboard Environmental Alerts System (Banner Container)
    // =========================================================================
    function renderAlerts({ temp, aqi, precip, windSpeed }) {
        if (!alertsContainer) return;

        const alerts = [];

        if (typeof temp === 'number' && temp >= 38) {
            alerts.push({
                type: 'alert-danger',
                icon: '🚨',
                title: 'High Heat Advisory',
                text: `Current local temperatures reach ${temp}°C. Stay hydrated, avoid strenuous midday exertion, and check on neighbors and pets.`
            });
        }

        if (typeof aqi === 'number' && aqi >= 101) {
            alerts.push({
                type: 'alert-danger',
                icon: '🌫️',
                title: 'Air Quality Precaution',
                text: `Elevated AQI (${aqi}) observed. Sensitive groups should minimize outdoor exertion and consider indoor air filtration.`
            });
        }

        if (typeof precip === 'number' && precip >= 15) {
            alerts.push({
                type: 'alert-warning',
                icon: '🌧️',
                title: 'Heavy Rainfall Alert',
                text: `Significant rain volume detected (${precip} mm). Help keep storm drainage pathways unobstructed.`
            });
        }

        if (typeof windSpeed === 'number' && windSpeed >= 40) {
            alerts.push({
                type: 'alert-warning',
                icon: '💨',
                title: 'High Wind Warning',
                text: `Sustained wind speeds of ${windSpeed} km/h detected. Secure outdoor lightweight items.`
            });
        }

        if (alerts.length === 0) {
            alertsContainer.innerHTML = '';
            alertsContainer.style.display = 'none';
        } else {
            alertsContainer.style.display = 'flex';
            alertsContainer.innerHTML = alerts.map(alert => `
                <div class="env-alert-banner ${alert.type}">
                    <div class="env-alert-icon">${alert.icon}</div>
                    <div class="env-alert-text">
                        <h5>${alert.title}</h5>
                        <p>${alert.text}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    // =========================================================================
    // 10. Environmental Condition Evaluator (Good / Moderate / Poor)
    // =========================================================================
    function evaluateEnvironmentalCondition({ aqi, pm25, temp, precip, windSpeed }) {
        const hasAqi = typeof aqi === 'number';
        const hasPm = typeof pm25 === 'number';
        const hasTemp = typeof temp === 'number';

        if (!hasAqi && !hasPm && !hasTemp) {
            return {
                level: 'unavailable',
                badge: 'ℹ️ Environmental Notice',
                title: 'Data Telemetry Notice',
                message: 'Environmental data is currently unavailable. Please try again later.',
                statusText: 'Data Unavailable',
                statusClass: 'toast-meta-val',
                icon: 'ℹ️',
                themeClass: 'env-toast-unavailable'
            };
        }

        // Poor / Bad conditions:
        // AQI > 100 (Unhealthy for sensitive groups, Unhealthy, Very Unhealthy, Hazardous)
        // or PM2.5 > 35 µg/m³
        // or Extreme Heat >= 38°C
        // or Severe Wind >= 45 km/h
        const isPoorAqi = hasAqi && aqi > 100;
        const isPoorPm = hasPm && pm25 > 35;
        const isExtremeHeat = hasTemp && temp >= 38;
        const isSevereWind = typeof windSpeed === 'number' && windSpeed >= 45;

        if (isPoorAqi || isPoorPm || isExtremeHeat || isSevereWind) {
            const reasons = [];
            if (isPoorAqi) reasons.push(`AQI ${aqi} (Unhealthy)`);
            else if (isPoorPm) reasons.push(`High PM2.5 (${pm25} µg/m³)`);
            if (isExtremeHeat) reasons.push(`Extreme Heat (${temp}°C)`);
            if (isSevereWind) reasons.push(`Gale Winds (${windSpeed} km/h)`);

            return {
                level: 'poor',
                badge: '⚠️ Environmental Alert',
                title: 'Attention: Environmental Precaution',
                message: 'You are currently in an area with poor environmental conditions. Please take necessary precautions and consider moving to a cleaner area.',
                statusText: reasons.length ? `Poor • ${reasons.join(', ')}` : 'Poor / Unhealthy Conditions',
                statusClass: 'toast-meta-val val-danger',
                icon: '⚠️',
                themeClass: 'env-toast-poor'
            };
        }

        // Moderate conditions:
        // AQI 51 - 100 or Temp 33 - 37°C or Temp < 12°C
        const isModAqi = hasAqi && aqi > 50 && aqi <= 100;
        const isElevatedTemp = hasTemp && temp >= 33 && temp < 38;
        const isCoolTemp = hasTemp && temp < 12;

        if (isModAqi || isElevatedTemp || isCoolTemp) {
            return {
                level: 'moderate',
                badge: '🟡 Environment Status: Moderate',
                title: 'Fair Ecological Balance',
                message: 'The environmental conditions around you are moderate. Stay mindful of air particulate and follow proactive green habits.',
                statusText: 'Moderate Quality',
                statusClass: 'toast-meta-val val-warning',
                icon: '🟡',
                themeClass: 'env-toast-moderate'
            };
        }

        // Good conditions:
        // AQI <= 50 and comfortable temperatures
        return {
            level: 'good',
            badge: '✅ Environment Status: Good',
            title: 'Optimal Living Conditions',
            message: 'The environmental conditions around you are currently good. Keep following eco-friendly practices!',
            statusText: 'Good Quality (Clean Air)',
            statusClass: 'toast-meta-val val-good',
            icon: '✅',
            themeClass: 'env-toast-good'
        };
    }

    // =========================================================================
    // 11. Modern Floating Environmental Alert Notification (Toast Card)
    // =========================================================================
    function renderFloatingEnvironmentalAlert({ condition, locationName, aqi, temp, pm25 }) {
        if (!floatingAlertContainer) return;

        // Prevent duplicate spam if user dismissed exact same location & status
        if (lastAlertState.dismissed && 
            lastAlertState.locationName === locationName && 
            lastAlertState.conditionLevel === condition.level) {
            return;
        }

        // Update tracking state
        lastAlertState = {
            locationName: locationName,
            conditionLevel: condition.level,
            dismissed: false
        };

        const aqiLabel = typeof aqi === 'number' 
            ? (aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Sensitive Caution' : 'Unhealthy') 
            : null;

        const aqiDisplay = typeof aqi === 'number' 
            ? `${aqi} (${aqiLabel})` 
            : (typeof pm25 === 'number' ? `PM2.5: ${pm25} µg/m³` : 'Live API Stream');

        const tempDisplay = typeof temp === 'number' ? `${temp}°C` : '--';

        floatingAlertContainer.innerHTML = `
            <div class="env-toast-card ${condition.themeClass}" id="env-active-toast" role="alert" aria-live="assertive">
                <button type="button" class="env-toast-close" id="btn-toast-close" aria-label="Dismiss notification">&times;</button>
                
                <div class="env-toast-header">
                    <div class="env-toast-icon-wrap">${condition.icon}</div>
                    <div class="env-toast-title-wrap">
                        <span class="env-toast-badge">
                            <span class="badge-pulse-dot"></span>
                            ${condition.badge}
                        </span>
                        <h4 class="env-toast-heading">${condition.title}</h4>
                    </div>
                </div>

                <div class="env-toast-body">
                    <p class="env-toast-message">${condition.message}</p>
                    
                    <div class="env-toast-meta-grid">
                        <div class="env-toast-meta-item span-full">
                            <span class="toast-meta-label">Location</span>
                            <span class="toast-meta-val" title="${locationName}">📍 ${locationName}</span>
                        </div>
                        <div class="env-toast-meta-item">
                            <span class="toast-meta-label">Air Quality (AQI)</span>
                            <span class="${condition.statusClass}">${aqiDisplay}</span>
                        </div>
                        <div class="env-toast-meta-item">
                            <span class="toast-meta-label">Temperature</span>
                            <span class="toast-meta-val">${tempDisplay}</span>
                        </div>
                        <div class="env-toast-meta-item span-full">
                            <span class="toast-meta-label">Environmental Status</span>
                            <span class="${condition.statusClass}">${condition.statusText}</span>
                        </div>
                    </div>

                    <div class="env-toast-source-note">
                        <span>🛡️ Based on live environmental data telemetry (Open-Meteo API)</span>
                    </div>
                </div>

                <div class="env-toast-actions">
                    <a href="#eco-tips" class="btn-toast-action" id="btn-toast-eco-tips">
                        <span>View Eco Tips</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </a>
                    <button type="button" class="btn-toast-dismiss" id="btn-toast-dismiss-action">Dismiss</button>
                </div>
            </div>
        `;

        // Attach Dismiss & View Eco Tips Listeners
        const toastEl = document.getElementById('env-active-toast');
        const closeBtn = document.getElementById('btn-toast-close');
        const dismissBtn = document.getElementById('btn-toast-dismiss-action');
        const ecoTipsBtn = document.getElementById('btn-toast-eco-tips');

        function dismissToast() {
            if (toastEl) {
                toastEl.classList.add('toast-dismissing');
                lastAlertState.dismissed = true;
                setTimeout(() => {
                    if (floatingAlertContainer) floatingAlertContainer.innerHTML = '';
                }, 350);
            }
        }

        if (closeBtn) closeBtn.addEventListener('click', dismissToast);
        if (dismissBtn) dismissBtn.addEventListener('click', dismissToast);

        if (ecoTipsBtn) {
            ecoTipsBtn.addEventListener('click', (e) => {
                const ecoTipsSection = document.getElementById('eco-tips');
                if (ecoTipsSection) {
                    ecoTipsSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    // =========================================================================
    // 12. Fallback State when Environmental Data is Unavailable
    // =========================================================================
    function renderUnavailableState(locationName) {
        if (locationNameEl) locationNameEl.innerHTML = `📍 ${locationName}`;
        
        const condition = {
            level: 'unavailable',
            badge: 'ℹ️ Environmental Notice',
            title: 'Environmental Data Notice',
            message: 'Environmental data is currently unavailable. Please try again later.',
            statusText: 'Unavailable',
            statusClass: 'toast-meta-val',
            icon: 'ℹ️',
            themeClass: 'env-toast-unavailable'
        };

        renderFloatingEnvironmentalAlert({
            condition,
            locationName,
            aqi: null,
            temp: null,
            pm25: null
        });
    }

    // =========================================================================
    // 13. Reverse Geocoding Helper
    // =========================================================================
    async function reverseGeocode(lat, lon) {
        try {
            const endpoint = window.ENVIORA_ENV_CONFIG.reverseGeocodeEndpoint;
            const url = `${endpoint}?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Reverse geocode failed");
            const data = await res.json();
            
            const city = data.city || data.locality || data.principalSubdivision || "Monitored Area";
            const state = data.principalSubdivision || "";
            const country = data.countryName || "";

            const parts = [city, state, country].filter(p => p && p.length > 0);
            return parts.join(', ');
        } catch (e) {
            return `Latitude ${lat.toFixed(2)}°, Longitude ${lon.toFixed(2)}°`;
        }
    }

    // =========================================================================
    // 14. Geolocation Detection (Automatic on Load & Manual Button)
    // =========================================================================
    function detectUserLocation(isManualClick = false) {
        if (!navigator.geolocation) {
            if (isManualClick) {
                alert("Geolocation is not supported by your browser. You can search any city in the search bar.");
            }
            return;
        }

        if (isManualClick && detectBtn) {
            detectBtn.disabled = true;
            detectBtn.innerHTML = `<span>Locating your area...</span>`;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const resolvedName = await reverseGeocode(lat, lon);

                currentCoords = { lat, lon, name: resolvedName };
                await loadEnvironmentalData(lat, lon, resolvedName);

                if (detectBtn) {
                    detectBtn.disabled = false;
                    detectBtn.innerHTML = `<span class="loc-ping-dot"></span><span>📍 Detect My Location</span>`;
                }
            },
            (error) => {
                console.warn("Geolocation permission or lookup:", error.message);
                if (detectBtn) {
                    detectBtn.disabled = false;
                    detectBtn.innerHTML = `<span class="loc-ping-dot"></span><span>📍 Detect My Location</span>`;
                }

                // If this was an automatic boot check, do NOT throw alert modals; seamlessly fallback to default city
                if (isManualClick) {
                    // Gracefully inform user without breaking anything
                    const condition = {
                        level: 'unavailable',
                        badge: 'ℹ️ Location Notice',
                        title: 'Location Access Notice',
                        message: 'Location access was not granted or timed out. You can enter any city or region in the search bar above.',
                        statusText: 'Manual Search Available',
                        statusClass: 'toast-meta-val',
                        icon: '📍',
                        themeClass: 'env-toast-unavailable'
                    };
                    renderFloatingEnvironmentalAlert({
                        condition,
                        locationName: currentCoords.name,
                        aqi: null,
                        temp: null,
                        pm25: null
                    });
                }
            },
            { timeout: 8000, enableHighAccuracy: false, maximumAge: 60000 }
        );
    }

    if (detectBtn) {
        detectBtn.addEventListener('click', () => detectUserLocation(true));
    }

    // =========================================================================
    // 15. Location Search with Open-Meteo Geocoding
    // =========================================================================
    let searchTimeout = null;

    if (searchInput && searchDropdown) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = searchInput.value.trim();

            if (query.length < 2) {
                searchDropdown.classList.remove('visible');
                searchDropdown.innerHTML = '';
                return;
            }

            searchTimeout = setTimeout(async () => {
                try {
                    const searchEndpoint = window.ENVIORA_ENV_CONFIG.geocodingSearchEndpoint;
                    const url = `${searchEndpoint}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
                    const res = await fetch(url);
                    const data = await res.json();

                    if (data.results && data.results.length > 0) {
                        searchDropdown.innerHTML = data.results.map(item => {
                            const locationLabel = [item.name, item.admin1, item.country].filter(Boolean).join(', ');
                            return `
                                <div class="env-search-item" data-lat="${item.latitude}" data-lon="${item.longitude}" data-name="${locationLabel}">
                                    <span>📍</span>
                                    <span>${locationLabel}</span>
                                </div>
                            `;
                        }).join('');
                        searchDropdown.classList.add('visible');

                        // Attach item click listeners
                        const items = searchDropdown.querySelectorAll('.env-search-item');
                        items.forEach(el => {
                            el.addEventListener('click', () => {
                                const lat = parseFloat(el.getAttribute('data-lat'));
                                const lon = parseFloat(el.getAttribute('data-lon'));
                                const name = el.getAttribute('data-name');

                                searchInput.value = name;
                                searchDropdown.classList.remove('visible');

                                currentCoords = { lat, lon, name };
                                loadEnvironmentalData(lat, lon, name);
                            });
                        });
                    } else {
                        searchDropdown.innerHTML = `<div class="env-search-item" style="cursor:default; color:var(--text-muted);">No locations found</div>`;
                        searchDropdown.classList.add('visible');
                    }
                } catch (e) {
                    console.error("Geocoding search failed:", e);
                }
            }, 300);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.classList.remove('visible');
            }
        });
    }

    // =========================================================================
    // 16. Quick City Pills Handlers
    // =========================================================================
    quickCityPills.forEach(pill => {
        pill.addEventListener('click', () => {
            quickCityPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const lat = parseFloat(pill.getAttribute('data-lat'));
            const lon = parseFloat(pill.getAttribute('data-lon'));
            const name = pill.getAttribute('data-name');

            currentCoords = { lat, lon, name };
            if (searchInput) searchInput.value = name;
            loadEnvironmentalData(lat, lon, name);
        });
    });

    // =========================================================================
    // 17. Initial Boot: Load Default City & Trigger Automatic Location Check
    // =========================================================================
    loadEnvironmentalData(currentCoords.lat, currentCoords.lon, currentCoords.name);
    
    // Auto-detect user's location on startup if permission is already granted or can be requested
    if (navigator.geolocation) {
        detectUserLocation(false);
    }
});
