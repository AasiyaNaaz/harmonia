# Design Guidelines: Interactive Music Learning Platform

## Design Approach
**Reference-Based:** Drawing inspiration from Apple GarageBand, Ableton Live's playful UI elements, and modern music education apps like Yousician and Simply Piano. The design emphasizes tactile, game-like interactions with professional studio aesthetics.

## Core Design Principles
- **Playful Professionalism:** Blend fun, approachable visuals with credible music education
- **Tactile Feedback:** Every interaction feels responsive and musical
- **Genre Identity:** Each music style has distinct visual personality
- **Studio Authenticity:** Instruments look and behave realistically while remaining accessible

## Typography System
- **Primary Font:** 'Outfit' or 'Poppins' (rounded, friendly, modern)
- **Display/Headers:** 700-800 weight, generous letter-spacing for musical energy
- **Body Text:** 400-500 weight, comfortable reading sizes (16-18px base)
- **UI Elements:** 600 weight for buttons, labels, and interactive controls
- **Instrument Labels:** Uppercase tracking for studio controls, title-case for friendly educational content

## Layout & Spacing
**Tailwind Spacing Units:** Consistently use 4, 6, 8, 12, 16, 20, 24, 32 for harmonious rhythm
- Section padding: py-16 md:py-24 lg:py-32
- Component spacing: gap-6 to gap-12
- Interactive elements: p-4 to p-8 for touch-friendly targets
- Card padding: p-6 md:p-8
- Studio interface: Generous spacing (min 48px) between playable instruments

## Component Library

### Homepage Components
- **Hero Section:** Full-width animated musical scene with floating notes, waveform visualizations, gradient background. Large welcoming headline with subtitle explaining the platform
- **Feature Cards Grid:** 3-column (desktop) showcase of "Explore Genres," "Play Studio," "Learn Instruments" with icon animations
- **Interactive Preview:** Mini playable instrument (e.g., piano keys) encouraging immediate engagement
- **CTA Section:** Prominent "Start Your Musical Journey" with secondary "Explore Genres" button

### Genre Exploration Pages
- **Genre Header:** Full-width banner with genre-specific gradient and iconic imagery (e.g., vinyl for Pop, orchestra for Classical)
- **History Timeline:** Horizontal scrolling cards with decade markers and key developments
- **Artist Gallery:** Grid of artist portraits (2-4 columns) with names and brief bios on hover/tap
- **Instrument Showcase:** Large professional instrument images (300-400px) in masonry grid, each clickable to reveal tutorial pop-up
- **Audio Sample Cards:** Rounded cards with waveform visualization, play button, and instrument name

### GarageBand Studio Interface
- **Studio Canvas:** Full viewport experience with subtle gradient background and ambient lighting effects
- **Instrument Layout:** Spatially arranged instruments (piano center-bottom, drums top-right, guitars left, etc.) mimicking real studio setup
- **Piano:** 2-octave keyboard spanning bottom third of screen, keys 40-60px wide with subtle shadows and highlights
- **Drum Kit:** Realistic 3D-perspective drum arrangement (kick, snare, hi-hats, toms, cymbals) with individual clickable zones (min 80px each)
- **Guitars:** Vertical or angled display with 6 visible, clickable strings with fret markers
- **World Instruments:** Compact representations with animated touch zones (e.g., taiko drum surface, koto strings)
- **Control Panel:** Fixed bottom bar (80-100px height) with icon buttons for Record, Play, Loop, FX, Tempo, Tracks, Instruments - each 48-60px with labels

### Interactive Elements
- **Instrument Pop-ups:** Modal overlays (max-w-2xl) with instrument image, 3-4 bullet tutorial, audio demo button, and "Try It Now" CTA
- **Key/String Animations:** Glowing effect (shadow-lg with opacity transition), scale transform (scale-105), and duration-200 transitions
- **Drum Hit Effects:** Radial pulse animation, slight bounce (translateY), and particle effects on impact
- **Waveform Visualizers:** Animated bars or curves responding to audio playback
- **Floating Notes:** SVG musical notes drifting upward with fade-out on instrument interaction

## Genre Color Theming
- **Pop:** Vibrant pink-purple gradients (#FF6B9D to #C060FF)
- **Classical:** Elegant gold-burgundy (#D4AF37 to #722F37)
- **Electronic:** Neon cyan-blue (#00F0FF to #0066FF)
- **Qawwali:** Rich emerald-amber (#00A86B to #FFBF00)
- **Folk:** Warm earth tones (#8B4513 to #FFB347)

Apply genre colors to: page backgrounds (subtle gradients), accent borders, button hovers, and instrument highlights when filtered by genre.

## Navigation Structure
- **Global Header:** Logo left, main nav center (Home, Explore Genres, Studio, About), mobile hamburger menu
- **Genre Dropdown:** Mega-menu style with all 5 genres, icons, and brief descriptions
- **Breadcrumb Trail:** Show path (Home > Pop > Piano Tutorial) for educational flow
- **Studio Mode Switcher:** Toggle between "Free Play" and genre-filtered instrument sets

## Animation Guidelines
- **Entry Animations:** Stagger fade-in-up for cards (delay-75, delay-150, delay-225)
- **Instrument Interactions:** Immediate visual feedback (<100ms), sound plays on touchstart/mousedown
- **Page Transitions:** Smooth crossfade between genre pages (duration-300)
- **Loading States:** Musical note spinner or waveform pulse
- **Micro-interactions:** Gentle scale and shadow changes on hover (hover:scale-105 hover:shadow-xl)

## Responsive Design
- **Desktop (lg+):** Full studio layout with all instruments visible
- **Tablet (md):** Simplified studio with scrollable instrument panels
- **Mobile (base):** Single-instrument focus view with swipe navigation between instruments, stacked genre content

## Image Strategy
- **Hero Image:** Vibrant, abstract musical scene (instruments, notes, waveforms) - custom illustration style
- **Genre Banners:** High-quality photography or stylized illustrations representing each genre's essence
- **Artist Portraits:** Professional headshots or performance photos (200x200px minimum)
- **Instrument Photos:** Studio-quality product photography with transparent backgrounds where possible
- **Tutorial Diagrams:** Clear, annotated instrument images showing finger positions, strike zones, etc.

## Accessibility & Touch Targets
- All interactive instrument zones minimum 44x44px (WCAG AA)
- Piano keys minimum 48px wide on mobile
- Clear visual indicators for active/playing state
- High contrast text on all backgrounds
- Keyboard navigation support for studio controls