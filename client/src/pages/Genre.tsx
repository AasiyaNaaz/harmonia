import Navigation from "@/components/Navigation";
import GenrePage from "@/components/GenrePage";
import { useRoute } from "wouter";
import popArtist from '@assets/generated_images/Pop_artist_portrait_1_21770589.png';
import classicalArtist from '@assets/generated_images/Classical_artist_portrait_58d291b1.png';
import electronicArtist from '@assets/generated_images/Electronic_artist_portrait_3d51a192.png';
import pianoImg from '@assets/generated_images/Piano_instrument_photo_2822d5fc.png';
import guitarImg from '@assets/generated_images/Acoustic_guitar_photo_72df9039.png';
import drumImg from '@assets/generated_images/Drum_kit_photo_015cb939.png';
import bassImg from '@assets/generated_images/Electric_bass_photo_a9063e12.png';
import synthImg from '@assets/generated_images/Synthesizer_photo_8fe9809d.png';
import kotoImg from '@assets/generated_images/Koto_instrument_photo_04607e8a.png';

const genreData = {
  pop: {
    name: "Pop",
    gradient: "from-pink-500 to-purple-600",
    history: "Pop music emerged in the mid-1950s as a distinct genre, characterized by its mass appeal and commercial orientation. It evolved from rock and roll and continues to absorb influences from various musical styles, creating catchy, accessible songs that dominate charts worldwide.",
    characteristics: ["Catchy melodies", "Verse-chorus structure", "4/4 time signature", "Repetitive hooks", "Electronic production", "Radio-friendly"],
    artists: [
      { name: "Taylor Swift", bio: "Contemporary pop icon known for storytelling and genre evolution", image: popArtist },
      { name: "The Weeknd", bio: "R&B-influenced pop artist with distinctive vocal style", image: popArtist },
      { name: "Ariana Grande", bio: "Powerhouse vocalist blending pop and R&B influences", image: popArtist }
    ],
    instruments: [
      { name: "Piano", image: pianoImg, tutorial: ["Start with proper hand position", "Learn basic chord progressions", "Practice rhythm patterns", "Combine melody and harmony"], audioSample: "piano" },
      { name: "Acoustic Guitar", image: guitarImg, tutorial: ["Hold guitar comfortably", "Learn open chords (G, C, D, Em)", "Practice strumming patterns", "Combine chords smoothly"], audioSample: "guitar" },
      { name: "Drums", image: drumImg, tutorial: ["Understand basic drum components", "Learn basic rock beat", "Practice coordination", "Build rhythm patterns"], audioSample: "drums" }
    ]
  },
  classical: {
    name: "Classical",
    gradient: "from-yellow-600 to-red-800",
    history: "Classical music spans centuries, from the Baroque period through the Romantic era and beyond. It emphasizes formal composition, orchestration, and sophisticated harmonic structures. This genre has profoundly influenced all modern Western music.",
    characteristics: ["Complex compositions", "Orchestral arrangements", "Dynamic range", "Formal structure", "Instrumental focus", "Emotional depth"],
    artists: [
      { name: "Ludwig van Beethoven", bio: "Revolutionary composer bridging Classical and Romantic eras", image: classicalArtist },
      { name: "Johann Sebastian Bach", bio: "Baroque master known for intricate counterpoint", image: classicalArtist },
      { name: "Wolfgang Amadeus Mozart", bio: "Prolific Classical period composer with timeless works", image: classicalArtist }
    ],
    instruments: [
      { name: "Piano", image: pianoImg, tutorial: ["Master proper posture and hand position", "Learn classical scales", "Study fingering techniques", "Practice sight reading"], audioSample: "piano" },
      { name: "Violin", image: guitarImg, tutorial: ["Hold bow correctly", "Learn proper bowing technique", "Practice finger placement", "Develop vibrato"], audioSample: "violin" }
    ]
  },
  electronic: {
    name: "Electronic",
    gradient: "from-cyan-400 to-blue-600",
    history: "Electronic music revolutionized sound production in the late 20th century. Using synthesizers, drum machines, and computers, artists create entirely new sonic landscapes. From disco to techno to modern EDM, electronic music continues to evolve.",
    characteristics: ["Synthesized sounds", "Electronic beats", "Digital production", "Loop-based", "Bass-heavy", "Festival culture"],
    artists: [
      { name: "Daft Punk", bio: "French duo pioneering electronic house music", image: electronicArtist },
      { name: "Deadmau5", bio: "Progressive house producer with technical mastery", image: electronicArtist },
      { name: "Skrillex", bio: "Dubstep innovator pushing sonic boundaries", image: electronicArtist }
    ],
    instruments: [
      { name: "Synthesizer", image: synthImg, tutorial: ["Understand oscillators and filters", "Learn ADSR envelope", "Experiment with modulation", "Create unique patches"], audioSample: "synth" },
      { name: "Drum Machine", image: drumImg, tutorial: ["Program basic patterns", "Layer different sounds", "Adjust tempo and swing", "Create variations"], audioSample: "drums" },
      { name: "Bass Synth", image: bassImg, tutorial: ["Focus on low frequencies", "Use sub-bass effectively", "Apply filters creatively", "Balance with kick drum"], audioSample: "bass" }
    ]
  },
  qawwali: {
    name: "Qawwali",
    gradient: "from-emerald-500 to-amber-500",
    history: "Qawwali is a form of devotional Sufi music originating in South Asia. Dating back over 700 years, it features passionate vocals, hand-clapping rhythms, and harmonium accompaniment. The genre aims to induce a state of spiritual ecstasy.",
    characteristics: ["Devotional lyrics", "Call and response", "Hand clapping", "Harmonium-driven", "Spiritual themes", "Improvisational"],
    artists: [
      { name: "Nusrat Fateh Ali Khan", bio: "Legendary voice bringing Qawwali to global audiences", image: popArtist },
      { name: "Rahat Fateh Ali Khan", bio: "Contemporary master continuing family legacy", image: popArtist },
      { name: "Sabri Brothers", bio: "Influential ensemble preserving traditional style", image: popArtist }
    ],
    instruments: [
      { name: "Harmonium", image: pianoImg, tutorial: ["Pump bellows rhythmically", "Learn basic scales", "Practice sustaining notes", "Accompany vocals"], audioSample: "harmonium" },
      { name: "Tabla", image: drumImg, tutorial: ["Master hand positions", "Learn basic bols (syllables)", "Practice rhythmic cycles", "Develop speed gradually"], audioSample: "tabla" }
    ]
  },
  folk: {
    name: "Folk",
    gradient: "from-amber-700 to-orange-500",
    history: "Folk music represents the traditional music of communities, passed down through generations. It tells stories of everyday life, historical events, and cultural heritage. Modern folk music revives and reinterprets these timeless traditions.",
    characteristics: ["Acoustic instruments", "Storytelling lyrics", "Traditional melodies", "Cultural heritage", "Simple arrangements", "Authentic expression"],
    artists: [
      { name: "Bob Dylan", bio: "Singer-songwriter revolutionizing folk music", image: popArtist },
      { name: "Joan Baez", bio: "Powerful voice of social justice through folk", image: popArtist },
      { name: "Pete Seeger", bio: "Activist preserving American folk traditions", image: popArtist }
    ],
    instruments: [
      { name: "Acoustic Guitar", image: guitarImg, tutorial: ["Learn fingerpicking patterns", "Master folk chord progressions", "Practice alternate tunings", "Develop rhythmic strumming"], audioSample: "guitar" },
      { name: "Banjo", image: guitarImg, tutorial: ["Understand clawhammer technique", "Learn three-finger picking", "Practice roll patterns", "Explore open tunings"], audioSample: "banjo" },
      { name: "Koto", image: kotoImg, tutorial: ["Wear finger picks correctly", "Learn basic plucking technique", "Understand tuning system", "Practice traditional pieces"], audioSample: "koto" }
    ]
  }
};

export default function Genre() {
  const [, params] = useRoute("/genre/:genre");
  const genreKey = params?.genre as keyof typeof genreData;
  const genre = genreData[genreKey];

  if (!genre) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Genre Not Found</h1>
            <p className="text-muted-foreground">The genre you're looking for doesn't exist.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <GenrePage genre={genre} />
    </>
  );
}
