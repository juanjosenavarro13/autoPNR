const puppeteer = require('puppeteer-extra');
const { executablePath } = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
// const url = 'https://www.iberia.com/es/?language=es';
const url = 'https://pree.iberia.es/es/?language=es';

const { formatDate, acceptCookies, delay } = require('./utils');

const flightOptios = {
    onlyWay: true,
    date: { way: formatDate(new Date(), 'way'), return: formatDate(new Date(), 'return') },
    flight: {
        origin: 'Madrid (MAD)',
        destiny: 'Bilbao (BIO)'
    },
    passengers: {
        name: 'test',
        surname: 'test',
        email: 'test@test.es',
        phone: '623456789'
    },
    payment: {
        number: '4012999999999999',
        name: 'test',
        surname: 'test',
        expiration: {
            day: 1,
            month: 1,
            year: 2025
        },
        ccv: '123'
    }
};

(async function main() {
    const browser = await puppeteer.launch({
        executablePath: executablePath(),
        headless: false,
        ignoreHTTPSErrors: true,
        args: [
            '--lang=es-ES,es;q=0.9',
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

        await pageFlight(page, flightOptios);
        await pageDispo(page);
        await pagePassengers(page, flightOptios);
        await pageAncillaries(page);
        await pagePayments(page, flightOptios);

        await delay(100);
    } catch (e) {
        console.log(e);
    } finally {
        await browser.close();
    }
})();

//  ==============================

const pageFlight = async (page, flightOptios) => {
    // write origin and destination for flight
    await page.waitForSelector('#flight_origin1');
    await page.evaluate((flightOptios) => {
        document.querySelector('#flight_origin1').value = flightOptios.flight.origin;
        document.querySelector('#flight_destiny1').value = flightOptios.flight.destiny;
    }, flightOptios);

    // select only way
    if (flightOptios.onlyWay) {
        await page.click('#ticketops-seeker-button > span.ui-selectmenu-text');
        await page.waitForSelector('#ui-id-13 > span');
        await page.click('#ui-id-13 > span');

        // select date
        await page.click('#flight_round_date1');
        await page.evaluate((flightOptios) => {
            document.querySelector('#flight_round_date1').value = flightOptios.date.way;
        }, flightOptios);
    }

    // submit
    await page.waitForSelector('#buttonSubmit1 > span.ibe-button__text');
    await page.screenshot({ path: 'img/1.jpg', fullPage: true });
    await page.click('#buttonSubmit1 > span.ibe-button__text');
};

const pageDispo = async (page) => {
    // select dispo
    await page.waitForSelector('#bbki-slice-info-cabin-0-0-E-btn > span', { timeout: 60000 });
    await page.screenshot({ path: 'img/2.jpg', fullPage: true });
    await page.click('#bbki-slice-info-cabin-0-0-E-btn > span');
    if ((await page.$('#bbki-slice-info-cabin-0-1-E-btn > span')) !== null) {
        await page.click('#bbki-slice-info-cabin-0-1-E-btn > span');
    }
    // go next page (passenger)
    await page.waitForSelector('#AVAILABILITY_CONTINUE_BUTTON');
    await page.screenshot({ path: 'img/3.jpg', fullPage: true });
    await page.click('#AVAILABILITY_CONTINUE_BUTTON');
};

const pagePassengers = async (page, flightOptios) => {
    // write form passenger
    await page.waitForSelector('#name_0', { timeout: 60000 });
    await page.type('#name_0', flightOptios.passengers.name);
    await page.type('#first_surname_0', flightOptios.passengers.surname);
    await page.type('#IBAIRP_CONTACT_FORM_EMAIL', flightOptios.passengers.email);
    await page.type('#IBAIRP_CONTACT_FORM_REPEATED_EMAIL', flightOptios.passengers.email);
    await page.type('#IBAIRP_CONTACT_FORM_PHONE', flightOptios.passengers.phone);

    // submit
    await page.waitForSelector('#AVAILABILITY_CONTINUE_BUTTON');
    await page.screenshot({ path: 'img/4.jpg', fullPage: true });
    await page.click('#AVAILABILITY_CONTINUE_BUTTON');
};

const pageAncillaries = async (page) => {
    // contratar noseque
    await page.waitForSelector(
        '#upselling-prio-modal > div > div > footer > div > div.ib-content-buttons__content-right > a',
        { timeout: 60000 }
    );
    await page.click('#upselling-prio-modal > div > div > footer > div > div.ib-content-buttons__content-right > a');

    // submit
    await page.waitForSelector('#GO_PAYMENTS_CONTINUE_BUTTON');
    await page.screenshot({ path: 'img/5.jpg', fullPage: true });
    await page.click('#GO_PAYMENTS_CONTINUE_BUTTON');
};

const pagePayments = async (page, flightOptios) => {
    console.log('waiting for iframe with form to be ready.');
    await page.waitForSelector('iframe');
    console.log('iframe is ready. Loading iframe content');

    const elementHandle = await page.$('iframe');
    const frame = await elementHandle.contentFrame();

    console.log('filling form in iframe');
    await page.waitForSelector('#number', { timeout: 60000 });
    await frame.type('#number', '123', { delay: 100 });


    // await page.waitForSelector('#number', { timeout: 60000 });
    // await page.focus('#number');
    // await page.type('#number', 'flightOptios.payment.number');

    // await page.waitForSelector('#name');
    // await page.type('#name', flightOptios.payment.name);

    // await page.waitForSelector('#surnames');
    // await page.type('#surnames', flightOptios.payment.surname);

    // await page.waitForSelector('#number');
    // await page.type('#number', flightOptios.payment.number);

    // await page.screenshot({ path: 'img/6.jpg', fullPage: true });
};

// =======================================
