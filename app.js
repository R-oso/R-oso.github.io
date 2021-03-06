const url = 'https://api.thingspeak.com/channels/1747179/feeds.json?key=G47577QHO93IWHOU&results=1'

// AI plant voorspelling
let plantvoorspelling = window.localStorage.getItem("plant")    

// sensor metingen
// sensor grondvocht meting
let grondvochtSensor  
// Temperatuur data
let temperatuurSensor  
// plant info array 
let perfectePlantSituatie = []
// minimale/maximale grondvocht waardes
let minimaleGrondvocht
let maximaleGrondvocht
// minimale/maximale grondvocht waardes
let minimaletemperatuur
let maximaletemperatuur

let plantDataLoaded = ""

// checkt of er een update is en print een message
let message = false

function getSensorData(){
    fetch(url)
    .then(response => response.json())
    .then(data => showSensorData(data))
}

function showSensorData(data){
    temperatuurSensor = data.feeds[0].field1;
    luchtvochtSensor = data.feeds[0].field2;
    grondvochtSensor = data.feeds[0].field3;
    
    // Work in progress!
    // let plantLink = document.createElement('a').setAttribute(plant.foto);
    // body.appendChild(plantLink)
    
    console.log('Data van sensoren:')
    console.log(grondvochtSensor);
    console.log(temperatuurSensor);
    console.log(luchtvochtSensor);
    setTimeout(getSensorData, 10000);
    if (plantDataLoaded == false){
        loadPlantData()    
    }

    if (message == true) {
        meldingen();
        addDelete();
        showOutput();
    }   
}

function showOutput() {
    document.getElementById('output').style.display = "block"
}

// // papa parse
function loadPlantData() {
    Papa.parse('./plantdata.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: results => searchPlant(results.data)
    })
}

// compare fetched sensor data with plant data
function searchPlant(data) {
    plantDataLoaded = true
    perfectePlantSituatie = []

    for (let plant of data) {
        if (plant.plantNaam === plantvoorspelling) {
            console.log("gevonden waarden uit CSV:")
            console.log(plant.grondvocht)
            console.log(plant.temperatuur)

            perfectePlantSituatie = [plant.grondvocht, plant.temperatuur]
            minimaleGrondvocht = perfectePlantSituatie[0] - 3
            maximaleGrondvocht = perfectePlantSituatie[0] + 3
            // minimale/maximale grondvocht waardes
            minimaletemperatuur = perfectePlantSituatie[1] - 3
            maximaletemperatuur = perfectePlantSituatie[1] + 3
        }
    }

    // checks if plant is in CSV
    if (perfectePlantSituatie.length == 0) {
        console.log("plant niet gevonden in CSV")

    } else {
        meldingen()
    }
}

// Message to user if no Bud has been connected yet
function noPlantsMessage() {
    let noPlants = document.createElement("p")
    let noPlantsText = document.createTextNode( "Click the button below to add a plant")
    let noPlantsTextBig = document.createTextNode("Het lijkt erop dat je nog geen BUD hebt toegevoegd.")
    noPlants.appendChild(noPlantsText)
    let noPlantsDiv = document.getElementById("no-plants")
    noPlantsDiv.appendChild(noPlantsTextBig)
    // noPlantsDiv.appendChild(noPlantsText)
}

function addDelete() {
    const element = document.getElementById('delete-plant')
    element.addEventListener("click", () => {
        if (window.localStorage != "") {
            window.localStorage.clear();
            let deletion = true
            localStorage.setItem("deleted", deletion);
            window.location.href = "/index.html";
            return;
        } else {
            return;
        } 
    })
}

// Data output for user
function meldingen() {
    document.getElementById("")
    let meldingGrondvocht = () => {
        if (grondvochtSensor >= minimaleGrondvocht && grondvochtSensor <= maximaleGrondvocht) {
            message = true
            document.querySelector("#sensor-bud").innerHTML = "Bud 1: ";
            document.getElementById("vocht").innerHTML = "De plant heeft voorlopig genoeg water";
            console.log('alles gaat goed')
        } else if (grondvochtSensor >= minimaleGrondvocht && grondvochtSensor >= maximaleGrondvocht) {
            message = true
            document.querySelector("#sensor-bud").innerHTML = "Bud 1: ";
            document.getElementById("vocht").innerHTML = `De ${plantvoorspelling} is aan het uitdrogen! Geef de plant wat water.`;
            console.log('je plant is aan het uitdrogen')
        } else if (grondvochtSensor <= minimaleGrondvocht && grondvochtSensor <= maximaleGrondvocht) {
            message = true
            document.querySelector("#sensor-bud").innerHTML = "Bud 1:"
            document.getElementById("vocht").innerHTML = "De potgrond van de plant is iets te nat. Je hoeft een tijdje geen water te geven.";
            console.log("Je plant is te nat!")
        } else {
            if (window.localStorage.getItem('deleted') == true) {
                meldingDelete()
            } else {
                noPlantsMessage()
                console.log('geen plant');                
            }           
        }
    }
    let meldingTemperatuur = () => {
        if (temperatuurSensor >= minimaletemperatuur && temperatuurSensor <= maximaletemperatuur) {
            document.querySelector("#sensor-bud").innerHTML = "Bud 1: ";
            document.getElementById("temp").innerHTML = "Dit is een fijne temperatuur voor de plant.";
            message = true
            console.log('alles gaat goed')
        } else if (temperatuurSensor <= minimaletemperatuur && temperatuurSensor <= maximaletemperatuur) {
            message = true
            document.querySelector("#sensor-bud").innerHTML = "Bud 1: ";
            document.getElementById("temp").innerHTML = `Het is erg koud voor je ${plantvoorspelling}. Verplaats de plant naar een warmere plek`;
            console.log('Je plant bevriest zowat!')
        } else if (temperatuurSensor >= minimaletemperatuur && temperatuurSensor >= maximaletemperatuur) {
            document.querySelector("#sensor-bud").innerHTML = "Bud 1: "
            message = true
            document.getElementById("temp").innerHTML = "Je plant heeft het te warm. Verplaats hem naar een koelere plek met wat meer schaduw.";
            console.log("Het is veeel te warm voor je plant!")
        } else {
            console.log('geen plant');           
        }
    }

    document.querySelector("#naam").innerHTML = plantvoorspelling
    console.log("grondvocht melding:")
    meldingGrondvocht();
    console.log('temperatuur melding:')
    meldingTemperatuur();
    console.log('deletion')
}

let meldingDelete = () => {
    let noPlants = document.getElementById('no-plants');
    noPlants.innerHTML = "De bud is verwijderd"
}

getSensorData();

