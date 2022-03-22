const {firefox} = require('playwright');

/*
bilet uzerindeki butun melumatlar
teyyare kodlari ve aid oldugu sirketler

stop_ids => [legs] equal [places].id

*/


const url = 'https://www.skyscanner.net/';

(async () => {

    const browser = await firefox.launch({
        headless: false
    })

    const context = await browser.newContext()

    const page = await context.newPage()

    await page.goto(url)

    await fillInputs(page)

    page.locator('.BpkButtonBase_bpk-button__NTM4Y').click();

    await page.waitForNavigation();

    const data = await callApiData(page)

    const itineraries = data['itineraries']
    const segments = data['segments']

    let segmentsArr = []
    for await (let key of Object.keys(segments)){
        segmentsArr={
            id: segments[key].id,
            origin_place_id: segments[key].origin_place_id,
            destination_place_id: segments[key].destination_place_id,
            arrival: segments[key].arrival,
            departure: segments[key].departure,
            duration: segments[key].duration,
            marketing_flight_number: segments[key].marketing_flight_number,
            marketing_carrier_id:segments[key].marketing_carrier_id,
            operating_carrier_id: segments[key].operating_carrier_id,
            mode: segments[key].mode
        }
    }


    let prices = []
    for await (let key of Object.keys(itineraries)) {
        const pricingOptions = itineraries[key]['pricing_options'];

        let options = [];
        for await (let index of Object.keys(pricingOptions)) {
            options = {
                agentIds: pricingOptions[index]['agent_ids'],
                mainPrice: pricingOptions[index]['price']['amount']
            }

            let itemsArr = [];
            const items = pricingOptions[index]['items'];
            for await (let key of Object.keys(items)) {
                itemsArr = {
                    itemAgentId: items[key]['agent_id'],
                    itemPrice: items[key]['price']['amount'],
                }
            }
            options['item'] = {
                itemsArr
            }
        }
        prices[key] = {
            id: itineraries[key].id,
            option: options
        }
    }
    console.dir(prices)


    browser.close();


})();

const keywords = {
    start: "Baku",
    end: "Istanbul (Any)"
}

async function fillInputs(page) {
    await page.click('#fsc-trip-type-selector-one-way');
    await page.click('#fsc-origin-search');
    await page.fill('#fsc-origin-search', keywords.start)

    await page.click('#fsc-destination-search')
    await page.fill('#fsc-destination-search', keywords.end)
}

async function callApiData(page) {
    const [response] = await Promise.all([
        page.waitForResponse('**/g/conductor/v1/**'),
    ]);
    return response.json();
}
