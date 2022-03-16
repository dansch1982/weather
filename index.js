//import fetch from 'node-fetch';

class Weather {
    constructor(lat, lon, altitude, parent) {
        this.location = {
            lat: lat,
            lon: lon,
            altitude: altitude,
        }
    }
    async update() {
        
        this.data = await this.getWeatherData();

        const data = this.data.properties.timeseries[0].data;
        const meta = this.data.properties.meta;

        for (const prop in data) {
            if (prop === "instant") {
                this.element.childNodes[0].textContent = `${this.name ? this.name + "\n": ""}${data[prop].details.air_temperature} ${meta.units.air_temperature}\nSenast uppdaterad ${new Date().toLocaleTimeString('sv-SE', { hour:"2-digit", minute:"2-digit" })}`
            } else if (prop === "next_1_hours") {
                this.element.childNodes[1].innerHTML = `<img src="https://api.met.no/images/weathericons/svg/${data[prop].summary.symbol_code}.svg" alt="${data[prop].summary.symbol_code}">`
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
        const data = await (await fetch(url)).json();
        return data;
    }
    async getLocationName() {
        const API_KEY = 'fd3ccc871f6c471a91d78a0f64734999'
        const url = new URL(`https://api.opencagedata.com/geocode/v1/json?q=${this.location.lat}+${this.location.lon}&key=${API_KEY}`)
        const data = await (await fetch(url)).json();
        console.log(data)
        return data.results[0].formatted
    }
    createElement(parent) {
        const section = document.createElement('section')
        section.id = "weather" + new Date().getTime();
        section.classList.add("weather")
        
        const temp = document.createElement('article')

        temp.addEventListener('click', () => {
            this.stop();
        })

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
    async start() {
        this.name = await this.getLocationName()
        this.element = this.createElement(parent);
        this.updateFrequency = 5*60*1000
        this.update();
        this.interval = setInterval(() => {
            this.update();
        }, this.updateFrequency);
    };
    stop() {
        clearInterval(this.interval);
        this.element.parentElement.removeChild(this.element);
    };
}
const parent = document.querySelector(".weatherContainer")

const create = document.getElementById('create')
create.addEventListener('click', () => {
    const latitude = document.getElementById('latitude')
    const lat = parseFloat(latitude.value)
    const longitude = document.getElementById('longitude')
    const lon = parseFloat(longitude.value)
    const weather = new Weather(lat, lon, 1, parent);
    weather.start();
})