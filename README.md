## 🎵 **Harmonica: The AI Music Multiverse**

Harmonica is an interactive music platform where anyone can transform songs, explore global styles, and create their own music—all powered by AI.

## 🌟 **Core Idea**

Harmonica blends creativity, culture, and AI. Users can:

* Convert their music into different styles
* Learn how each style works through visuals and animations
* Build their own multi-style compositions
* Discover their unique vocal identity
* Explore how music connects cultures through tone, rhythm, and expression
* 

## 🚀 **Modes & Features**

Below are all the project modes included in the main roadmap. (Experiment Mode intentionally excluded as requested.)

---

### **1. Learn Mode — "Discover the Styles"**

Interactive pages for each music style.

Each style page includes:

* A visual explanation of the style (rhythm, instruments, vibe)
* Animated instruments showing how the style is built
* "Convert This Melody" feature (currently working only for Pop)
* Suggestions of famous songs from that style


### **2. Create Mode — "Compose Your Own Music"**

A full creative playground.

Users can:

* Add & layer instruments
* Mix styles (e.g., sitar + electric guitar)
* Adjust tempo, rhythm, pitch, and mood
* Save and export as `.wav`, `.mp3`, or `.midi`


### **3. Explore Mode — “Folk Finder”**

Lets users sing or hum to discover which folk tradition matches their vocal style.

AI analyzes:

* Tone
* Ornamentation
* Rhythm pattern
* Cultural signatures

Results appear as an animated glowing world map.


### **4. Voice Discovery Mode — "Find Your Musical Identity"**

Upload or record a voice sample.
AI generates a personalized Vocal Profile:

* Strengths (tone, texture, range)
* Style fit (Metal, Classical, Folk, Pop, etc.)
* Suggested learning paths
* Voice-based templates for composing

### **5. Lyrics Soul Translator**

Users enter lyrics, and AI rewrites + re-sings them into different musical traditions.

Examples:

* Pop → modern relatable version
* Classical → more poetic, Italian/Urdu flair
* Folk → storytelling tone

Dynamic visuals transition the text into different scripts, instruments, and themes.


### **6. Journey Mode — "Mythic Music Quest"**

A gamified adventure through five music worlds:

* Pop City
* Classical Castle
* Electronic Realm
* Folk Village
* Metal Mode

Players unlock challenges based on rhythm, pitch, creativity, or style knowledge.


## 🧩 **Project Roadmap**

### **Phase 1 – MVP**

Focus: Basic Conversion + Creative Tools

* Learn Mode
* Create Mode
* (Future) Style conversions for all 5 main genres

### **Phase 2 – Advanced AI + Gamification**

* Lyrics Soul Translator
* Folk Finder
* Voice Discovery
* Mythic Music Quest


## 🎯 Use Cases

Harmonica helps users:

* Understand how music styles work
* Explore new global styles
* Get creative with composition
* Discover what genre fits their voice naturally
* Learn & play through gamified experiences


## 🛠️ Tech (General Overview)

* Frontend: React + Tailwind + Framer Motion
* Audio Processing: Python, Librosa, Diffusion Models, Onnx Runtime
* Backend: Node/Python APIs
* Hosting: Vercel / AWS / Firebase


# 🔧 Technical Architecture (High-Level)

## Frontend 

* **React + TypeScript**
* **TailwindCSS** for styling
* **Framer Motion** for animations
* **Audio playground** using custom components (Piano, Rhythm Pads, Waveform Visualizers)
* **Client-side audio processing** (basic transformations, previews)

## Backend

* **Python API** for:
  * Audio extraction
  * Style conversion models (Pop → Future styles)
  * Melody/rhythm/stem analysis
* **Node/Express layer** for routing + auth

### AI Layer
* **Feature extraction**: Librosa / Essentia
* **Model inference**: ONNX Runtime / PyTorch
* **Conversion models**: Diffusion-based + rule-based mapping for early styles

## Storage

* **Firebase** for:
  * User projects
  * Saved compositions
  * Auth & sessions
* **Cloud storage** for audio files

# 🏗️ Setup Instructions 

## 1. Clone the Repo

```
git clone https://github.com/AasiyaNaaz/harmonia.git
cd harmonica
```

## 2. Install Dependencies

```
cd frontend
npm install
```

## 3. Run Frontend

```
 npx tsx server/index.ts
```
In new terminal run the next commands

## 4. Backend 

```
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn server:app --reload --port 8000
```


# 📁 Proposed Folder Structure 

```
harmonica/
│
├── frontend/                # React app
│   ├── src/
│   │   ├── components/      # UI components (piano, sliders, visuals)
│   │   ├── pages/           # Learn Mode, Create Mode, etc
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Audio helpers, math utils
│   │   ├── assets/          # Icons, animations
│   │   ├── styles/          # Tailwind configs
│   │   └── main.tsx         
│   └── public/
│
├── backend/                 # Python backend
│   ├── seperated/           # Seperated instruments of input audios
│   ├── server.py            # Main function for midi to audio
│   └── requirements.txt
│
├── scripts/                 # extractors demucs pitch crepe convertors.
│
├── soundfonts/              # Soundfont files
│
├── output/                  # Final converted audio + instrument audio + midi files raw
│
└── README.md
```
* Learn how different music styles work
* Discover what style fits your voice best

