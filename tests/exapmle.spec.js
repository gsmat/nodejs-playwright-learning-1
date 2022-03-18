const {test, expect} = require('@playwright/test');
const {firefox, chromium, webkit} = require("playwright");

test('my test', async () => {
    const browser = await firefox.launch();
    const context = await browser.newContext({
        geolocation: {longitude: 12.492507, latitude: 41.889938},
        permissions: [
            'geolocation'
        ]
    });

    const page = await context.newPage('https://www.skyscanner.net/flights');
    // await page.click('text="Your location"');
    await page.screenshot({path: 'skyScannerLocation.png'});
    await browser.close();

});
