export type ForecastPeriod = {
    number : number,
    name : string,
    startTime : string,
    endTime : string,
    isDaytime : boolean,
    temperature: number,
    temperatureUnit : 'F'|'C',
    windSpeed : string,
    windDirection : 'S'|'N'|'E'|'W'|'SE'|'SW'|'NE'|'NW',
    icon : string,
    shortForecsat : string,
    detailedForecast : string,
}

export type ForecastResponse = {
    properties : {
        periods : ForecastPeriod[]
    }
}

//Types for convenience.