import type {ForecastPeriod} from './weather'
import {print} from './global_util'
function fInclude(forecast, weather: string) {return forecast.includes(weather)}

function getWeather(data: ForecastPeriod, input: string) {
    const forecast = data.shortForecast.toLowerCase();
    input = input.toLowerCase();
    const rain = input === "rain"; const sunny = input === "sunny"; const cloudy = input === "cloudy"; const snow = input === "snow";

    if (!(rain || sunny || cloudy || snow)) return print("getWeather requires a valid weather pattern");
    
    return (snow && fInclude(forecast, "frost") || fInclude(forecast, "snow")) || //Snow
           (cloudy && fInclude(forecast, "cloudy")) || //Clouds
           (sunny && fInclude(forecast, "sunny")) || //Sun
           (rain && fInclude(forecast, "rain") || fInclude(forecast, "thunderstorms") || fInclude(forecast, "showers")); //Rain
}

export function determineColor(minClamp: number, maxClamp: number, data: ForecastPeriod, maxTemp: number) {
    const rain = getWeather(data, "rain"); const sunny = getWeather(data, "sunny"); 
    const cloudy = getWeather(data, "cloudy"); const snow = getWeather(data, "snow");
    
    const coldTemp = 40; const hotTemp = 70;
    
    const temp = data.temperature;
    const hot = temp >= hotTemp && !rain; //If temp >= hotTemp and it's not raining be hot.
    const cold = (temp <= coldTemp || (rain || snow)) && !sunny; 
    //If temp is <= coldTemp or it's raining or snowing and it's not sunny be cold.
    const moderate = (sunny || cloudy) && temp > coldTemp && temp < hotTemp; 
    //If sunny or cloudy and the temp is higher than cold temp and lower than cold temp, it's moderate.

    const maxFormula = maxTemp * (maxClamp - (temp/maxTemp)); //max temp multiplied by maxClamp subtracted by temp/maxtemp
    const minFormula = maxTemp * (minClamp + (temp/maxTemp)); //max temp multiplied by minClamp added by temp/maxtemp

    return  (hot && `rgb(${minFormula}, 0, 0)`) || 
                //Red RGB scale, triggered by hot.
            (cold && `rgb(0, 128, ${maxFormula})`) ||  
                //Blue RGB scale, triggered by cold.
            (moderate && `rgb(${minFormula / 
                //Min formula divided by the min + max clamp and the max formula divided by max temp, moderate.
            ((minClamp + maxClamp) + (maxFormula / maxTemp))}, ${minFormula}, 0)`) || 
                //Use min formula for green.
            (`rgb(0, ${maxFormula}, 0)`); 
                //Max formula for green, fallback.
}

export function addHSL(data: ForecastPeriod) {
    const rain = getWeather(data, "rain"); const sunny = getWeather(data, "sunny"); 
    const cloudy = getWeather(data, "cloudy"); const snow = getWeather(data, "snow");
    
    const coldTemp = 40; const hotTemp = 70;
    const red = 0; const blue = 240; const yellow = 60; const green = 90;
    const temp = data.temperature;
    
    const hot = (temp >= hotTemp && !rain) && red || red;
    const cold = ((temp <= coldTemp || (rain || snow)) && !sunny) && blue || red;
    const moderate = ((sunny || cloudy) && temp > coldTemp && temp < hotTemp) && yellow || red;
    
    return hot || cold || moderate || green; //Hot (Red) or Cold (Blue) or Moderate (Yellow) or Median (green).
}

export function determineHSL(divisor: number, colorValue: number) {
    const bgColor = document.documentElement.style;
    bgColor.setProperty("--bgcolor", `${colorValue / divisor}`);
}