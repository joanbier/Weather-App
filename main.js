// API Data
const myAPIKey = "3719d85055652c6fa5839298a45e7ab7";
const url = "http://api.openweathermap.org";

const searchInput = document.querySelector('[name = "city-name"]');
const cityBtn = [...document.querySelectorAll('[name = "city-btn"]')];
const mainInfo = document.querySelector(".main-info");
const hourlyWF = document.querySelector(".hourly-WF");
const dailyWF = document.querySelector(".daily-WF");
const timeInfo = document.querySelector(".time-now");

const hoursContainer = document.querySelector(".hours");
const iconsContainer = document.querySelector(".icons");
const tempContainer = document.querySelector(".temperature");

const weekdayContainer = document.querySelector(".weekday");
const iconsDailyContainer = document.querySelector(".icons-daily");
const tempDailyContainer = document.querySelector(".temp-daily");
const tempDailyNightContainer = document.querySelector(".temp-daily-night");

const detailsSection = document.querySelector(".details");

setInterval(() => {
  timeInfo.textContent = new Date().toLocaleString();
}, 1000);

// To get full weather forecast we need latitude and longitude, therefore the function below fetch the coordinates after input name of city
const fetchCoordinates = e => {
  let city = e;
  if (e.target !== undefined) {
    e.preventDefault();
    //set city variable depends on event(click or submit)
    city = e.target.value;
    if (e.target.classList.contains("search-form")) {
      city = searchInput.value;
    }
  }
  fetch(`${url}/data/2.5/weather?q=${city}&APPID=${myAPIKey}`)
    .then(response => {
      if (response.status !== 200) {
        [...hourlyWF.children].forEach(item => (item.textContent = ""));
        [...dailyWF.children].forEach(item => (item.textContent = ""));
        detailsSection.textContent = "";
        mainInfo.innerHTML = `<h2>There is not city like: ${city}</h2>`;
        throw Error(`There is not city like: ${city}`);
      } else {
        return response.json();
      }
    })
    .then(data => fetchWeather(data, city))
    .catch(err => console.log(err));
  searchInput.value = "";
};

// Now, we can download the fully weather forecast without worrying about the coordinates of the selected city
const fetchWeather = (data, city) => {
  const lat = data.coord.lat.toFixed(2);
  const lon = data.coord.lon.toFixed(2);
  fetch(
    `${url}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely&appid=${myAPIKey}`
  )
    .then(response => {
      if (response.status !== 200) {
        throw Error(`There is not city like: ${city}`);
      } else {
        return response.json();
      }
    })
    .then(data => showWeather(data, city))
    .catch(err => console.log(err));
};

//The universal function for iterating an Array and creating a list. Recommended: document.createDocumentFragment() as a parentElement
const createElements = (array, parentElement, tag = "div") => {
  array.forEach(item => {
    const newElement = document.createElement(tag);
    newElement.textContent = item;
    parentElement.appendChild(newElement);
  });
};

//Displaying all neceserry fetched data
const showWeather = (data, city) => {
  const { timezone, current, hourly, daily } = data;

  [...hourlyWF.children].forEach(item => (item.textContent = ""));
  [...dailyWF.children].forEach(item => (item.textContent = ""));

  //Basic information
  mainInfo.innerHTML = `
    <h2 class="city">${city}</h2>
    <p class="time-zone">${timezone}</p>
    <p class="weather-description">${current.weather[0].description}</p>
    <h3 class="temp">${Math.round(current.temp)}&#8451;</h3>
  `;

  //----------------NEXT SECTION---------------------------

  // Temperature for the next 5 hours

  //Hours Array
  let hour = new Date().getHours();
  const hours = [];
  for (let i = 0; i < 5; i++) {
    hour++;
    if (hour === 25) {
      hour = 1;
    }
    hours.push(hour);
  }
  //Temperature and icon Arrays
  let tempForNext5Hours = [];
  let iconArray = [];
  for (const item in hourly) {
    const temp = Math.round(hourly[item].temp) + "°C";
    const icon = hourly[item].weather[0].icon;
    tempForNext5Hours.push(temp);
    iconArray.push(icon);
  }
  tempForNext5Hours = tempForNext5Hours.slice(0, 5);
  iconArray = iconArray.slice(0, 5);

  //Creating Parent elements
  const fragmentIcons = document.createDocumentFragment();
  const fragmentTime = document.createDocumentFragment();
  const fragmentHoursTemp = document.createDocumentFragment();

  // Creating Icons List
  iconArray.forEach(item => {
    const newElement = document.createElement("img");
    newElement.src = `http://openweathermap.org/img/w/${item}.png`;
    fragmentIcons.appendChild(newElement);
  });
  // Creating Hours and Temp List
  createElements(tempForNext5Hours, fragmentHoursTemp);
  createElements(hours, fragmentTime);

  hoursContainer.appendChild(fragmentTime);
  tempContainer.appendChild(fragmentHoursTemp);
  iconsContainer.appendChild(fragmentIcons);

  //----------------NEXT SECTION---------------------------

  //Daily Weather Forecast

  //Setting day of a week
  let DayNow = new Date().getDay();
  const weekdayInNumber = [];
  const weekdayList = [];
  let counter = 0;

  do {
    DayNow++;
    if (DayNow === 7) DayNow = 0;
    weekdayInNumber.push(DayNow);
    counter++;
  } while (counter < 8);

  weekdayInNumber.forEach(item => {
    switch (item) {
      case 0:
        weekdayList.push("Sunday");
        break;
      case 1:
        weekdayList.push("Monday");
        break;
      case 2:
        weekdayList.push("Tuesday");
        break;
      case 3:
        weekdayList.push("Wednesday");
        break;
      case 4:
        weekdayList.push("Thursday");
        break;
      case 5:
        weekdayList.push("Friday");
        break;
      case 6:
        weekdayList.push("Saturday");
        break;
      default:
        console.log("not a day");
    }
  });

  const fragmentWeekday = document.createDocumentFragment();
  createElements(weekdayList, fragmentWeekday);
  weekdayContainer.appendChild(fragmentWeekday);

  //Temperature and icon Arrays
  let tempForNext7Days = [];
  let tempForNext7DaysNight = [];
  let iconArray7Days = [];
  for (const item in daily) {
    const temp = Math.round(daily[item].temp.day) + "°C";
    const tempNight = Math.round(daily[item].temp.night) + "°C";
    const icon = daily[item].weather[0].icon;
    tempForNext7Days.push(temp);
    tempForNext7DaysNight.push(tempNight);
    iconArray7Days.push(icon);
  }

  //Creating Parent elements
  const fragmentDailyTemp = document.createDocumentFragment();
  const fragmentDailyTempNight = document.createDocumentFragment();
  const fragmentIcons7Days = document.createDocumentFragment();

  // Creating Icons List
  iconArray7Days.forEach(item => {
    const newElement = document.createElement("img");
    newElement.src = `http://openweathermap.org/img/w/${item}.png`;
    fragmentIcons7Days.appendChild(newElement);
  });

  createElements(tempForNext7Days, fragmentDailyTemp);
  createElements(tempForNext7DaysNight, fragmentDailyTempNight);

  tempDailyContainer.appendChild(fragmentDailyTemp);
  tempDailyNightContainer.appendChild(fragmentDailyTempNight);
  iconsDailyContainer.appendChild(fragmentIcons7Days);

  //----------------NEXT SECTION---------------------------

  //Today Detailes

  const {
    clouds,
    feels_like,
    humidity,
    pressure,
    sunrise,
    sunset,
    uvi,
    wind_speed
  } = current;

  const sunriseTime = new Date(sunrise * 1000).toLocaleTimeString().slice(0, 5);

  const sunsetTime = new Date(sunset * 1000).toLocaleTimeString().slice(0, 5);

  detailsSection.innerHTML = ` 
  <table>
  <tr>
      <th>Sunrise</th>
      <th>Sunset</th>
  </tr>
  <tr>
      <td>${sunriseTime}</td>
      <td>${sunsetTime}</td>
  </tr>
  <tr>
      <th>Humidity</th>
      <th>Pressure</th>
  </tr>
  <tr>
      <td>${humidity}%</td>
      <td>${pressure} hPa</td>
  </tr>
  <tr>
      <th>Wind</th>
      <th>Feels Like</th>
  </tr>
  <tr>
      <td>${wind_speed.toFixed(1)} m/s</td>
      <td>${Math.round(feels_like)}&#8451;</td>
  </tr>
  <tr>
      <th>Clouds</th>
      <th>UV Index</th>
  </tr>
  <tr>
      <td>${clouds}%</td>
      <td>${uvi.toFixed(1)}</td>
  </tr>
</table>`;

  //Setting backgorund-image depending on weather description
  const description = current.weather[0].main;
  const bcg = document.querySelector(".background-wrapper");
  switch (description) {
    case "Clear":
      bcg.style.backgroundImage = "url(./backgrounds-image/clear.gif)";
      break;
    case "Mist":
      bcg.style.backgroundImage = "url(./backgrounds-image/fog.gif)";
      break;
    case "Rain":
      bcg.style.backgroundImage = "url(./backgrounds-image/rain.gif)";
      break;
    case "Drizzle":
      bcg.style.backgroundImage = "url(./backgrounds-image/rain.gif)";
      break;
    case "Thunderstorm":
      bcg.style.backgroundImage = "url(./backgrounds-image/thunderstorm.gif)";
      break;
    case "Snow":
      bcg.style.backgroundImage = "url(./backgrounds-image/snow.gif)";
      break;
    default:
      bcg.style.backgroundImage = "url(./backgrounds-image/clouds.gif)";
  }
};

document.querySelector(
  "footer"
).innerHTML = `<p>&copy; ${new Date().getFullYear()} Copyright: Joanna Biernat</p>`;

//Events for buttons and input
document
  .querySelector(".search-form")
  .addEventListener("submit", fetchCoordinates);
cityBtn.forEach(item => item.addEventListener("click", fetchCoordinates));

fetchCoordinates("Warsaw");
