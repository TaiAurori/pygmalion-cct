import containerStyles from '../container.module.css';
import itemStyles from '../item.module.css';
import { CHARACTER_PROPS, LENGTH, WPP_POLICY } from '../constant';
import WppAssembler from './WppAssembler';
import { createSignal, createEffect, untrack } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Key } from "@solid-primitives/keyed";

function pokeValue(obj, name, value) {
  let result = structuredClone(obj);
  result[name] = value;
  return result;
}

function PropertyEditor(props) {
  let [content, setContent] = createSignal("");
  let [wpp, setWpp] = createSignal(""); 

  createEffect((prev) => {
    if (props.oninput) props.oninput(content(), wpp());
  });

  createEffect(() => {
    if (props.value && props.value.value) setContent(props.value.value);
    if (props.value && props.value.wpp) setWpp(props.value.wpp);
  });
  
  return (
    <div class={ containerStyles["property-editor"] }>
      <span class={ itemStyles["property-label"] }>
        {props.prop.name}
      </span>
      <span>
        {props.prop.description}
      </span>
      {
        props.prop.wppPolicy != WPP_POLICY.REQUIRE &&
        (props.prop.form == LENGTH.LONG ?
        <textarea 
          placeholder={props.prop.hint} 
          value={content()}
          oninput={e => {
            if (e.target.value != content()) setContent(e.target.value); 
          }} 
        />
        :
        <input 
          type="text"
          placeholder={props.prop.hint} 
          value={content()}
          oninput={e => {
            if (e.target.value != content()) setContent(e.target.value); 
          }} 
        />)
      }
      {
        props.prop.wppPolicy && props.prop.wppPolicy != WPP_POLICY.NONE &&
        <WppAssembler 
          oninput={newWpp => {
            if (newWpp != wpp) setWpp(newWpp); 
          }}
          value={wpp()}
        />
      }
    </div>
  )
}

function CharacterEditor(props) {
  let [info, setInfo] = createStore({})
  setInfo(() => {
    let result = {};
    CHARACTER_PROPS.forEach(prop => {
      result[prop.name] = {value: ""};
    });
    return result;
  });

  createEffect(() => {
    CHARACTER_PROPS.forEach(prop => {
      if (props.imported[prop.name]) {
        setInfo(prop.name, JSON.parse(JSON.stringify(props.imported[prop.name])));
      }
    });
  });
  
  return (
    <Key 
      each={CHARACTER_PROPS} 
      by={prop => prop.name} 
      fallback={<span>{"No properties found! This shouldn't happen!"}</span>}
    >
      {prop => 
        <PropertyEditor prop={prop()} value={info[prop().name]} oninput={(text, wpp) => {
          setInfo(prop().name, "value", text);
          setInfo(prop().name, "wpp", wpp);
          if (props.oninput) {
            props.oninput(info);
          };
        }} />
      }
    </Key>
  );
}

export default CharacterEditor;
