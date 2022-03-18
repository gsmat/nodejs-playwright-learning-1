const {chromium, firefox, webkit} = require('playwright')

const getScreenshot = async (browserType) => {
    console.log(browserType.name())
    const browser = await browserType.launch();
    const page = await browser.newPage()
    await page.goto('https://www.skyscanner.net/flights')
    await page.screenshot({
        path: `image-${browserType.name()}.png`
    })
    await browser.close()
}

/*
const changeLocation = async () => {
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
}*/

const fillInput = async () => {
    const browser = await firefox.launch();
    const context = await browser.newContext({
        geolocation: {longitude: 12.492507, latitude: 41.889938}
    })
    const page = await context.newPage('https://www.skyscanner.net/flights')
    page.once('load', () => console.log('Page loaded!'));

    await context.setGeolocation({
        latitude: 41.88,
        longitude: 12.49
    })
    await page.screenshot({path: 'skyScannerLocation.png'});
    browser.close()
}

const firstParse = async () => {
    const browser = await firefox.launch();

    const page = await browser.newPage()


    // Go to https://www.skyscanner.net/flights?previousCultureSource=GEO_LOCATION&redirectedFrom=www.skyscanner.com
    await page.goto('https://www.skyscanner.net/flights?previousCultureSource=GEO_LOCATION&redirectedFrom=www.skyscanner.com');

    // Click text=ToAdd nearby airports >> [placeholder="Country\, city or airport"]
    await page.locator('text=ToAdd nearby airports >> [placeholder="Country\\, city or airport"]').click();

    // Click button:has-text("24/03/2022")
    await page.locator('button:has-text("24/03/2022")').click();

    // Click [aria-label="Saturday\, 26 March 2022"]
    await page.locator('[aria-label="Saturday\\, 26 March 2022"]').click();

    // Click button:has-text("31/03/2022")
    await page.locator('button:has-text("31/03/2022")').click();

    // Click [aria-label="Wednesday\, 30 March 2022"]
    await page.locator('[aria-label="Wednesday\\, 30 March 2022"]').click();

    // Check text=FromAdd nearby airports >> [aria-label="Add nearby airports"]
    await page.locator('text=FromAdd nearby airports >> [aria-label="Add nearby airports"]').check();

    // Click [aria-label="Search flights"]
    const data = await page.locator('[aria-label="Search flights"]').click();
    console.log(data)
    await page.screenshot({
        path: `image-skyscanner.png`
    })
    await browser.close()
}

for (const browserType of [chromium, firefox, webkit]) {
    //getScreenshot(browserType).then(r => console.log('ok'))
    //working :)
}
// changeLocation().then(r => console.log(r)).catch(e=>console.log(e))   not working set geolocation
// fillInput().then(r => console.log(r)).catch(e => console.log(e)) not working fill input and take a screenshot
firstParse().then(r => console.log(r)).catch(e => console.log(e))
