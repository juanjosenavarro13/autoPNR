const puppeteer = require('puppeteer-extra');
const { executablePath } = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const url = 'https://www.iberia.com/';

(async function main() {
    const browser = await puppeteer.launch({
        executablePath: executablePath(),
        headless: false,
        ignoreHTTPSErrors: true,
        args: [
            '--lang=es-ES,en;q=0.9',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list'
        ],
        defaultViewport: {
            width: 1280,
            height: 720
        },
        userDataDir: './tmp'
    });
    try {
        const [page] = await browser.pages();
        await page.goto(url);
        await acceptCookies(page);

        const date = formatDate(new Date());
        const flight = {
            origin: 'Madrid (MAD)',
            destiny: 'Bilbao (BIO)'
        };

        // write origin and destination for flight
        await page.waitForSelector('#flight_origin1');
        await page.evaluate((flight) => {
            document.querySelector('#flight_origin1').value = flight.origin;
            document.querySelector('#flight_destiny1').value = flight.destiny;
        }, flight);

        // select only way
        await page.click('#ticketops-seeker-button > span.ui-selectmenu-text');
        await page.waitForSelector('#ui-id-13 > span');
        await page.click('#ui-id-13 > span');

        // select date
        await page.click('#flight_round_date1');
        await page.evaluate((date) => {
            document.querySelector('#flight_round_date1').value = date;
        }, date);

        // submit
        await page.waitForSelector('#buttonSubmit1 > span.ibe-button__text');
        await page.screenshot({ path: 'sc1.jpg', fullPage: true });
        await page.click('#buttonSubmit1 > span.ibe-button__text');

        // select dispo
        await page.waitForSelector('#bbki-slice-info-cabin-0-0-E-btn > span');
        await page.screenshot({ path: 'sc2.jpg', fullPage: true });
        await page.click('#bbki-slice-info-cabin-0-0-E-btn > span');
        if ((await page.$('#bbki-slice-info-cabin-0-1-E-btn > span')) !== null) {
            await page.click('#bbki-slice-info-cabin-0-1-E-btn > span');
        }
        // go next page (passenger)
        await page.waitForSelector('#AVAILABILITY_CONTINUE_BUTTON');
        await page.click('#AVAILABILITY_CONTINUE_BUTTON');

        // write form passenger
        await page.waitForSelector('#name_0');
        await page.screenshot({ path: 'sc3.jpg', fullPage: true });

        await delay(100);
    } catch (e) {
        console.log(e);
    } finally {
        await browser.close();
    }
})();

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date) {
    return [padTo2Digits(date.getDate() + 1), padTo2Digits(date.getMonth() + 1), date.getFullYear()].join('/');
}

const acceptCookies = async (page) => {
    const button = await page.$('button[id="onetrust-accept-btn-handler"]');
    if (button) {
        return await page.click('button[id="onetrust-accept-btn-handler"]');
    }
    return true;
};

function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
}
