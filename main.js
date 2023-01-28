const maxTokens = 1024

function grab(id) {
    return document.getElementById("character-" + id).value
}

function pageLoaded() {
    addItem()
    updateOutput()
    document.getElementById("max-tokens").innerText = maxTokens
}

function makeIntoWpp() {
    let name = grab("name")
    let species = grab("species")
    let traits = []
    Array.from(document.getElementById("character-traits").children).forEach(child => {
        traits.push([child.children[1].value, child.children[2].value])
    })
    
    let out = `[${species}("${name}")\n{\n`
    for (trait of traits) {
        let stringVal = `${trait[0]}(`
        let splitVal = trait[1].split(",")
        for (value in splitVal) {
            if (value == 0) {
                stringVal += `"${splitVal[value].trim()}"`
            } else {
                stringVal += ` + "${splitVal[value].trim()}"`
            }
        }
        stringVal += ")\n"
        out += stringVal
    }
    out += "}]"
    return out
}

function updateOutput() {
    let out = makeIntoWpp()

    document.getElementById("output").innerText = out

    let tokenAmount = encode(out).length
    document.getElementById("used-tokens").innerText = tokenAmount

    let counterElem = document.getElementById("token-counter")
    if (tokenAmount > maxTokens) {
        counterElem.className = "overdraft"
    } else if (tokenAmount > (maxTokens * 0.75)) {
        counterElem.className = "warning"
    } else {
        counterElem.className = ""
    }
}

function addItem() {
    let traits = document.getElementById("character-traits")
    let trait = document.createElement("div")
    trait.className = "trait"
    trait.innerHTML = `
        <button 
            class="delete-button" 
            onclick="this.parentElement.remove()"
        >X</button>
        <input class="first" oninput="updateOutput()" placeholder="Appearance">
        <input class="second" oninput="updateOutput()" placeholder="Blue shirt, Long red hair">
    `
    traits.appendChild(trait)
}


function downloadString(str, filename) {
    let stringBlob = new Blob([str], { id: "octet/stream" })
    let link = window.URL.createObjectURL(stringBlob)
    let a = document.createElement("a")
    a.href = link
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(link)
}


function exportTavern() {
    let name = grab("name")
    let result = JSON.stringify({
        name: name,
        description: makeIntoWpp(),
        avatar: "",
        chat: "",
        last_mes: [],
        mes_example: ""
    })
    downloadString(result, `${name}.json`)
}

function exportOogabooga() {
    
}

function exportGradio() {
    
}
