function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date, direction) {
    if (direction === 'return') {
        return [padTo2Digits(date.getDate() + 8), padTo2Digits(date.getMonth() + 1), date.getFullYear()].join('/');
    } else if (direction === 'way') {
        return [padTo2Digits(date.getDate() + 1), padTo2Digits(date.getMonth() + 1), date.getFullYear()].join('/');
    }
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

module.exports = {
    formatDate,
    acceptCookies,
    delay
};
