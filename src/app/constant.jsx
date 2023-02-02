const makeEnum = (obj) => {
  let result = {}
  Object.keys(obj).forEach(k => {
    result[k] = Object.freeze({toString: () => obj[k].toString()})
  });
  return Object.freeze(result);
}

export const TARGETS = makeEnum({
  TAVERN_AI: "TavernAI",
  GRADIO: "Gradio/Ooba"
});

export const LENGTH = makeEnum({
  SHORT: "Short",
  LONG: "Long"
});

export const WPP_POLICY = makeEnum({
  NONE: "None",
  ATTACHED: "Accept Attached",
  REQUIRE: "Require",
});

export const CHARACTER_PROPS = [
  {
    name: "Name",
    form: LENGTH.SHORT,
    wppPolicy: WPP_POLICY.NONE,
    usesTokens: false,
    hint: "What name does your character go by?",
    keys: {
      [ TARGETS.TAVERN_AI ]: "name",
      [ TARGETS.GRADIO ]: "char_name",
    }
  },
  {
    name: "Greeting",
    form: LENGTH.SHORT,
    wppPolicy: WPP_POLICY.NONE,
    usesTokens: true,
    hint: "What should this character say first?",
    keys: {
      [ TARGETS.TAVERN_AI ]: "first_mes",
      [ TARGETS.GRADIO ]: "char_greeting",
    }
  },
  {
    name: "Scenario",
    form: LENGTH.SHORT,
    wppPolicy: WPP_POLICY.NONE,
    usesTokens: true,
    hint: "Where are we? What happened just before?",
    keys: {
      [ TARGETS.TAVERN_AI ]: "scenario",
      [ TARGETS.GRADIO ]: "world_scenario",
    }
  },
  {
    name: "Description",
    form: LENGTH.LONG,
    wppPolicy: WPP_POLICY.ATTACHED,
    usesTokens: true,
    hint: "What is some other information about this character?",
    keys: {
      [ TARGETS.TAVERN_AI ]: "description",
      [ TARGETS.GRADIO ]: "char_persona",
    }
  },
  {
    name: "Example Conversations",
    form: LENGTH.LONG,
    wppPolicy: WPP_POLICY.NONE,
    usesTokens: true,
    description: <>
      See <a href={"https://rentry.org/pygtips#character-creation-tips"}>this document</a> 
      for an explanation of Example Conversations and other character creation tips.
    </>,
    hint: "What is some other information about this character?",
    keys: {
      [ TARGETS.TAVERN_AI ]: "mes_example",
      [ TARGETS.GRADIO ]: "example_dialogue",
    }
  },
];

export const MAX_TOKENS = 1024;
