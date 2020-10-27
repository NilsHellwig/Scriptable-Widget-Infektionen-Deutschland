// Parameter, die App übergeben bekam
let param = args.widgetParameter
if (param != null && param.length > 0) {
    stateName = param
}

const widget = new ListWidget()
const numberDeaths = await fetchDeaths()
const totalCases = await fetchTotalCases()
const casesForState = await fetchCasesForState(stateName)
await createWidget()

// used for debugging if script runs inside the app
if (!config.runsInWidget) {
    await widget.presentSmall()
}
Script.setWidget(widget)
Script.complete()

// build the content of the widget
async function createWidget() {
    let background_req = new Request ('https://images.pexels.com/photos/4113084/pexels-photo-4113084.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260')
    let backgroundImage = await background_req.loadImage()
    widget.backgroundImage = backgroundImage
    widget.setPadding(10, 10, 10, 10)

    const logoStack = widget.addStack()
    
    const logoImageStack = logoStack.addStack()
    logoStack.layoutHorizontally()

    const divi_icon = await getImage('divi_icon')
    const wimg = logoImageStack.addImage(divi_icon)
    wimg.imageSize = new Size(65, 65)
    wimg.rightAlignImage()


    const contact_icon = await getImage('contact_icon')
    let row = widget.addStack()
    row.layoutHorizontally()
    row.addSpacer(2)
    const iconImg = row.addImage(contact_icon)
    iconImg.imageSize = new Size(50, 50)
    row.addSpacer(13)

    let column = row.addStack()
    column.layoutVertically()

    const numberOfDeaths = numberDeaths
    column.addSpacer(5)
    const numberOfDeaths_Label = column.addText(totalCases.toString())
    numberOfDeaths_Label.font = Font.mediumRoundedSystemFont(18)
    numberOfDeaths_Label.textColor = new Color("#90ee90")
    intensiv_count = column.addStack()
    changed_deaths = intensiv_count.addText(numberOfDeaths.toString())
    changed_deaths.font = Font.mediumRoundedSystemFont(14)
    changed_deaths.textColor = new Color("#ff5555")
    bundesland_count  = widget.addStack()
    bundesland_count_text = bundesland_count.addText(casesForState)
    bundesland_count_text.font = Font.mediumRoundedSystemFont(14)
    bundesland_count_text.textColor = new Color("#ffffff")
}

async function fetchDeaths(){
    let url
    url = 'https://api.apify.com/v2/key-value-stores/OHrZyNo9BzT6xKMRD/records/LATEST?disableRedirect=true'
    const req = new Request(url)
    const apiResult = await req.loadJSON()
    return apiResult.deceased
}

async function fetchCasesForState(stateName){
    let url
    url = 'https://rki-covid-api.now.sh/api/states'
    const req = new Request(url)
    const apiResult = await req.loadJSON()
    let statecount = ""
    apiResult.states.forEach(function (item) {
        if (stateName === item.name) {
            statecount = stateName+ ": " + item.count.toString();
        }
    });
    return statecount;
}

async function fetchTotalCases() {
    let url
    url = 'https://rki-covid-api.now.sh/api/states'
    const req = new Request(url)
    const apiResult = await req.loadJSON()
    // only proceed once second promise is resolved
    let sum = 0
    apiResult.states.forEach(function (item) {
     sum += item.count
   });
    return sum;
}

// get images from local filestore or download them once
async function getImage(image) {
    let fm = FileManager.local()
    let dir = fm.documentsDirectory()
    let path = fm.joinPath(dir, image)
    if (fm.fileExists(path)) {
        return fm.readImage(path)
    } else {
        let imageUrl
        switch (image) {
            case 'contact_icon':
                imageUrl = "https://i.imgur.com/S91gOyr.png"
                break
            case 'divi_icon':
                imageUrl = "https://i.imgur.com/pSA5FFP.png"
                break
            default:
                console.log(`Sorry, couldn't find ${image}.`);
        }
        let iconImage = await loadImage(imageUrl)
        fm.writeImage(path, iconImage)
        return iconImage
    }
}

// helper function to download an image from a given url
async function loadImage(imgUrl) {
    const req = new Request(imgUrl)
    return await req.loadImage()
}
