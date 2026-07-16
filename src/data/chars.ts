import type { CharLesson } from "./types";

export const LESSONS: CharLesson[] = [
  {
    id: "why", title: "Characters are pictures", badge: "Step 0 · the idea", type: "concept",
    intro: "Two minutes before we start. Nothing to memorise here — just see how the writing system thinks.",
    items: [
      ["Every character is one syllable", "One character = one beat of sound. 你好 is two characters, two syllables: nei5 hou2. There is no alphabet to sound out — each character is a little picture with its own sound."],
      ["They really did start as drawings", "3,000 years ago people scratched pictures on bones: a mountain, a mouth, the sun. Those drawings slowly straightened into today's characters — and in lots of them you can STILL see the picture. That's where we start."],
      ["You only need to recognise, not write", "Children in Hong Kong spend years learning to write by hand. You don't have to. Reading a character on a menu or a sign is the superpower — writing can wait forever."],
      ["Big characters are built from small ones", "Once you know 20 simple pictures, bigger characters stop being noise: 好 is just woman + child. 明 is sun + moon. Learning characters is stacking blocks, not memorising snowflakes."],
      ["Hong Kong writes the full-fat version", "HK uses traditional characters (繁體字) — more strokes, more history, and the picture inside is often easier to see than in the simplified mainland forms. Lucky you."],
      ["Guessing is allowed", "Real readers guess from parts all the time. If you see the water dots 氵 you can bet it's something wet. Wrong guesses that are close are progress — that's exactly how kids learn."],
    ],
  },
  {
    id: "pict", title: "Pictures you can still see", badge: "Step 1 · pictographs", type: "pict",
    intro: "Ten characters that are still drawings. Look at the picture, hear it, and let your eyes find the shape inside the character. Mark ✓ when you can spot it.",
    items: [
      { han: "人", jp: "jan4", en: "person", pic: "🚶", story: "Two legs mid-stride. Every person you'll meet in writing starts here." },
      { han: "山", jp: "saan1", en: "mountain", pic: "⛰️", story: "Three peaks, middle one tallest. Hong Kong is covered in these." },
      { han: "口", jp: "hau2", en: "mouth", pic: "👄", story: "An open mouth. Remember this one — it becomes the most Cantonese radical of all." },
      { han: "日", jp: "jat6", en: "sun · day", pic: "☀️", story: "A round sun, squared off, with a spot in the middle. One sun = one day." },
      { han: "月", jp: "jyut6", en: "moon · month", pic: "🌙", story: "A crescent moon standing on its tip. One moon cycle = one month." },
      { han: "水", jp: "seoi2", en: "water", pic: "💧", story: "A stream down the middle, splashes either side." },
      { han: "火", jp: "fo2", en: "fire", pic: "🔥", story: "A flame with two sparks jumping off it." },
      { han: "木", jp: "muk6", en: "tree · wood", pic: "🌳", story: "A trunk, branches up, roots down." },
      { han: "手", jp: "sau2", en: "hand", pic: "✋", story: "A palm with fingers spread — count the lines." },
      { han: "門", jp: "mun4", en: "door · gate", pic: "🚪", story: "Saloon doors, two leaves on hinges. You'll see it on every shopfront." },
    ],
    quiz: [
      { q: "mountain", opts: ["山", "水", "火"], ok: 0 },
      { q: "moon", opts: ["日", "月", "門"], ok: 1 },
      { q: "hand", opts: ["木", "口", "手"], ok: 2 },
    ],
  },
  {
    id: "idea", title: "Count and point", badge: "Step 2 · simple ideas", type: "pict",
    intro: "Ideas too abstract to draw got the simplest marks possible — lines and pointers. These are the easiest characters you will ever learn.",
    items: [
      { han: "一", jp: "jat1", en: "one", pic: "1️⃣", story: "One line. That's it. You now read Chinese." },
      { han: "二", jp: "ji6", en: "two", pic: "2️⃣", story: "Two lines." },
      { han: "三", jp: "saam1", en: "three", pic: "3️⃣", story: "Three lines. (Four is NOT four lines — sadly.)" },
      { han: "十", jp: "sap6", en: "ten", pic: "🔟", story: "A full crossing — ten, complete. 三十 = three tens = 30." },
      { han: "上", jp: "soeng6", en: "up · above", pic: "⬆️", story: "A mark ABOVE the base line, pointing up." },
      { han: "下", jp: "haa6", en: "down · below", pic: "⬇️", story: "Same idea flipped — the mark hangs BELOW the line." },
      { han: "中", jp: "zung1", en: "middle · centre", pic: "🎯", story: "A line straight through the centre of a box. Dead centre — 中." },
      { han: "大", jp: "daai6", en: "big", pic: "🙆", story: "A person (人) stretching both arms out wide: it was THIS big!" },
      { han: "小", jp: "siu2", en: "small", pic: "🤏", story: "Three small strokes shrinking away from each other. Tiny." },
    ],
    quiz: [
      { q: "three", opts: ["二", "三", "十"], ok: 1 },
      { q: "big", opts: ["大", "小", "中"], ok: 0 },
      { q: "up / above", opts: ["下", "中", "上"], ok: 2 },
    ],
  },
  {
    id: "story", title: "Two pictures, one idea", badge: "Step 3 · character stories", type: "story",
    intro: "Now the fun part. Put two pictures you know in one square and you get a new idea. Read the equation, then look at the character until you can see both halves.",
    items: [
      { parts: ["日", "月"], pen: ["sun", "moon"], han: "明", jp: "ming4", en: "bright", story: "Sun AND moon together — all the light there is. Bright." },
      { parts: ["女", "子"], pen: ["woman", "child"], han: "好", jp: "hou2", en: "good", story: "A mother with her child — the old picture of 'all is well'. You've been saying it all along: 你好." },
      { parts: ["亻", "木"], pen: ["person", "tree"], han: "休", jp: "jau1", en: "to rest", story: "A person leaning against a tree. Break time." },
      { parts: ["木", "木"], pen: ["tree", "tree"], han: "林", jp: "lam4", en: "woods", story: "Two trees make a wood. (You'll see 林 in tons of HK names.)" },
      { parts: ["木", "木", "木"], pen: ["tree", "tree", "tree"], han: "森", jp: "sam1", en: "forest", story: "THREE trees make a forest. Yes, it's that literal." },
      { parts: ["宀", "豕"], pen: ["a roof", "a pig"], han: "家", jp: "gaa1", en: "home · family", story: "A pig under your roof — in old farming life, that meant wealth and warmth. Home." },
    ],
    quiz: [
      { q: "bright", opts: ["林", "明", "休"], ok: 1 },
      { q: "to rest", opts: ["休", "森", "家"], ok: 0 },
      { q: "forest", opts: ["木", "林", "森"], ok: 2 },
    ],
  },
  {
    id: "blocks", title: "The building blocks", badge: "Step 4 · radicals", type: "radical",
    intro: "Most characters have a HINT built in — a squeezed-down picture on one side that whispers what kind of word it is. Spot the hint and half the guessing is done. Tap any example to hear it.",
    items: [
      { rad: "亻", name: "the person side", note: "That's 人 squeezed thin to stand on the left. If it's there, the character is about people.", ex: [["你", "nei5", "you"], ["佢", "keoi5", "he / she"], ["休", "jau1", "to rest"]] },
      { rad: "氵", name: "the water side", note: "Three drops on the left — anything wet, flowing or drinkable.", ex: [["海", "hoi2", "sea"], ["湯", "tong1", "soup"], ["酒", "zau2", "alcohol"]] },
      { rad: "口", name: "the mouth side", note: "The most Cantonese thing in writing: Hong Kong invented characters for spoken-only words by adding a mouth. If it has 口 on the left, say it out loud — it's probably pure Cantonese.", ex: [["唔", "m4", "not"], ["啦", "laa1", "(come on!)"], ["咩", "me1", "what?!"]] },
      { rad: "女", name: "the woman side", note: "The character 女 (neoi5, woman) as a building block.", ex: [["媽", "maa1", "mum"], ["姐", "ze2", "older sister"], ["好", "hou2", "good"]] },
      { rad: "扌", name: "the hand side", note: "That's 手 squeezed thin. Things you do with your hands.", ex: [["打", "daa2", "to hit"], ["搵", "wan2", "to look for"]] },
      { rad: "艹", name: "the grass top", note: "Two little sprouts across the top — plants, and things made from them.", ex: [["茶", "caa4", "tea"], ["菜", "coi3", "vegetables"]] },
    ],
    quiz: [
      { q: "Which is probably something WET?", opts: ["湯", "打", "姐"], ok: 0 },
      { q: "Which is a spoken-Cantonese word?", opts: ["林", "咩", "森"], ok: 1 },
      { q: "Which is done with the HANDS?", opts: ["海", "菜", "打"], ok: 2 },
    ],
  },
  {
    id: "sound", title: "Meaning + sound", badge: "Step 5 · the big secret", type: "story",
    intro: "Here's the trick behind most characters: one half hints the MEANING, the other half lends its SOUND. Crack this and characters stop being random.",
    items: [
      { parts: ["女", "馬"], pen: ["woman (meaning)", "馬 maa5 horse (sound)"], han: "媽", jp: "maa1", en: "mum", story: "The 女 says 'a woman-word'; the horse 馬 just donates its sound: maa. Mum is not a horse." },
      { parts: ["氵", "可"], pen: ["water (meaning)", "可 ho2 (sound)"], han: "河", jp: "ho4", en: "river", story: "Water side + the sound ho. A wet thing that sounds like 'ho' — river." },
      { parts: ["口", "麻"], pen: ["mouth (spoken!)", "麻 maa4 (sound)"], han: "嘛", jp: "maa3", en: "(you know…)", story: "Mouth side = a spoken particle; 麻 lends the sound maa. A word that exists only out loud." },
      { parts: ["亻", "尔"], pen: ["person (meaning)", "尔 (sound)"], han: "你", jp: "nei5", en: "you", story: "The person side plus a sound part — and it's the character you've seen most in this course. Now you know why it's built that way." },
    ],
    quiz: [
      { q: "In 媽 (mum), what does 馬 do?", opts: ["means 'horse'", "lends the sound maa", "means 'big'"], ok: 1 },
      { q: "In 河 (river), what does 氵 tell you?", opts: ["it's wet", "it's loud", "it's small"], ok: 0 },
      { q: "A 口 on the left usually means…", opts: ["it's food", "it's a spoken word", "it's a place"], ok: 1 },
    ],
  },
  {
    id: "read", title: "Read your first words", badge: "Step 6 · the payoff", type: "read",
    intro: "Every character below is one you've now met. No new pictures — just put them side by side and READ. Out loud, please.",
    items: [
      ["你好", "nei5 hou2", "hello", "person-side 你 + woman-and-child 好. You've been reading it all along."],
      ["大人", "daai6 jan4", "adult", "big + person. A big person. Chinese is often this honest."],
      ["一日", "jat1 jat6", "one day", "one + sun. One sun crossing the sky."],
      ["三十", "saam1 sap6", "thirty", "three + ten. Three tens. All numbers stack like this."],
      ["門口", "mun4 hau2", "doorway", "door + mouth — the mouth of the building."],
      ["山水", "saan1 seoi2", "scenery", "mountain + water — the classic word for a beautiful landscape."],
      ["中文", "zung1 man4", "Chinese (language)", "middle + writing: the writing of the Middle Kingdom. 文 man4 is new — consider it a gift."],
    ],
    quiz: [
      { q: "Read it: 大人", opts: ["thirty", "adult", "doorway"], ok: 1 },
      { q: "Read it: 山水", opts: ["scenery", "one day", "hello"], ok: 0 },
      { q: "Read it: 門口", opts: ["forest", "bright", "doorway"], ok: 2 },
    ],
  },
];
