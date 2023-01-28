const maxTokens = 1024

function grab(id) {
    return document.getElementById("character-" + id).value
}

function pageLoaded() {
    addTraitItem()
    addChatItem()
    updateOutput()
    document.getElementById("max-tokens").innerText = maxTokens
}

function makeIntoWpp() {
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
            '<textarea placeholder="Person: Hello!"></textarea>'
            :
            '<input placeholder="Person: Hello!">'
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
    let name = grab("name")
    let greeting = grab("greeting")
    let scenario = grab("scenario")
    let dialogue = []

    Array.from(document.getElementById("character-chats").children).forEach(child => {
        dialogue.push(
            child.children[1].value
        )
    })
    
    let result = JSON.stringify({
        char_name: name,
        char_persona: makeIntoWpp(),
        char_greeting: greeting,
        world_scenario: scenario,
        example_dialogue: dialogue.join("\n")
    })
    downloadString(result, `${name}.json`)
}
