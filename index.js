//import fetch from 'node-fetch';

class Weather {
    constructor(lat, lon, altitude, parent) {
        this.location = {
            lat: lat,
            lon: lon,
            altitude: altitude
        }
        this.element = this.createElement(parent);
        this.updateFrequency = 5*60*1000
    }
    async update() {
        await this.getWeatherData();
        const data = this.data.properties.timeseries[0].data;
        const meta = this.data.properties.meta;

        /* const API_KEY = 'fd3ccc871f6c471a91d78a0f64734999'
        const url = new URL(`https://api.opencagedata.com/geocode/v1/json?q=${this.location.lat}+${this.location.lon}&key=${API_KEY}`)

        const cityData = await fetch(url)
        const city = await cityData.json();
        console.log(city) */

        for (const prop in data) {
            if (prop === "instant") {
                this.element.childNodes[0].textContent = `${data[prop].details.air_temperature} ${meta.units.air_temperature} ${new Date().toLocaleTimeString('sv-SE')}`
                //this.element.childNodes[0].textContent = `${city.results[0].components.municipality}: ${data[prop].details.air_temperature} ${meta.units.air_temperature} ${new Date().toLocaleTimeString('sv-SE')}`
            } else if (prop === "next_1_hours") {
                //console.log(data[prop].summary.symbol_code)
                this.element.childNodes[1].innerHTML = `<img src="https://api.met.no/images/weathericons/svg/${data[prop].summary.symbol_code}.svg" alt="${data[prop].summary.symbol_code}">`
                //
            } else {
                continue;
            }
        }
    }
    async getWeatherData() {
        //const url = new URL("https://api.met.no/weatherapi/locationforecast/2.0/complete")
        const url = new URL("https://api.met.no/weatherapi/nowcast/2.0/complete")
        for (const prop in this.location) {
            url.searchParams.append(prop, this.location[prop])
        }
        //https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=60.6749&lon=17.1413&altitude=1
        //https://api.met.no/weatherapi/nowcast/2.0/complete?lat=60.6749&lon=17.1413&altitude=1
        const data = await fetch(url, {
            "accept-ranges": "bytes",
            "access-control-allow-headers": "Origin",
            "access-control-allow-methods": "GET",
            "access-control-allow-origin": "*",
            "age": "0",
            "content-encoding": "gzip",
            "content-type": "application/json",
            "server": "nginx/1.18.0 (Ubuntu)",
            "vary": "Accept, Accept-Encoding",
            "via": "1.1 varnish (Varnish/7.0)"
        });
        this.data = await data.json();
    }
    createElement(parent) {
        const section = document.createElement('section')
        section.id = "weather" + new Date().getTime();
        section.classList.add("weather")
        
        const temp = document.createElement('article')
        temp.id = `${section.id}_temp`
        temp.classList.add("temp")
        section.appendChild(temp)
        
        const symbol = document.createElement('article')
        symbol.id = `${section.id}_symbol`
        symbol.classList.add("symbol")
        section.appendChild(symbol)

        parent.appendChild(section)

        return section;
    }
    start() {
        this.update();
        this.interval = setInterval(() => {
            this.update();
        }, this.updateFrequency);
    };
    stop() {
        clearInterval(this.interval);
    };
}
const parent = document.querySelector(".weatherContainer")
/* weather = new Weather(59.3502, 17.9446, 1, parent);
weather.start(); */

const create = document.getElementById('create')
create.addEventListener('click', () => {
    const latitude = document.getElementById('latitude')
    const lat = parseFloat(latitude.value)
    const longitude = document.getElementById('longitude')
    const lon = parseFloat(longitude.value)
    const weather = new Weather(lat, lon, 1, parent);
    weather.start();
})