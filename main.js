const puppeteer = require('puppeteer-extra');
const { executablePath } = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { acceptCookies } = require('./src/utils');
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
        await pageConfirmation(page);
    } catch (e) {
        console.log(e);
        await browser.close();
    } finally {
        await browser.close();
    }
})();

//  ==================================================================================================

const pageFlight = async (page, flightOptios) => {
    console.log('start pageFlight');
    // write origin and destination for flight
    await page.waitForSelector('#flight_origin1');
    await page.waitForSelector('#flight_destiny1');

    // get values of flight (origin and destiny)
    const valuesFlight = await page.evaluate(() => {
        const valueOrigin = document.querySelector('#flight_origin1').value;
        const valueDestiny = document.querySelector('#flight_destiny1').value;

        return [valueOrigin, valueDestiny];
    });

    // delete default values origin and destiny
    await page.click('#flight_origin1');
    for (valuesFlight[0] of valuesFlight[0]) {
        await page.keyboard.press('Backspace');
    }
    await page.click('#flight_destiny1');
    for (valuesFlight[1] of valuesFlight[1]) {
        await page.keyboard.press('Backspace');
    }

    // write new values origin and destiny
    await page.type('#flight_origin1', flightOptios.flight.origin);
    await page.type('#flight_destiny1', flightOptios.flight.destiny);

    // select only way
    if (flightOptios.onlyWay) {
        await page.waitForSelector('#ticketops-seeker-button > span.ui-selectmenu-text');
        await page.click('#ticketops-seeker-button > span.ui-selectmenu-text');
        await page.waitForSelector('#ticketops-seeker-menu > li:nth-child(2)');
        await page.click('#ticketops-seeker-menu > li:nth-child(2)');

        // select date
        await page.waitForSelector('#flight_round_date1');
        await page.type('#flight_round_date1', flightOptios.date.way);
    } else {
        // en desarrollo ida y vuelta
    }

    // submit
    await page.waitForSelector('#buttonSubmit1 > span.ibe-button__text');
    await page.click('#buttonSubmit1 > span.ibe-button__text');
    await page.screenshot({ path: 'img/1.jpg', fullPage: false });
    console.log('end pageFlight');
};

const pageDispo = async (page) => {
    console.log('start pageDispo');
    await page.waitForSelector('#header-commons-iberia-logo-home-link > img', { timeout: 60000 });

    // select dispo
    await page.waitForSelector('#bbki-slice-info-cabin-0-0-E-btn > span');
    await page.screenshot({ path: 'img/2.jpg', fullPage: false });
    await page.click('#bbki-slice-info-cabin-0-0-E-btn > span');
    if ((await page.$('#bbki-slice-info-cabin-0-1-E-btn > span')) !== null) {
        await page.click('#bbki-slice-info-cabin-0-1-E-btn > span');
        if ((await page.$('#bbki-slice-info-cabin-0-2-E-btn > span')) !== null) {
            await page.click('#bbki-slice-info-cabin-0-2-E-btn > span');
        }
    }

    // submit
    await page.waitForSelector('#AVAILABILITY_CONTINUE_BUTTON');
    await page.screenshot({ path: 'img/3.jpg', fullPage: false });
    await page.click('#AVAILABILITY_CONTINUE_BUTTON');
    console.log('end pageDispo');
};

const pagePassengers = async (page, flightOptios) => {
    console.log('start pagePassengers');
    await page.waitForSelector('#header-commons-iberia-logo-home-link > img', { timeout: 60000 });
    // write form passenger
    await page.waitForSelector('#name_0');
    await page.type('#name_0', flightOptios.passengers.name);
    await page.waitForSelector('#first_surname_0');
    await page.type('#first_surname_0', flightOptios.passengers.surname);
    await page.waitForSelector('#IBAIRP_CONTACT_FORM_EMAIL');
    await page.type('#IBAIRP_CONTACT_FORM_EMAIL', flightOptios.passengers.email);
    await page.waitForSelector('#IBAIRP_CONTACT_FORM_REPEATED_EMAIL');
    await page.type('#IBAIRP_CONTACT_FORM_REPEATED_EMAIL', flightOptios.passengers.email);
    await page.waitForSelector('#IBAIRP_CONTACT_FORM_PHONE');
    await page.type('#IBAIRP_CONTACT_FORM_PHONE', flightOptios.passengers.phone);

    // submit
    await page.waitForSelector('#AVAILABILITY_CONTINUE_BUTTON');
    await page.screenshot({ path: 'img/4.jpg', fullPage: false });
    await page.click('#AVAILABILITY_CONTINUE_BUTTON');
    console.log('end pagePassengers');
};

const pageAncillaries = async (page) => {
    console.log('start pageAncillaries');
    await page.waitForSelector('#header-commons-iberia-logo-home-link > img', { timeout: 60000 });

    // submit
    await page.waitForSelector('#GO_PAYMENTS_CONTINUE_BUTTON');
    await page.screenshot({ path: 'img/5.jpg', fullPage: false });
    await page.click('#GO_PAYMENTS_CONTINUE_BUTTON');
    console.log('end pageAncillaries');
};

const pagePayments = async (page, flightOptios) => {
    console.log('start pagePayments');
    await page.waitForSelector('#header-commons-iberia-logo-home-link > img', { timeout: 60000 });

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

    await page.screenshot({ path: 'img/6.jpg', fullPage: false });

    await page.waitForSelector(
        '#pmt-breakdown > fieldset > section > div.ib-box.ng-scope.ib-box--medium.ib-box--separator.u-mb-none > div.ib-check.ib-check--regular > label > span'
    );
    await page.click(
        '#pmt-breakdown > fieldset > section > div.ib-box.ng-scope.ib-box--medium.ib-box--separator.u-mb-none > div.ib-check.ib-check--regular > label > span'
    );
    // submit
    await page.waitForSelector('#pmt-total-price-pay-btn > span');
    await page.click('#pmt-total-price-pay-btn > span');
    console.log('end pagePayments');
};

const pageConfirmation = async (page) => {
    console.log('start pageConfirmation');

    await page.waitForSelector(
        'body > main > div:nth-child(1) > ib-new-main-header > div > div > div > div > div > ib-main-header > header > div > div > div > div > div.navbar-header.u-pl > a > figure > img'
    );


    const PNR = await page.evaluate(() => document.querySelector('body > main > div:nth-child(2) > main > div.container > equal-height:nth-child(2) > div > div > div > div > div.ib-box__wrapper.ib-box__wrapper--small > div > div > span').innerText);
    console.log('TU PNR ES: ', PNR);

    await page.screenshot({ path: 'img/7.jpg', fullPage: false });

    console.log('end pageConfirmation');
};

// ========================================================================================================================
