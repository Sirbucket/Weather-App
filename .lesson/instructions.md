# Instructions  

You will build a basic weather app.

To get started, you can fetch weather for the school. Our latitude and longitude is: 42.6589194,-71.4103709

We will use the National Weather Service's free API, which is documented here:

[https://www.weather.gov/documentation/services-web-api](https://www.weather.gov/documentation/services-web-api)

The basic idea of an API call is that we make a request to a particular URL on the web and instead of getting a webpage back, we get back data, usually in the form of JSON (basically a big object or list in JavaScript).

The way the weather service works is it breaks areas into a grid, each of which has its own forecast.

In order to get the forecast, we first need to know which "grid square" we belong to, which we might get from a latitude and longitude, as follows.

## My First API Call: Moving from our Latitude and Longitude to a Grid

To go from a latitude and longitude to the grid, we have to hit the following endpoint:

`https://api.weather.gov/points/{latitude},{longitude}`

We can try that out by typing it directly into a browser window like this:

[https://api.weather.gov/points/42.6589194,-71.4103709](https://api.weather.gov/points/42.6589194,-71.4103709)

Visiting that page will give you a big dump of information in the form of JSON (basically, a big JavaScript object), like this:

```json
{
    "@context": [
        "https://geojson.org/geojson-ld/geojson-context.jsonld",
        {
            "@version": "1.1",
            "wx": "https://api.weather.gov/ontology#",
            "s": "https://schema.org/",
            "geo": "http://www.opengis.net/ont/geosparql#",
            "unit": "http://codes.wmo.int/common/unit/",
            "@vocab": "https://api.weather.gov/ontology#",
            "geometry": {
                "@id": "s:GeoCoordinates",
                "@type": "geo:wktLiteral"
            },
            "city": "s:addressLocality",
            "state": "s:addressRegion",
            "distance": {
                "@id": "s:Distance",
                "@type": "s:QuantitativeValue"
            },
            "bearing": {
                "@type": "s:QuantitativeValue"
            },
            "value": {
                "@id": "s:value"
            },
            "unitCode": {
                "@id": "s:unitCode",
                "@type": "@id"
            },
            "forecastOffice": {
                "@type": "@id"
            },
            "forecastGridData": {
                "@type": "@id"
            },
            "publicZone": {
                "@type": "@id"
            },
            "county": {
                "@type": "@id"
            }
        }
    ],
    "id": "https://api.weather.gov/points/42.6589,-71.4104",
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [
            -71.410399999999996,
            42.658900000000003
        ]
    },
    "properties": {
        "@id": "https://api.weather.gov/points/42.6589,-71.4104",
        "@type": "wx:Point",
        "cwa": "BOX",
        "forecastOffice": "https://api.weather.gov/offices/BOX",
        "gridId": "BOX",
        "gridX": 57,
        "gridY": 101,
        "forecast": "https://api.weather.gov/gridpoints/BOX/57,101/forecast",
        "forecastHourly": "https://api.weather.gov/gridpoints/BOX/57,101/forecast/hourly",
        "forecastGridData": "https://api.weather.gov/gridpoints/BOX/57,101",
        "observationStations": "https://api.weather.gov/gridpoints/BOX/57,101/stations",
        "relativeLocation": {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -71.321140999999997,
                    42.638979900000002
                ]
            },
            "properties": {
                "city": "Lowell",
                "state": "MA",
                "distance": {
                    "unitCode": "wmoUnit:m",
                    "value": 7628.7852625690002
                },
                "bearing": {
                    "unitCode": "wmoUnit:degree_(angle)",
                    "value": 286
                }
            }
        },
        "forecastZone": "https://api.weather.gov/zones/forecast/MAZ005",
        "county": "https://api.weather.gov/zones/county/MAC017",
        "fireWeatherZone": "https://api.weather.gov/zones/fire/MAZ005",
        "timeZone": "America/New_York",
        "radarStation": "KBOX"
    }
}
```

If we look at that data, we'll notice it's kind enough to give us the URLs for various forecasts, which we can use to make our *second API call* to get the actual forecast:

Let's see what data from a forecast looks like:
[https://api.weather.gov/gridpoints/BOX/57,101/forecast](https://api.weather.gov/gridpoints/BOX/57,101/forecast)

## But what about JavaScript?

Oh right, this is a JavaScript class :) Hitting webpages to get data in hard-to-read formats is not the point, is it?

Let's use JavaScript to do the same thing we just did by hand.

When we make API calls, we're doing what's called *asynchronous* programming, because the browser doesn't know how long it's going to take to fetch some data from another website, and while we're busy fetching data, we don't want our whole web browser to be frozen.

The way asynchronous programming works is essentially that we use callbacks, which should be familiar to you from event handlers. You say something like this:

**Hey browser, fetch this website, and when it's done, call a function.**

The "raw" way to do this looks like this (the below is how JavaScript programs looked for many years before the methods I'll show you below were introduced):

```javascript
fetch('https://api.weather.gov/gridpoints/BOX/57,101/forecast').then(
  function (response) {
    // Do something with the response object...
  }
);
```

### The Miracle of Async!

When we only have one layer of asynchronous programming, this isn't so bad, but in practice, we have *many* layers, because in addition to fetching websites, parsing the data (asking the browser for JSON from the response) is also asynchronous since a webpage could be large and take several seconds to parse. And of course, we often have to make many API calls in a row in order to get our data (for example, we might first convert a city to lattitude and longitude coordinates via one API, then convert those coordinates to the NWS grid via another, then grab the forecast via a third API call).

Luckily, JavaScript supports a special kind of *asynchronous* function which lets us write asynchronous programs as if they were synchronous

An asynchronous function can look like this:
```javascript
async function getWeatherData () {
  let response = await fetch('https://api.weather.gov/gridpoints/BOX/57,101/forecast');
  let json = await response.json();
  console.log('Got json',json);
}
```

Go ahead and try adding that code to your project to see if you can see the json logged in the console (you'll have to call the function to see it).

A more complicated asynchronous function would *begin* with the Latitude and Longitude, then fetch the weather data, and then display it, like this:

```javascript
async function getWeatherData (lat, lon) {
  let gridResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
  let gridJson = await gridResponse.json();
  let forecastURL = gridJson.properties.forecast;
  let forecastResponse = await fetch(forecastURL);
  let forecastJson = await forecastResponse.json();
  let forecastData = forecastJson.properties.periods;
  console.log('Forecast is:',forecastJson.properties.periods);
}
```

Note: production code would be much longer because you would have to include if statements and try/catch statements  to handle errors at any of those stages, since an API might be down or give you unexpected data.

## TypeScript and JSON Data

One thing that you've probably noticed already is that dealing with big nested JSON objects is quite a pain. If I wanted to get the description of the weather for the first forecasted period, for example, I would need to do something like:

```typescript
forecastJson.properties.periods[0].description
```

Remembering how to type all of that is quite a challenge.

One approach to dealing with an API is to create a JavaScript *type* which matches the *schema* the API provides. In other words, you can tell your text editor what kind of data JavaScript expects.

You can see what a forecast API response looks like [here](https://www.weather.gov/documentation/services-web-api#/default/gridpoint_forecast), for example.

We could then create a new file for typescript type definition. Files that consist only of type definitions should end with `d.ts` instead of just `.ts`

We can create a file like this (I'll just do a couple of properties -- you could copy everything over from the schema to be complete or you can be lazy and just bring in the items you'll actually need to access in your program)

*weather.d.ts*
```typescript
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
```

In order to *use* your types, you'll need to import them and then tell typescript where you expect them, as follows:

```typescript
import type {ForecastPeriod} from './weather';
```

Now I get autocomplete in my text editor, which makes it significantly easier to work with!

## Task 1:

Now that you have the idea of how to make an API call, go ahead and make a web page which fetches the forecast for our school when you press a button and displays it on the page in a simple way.




