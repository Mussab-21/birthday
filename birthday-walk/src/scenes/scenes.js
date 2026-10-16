// scenes.js — all scene data, gifts, and voice notes
import scene1Bg from '../assets/img/scene1_trailhead.jpg';
import scene2Bg from '../assets/img/scene2_rain_path.jpg';
import scene3Bg from '../assets/img/scene3_lake_bench.jpg';
import scene4Bg from '../assets/img/scene4_stars.jpg';
import scene5Bg from '../assets/img/scene5_cabin.jpg';

export const SCENES_DATA = [
  {
    id: "trailhead",
    title: "The Mountain",
    bg: scene1Bg,
    ambient: null,
    music: null,
    walkLength: 1800,
    urduQuote: {
      ur: "تم سے ملنا ابھی باقی ہے، مگر تم میری زندگی میں آ چکی ہو۔",
      en: "Meeting you is yet to come, but you have already arrived in my life."
    },
    gift: {
      type: "voiceNote",
      triggerAt: 1600,
      glowObject: "lantern",
      audio: ["./audio/voice-01.mp3", "./audio/voice-01.ogg"],
      caption: "Ninu... Hi. I know this feels like a strange place to be. But I wanted our first walk together to be somewhere beautiful. Somewhere you would love. Somewhere with mountains, and cold air, and that kind of quiet that only exists when the whole world goes still. I've been standing here for a while, waiting for you. Come. Walk with me."
    },
    next: "rain-path"
  },
  {
    id: "rain-path",
    title: "The Rain",
    bg: scene2Bg,
    ambient: null,
    music: null,
    walkLength: 1800,
    urduQuote: {
      ur: "بارش اور تم — دونوں بن بلائے آتے ہو، اور دونوں کو روکا نہیں جا سکتا۔",
      en: "Rain and you — both arrive uninvited, and neither can be stopped."
    },
    gift: {
      type: "fogLetter",
      triggerAt: 1500,
      audio: ["./audio/voice-02.mp3", "./audio/voice-02.ogg"],
      caption: "You once told me that rain makes you feel both lonely and safe. I didn't understand how both could be true — until I imagined standing in it beside you. There is something about rain that is honest. It doesn't pretend. It just falls. And that is what you are to me, Jaan. Honest. Real. Unexpected. If I could hold an umbrella over you tonight — in every storm, in every rain — I would. Without question. Without hesitation. Always.",
      content: {
        en: `You once told me that rain makes you feel both lonely and safe.\n\nI didn't understand how both could be true — until I imagined standing in it beside you.\n\nThere is something about rain that is honest.\nIt doesn't pretend. It just falls.\n\nAnd that is what you are to me, Jaan.\nHonest. Real. Unexpected.\n\nIf I could hold an umbrella over you tonight — in every storm, in every rain — I would.\n\nWithout question. Without hesitation.\nAlways.`
      }
    },
    next: "lake"
  },
  {
    id: "lake",
    title: "The Lake",
    bg: scene3Bg,
    ambient: null,
    music: null,
    walkLength: 1200,
    urduQuote: {
      ur: "تم میری خاموشی میں بھی شور ہو۔",
      en: "You are noise even in my silence."
    },
    gift: {
      type: "benchMessage",
      audio: ["./audio/voice-03.mp3", "./audio/voice-03.ogg"],
      caption: "I know you love loneliness, Ninu. You carry it like something precious — and it is. There is a kind of beauty in a person who knows how to be alone. I don't want to take that from you. I only want to sit beside it. On a bench like this. In a silence like this. Just close enough that you feel it — that in all of your beautiful loneliness, you are not alone.",
      message: `I know you love loneliness, Ninu.\n\nYou carry it like something precious — and it is.\nThere is a kind of beauty in a person who knows how to be alone.\n\nI don't want to take that from you.\n\nI only want to sit beside it.\nOn a bench like this. In a silence like this.\n\nJust close enough that you feel it —\nthat in all of your beautiful loneliness,\nyou are not alone.`,
      photos: []
    },
    next: "stars"
  },
  {
    id: "stars",
    title: "The Stars",
    bg: scene4Bg,
    ambient: null,
    music: null,
    urduQuote: {
      ur: "دوری صرف جسم کی ہوتی ہے — دل کی نہیں۔",
      en: "Distance is only of the body — not of the heart."
    },
    gift: {
      type: "constellation",
      voiceAudio: ["./audio/voice-04.mp3", "./audio/voice-04.ogg"],
      voiceCaption: "Ninu... do you remember March 19th? 213 days ago. That first conversation. I didn't know then that I was talking to someone who would make me want to count every single day since. That night, after we spoke, I sat by my window and looked at the sky. And I thought to myself — one day I'll tell her about this. Tonight, one of those stars has your name.",
      stars: [
        {
          id: "star-1",
          x: 20, y: 35,
          size: "large",
          title: "The Beginning",
          memory: "March 19th. The conversation that changed everything. I didn't know then what I was starting. Now I can't imagine having not started it.",
          special: false
        },
        {
          id: "star-2",
          x: 65, y: 25,
          size: "medium",
          title: "The First Goodnight",
          memory: "The first night you said goodnight, I watched the clock until morning. I didn't want the day to end.",
          special: false
        },
        {
          id: "star-3",
          x: 40, y: 15,
          size: "medium",
          title: "Jaan",
          memory: "The first time you called me Jaan, I read it three times. Just to make sure it was real.",
          special: false
        },
        {
          id: "star-4",
          x: 75, y: 45,
          size: "large",
          title: "The Rain",
          memory: "The day you told me what rain does to your heart. That was the moment I realized you feel the world differently — and I wanted to stay in that world with you.",
          special: false
        },
        {
          id: "star-5",
          x: 50, y: 20,
          size: "special",
          title: "نِینو ✨",
          memory: "This star has always been yours. I just didn't know your name yet.",
          special: true
        }
      ]
    },
    next: "cabin"
  },
  {
    id: "cabin",
    title: "The Cabin",
    bg: scene5Bg,
    ambient: null,
    music: null,
    gift: {
      type: "cake",
      voiceAudio: ["./audio/voice-05.mp3", "./audio/voice-05.ogg"],
      voiceCaption: "Happy birthday, GulabJamun. We have never stood in the same place. Never felt the same rain. Never looked at the same sky. But tonight, we walked the same road. 213 days ago, I didn't know your name. Now I cannot imagine a morning without it being the first thought in my mind. You are the kind of person people write songs about — and I am just someone who writes to you. But I mean every word more than any song ever could. You deserve mountains and rain and every quiet, beautiful thing you love. You deserve someone who sees you — really sees you — and chooses you anyway. I see you, Jaan. Every part of you. One day, this won't be a screen. One day, we will stand somewhere real — somewhere cold and quiet, with stars overhead — and I will say all of this to your face. Until then, make a wish. Happy birthday, Ninu. The world became more beautiful the day you were born. Yours, Mussab 🤍",
      letter: `Happy birthday, GulabJamun. 🎂\n\nWe have never stood in the same place.\nNever felt the same rain.\nNever looked at the same sky.\n\nBut tonight, we walked the same road.\n\n213 days ago, I didn't know your name.\nNow I cannot imagine a morning without it being the first thought in my mind.\n\nYou are the kind of person people write songs about —\nand I am just someone who writes to you.\nBut I mean every word more than any song ever could.\n\nYou deserve mountains and rain and every quiet, beautiful thing you love.\nYou deserve someone who sees you — really sees you — and chooses you anyway.\n\nI see you, Jaan. Every part of you.\n\nOne day, this won't be a screen.\nOne day, we will stand somewhere real — somewhere cold and quiet, with stars overhead —\nand I will say all of this to your face.\n\nUntil then, make a wish.\n\nHappy birthday, Ninu.\nThe world became more beautiful the day you were born.\n\nYours,\nMussab 🤍`
    },
    next: null
  }
];
