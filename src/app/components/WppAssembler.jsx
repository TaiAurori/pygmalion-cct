import { createSignal, createEffect, Index } from "solid-js";
import { createStore } from "solid-js/store";
import containerStyles from "../container.module.css";
import itemStyles from "../item.module.css";

function parseWpp(name, traits) {
  let out = `[character("${name}")\n{\n`
  for (let trait of traits) {
    if (trait[0] == "" && trait[1] == "") continue
    let stringVal = `${trait[0]}(`
    for (let value in trait[1]) {
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

function WppAssembler(props) {
  let [table, setTable] = createStore([]);
  let [name, setName] = createSignal("");
  let [attached, setAttached] = createSignal(false);
  let lastParsed = "";
  
  function addEntry(name = "", long = false) {
    setTable(table => [...table, [name, "", long]]);
  }
  
  function delEntry(index) {
    setTable(table => table.slice(0, index - 1).concat(table.slice(index)));
  }
  
  function setEntryName(index, content) {
    setTable(index, 0, content);
  }
  
  function setEntryValue(index, content) {
    setTable(index, 1, content);
  }

  createEffect(() => {
    if (props.value == lastParsed) return;
    if (props.value != "") setAttached(true);
    
    // todo: probably use regex for this
    if (props.value.startsWith('[') && props.value.endsWith("}]")) {
      let lines = props.value.split('\n');
      let quoteSplit = lines[0].split('("');
      let name = quoteSplit[1].split('")')[0];

      setName(name);

      let traits = [];
      lines = lines.slice(2);
      lines.pop();
      lines.forEach(line => {
        let quoteSplit = line.split('("');
        let key = quoteSplit[0];
        let valueString = quoteSplit[1].split('")')[0];
        let values = valueString.split('" + "')
        traits.push([key, values]);
      });
      
      setTable(traits.map(trait => {
        trait[1] = trait[1].join(", ");
        trait.push(false);
        return trait;
      }));
    }
  });

  createEffect(() => {
    if (props.oninput) {
      let traits = table.map(trait => {
        let value = trait[1]
          .split(trait[2] ? "\n" : ",")
          .map(t => t.trim());
        return [trait[0], value];
      });
      let wpp = attached() ? parseWpp(name(), traits) : "";
      lastParsed = wpp;
      props.oninput(wpp);
    }
  })
  
  // solid only updates if the signal call is inside a jsx element
  // which is why we have to use a fragment here
  return (
    <>
      {
        attached() ? 
          <>
            <div class={ containerStyles["section"] }>
              <input 
                type="text"
                placeholder="Character Name"
                oninput={e => {setName(e.target.value)}}
                value={name()}
              />
              <Index each={table}>
                {(prop, i) => 
                  <div 
                    class={`
                    ${itemStyles["trait-entry"]} 
                    ${prop()[2] ? itemStyles["trait-entry-long"] : ""}
                    `}
                  >
                    <button
                      class={ itemStyles["trait-delete-button"]}
                      onclick={ () => delEntry(i) }
                    >X</button>
                    <input 
                      class={ itemStyles["trait-name-input"] } 
                      type="text"
                      placeholder="Appearance" 
                      oninput={e => setEntryName(i, e.target.value)}
                      value={prop()[0]}
                    />
                    {prop()[2] ? 
                      <textarea 
                        class={ itemStyles["trait-value-input"] } 
                        placeholder="Blue shirt&#10;Long red hair"
                        oninput={e => setEntryValue(i, e.target.value)}
                        value={prop()[1]}
                      />
                      :
                      <input 
                        class={ itemStyles["trait-value-input"] } 
                        type="text"
                        placeholder="Blue shirt, Long red hair"
                        oninput={e => setEntryValue(i, e.target.value)}
                        value={prop()[1]}
                      />
                    }
                  </div>
                } 
              </Index>
              <button 
                class={ containerStyles["top-margin"] } 
                onclick={() => addEntry('', false)}
              >
                Add short item<br />
                <small>(e.g {"<"}3 words)</small>
              </button>
              <button 
                class={ containerStyles["left-margin"] } 
                onclick={() => addEntry('', true)}
              >
                Add long item<br />
                <small>(e.g sentences)</small>
              </button>
            </div>
            <button 
              onclick={() => setAttached(false)}
            >Detach W++</button>
          </>
          :
          <button 
            class={ containerStyles["top-margin"] } 
            onclick={() => setAttached(true)}
          >Attach W++</button>
      }
    </>
  );
}

export default WppAssembler;
