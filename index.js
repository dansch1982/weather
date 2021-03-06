class Weather {
    constructor(lat, lon, altitude, parent) {
        this.location = {
            lat: lat,
            lon: lon,
            altitude: altitude,
        }
        this.element = this.createElement(parent);
        this.updateFrequency = 5*60*1000
    }
    async update() {
        
        this.data = await this.getWeatherData();

        const data = this.data.properties.timeseries[0].data;
        const meta = this.data.properties.meta;

        for (const prop in data) {
            if (prop === "instant") {
                this.element.querySelector("[id*='_temp']").textContent = `${this.name ? this.name + "\n": ""}${data[prop].details.air_temperature} ${meta.units.air_temperature}\nSenast uppdaterad ${new Date().toLocaleTimeString('sv-SE', { hour:"2-digit", minute:"2-digit" })}`
            } else if (prop === "next_1_hours") {
                this.element.querySelector("[id*='_symbol']").innerHTML = `<img src="https://api.met.no/images/weathericons/svg/${data[prop].summary.symbol_code}.svg" alt="${data[prop].summary.symbol_code}">`
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
        return data.results[0].formatted
    }
    createElement(parent) {
        const section = document.createElement('section')
        section.id = `weather_${new Date().getTime()}`;
        
        const temp = document.createElement('article')

        temp.addEventListener('click', () => {
            this.stop();
        })

        temp.id = `${section.id}_temp`
        section.appendChild(temp)
        
        const symbol = document.createElement('article')
        symbol.id = `${section.id}_symbol`
        section.appendChild(symbol)

        parent.appendChild(section)

        this.createCSS();

        return section;
    }
    async start() {
        this.name = await this.getLocationName()
        this.update();
        this.interval = setInterval(() => {
            this.update();
        }, this.updateFrequency);
    };
    stop() {
        clearInterval(this.interval);
        this.element.parentElement.removeChild(this.element);
    };
    createCSS() {
        if (!document.getElementById('weatherAppCSS')) {
            const style = document.createElement('style')
            style.id = "weatherAppCSS"
            style.innerHTML = '[id^=weather_]{background-color:#f5f5f5;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;height:100%;padding:.5em;gap:.5em}[id^=weather_] *{padding:0;margin:0;box-sizing:border-box}[id^=weather_] [id^=weather_][id$=_temp]{display:flex;justify-content:center;align-items:center;text-align:center;height:-webkit-fit-content;height:-moz-fit-content;height:fit-content;width:-webkit-fit-content;width:-moz-fit-content;width:fit-content;white-space:pre}[id^=weather_] [id^=weather_][id$=_symbol]{position:relative;justify-content:center;align-items:center;width:100%;height:100%}[id^=weather_] [id^=weather_][id$=_symbol] svg,[id^=weather_] [id^=weather_][id$=_symbol] img{position:absolute;top:5%;left:5%;width:90%;height:90%}/*# sourceMappingURL=weather.css.map */'
            document.head.appendChild(style)
        }
    }
}

const create = document.getElementById('create')
create.addEventListener('click', () => {
    const latitude = document.getElementById('latitude')
    const lat = parseFloat(latitude.value)
    const longitude = document.getElementById('longitude')
    const lon = parseFloat(longitude.value)
    const parent = document.querySelector(".weatherContainer")
    const weather = new Weather(lat, lon, 1, parent);
    weather.start();
})

const weatherContainer = document.querySelector('.weatherContainer')
const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            weatherContainer.style.gridTemplateColumns = `repeat(${weatherContainer.children.length < 3 ? weatherContainer.children.length : 3}, 1fr)`
        }
    }
});
observer.observe(weatherContainer, { childList: true, subtree: false });