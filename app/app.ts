import type {ForecastPeriod, ForecastResponse} from './weather';
import {itemTemplate, customErrorMessages, errormsg} from './globals';
import {returnError, clearContent, modifyTextContent, modifyParent, print, toJson} from './global_util';
import {determineColor, addHSL, determineHSL} from './colors';

async function getWeatherWithGeolocation(position) {
    const content: HTMLElement = document.querySelector(".weatherprint");
    const forecastData: ForecastPeriod = await returnWeatherData(position.coords.latitude, position.coords.longitude)
    addWeather(forecastData, content)
    return print("Local weather access successful!")
}

async function getWeatherData (lat: number, lon: number) {
    try {
        var gridResponse: Response = await fetch(`https://api.weather.gov/points/${lat},${lon}`);   
    } catch(err) {
        return returnError(customErrorMessages.validityError);
    } try {
        var gridJson = await toJson(gridResponse);
    } catch(err) {
        return returnError(err);
    } try {
        var forecastURL = gridJson.properties.forecast;
    } catch(err) {
        return returnError(customErrorMessages.validityError);
    } try {
        var forecastResponse: Response = await fetch(forecastURL);
    } catch(err) {
        return returnError(err);
    } try {
        var forecastJson = await toJson(forecastResponse);   
    } catch(err) {
        return returnError(err);
    } try {
        const forecastData = forecastJson.properties.periods;
        return forecastData; //Bring data out of function into context.
    } catch(err) {
        return returnError(customErrorMessages.validityError);
    }
}

async function returnWeatherData(lat: number, lon: number) {
    try {
        const forecastData = await getWeatherData(lat, lon);//Request weather data.   
        return forecastData
    } catch(err) {
        return print(err)
    }
}

function addWeather(data: ForecastPeriod, content: HTMLElement) {
    if (data[0].name === undefined) return returnError(customErrorMessages.validityError);
    
    const steps = 2; //Jump by 2 to skip alternative time, jump by 1 to print all weather.
    const length = data.length - 1; //Number of datapoints.
    
    let clone: Node, 
        newClone: HTMLElement, 
        newContent: HTMLElement, //Do not recreate variables, it chugs performance. 
        info: ForecastPeriod, 
        bgColor: string;
    
    let colorValue: number = 0;

    const minClamp = 0.5; const maxClamp = 1; const maxTemp = 255;

    const fragment: DocumentFragment = document.createDocumentFragment();
    
    clearContent(content); //Make sure data cleans itself up.
    clearContent(errormsg);
    
    for (let i: number = 0; i < length; i += steps) { 
        clone = itemTemplate.cloneNode(true); 
        newClone = clone.content.querySelector(".weatheritem"); 
        newContent = newClone.querySelector(".weather"); //Create clone
        
        info = data[i]; 
        
        bgColor = determineColor(minClamp, maxClamp, info, maxTemp); 
        colorValue += addHSL(info); //Colors

        modifyTextContent(newContent, `
            ${info.name}: 
            ${info.shortForecast}
            ${info.temperature}
            ${info.temperatureUnit}
        `); //Add data from forecast to clone'd objects textContent.
        
        newContent.style.backgroundColor = bgColor; //Background color styled to temperature with a wonderful scaling gradiant.
        modifyParent(fragment, newContent); //Append to fragment for micro boost in client side snappiness.
    }

    determineHSL(length / steps, colorValue); //Change CSS color.
    modifyParent(content, fragment); //Append the fragment so dom shift only happens one time.
}

function setupButtons() {
    const addButton: HTMLButtonElement = document.querySelector(".new-weather .submit");
    const localButton: HTMLButtonElement = document.querySelector(".new-weather .local")
    const latInput: HTMLInputElement = document.querySelector(".new-weather .lat");
    const lonInput: HTMLInputElement = document.querySelector(".new-weather .lon");
    const content: HTMLElement = document.querySelector(".weatherprint"); //Setup all buttons and inputs.

    addButton.addEventListener("click", async () => { //Async to ensure data is got before textContent needs to run.
        const lat: number = Number(latInput.value);
        const lon: number = Number(lonInput.value);

        if (!(lat || lon)) return returnError(customErrorMessages.validityError);
        //If our do not contain a number then give this value.

        const forecastData: ForecastPeriod = await returnWeatherData(lat, lon);      
        addWeather(forecastData, content); //Add data to screen.
        
        latInput.value = ''; //Empty boxes, note lat and lon are variables that store the old data, not the object.
        lonInput.value = '';
    });

    localButton.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getWeatherWithGeolocation)
        }
    });
}

setupButtons(); //Run code.