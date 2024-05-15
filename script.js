// API key for OpenWeatherMap API
var APIKey = "a836acbd536c6ec3b05d3d1fcc35d97f";

// Variables for city data
var lastCitySearched; // Stores the last searched city
var storedCities; // Stores the list of cities in local storage
var cities = []; // Array to store cities

// Check if cities are stored in local storage
if (localStorage.getItem("cities")) {
    storedCities = JSON.parse(localStorage.getItem("cities")); // Retrieve stored cities
    lastCitySearched = storedCities[storedCities.length - 1]; // Get the last searched city
} else {
    cities; // Initialize cities array if local storage is empty
}
renderLastCityInfo(); // Render information for the last searched city

// Event listener for clicking on search button
$("#search-city").on("click", function (event) {
    event.preventDefault();
    var city = $("#city-input").val().trim(); // Get the value of the city input
    var queryURL1 = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey; // Construct the query URL for weather data

    // AJAX request to fetch weather data for the input city
    $.ajax({
        url: queryURL1,
        method: "GET",
    }).then(function (response) {
        lat = response.coord.lat;
        lon = response.coord.lon;

        cities.push(city); // Add the input city to the cities array
        localStorage.setItem("cities", JSON.stringify(cities)); // Store the cities array in local storage

        var cityItem = $("<li>");
        cityItem.addClass("list-group-item city-item");
        cityItem.text(response.name);
        cityItem.attr("lat", response.coord.lat);
        cityItem.attr("lon", response.coord.lon);
        $("#city-list").prepend(cityItem);

        cityItem.on("click", function () {
            lat = $(this).attr("lat");
            lon = $(this).attr("lon");
            renderCityName(response);
            renderCityInfo(lat, lon);
        });
        renderCityName(response); // Render city name and current date
        renderCityInfo(lat, lon); // Render weather information for the city
    });
});

// Function to render weather information for the last searched city
function renderLastCityInfo() {
    var queryURL1 = "https://api.openweathermap.org/data/2.5/weather?q=" + lastCitySearched + "&appid=" + APIKey; // Construct the query URL for last searched city

    // AJAX request to fetch weather data for the last searched city
    $.ajax({
        url: queryURL1,
        method: "GET",
    }).then(function (response) {
        lat = response.coord.lat;
        lon = response.coord.lon;

        renderCityName(response); // Render city name and current date
        renderCityInfo(lat, lon); // Render weather information for the city
    });
}

// Function to render the city name and current date
function renderCityName(response) {
    var currentDate = moment().format("L"); // Get current date
    $(".card-title").text(`${response.name} (${currentDate})`); // Render city name and current date
    var weatherIcon = $("<img>");
    var iconCode = response.weather[0].icon;
    var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + ".png";
    weatherIcon.attr("src", iconUrl);
    $(".card-title").append(weatherIcon); // Render weather icon
}

// Function to render weather information for the city
function renderCityInfo(lat, lon) {
    var queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + APIKey; // Construct the query URL for city weather

    // AJAX request to fetch weather data for the city
    $.ajax({
        url: queryURL2,
        method: "GET",
    }).then(function (response) {
        // Render temperature, humidity, wind speed, and UV index
        $("#temperature").text(`Temperature: ${response.current.temp} \xB0F`);
        $("#humidity").text(`Humidity: ${response.current.humidity}%`);
        $("#wind-speed").text(`Wind Speed: ${response.current.wind_speed} MPH`);
        $("#uv-index").text(`UV Index: `);

        // Render UV index badge with appropriate color based on severity
        var uviSpan = $("<span>");
        uviSpan.text(`${response.current.uvi}`);
        var uvi = response.current.uvi;
        if (uvi <= 2) {
            uviSpan.addClass("badge badge-success"); // Favorable UV index
        } else if (uvi <= 5) {
            uviSpan.addClass("badge badge-warning"); // Moderate UV index
        } else if (uvi <= 7) {
            uviSpan.addClass("badge");
            uviSpan.css("background-color", "orange");
        } else if (uvi <= 9) {
            uviSpan.addClass("badge badge-danger"); // Severe UV index
        } else {
            uviSpan.addClass("badge");
            uviSpan.css("background-color", "purple");
            uviSpan.css("color", "white");
        }
        $("#uv-index").append(uviSpan);

        renderForecast(response); // Render 5-day forecast
    });
}

// Function to render the 5-day forecast
function renderForecast(response) {
    $("#forecast").empty(); // Clear previous forecast
    var days = response.daily;
    // Render each day's forecast
    days.slice(1, 6).map((day) => {
        var dayCard = $("<div>");
        dayCard.addClass("card col-md-4 daycard");
        dayCard.css("background-color", "lightblue");
        dayCard.css("margin-right", "5px");
        dayCard.css("font-size", "15px");

        var dayCardBody = $("<div>");
        dayCardBody.addClass("card-body");
        dayCard.append(dayCardBody);

        var dayCardName = $("<h6>");
        dayCardName.addClass("card-title");
        var datestamp = moment.unix(day.dt);
        var forecastDate = datestamp.format("L");
        dayCardName.text(forecastDate);
        dayCardBody.append(dayCardName);

        var weatherIcon = $("<img>");
        var iconCode = day.weather[0].icon;
        var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + ".png";
        weatherIcon.attr("src", iconUrl);
        dayCardBody.append(weatherIcon);

        var dayTemp = $("<p>");
        dayTemp.text(`Temp: ${day.temp.max} \xB0F`);
        dayCardBody.append(dayTemp);

        var dayHumidity = $("<p>");
        dayHumidity.text(`Humidity: ${day.humidity}%`);
        dayCardBody.append(dayHumidity);

        $("#forecast").append(dayCard); // Append the day's forecast to the forecast container
    });
}
