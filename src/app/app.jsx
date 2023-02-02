import { encode } from './util/tokenizer.js'
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Key } from "@solid-primitives/keyed";
import containerStyles from './container.module.css';
import itemStyles from './item.module.css';
import CharacterEditor from './components/CharacterEditor';
import { CHARACTER_PROPS, MAX_TOKENS, TARGETS, WPP_POLICY } from './constant.jsx';

const wppRegex = /\[character\(".*?"\)\n{.*}]/ims;

function calculateUsedTokens(info) {
  let result = 0;
  CHARACTER_PROPS.forEach(prop => {
    if (
      prop.usesTokens && 
      (
        info[prop.name].value.length != 0 ||
        info[prop.name].wpp && info[prop.name].wpp.length != 0
      )
    ) {
      result += encode(info[prop.name].value || "").length;
      result += encode(info[prop.name].wpp || "").length;
    }
  });
  return result;
}

function getJsonForTarget(target, info) {
  let result = {};
  CHARACTER_PROPS.forEach(prop => {
    if (prop.keys[target] && info[prop.name]) {
      result[prop.keys[target]] = (info[prop.name].value || "") + (info[prop.name].wpp || "");
    }
  });
  return result;
}

function guessJsonFormat(json) {
  let guesses = {};
  let keys = Object.keys(json);
  Object.values(TARGETS).forEach(t => guesses[t] = 0);
  CHARACTER_PROPS.forEach(prop => {
    Object.values(TARGETS).forEach(target => {
      if (keys.includes(prop.keys[target])) guesses[target] += 1;
    });
  });
  let entries = Object.entries(guesses).sort((a, b) => b[1] - a[1]);
  return entries;
}

function jsonToInternalFormat(json, target) {
  let result = {};

  if (target) {
    CHARACTER_PROPS.forEach(prop => {
      if (prop.keys[target] && json[prop.keys[target]]) {
        result[prop.name] = {value: json[prop.keys[target]], wpp: ""};
      }
    });
  }
  
  return result;
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

function App() {
  let [usedTokens, setUsedTokens] = createSignal(0);
  let [previewTarget, setPreviewTarget] = createSignal(TARGETS.TAVERN_AI);
  let [info, setInfo] = createStore(null);
  let [imported, setImported] = createStore({});
  let getDescription = () => (
    (`${info["Description"]?.value || ""}\n${info["Description"]?.wpp || ""}`).trim()
  );

  return (
    <div class={ containerStyles["main-container"] }>
      <div class={ containerStyles["left-panel"] }>
        <div>
          Welcome to the Pygmalion Character Creation Toolkit.
          <br /><br />
          This page will allow you to write up a character and
          export it for every supported platform in one go!
        </div>
        {/* importing stuff i couldnt figure out yet
          
        <input 
          type="file" 
          accept="application/json" 
          onchange={e => {
            if (e.target.files[0]) {
              let reader = new FileReader();
              reader.readAsText(e.target.files[0]);
              reader.onload = function() {
                let jsonResult = JSON.parse(reader.result);
                let guessedFormat = guessJsonFormat(jsonResult);
                let internalFormat = jsonToInternalFormat(jsonResult, guessedFormat[0][0]);

                CHARACTER_PROPS.filter(prop => prop.wppPolicy != WPP_POLICY.NONE).forEach(prop => {
                  let content = internalFormat[prop.name].value;
                  let wpp = wppRegex.exec(content);
                  if (wpp && wpp[0]) {
                    content = content.replaceAll(wpp[0], "").trim();
                    internalFormat[prop.name].value = content;
                    internalFormat[prop.name].wpp = wpp[0];
                  }
                })

                setImported(internalFormat);
              };
            }
          }}
        /> */}
        <CharacterEditor oninput={info => {
          setInfo(info);
          setUsedTokens(calculateUsedTokens(info));
        }} imported={imported} />
        <Key each={Object.values(TARGETS)} by={entry => entry.toString()}>
          {entry =>
            <button onclick={() => {
              downloadString(
                JSON.stringify(
                  getJsonForTarget(entry().toString(), info)
                ), 
                `${info["Name"].value || "character"}.json`
              );
            }}>{entry().toString()}</button>
          }
        </Key>
      </div>
      <div class={ containerStyles["right-panel"] }>
        <div class={ containerStyles["format-buttons"] }>
          View JSON as... 
          <Key each={Object.entries(TARGETS)} by={entry => entry[0].toString()}>
            {entry =>
              <button 
                class={
                  previewTarget() == entry()[1].toString() ?
                  containerStyles["active"]
                  :
                  ""
                }
                onclick={() =>
                  setPreviewTarget(entry()[1].toString())
                }
              >{entry()[1].toString()}</button>
            }
          </Key>
        </div>
        <div class={ containerStyles["output-one"] }>
          <div class={ containerStyles["monospace"] }>
            {JSON.stringify(getJsonForTarget(previewTarget(), info), null, 2)}
          </div>
        </div>
        <div class={ containerStyles["output-two"] }>
          <div class={ containerStyles["monospace"] }>
            {getDescription()}
          </div>
        </div>
      </div>
      <div class={`
        ${itemStyles["token-counter"]} 
        ${usedTokens() > (MAX_TOKENS * 0.75) && 
          usedTokens() <= MAX_TOKENS ? itemStyles["warning"] : ""}
        ${usedTokens() > MAX_TOKENS ? itemStyles["overdraft"] : ""}
      `}>
        {usedTokens()} / {MAX_TOKENS} tokens
      </div>
      <div class={ itemStyles["beta-badge"] }>BETA</div>
    </div>
  );
}

export default App;
