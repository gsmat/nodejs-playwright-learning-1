const {firefox} = require('playwright');

/*
bilet uzerindeki butun melumatlar
teyyare kodlari ve aid oldugu sirketler

stop_ids => [legs] equal [places].id

legs[key].origin_id = places[key].id


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
    const places = data['places']
    const legs = data['legs']
    const agents = data['agents']
    const legId = [];
    let itinerariesArr = []

    for await (let key of Object.keys(itineraries)) {
        legId.push(itineraries[key]?.leg_ids)
        const pricingOptions = itineraries[key]['pricing_options'];
        let legsArr = []
        for await (let key of Object.keys(legs)) {
            for (let index of Object.keys(legId)) {
                if (legId[index].toString() === legs[key]?.id) {
                    let original_place_name;
                    let destination_place_name;
                    for await (let key of Object.keys(places)) {
                        if (legs[key]?.origin_place_id === places[key]?.id) {
                            original_place_name = places[key].name
                        }
                        if (legs[key]?.destination_place_id === places[key]?.id) {
                            destination_place_name = places[key].name
                        }
                    }
                    const segmentIds = legs[key]?.segment_ids;
                    let segmentData = []
                    for await (let index of Object.keys(segments)) {
                        for await (let i of Object.keys(segmentIds)) {
                            if (segmentIds[i] === segments[index]?.id) {
                                let segment_original_place_name;
                                let segment_destination_place_name;
                                for await (let key of Object.keys(places)) {
                                    if (segments[index]?.origin_place_id === places[key]?.id) {
                                        segment_original_place_name = places[key].name
                                    }
                                    if (segments[index]?.destination_place_id === places[key]?.id) {
                                        segment_destination_place_name = places[key].name
                                    }
                                }
                                segmentData.push({
                                    origin_place_id: segments[index].origin_place_id,
                                    origin_place_name: segment_original_place_name,
                                    destination_place_id: segments[index].destination_place_id,
                                    destination_place_name: segment_destination_place_name,
                                    departure: segments[index].departure.split('T'),
                                    arrival: segments[index].arrival.split('T'),
                                    duration: segments[index].duration,
                                    mode: segments[index].mode
                                })
                            }
                        }
                    }
                    legsArr = {
                        id: legs[key].id,
                        origin_place_id: legs[key].origin_place_id,
                        origin_place_name: original_place_name,
                        destination_place_id: legs[key].destination_place_id,
                        destination_place_name: destination_place_name,
                        departure: legs[key].departure.split('T'),
                        arrival: legs[key].arrival.split('T'),
                        segment_ids: legs[key].segment_ids,
                        duration: legs[key].duration,
                        stop_count: legs[key].stop_count,
                        stop_ids: legs[key].stop_ids,
                        segmentData
                    }
                }
            }
        }

        let options = [];
        for await (let index of Object.keys(pricingOptions)) {

            const items = pricingOptions[index]['items'];
            for await (let key of Object.keys(items)) {

                let itemAgentName;
                for await (let index of Object.keys(agents)) {
                    if (items[key].agent_id === agents[index].id) {
                        itemAgentName = agents[index].name
                    }
                }
                options = {
                    agentIds: pricingOptions[index].agent_ids,
                    mainPrice: pricingOptions[index].price.amount,
                    itemAgentId: items[key]['agent_id'],
                    itemAgentName: itemAgentName,
                    itemPrice: items[key]['price']['amount'],
                }
            }

        }

        itinerariesArr[key] = {
            id: itineraries[key].id,
            options,
            legsArr
        }
    }
    let a = JSON.stringify(itinerariesArr)
    console.info(a)
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

async function findReplace(firstArr, secondArr, firstSearchElement, secondSearchElement, replaceField) {
    for await (let key of Object.keys(secondArr)) {
        if (firstArr[firstSearchElement] === secondArr[secondSearchElement]) {
            return secondArr[replaceField]
        }
    }
}
