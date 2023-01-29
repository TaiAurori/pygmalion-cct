const maxTokens = 1024
var currentTarget = "tavern"

function grab(id) {
    return document.getElementById("character-" + id).value
}

function pageLoaded() {
    setExportTarget("tavern")
    addTraitItem()
    addChatItem()
    updateOutput()
    document.getElementById("max-tokens").innerText = maxTokens
}

function setExportTarget(target) {
    disableGlobal("target-" + currentTarget)
    enableGlobal("target-" + target)
    currentTarget = target
    updateOutput()
}

function grabDescription() {
    if (!globalActive('wpp-mode')) return grab('description')
    
    let name = grab("name")
    
    let traits = []
    let traitsElement = document.getElementById("character-traits")

    let description = grab("description")
    if (description) traits.unshift(["Description", description.split("\n")])
    
    Array.from(traitsElement.children).forEach(child => {
        traits.push([
            child.children[1].value, 
            child.children[2].value.split(
                child.className.includes("long") ? "\n" : ","
            )
        ])
    })
    
    let out = `[character("${name}")\n{\n`
    
    for (trait of traits) {
        if (trait[0] == "" && trait[1] == "") continue
        let stringVal = `${trait[0]}(`
        for (value in trait[1]) {
            if (value == 0) {
                stringVal += `"${trait[1][value].trim()}"`
            } else {
                stringVal += ` + "${trait[1][value].trim()}"`
            }
        }
        stringVal += ")\n"
        out += stringVal
    }
    out += "}]"
    return out
}

function updateOutput() {
    if (!globalActive("wpp-mode")) {
        let ogetCurrentJson
    }
    let isWpp = globalActive("wpp-mode")
    var outJson = JSON.stringify(getCurrentJson(), null, 2)
    var outDesc = grabDescription()
    var tokenAmount = encode(JSON.stringify(getCurrentJson())).length

    document.getElementById("output-one").innerText = outJson
    document.getElementById("output-two").innerText = outDesc

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

function toggleGlobal(name) {
    document.body.classList.toggle(name)
    updateOutput()
}

function enableGlobal(name) {
    document.body.classList.add(name)
    updateOutput()
}

function disableGlobal(name) {
    document.body.classList.remove(name)
    updateOutput()
}

function globalActive(name) {
    return Array.from(document.body.classList).includes(name)
}

function addTraitItem(key, long = false) {
    let traits = document.getElementById("character-traits")
    let trait = document.createElement("div")
    trait.className = "trait"
    if (long) trait.className += " long"
    trait.innerHTML = `
        <button 
            class="delete-button" 
            onclick="this.parentElement.remove(); updateOutput()"
        >X</button>
        <input class="first" oninput="updateOutput()" placeholder="Appearance">
        ${long ?
            '<textarea class="second" oninput="updateOutput()" placeholder="Blue shirt&#10;Long red hair"></textarea>'
            :
            '<input class="second" oninput="updateOutput()" placeholder="Blue shirt, Long red hair">'
        }
    `
    if (key) trait.children[1].value = key
    traits.appendChild(trait)
    updateOutput()
}

function addChatItem(long = false) {
    let msgs = document.getElementById("character-chats")
    let msg = document.createElement("div")
    msg.className = "msg"
    if (long) msg.className += " long"
    msg.innerHTML = `
        <button 
            class="delete-button" 
            onclick="this.parentElement.remove()"
        >X</button>
        ${long ?
            '<textarea placeholder="Person: Hello!" oninput="updateOutput()"></textarea>'
            :
            '<input placeholder="Person: Hello!" oninput="updateOutput()">'
        }
    `
    msgs.appendChild(msg)
    updateOutput()
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

function getCurrentJson() {
    if (currentTarget == "tavern") return exportTavern()
    if (currentTarget == "gradio") return exportGradio()
    return {"error": "Invalid target"}
}

function exportTavern() {
    let dialogue = grab("chats").split("\n")
    
    let name = grab("name")
    let scenario = grab("scenario")
    let result = {
        name: name,
        description: grabDescription(),
        avatar: "none",
        // chat: "",
        last_mes: [],
        mes_example: !globalActive("simple") ? dialogue.join("\n") : "",
        scenario: scenario
    }
    return result
}

function exportGradio() {
    let name = grab("name")
    let greeting = grab("greeting")
    let scenario = grab("scenario")
    let dialogue = grab("chats").split("\n")
    
    let result = {
        char_name: name,
        char_persona: grabDescription(),
        char_greeting: greeting,
        world_scenario: scenario,
        example_dialogue: !globalActive("simple") ? dialogue.join("\n") : ""
    }
    return result
}

function downloadCharacter() {
    let name = grab("name")
    downloadString(JSON.stringify(getCurrentJson()), name + ".json")
}
