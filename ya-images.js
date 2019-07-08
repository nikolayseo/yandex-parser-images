const https = require('https');
const Images = require('./Models/Images.js');

module.exports = class YaImages {

    constructor(config) {
        this.url = config.url;
        this.requestInterval = config.requestInterval;
        this.idRequestInterval = '';
        this.requestPage = config.requestPage || 1;
        this.textSearch = config.textSearch;
    }

    httpRequest(url = `https://yandex.ru/images/search?format=json&request=%7B%22blocks%22%3A%5B%7B%22block%22%3A%22serp-controller%22%2C%22params%22%3A%7B%7D%2C%22version%22%3A2%7D%2C%7B%22block%22%3A%22serp-list_infinite_yes%22%2C%22params%22%3A%7B%22initialPageNum%22%3A0%7D%2C%22version%22%3A2%7D%2C%7B%22block%22%3A%22more_direction_next%22%2C%22params%22%3A%7B%7D%2C%22version%22%3A2%7D%2C%7B%22block%22%3A%22gallery__items%3Aajax%22%2C%22params%22%3A%7B%7D%2C%22version%22%3A2%7D%5D%2C%22bmt%22%3A%7B%22lb%22%3A%2270xek%5EjjDN(%7ByjI%3D52Fx%22%7D%2C%22amt%22%3A%7B%22las%22%3A%22justifier-height%3D1%3Bthumb-underlay%3D1%3Bjustifier-setheight%3D1%3Bfitimages-height%3D1%3Bjustifier-fitincuts%3D1%22%7D%7D&yu=1778190371562362282&p=${this.requestPage}&text=${this.textSearch}`) {

        return new Promise((resolve, reject) => {

            https.get(url, (res) => {

                let rawData = [];

                res.on('data', (chunk) => {
                    rawData.push(chunk);
                });

                res.on('end', () => {
                    this.requestPage = this.requestPage + 1;
                    resolve(rawData.toString());
                });

            }).on('error', (err) => {
                reject(err);
            });

        });

    }

    insertImagesDb(images = []) {

        Images.bulkCreate(images.map((val) => ({
            image_url: val
        }))).catch((err) => {
            console.error(err);
        });

    }

    selectImagesDb() {

        return Images.findAll({
            raw: true
        });

    }

    parseRawData(rawData) {

        let regex = new RegExp('img_url=(.+?)&amp;', 'gm');
        let outputSet = new Set();
        let matches;

        while (matches = regex.exec(rawData)) {
            outputSet.add(decodeURIComponent(matches[1]));
        }

        return [...outputSet];

    }

    start() {

        this.idRequestInterval = setInterval(async () => {

            try {

                let response = await this.httpRequest(this.url);
                let images = this.parseRawData(response);
                this.insertImagesDb(images);

            } catch (e) {
                console.error(e);
            }

        }, this.requestInterval);

    }

    stop() {
        clearInterval(this.idRequestInterval);
    }
};