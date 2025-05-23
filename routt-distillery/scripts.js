// Cookie Consent Manager
const CookieConsent = {
    consent: localStorage.getItem('cookieConsent') || null,
    setConsent(value) {
        this.consent = value;
        localStorage.setItem('cookieConsent', value);
        document.getElementById('cookie-banner').classList.add('hidden');
        if (value === 'all') {
            this.loadAnalytics();
        }
        ClosureManager.check();
    },
    init() {
        if (this.consent) {
            document.getElementById('cookie-banner').classList.add('hidden');
            if (this.consent === 'all') {
                this.loadAnalytics();
            }
            ClosureManager.check();
        }
    },
    loadAnalytics() {
        if (!window.gtag) {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=G-JD6YPJWYY6';
            document.head.appendChild(script);

            script.onload = () => {
                window.dataLayer = window.dataLayer || [];
                function gtag() { dataLayer.push(arguments); }
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', 'G-JD6YPJWYY6', { 'anonymize_ip': true });
            };
        }
    }
};

function acceptAllCookies() {
    CookieConsent.setConsent('all');
}

function acceptNecessaryCookies() {
    CookieConsent.setConsent('necessary');
}

function declineCookies() {
    CookieConsent.setConsent('declined');
}

// Closure Manager with Google Sheets Integration
const ClosureManager = {
    apiKey: 'AIzaSyDPe8RLxF1IGKJp4S1tVdX2U3gU8xa4av4',
    sheetId: '1tk8ASOFtc2M6rHsd8bU9GwIjBsuQ2uJb2ja_x-N_7oQ',
    range: 'Sheet1!A2:C',
    cacheTTL: 60 * 60 * 1000,

    check() {
        const cachedData = localStorage.getItem('closureData');
        const cacheTime = localStorage.getItem('closureCacheTime');
        const now = Date.now();

        if (cachedData && cacheTime && (now - cacheTime < this.cacheTTL)) {
            this.processData(JSON.parse(cachedData));
        } else {
            this.fetchData();
        }
    },

    fetchData() {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.range}?key=${this.apiKey}`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem('closureData', JSON.stringify(data));
                localStorage.setItem('closureCacheTime', Date.now());
                this.processData(data);
            })
            .catch(error => {
                console.error('Error fetching closure data:', error);
                const closureMessage = document.getElementById('closure-message');
                closureMessage.textContent = 'Unable to check closure status at this time. Please call us at 970.367.7477.';
                document.getElementById('closure-splash').classList.remove('hidden');
            });
    },

    processData(data) {
        const today = new Date();
        const closureSplash = document.getElementById('closure-splash');
        const closureMessage = document.getElementById('closure-message');
        let closureFound = false;

        if (data.values && data.values.length > 0) {
            data.values.forEach(row => {
                const startDate = new Date(row[0]);
                const endDate = new Date(row[1]);
                const nextOpenDate = new Date(row[2]);

                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(nextOpenDate.getTime())) {
                    console.warn(`Invalid date in row: ${row}`);
                    return;
                }

                if (today >= startDate && today <= endDate) {
                    const dateRange = startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0]
                        ? startDate.toLocaleDateString()
                        : `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
                    const options = { weekday: 'long', month: 'long', day: 'numeric' };
                    const nextOpenFormatted = nextOpenDate.toLocaleDateString('en-US', options).replace(/\d+$/, num => {
                        const n = parseInt(num);
                        const s = ['th', 'st', 'nd', 'rd'];
                        const v = n % 100;
                        return n + (s[(v - 20) % 10] || s[v] || s[0]);
                    });
                    closureMessage.textContent = `Sorry, we will be closed ${dateRange}. We will next be open on ${nextOpenFormatted}. Hope to see you then!`;
                    closureSplash.classList.remove('hidden');
                    closureFound = true;
                }
            });
        }

        if (!closureFound) {
            closureSplash.classList.add('hidden');
        }
    }
};

function closeClosure() {
    document.getElementById('closure-splash').classList.add('hidden');
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Dynamic Year in Footer
function setCurrentYear() {
    document.getElementById('current-year').textContent = new Date().getFullYear();
}

// Initialize Everything on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    CookieConsent.init();
    initSmoothScrolling();
    setCurrentYear();
});