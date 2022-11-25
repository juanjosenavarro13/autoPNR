function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date, direction) {
    if (direction === 'return') {
        return [padTo2Digits(date.getDate() + 8), padTo2Digits(date.getMonth() + 1), date.getFullYear()].join('');
    } else if (direction === 'way') {
        return [padTo2Digits(date.getDate() + 1), padTo2Digits(date.getMonth() + 1), date.getFullYear()].join('');
    }
}

const acceptCookies = async (page) => {
    if (await page.$('button[id="onetrust-accept-btn-handler"]')) {
        return await page.click('button[id="onetrust-accept-btn-handler"]');
    }
    return true;
};


module.exports = {
    formatDate,
    acceptCookies
};
