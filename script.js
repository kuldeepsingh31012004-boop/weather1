// OpenWeatherMap API configuration
const apiKey = '9f3ddd28b92c25f88afa96012090f973'; // आपकी API Key यहाँ सेट कर दी गई है

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');

const cityName = document.getElementById('city-name');
const dateTime = document.getElementById('date-time');
const mainTemp = document.getElementById('main-temp');
const weatherDesc = document.getElementById('weather-desc');
const weatherIcon = document.getElementById('weather-icon');

const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const visibility = document.getElementById('visibility');
const clouds = document.getElementById('clouds');
const pressure = document.getElementById('pressure');

const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');

// Date & Time Formatter
function updateDateTime(timezoneOffset) {
    const d = new Date();
    const localTime = d.getTime() + (d.getTimezoneOffset() * 60000);
    const targetTime = new Date(localTime + (1000 * timezoneOffset));
    
    const options = { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: true };
    dateTime.innerText = targetTime.toLocaleString('en-US', options);
}

// Format Unix Timestamp to readable time (AM/PM)
function formatTime(unixTimestamp, timezoneOffset) {
    let hours = new Date(unixTimestamp * 1000).getUTCHours() + (timezoneOffset / 3600);
    if(hours >= 24) hours -= 24;
    if(hours < 0) hours += 24;
    
    const minutes = "0" + new Date(unixTimestamp * 1000).getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    let displayHours = hours % 12;
    displayHours = displayHours ? displayHours : 12;
    
    return `${String(Math.floor(displayHours)).padStart(2, '0')}:${minutes.substr(-2)} ${ampm}`;
}

// Fetch weather data from API
async function getWeather(query) {
    if (!query) return;

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&units=metric&appid=${apiKey}`);
        
        if (!response.ok) {
            if(response.status === 401) {
                throw new Error('Invalid API Key! कृपया जांचें कि की सही है या नहीं, या इसके एक्टिव होने का थोड़ा इंतज़ार करें।');
            }
            if(response.status === 404) {
                throw new Error('City not found! कृपया शहर के नाम की स्पेलिंग सही टाइप करें।');
            }
            throw new Error('Weather डेटा लोड करने में समस्या आ रही है।');
        }
        
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        alert(error.message);
    }
}

// Update the UI Dashboard elements with fetched data
function updateUI(data) {
    cityName.innerText = `${data.name}, ${data.sys.country}`;
    mainTemp.innerText = Math.round(data.main.temp);
    weatherDesc.innerText = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    feelsLike.innerText = Math.round(data.main.feels_like);
    humidity.innerText = data.main.humidity;
    windSpeed.innerText = data.wind.speed;
    visibility.innerText = (data.visibility / 1000).toFixed(0); 
    clouds.innerText = data.clouds.all;
    pressure.innerText = data.main.pressure;
    
    updateDateTime(data.timezone);
    sunrise.innerText = formatTime(data.sys.sunrise, data.timezone);
    sunset.innerText = formatTime(data.sys.sunset, data.timezone);
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    getWeather(`q=${cityInput.value.trim()}`);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather(`q=${cityInput.value.trim()}`);
    }
});

// Current Location (GPS Button)
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeather(`lat=${lat}&lon=${lon}`);
        }, (error) => {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    alert("लोकेशन एक्सेस डिनाइड! कृपया ब्राउज़र के एड्रेस बार (URL bar) में लगे लॉक आइकॉन पर क्लिक करके Location Allow करें।");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("लोकेशन की जानकारी उपलब्ध नहीं है।");
                    break;
                case error.TIMEOUT:
                    alert("लोकेशन रिक्वेस्ट टाइमआउट हो गई।");
                    break;
                default:
                    alert("लोकेशन ढूंढने में कोई समस्या आई।");
            }
        });
    } else {
        alert("यह ब्राउज़र Geolocation सपोर्ट नहीं करता है।");
    }
});

// Load a default city on startup
window.addEventListener('load', () => {
    getWeather('q=New Delhi'); 
});