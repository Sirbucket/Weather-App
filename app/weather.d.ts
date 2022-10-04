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
    shortForecast : string,
    detailedForecast : string,
    length : number,
}

export type ForecastResponse = {
    properties : {
        periods : ForecastPeriod[]
    }
}
//Types for convenience.