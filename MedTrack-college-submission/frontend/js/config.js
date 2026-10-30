// MedTrack Frontend API Configuration
// Local development uses Flask on port 5000; production uses Railway.
const CONFIG = {
    API_BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:5000'
        : 'https://medtrack-customer-production-13a3.up.railway.app'
};
