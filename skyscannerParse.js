const {chromium} = require('playwright')

async function main() {
    const browser = await chromium.launch({
        headless: false,
        devtools: true,
    })
    const context = await browser.newContext();

    const page = await context.newPage()

    await page.goto('https://www.skyscanner.net/transport/flights/gyd/ista/220323/220330/?adults=2&adultsv2=2&c=&cabinclass=economy')

    await page.click('text=Show more results')
    await page.waitForFunction(() => {
        const priceDivs = document.querySelectorAll('div.FlightsResults_dayViewItems__ZDFlO div')
        return priceDivs.length > 20
    })
    const prices = await page.$$eval('div.FlightsResults_dayViewItems__ZDFlO div', (priceDivs) => {
        return priceDivs.map(priceDiv => {
            const start = priceDiv.querySelectorAll('div.LegInfo_routePartialDepart__NzEwY > span.BpkText_bpk-text__YWQwM ')
            const end = priceDiv.querySelectorAll('div.LegInfo_routePartialArrive__Y2U1N > span.BpkText_bpk-text__YWQwM ')
            return {
                start: (start),
                end: (end)
            }
        })
    })

    // console.log(prices)
    browser.close();

}

main()