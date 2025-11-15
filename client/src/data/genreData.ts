// src/data/genreData.ts

import pianoImg from "@assets/generated_images/Piano_instrument_photo_2822d5fc.png";
import guitarImg from "@assets/generated_images/Acoustic_guitar_photo_72df9039.png";
import drumImg from "@assets/generated_images/Drum_kit_photo_015cb939.png";
import bassImg from "@assets/generated_images/Electric_bass_photo_a9063e12.png";
import synthImg from "@assets/generated_images/Synthesizer_photo_8fe9809d.png";
import kotoImg from "@assets/generated_images/Koto_instrument_photo_04607e8a.png";

export type GenreType = {
  name: string;
  gradient: string;
  history: string;
  characteristics: string[];
  artists: { name: string; bio: string }[];
  instruments?: {
    name: string;
    image: string;
    tutorial: string[];
    audioSample?: string;
  }[];
};

// --------------
// IMPORTANT FIX
// --------------
// Only ONE declaration of `genreData`
// And MUST be exported as a **named export**
// --------------

export const genreData: Record<string, GenreType> = {
  pop: {
    name: "Pop",
    gradient: "from-pink-500 to-purple-600",
    history:
      "Pop music emerged in the mid-1950s as a distinct genre, characterized by its mass appeal...",
    characteristics: [
      "Catchy melodies",
      "Verse-chorus structure",
      "4/4 time signature",
      "Repetitive hooks",
      "Electronic production",
      "Radio-friendly",
    ],
    artists: [
      { name: "Taylor Swift", bio: "Contemporary pop icon..." },
      { name: "The Weeknd", bio: "R&B-influenced pop artist..." },
      { name: "Ariana Grande", bio: "Powerhouse vocalist..." },
    ],
    instruments: [
      {
        name: "Piano",
        image: pianoImg,
        tutorial: [
          "Start with proper hand position",
          "Learn basic chord progressions",
          "Practice rhythm patterns",
          "Combine melody and harmony",
        ],
        audioSample: "piano",
      },
      {
        name: "Acoustic Guitar",
        image: guitarImg,
        tutorial: [
          "Hold guitar comfortably",
          "Learn open chords",
          "Practice strumming patterns",
          "Combine chords smoothly",
        ],
        audioSample: "guitar",
      },
      {
        name: "Drums",
        image: drumImg,
        tutorial: [
          "Understand drum components",
          "Learn basic rock beat",
          "Practice coordination",
          "Build rhythm patterns",
        ],
        audioSample: "drums",
      },
    ],
  },

  classical: {
    name: "Classical",
    gradient: "from-yellow-600 to-red-800",
    history:
      "Classical music spans centuries, from the Baroque period through the Romantic era...",
    characteristics: [
      "Complex compositions",
      "Orchestral arrangements",
      "Dynamic range",
      "Formal structure",
      "Instrumental focus",
      "Emotional depth",
    ],
    artists: [
      { name: "Beethoven", bio: "Revolutionary composer..." },
      { name: "Bach", bio: "Baroque master..." },
      { name: "Mozart", bio: "Prolific classical composer..." },
    ],
    instruments: [
      {
        name: "Piano",
        image: pianoImg,
        tutorial: [
          "Master posture",
          "Learn scales",
          "Study fingering",
          "Practice sight reading",
        ],
        audioSample: "piano",
      },
      {
        name: "Violin",
        image: guitarImg, // Replace if you add violin image
        tutorial: [
          "Hold bow correctly",
          "Practice bowing",
          "Finger placement",
          "Develop vibrato",
        ],
        audioSample: "violin",
      },
    ],
  },

  electronic: {
    name: "Electronic",
    gradient: "from-cyan-400 to-blue-600",
    history:
      "Electronic music revolutionized sound production in the late 20th century...",
    characteristics: [
      "Synthesized sounds",
      "Electronic beats",
      "Digital production",
      "Loop-based",
      "Bass-heavy",
      "Festival culture",
    ],
    artists: [
      { name: "Daft Punk", bio: "French duo pioneering electronic music" },
      { name: "Deadmau5", bio: "Progressive house producer" },
      { name: "Skrillex", bio: "Dubstep innovator" },
    ],
    instruments: [
      {
        name: "Synthesizer",
        image: synthImg,
        tutorial: [
          "Understand oscillators",
          "Learn ADSR",
          "Experiment with modulation",
          "Create patches",
        ],
        audioSample: "synth",
      },
      {
        name: "Drum Machine",
        image: drumImg,
        tutorial: [
          "Program patterns",
          "Layer sounds",
          "Adjust swing",
          "Create variations",
        ],
        audioSample: "drums",
      },
      {
        name: "Bass Synth",
        image: bassImg,
        tutorial: [
          "Focus low frequencies",
          "Use sub-bass",
          "Apply filters",
          "Balance with kick",
        ],
        audioSample: "bass",
      },
    ],
  },

  qawwali: {
    name: "Qawwali",
    gradient: "from-emerald-500 to-amber-500",
    history:
      "Qawwali is a devotional Sufi music form over 700 years old...",
    characteristics: [
      "Devotional lyrics",
      "Call and response",
      "Hand clapping",
      "Harmonium-driven",
      "Spiritual themes",
      "Improvisational",
    ],
    artists: [
      { name: "Nusrat Fateh Ali Khan", bio: "Legendary Qawwali voice" },
      { name: "Rahat Fateh Ali Khan", bio: "Contemporary master" },
      { name: "Sabri Brothers", bio: "Traditional Qawwali ensemble" },
    ],
    instruments: [
      {
        name: "Harmonium",
        image: pianoImg,
        tutorial: [
          "Pump bellows",
          "Learn scales",
          "Practice sustained notes",
          "Accompany vocals",
        ],
        audioSample: "harmonium",
      },
      {
        name: "Tabla",
        image: drumImg,
        tutorial: [
          "Master hand positions",
          "Learn bols",
          "Practice rhythmic cycles",
          "Increase speed",
        ],
        audioSample: "tabla",
      },
    ],
  },

  folk: {
    name: "Folk",
    gradient: "from-amber-700 to-orange-500",
    history:
      "Folk music represents cultural storytelling passed through generations...",
    characteristics: [
      "Acoustic instruments",
      "Storytelling lyrics",
      "Traditional melodies",
      "Simple arrangements",
      "Cultural heritage",
      "Authentic expression",
    ],
    artists: [
      { name: "Bob Dylan", bio: "Folk music pioneer" },
      { name: "Joan Baez", bio: "Voice of social justice" },
      { name: "Pete Seeger", bio: "Folk preservation activist" },
    ],
    instruments: [
      {
        name: "Acoustic Guitar",
        image: guitarImg,
        tutorial: [
          "Fingerpicking",
          "Folk chord progressions",
          "Alternate tunings",
          "Rhythmic strumming",
        ],
        audioSample: "guitar",
      },
      {
        name: "Banjo",
        image: guitarImg,
        tutorial: [
          "Clawhammer technique",
          "Three-finger picking",
          "Roll patterns",
          "Open tunings",
        ],
        audioSample: "banjo",
      },
      {
        name: "Koto",
        image: kotoImg,
        tutorial: [
          "Wear finger picks",
          "Basic pluck technique",
          "Understand tuning",
          "Practice traditional pieces",
        ],
        audioSample: "koto",
      },
    ],
  },
};
