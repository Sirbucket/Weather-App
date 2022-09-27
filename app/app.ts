import type {ForecastPeriod, ForecastResponse} from './weather';
const itemTemplate = document.querySelector("#weatheritem"); //assign this.

async function getWeatherData (lat: number, lon: number) {
    const gridResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
    const gridJson = await gridResponse.json();
    const forecastURL = gridJson.properties.forecast;
    const forecastResponse = await fetch(forecastURL);
    const forecastJson = await forecastResponse.json();
    const forecastData = forecastJson.properties.periods;

    console.log('Forecast is:', forecastData); //Log for more interested users in console.
    
    return forecastData //Bring data out of function into context.
}

function addWeather(data: ForecastPeriod, content: HTMLElement) {
    const fragment: DocumentFragment = document.createDocumentFragment();
    
    content.textContent = ""; //Make sure data cleans itself up.
    
    for (let i: number = 0; i < 14; ++i) { //Only gives 14 data points anyway.
        const clone = itemTemplate.cloneNode(true);
        const newClone = clone.content.querySelector(".weatheritem");
        const newcontent = newClone.querySelector(".weather"); //Create clone
        newcontent.textContent = `
            ${data[i].name}: 
            ${data[i].shortForecast}
            ${data[i].temperature}
            ${data[i].temperatureUnit}
        `; //Add data from forecast to clone'd objects textContent.
        
        fragment.appendChild(newcontent); //Append to fragment for micro boost in client side snappiness.
    }

    console.log("Displayed data!") //Action complete.
    
    content.appendChild(fragment); //Append the fragment so dom shift only happens one time.
}

function setupButtons() {
    const addButton: HTMLButtonElement = document.querySelector(".new-weather .submit");
    const iacsButton: HTMLButtonElement = document.querySelector(".new-weather .iacs")
    const latInput: HTMLElement = document.querySelector(".new-weather .lat");
    const lonInput: HTMLElement = document.querySelector(".new-weather .lon");
    const content: HTMLElement = document.querySelector(".weatherprint"); //Setup all buttons and inputs.
    const errormsg: HTMLElement = document.querySelector(".error .errormsg");
    
    addButton.addEventListener("click", async () => { //Async to ensure data is got before textContent needs to run.
        if ((latInput.value || lonInput.value) === '' || !(Number(latInput.value || lonInput.value))) {
            return errormsg.textContent = "Please give a valid longitude and latitude!";
        } //If our boxes are blank or do not contain a number (e) then give this value.
        errormsg.textContent = "";
        const lat: number = Number(latInput.value);
        const lon: number = Number(lonInput.value);

        const forecastData = await getWeatherData(lat, lon);//Request weather data.
        
        addWeather(forecastData, content); //Add data to screen.
        
        latInput.value = ''; //Empty boxes.
        lonInput.value = '';
    });

    iacsButton.addEventListener("click", async () => {
        errormsg.textContent = ""
        const forecastData = await getWeatherData(42.6589, -71.4103); //IACS specific, if this were a real webapp this button wouldn't exist.
        addWeather(forecastData, content);
    });
}

setupButtons(); //Run code.