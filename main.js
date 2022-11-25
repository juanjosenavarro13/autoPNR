const puppeteer = require('puppeteer-extra');
const { executablePath } = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { acceptCookies, delay } = require('./src/utils');
const { flightOptios } = require('./src/config');

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
        await page.goto(flightOptios.url);

        await acceptCookies(page);

        await pageFlight(page, flightOptios);
        await pageDispo(page);
        await pagePassengers(page, flightOptios);
        await pageAncillaries(page);
        await pagePayments(page, flightOptios);
    } catch (e) {
        console.log(e);
        await browser.close();
    } finally {
        await browser.close();
    }
})();

//  ==============================

const pageFlight = async (page, flightOptios) => {
    console.log('start pageFlight');
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
    console.log('end pageFlight');
};

const pageDispo = async (page) => {
    console.log('start pageDispo');
    // blackfriday
    const selectorBlackFriday =
        'body > main > div:nth-child(1) > ib-new-main-header > div.lc-a21-wrapper > div.lc-a21-strip-info.mnt-111-W1220-strip > div > div > div > label.lc-a21-details-btn > div.lc-a21-details-btn-shr';
    await page.waitForSelector(selectorBlackFriday, { timeout: 30000 });
    try {
        await page.click(selectorBlackFriday);
    } catch (error) {
        console.log('boton de black friday oculto');
    }
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
    console.log('end pageDispo');
};

const pagePassengers = async (page, flightOptios) => {
    console.log('start pagePassengers');
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
    console.log('end pagePassengers');
};

const pageAncillaries = async (page) => {
    console.log('start pageAncillaries');
    await page.waitForSelector('#GO_PAYMENTS_CONTINUE_BUTTON');
    await delay(2);
    // contratar noseque
    try {
        await page.click(
            '#upselling-prio-modal > div > div > footer > div > div.ib-content-buttons__content-right > a'
        );
    } catch (error) {
        console.log('boton de contratar noseque oculto');
    }

    // submit
    await page.waitForSelector('#GO_PAYMENTS_CONTINUE_BUTTON');
    await page.screenshot({ path: 'img/5.jpg', fullPage: true });
    await page.click('#GO_PAYMENTS_CONTINUE_BUTTON');
    console.log('end pageAncillaries');
};

const pagePayments = async (page, flightOptios) => {
    console.log('start pagePayments');
    delay(3);
    await page.waitForSelector('#ibdc-number-frame');
    const elementHandleNumber = await page.$('#ibdc-number-frame');
    const frameNumber = await elementHandleNumber.contentFrame();

    await frameNumber.waitForSelector('#number');
    await frameNumber.type('#number', flightOptios.payment.number);

    await page.waitForSelector('#name');
    await page.type('#name', flightOptios.payment.name);

    await page.waitForSelector('#surnames');
    await page.type('#surnames', flightOptios.payment.surname);

    await page.waitForSelector(
        '#EXPIRY_DATE > .ib-select-date__action:nth-child(2) > .ib-select-date__list-ipt > .btn > .ui-select-placeholder'
    );
    await page.click(
        '#EXPIRY_DATE > .ib-select-date__action:nth-child(2) > .ib-select-date__list-ipt > .btn > .ui-select-placeholder'
    );

    await page.waitForSelector('#ui-select-choices-row-1-0');
    await page.click('#ui-select-choices-row-1-0');

    await page.waitForSelector(
        '#EXPIRY_DATE > .ib-select-date__action:nth-child(3) > .ib-select-date__list-ipt > .btn > .ui-select-placeholder'
    );
    await page.click(
        '#EXPIRY_DATE > .ib-select-date__action:nth-child(3) > .ib-select-date__list-ipt > .btn > .ui-select-placeholder'
    );

    await page.waitForSelector(
        '.ui-select-choices > #ui-select-choices-2 > #ui-select-choices-row-2-0 > .ui-select-choices-row-inner > .ib-select-date__list-txt'
    );
    await page.click(
        '.ui-select-choices > #ui-select-choices-2 > #ui-select-choices-row-2-0 > .ui-select-choices-row-inner > .ib-select-date__list-txt'
    );

    await page.waitForSelector('#ibdc-cvv-frame');
    const elementHandleCcv = await page.$('#ibdc-cvv-frame');
    const frameCcv = await elementHandleCcv.contentFrame();

    await frameCcv.waitForSelector('#cvv');
    await frameCcv.type('#cvv', flightOptios.payment.ccv);

    await page.screenshot({ path: 'img/6.jpg', fullPage: true });

    await page.click('#check_terms_conditions');
    // submit
    await page.click('#pmt-total-price-pay-btn > span');
    console.log('end pagePayments');
};

// =======================================
