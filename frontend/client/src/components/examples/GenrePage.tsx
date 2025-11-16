import GenrePage from '../GenrePage'
import pianoImg from '@assets/generated_images/Piano_instrument_photo_2822d5fc.png'
import guitarImg from '@assets/generated_images/Acoustic_guitar_photo_72df9039.png'

export default function GenrePageExample() {
  const popGenre = {
    name: "Pop",
    gradient: "from-pink-500 to-purple-600",
    history: "Pop music emerged in the mid-1950s as a distinct genre, characterized by its mass appeal and commercial orientation. It evolved from rock and roll and continues to absorb influences from various musical styles, creating catchy, accessible songs that dominate charts worldwide.",
    characteristics: [
      "Catchy melodies",
      "Verse-chorus structure",
      "4/4 time signature",
      "Repetitive hooks",
      "Electronic production",
      "Radio-friendly"
    ],
    artists: [
      {
        name: "Taylor Swift",
        bio: "Contemporary pop icon known for storytelling and genre evolution"
      },
      {
        name: "The Weeknd",
        bio: "R&B-influenced pop artist with distinctive vocal style"
      },
      {
        name: "Ariana Grande",
        bio: "Powerhouse vocalist blending pop and R&B influences"
      }
    ],
    instruments: [
      {
        name: "Piano",
        image: pianoImg,
        tutorial: [
          "Start with proper hand position on the keys",
          "Learn basic chord progressions (C, G, Am, F)",
          "Practice rhythm patterns with both hands",
          "Combine melody and harmony"
        ],
        audioSample: "piano-sample"
      },
      {
        name: "Acoustic Guitar",
        image: guitarImg,
        tutorial: [
          "Hold the guitar comfortably against your body",
          "Learn basic open chords (G, C, D, Em)",
          "Practice strumming patterns",
          "Combine chords smoothly"
        ],
        audioSample: "guitar-sample"
      }
    ]
  };

  return <GenrePage genre={popGenre} />
}
