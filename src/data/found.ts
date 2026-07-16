import type { FoundationLesson } from "./types";

export const LESSONS: FoundationLesson[] = [
  {
    id:"how", title:"How Cantonese works", badge:"Lesson 0 · orientation", type:"concept",
    intro:"A two-minute orientation. No memorising yet — just get the lay of the land so the rest makes sense.",
    items:[
      ["Six tones carry meaning","The same syllable said at a different pitch is a different word — and there are six pitches. Training your ear to them is the single most useful thing you'll do. That's the very next lesson."],
      ["Traditional characters","Hong Kong and Macau write in traditional characters (繁體字). Each character is exactly one syllable. You don't need to write them to speak — reading a few comes much later."],
      ["Jyutping = training wheels","Jyutping spells the sounds with letters, then adds a number (1–6) for the tone. So nei5 hou2 is 'hello'. Lean on it until the characters start to stick."],
      ["Spoken isn't written","What people actually say (口語, colloquial) isn't word-for-word the formal written language. This whole course teaches the spoken form — what you'll really hear and use."],
      ["n and l blur together","Loads of speakers swap initial n- and l-, so 你 nei5 often comes out as lei5. Both are completely fine. Don't let it throw you when you hear it."],
      ["Don't chase perfect","You'll get tones wrong at first — everyone does. Context carries most of the meaning, and any attempt at Cantonese earns real warmth. Speak early, speak often."],
    ]
  },
  {
    id:"tones", title:"The six tones", badge:"Lesson 1 · your ear", type:"tone",
    intro:"Six everyday words, one sitting on each tone. Trace the pitch line, hit ▶, and say it back out loud. Level = how high it sits; the line shape = how it moves.",
    items:[
      {n:1,name:"high level",  pts:[[6,16],[94,16]], syl:"maa1",  han:"媽 (mum)"},
      {n:2,name:"mid rising",  pts:[[6,38],[94,11]], syl:"hou2",  han:"好 (good)"},
      {n:3,name:"mid level",   pts:[[6,27],[94,27]], syl:"heoi3", han:"去 (to go)"},
      {n:4,name:"low falling", pts:[[6,36],[94,46]], syl:"caa4",  han:"茶 (tea)"},
      {n:5,name:"low rising",  pts:[[6,44],[94,28]], syl:"ngo5",  han:"我 (I / me)"},
      {n:6,name:"low level",   pts:[[6,41],[94,41]], syl:"faan6", han:"飯 (rice)"},
    ]
  },
  {
    id:"initials", title:"Initial sounds", badge:"Lesson 2 · consonants", type:"sound",
    intro:"The consonant that starts a syllable. A few have no English match, and several come in soft/hard pairs — the hard one has a little puff of air. Tap an example to hear it.",
    items:[
      {jp:"b / p", note:"Soft vs puffy. p pushes air; b doesn't.", ex:[["爸","baa1","dad"],["怕","paa3","afraid"]]},
      {jp:"d / t", note:"Same pairing — listen for the puff on t.", ex:[["大","daai6","big"],["太","taai3","too"]]},
      {jp:"g / k", note:"Hard g vs puffy k.", ex:[["狗","gau2","dog"],["球","kau4","ball"]]},
      {jp:"gw / kw", note:"g and k with rounded lips (a 'w' glide).", ex:[["國","gwok3","country"],["規","kwai1","rule"]]},
      {jp:"z / c", note:"z is like 'ds'; c is 'ts' with a puff.", ex:[["知","zi1","to know"],["茶","caa4","tea"]]},
      {jp:"s", note:"As in English 'see'.", ex:[["三","saam1","three"]]},
      {jp:"j", note:"Like English 'y', not 'j'.", ex:[["一","jat1","one"],["有","jau5","to have"]]},
      {jp:"ng", note:"A nasal start — the 'ng' in 'sing', moved to the front.", ex:[["五","ng5","five"],["我","ngo5","I / me"]]},
      {jp:"h", note:"A light breathy h.", ex:[["好","hou2","good"]]},
      {jp:"m / n / l", note:"n and l often merge — both are fine.", ex:[["媽","maa1","mum"],["你","nei5","you"],["嚟","lei4","to come"]]},
      {jp:"f / w", note:"As in English.", ex:[["火","fo2","fire"],["話","waa6","to speak"]]},
    ]
  },
  {
    id:"finals", title:"Final sounds", badge:"Lesson 3 · vowels & endings", type:"sound",
    intro:"Everything after the initial — the vowel plus any ending. Cantonese has long vs short vowels, rounded vowels English lacks, and clipped -p/-t/-k endings you barely release.",
    items:[
      {jp:"aa vs a", note:"aa is a long 'ah'; a is short (only before an ending).", ex:[["沙","saa1","sand"],["心","sam1","heart"]]},
      {jp:"-m / -n / -ng", note:"Close your lips fully for -m.", ex:[["三","saam1","three"],["山","saan1","mountain"],["想","soeng2","to want"]]},
      {jp:"-p / -t / -k", note:"Shape the ending but barely release it — clipped.", ex:[["十","sap6","ten"],["一","jat1","one"],["六","luk6","six"]]},
      {jp:"oe", note:"A rounded vowel — like the 'eu' in French 'peu'.", ex:[["香","hoeng1","fragrant"],["靴","hoe1","boot"]]},
      {jp:"eo", note:"A short rounded vowel, before n/t.", ex:[["春","ceon1","spring"],["信","seon3","letter"]]},
      {jp:"yu", note:"Tight rounded 'ee' — French u / German ü.", ex:[["書","syu1","book"],["魚","jyu4","fish"]]},
      {jp:"eoi", note:"Glides from the rounded vowel.", ex:[["水","seoi2","water"],["去","heoi3","to go"]]},
      {jp:"ou", note:"Like saying 'oh'.", ex:[["好","hou2","good"],["路","lou6","road"]]},
      {jp:"o / oi", note:"o as in 'or'; oi adds a glide.", ex:[["哥","go1","big brother"],["開","hoi1","to open"]]},
      {jp:"ai vs aai", note:"Short ai vs long aai.", ex:[["西","sai1","west"],["太","taai3","too"]]},
    ]
  },
  {
    id:"blocks", title:"Building blocks", badge:"Lesson 4 · first words", type:"word",
    intro:"The atoms of every sentence: who, the verb 'to be', having, good/bad, this/that, and the question words. Get these and you can already say a lot.",
    items:[
      ["我","ngo5","I / me",""],
      ["你","nei5","you",""],
      ["佢","keoi5","he / she / it",""],
      ["我哋","ngo5 dei6","we / us","Add 哋 dei6 to make a pronoun plural."],
      ["你哋","nei5 dei6","you (plural)",""],
      ["佢哋","keoi5 dei6","they / them",""],
      ["係","hai6","to be / yes",""],
      ["唔係","m4 hai6","is not / no","唔 m4 is the all-purpose 'not'."],
      ["有","jau5","to have / there is",""],
      ["冇","mou5","to not have / there isn't",""],
      ["好","hou2","good / very","Also means 'very': 好好 = very good."],
      ["唔好","m4 hou2","not good / don't",""],
      ["呢個","ni1 go3","this one",""],
      ["嗰個","go2 go3","that one",""],
      ["乜嘢","mat1 je5","what",""],
      ["邊個","bin1 go3","who / which one",""],
      ["點","dim2","how",""],
    ]
  },
  {
    id:"first", title:"Your first sentences", badge:"Lesson 5 · put it together", type:"word",
    intro:"Now snap the blocks together. Notice the yes/no trick below — it builds half of these for you.",
    keynote:["The yes/no trick","To ask a yes/no question, say the word, then 唔 (not), then the word again. <code>係唔係</code> = 'is it?', <code>有冇</code> = 'do you have?', <code>好唔好</code> = 'is it good / okay?'. No question word needed."],
    items:[
      ["我係…","ngo5 hai6","I am…",""],
      ["你係唔係…?","nei5 hai6 m4 hai6","Are you…?","The X-唔-X yes/no pattern."],
      ["呢個係…","ni1 go3 hai6","This is…",""],
      ["呢個係乜嘢?","ni1 go3 hai6 mat1 je5","What is this?",""],
      ["我有…","ngo5 jau5","I have…",""],
      ["你有冇…?","nei5 jau5 mou5","Do you have…?","有冇 = have-not-have."],
      ["好唔好?","hou2 m4 hou2","Is it good? / Okay?",""],
      ["佢係邊個?","keoi5 hai6 bin1 go3","Who is he / she?",""],
    ]
  },
];
