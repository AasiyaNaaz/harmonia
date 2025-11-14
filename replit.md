# Interactive Music Learning Platform

## Overview

This is an interactive music learning web application that combines education with hands-on musical exploration. Users can discover different music genres (Pop, Classical, Electronic, Qawwali, Folk), learn about their history and key artists, explore instruments used in each style, and play virtual instruments in an interactive GarageBand-style studio environment.

The platform emphasizes a playful, game-like experience with tactile feedback, realistic instrument animations, and the ability to record and playback musical creations. The design draws inspiration from Apple GarageBand, Ableton Live, and modern music education apps.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**Routing**: wouter for lightweight client-side routing with pages for Home, Studio, and individual Genre exploration.

**UI Component System**: shadcn/ui components built on Radix UI primitives, providing accessible, customizable components with a consistent design system using Tailwind CSS.

**State Management**: 
- React Query (@tanstack/react-query) for server state management and data fetching
- Local component state with React hooks for UI interactions
- Custom RecordingManager singleton for managing audio recording, playback, and looping functionality

**Animation**: Framer Motion for smooth transitions, interactive animations, and tactile feedback on instrument interactions.

**Design System**:
- Tailwind CSS for utility-first styling with custom theme configuration
- CSS custom properties for theming (light/dark mode support)
- Poppins/Outfit font family for friendly, modern typography
- Gradient-based genre identities with soft neon glows and playful visuals

### Audio System

**Web Audio API Implementation**: Custom audio utilities (`audioUtils.ts`) using the Web Audio API to synthesize instrument sounds in the browser:
- Piano notes using sine wave oscillators with ADSR envelopes
- Drum sounds with noise generation and filtering
- Guitar string plucks with harmonic overtones
- Synthesizer pads with various waveforms

**Recording System**: Custom `RecordingManager` class handles:
- Multi-track recording with timestamps
- Playback with accurate timing
- Loop functionality
- Track management and clearing
- State change notifications for UI updates

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**API Structure**: RESTful API design with routes prefixed with `/api` (currently minimal backend, focused on storage interface).

**Development Setup**: 
- Vite middleware mode for HMR in development
- Separate build process for client (Vite) and server (esbuild)
- Server-side rendering preparation with custom middleware

**Storage Interface**: Abstract storage interface (`IStorage`) with in-memory implementation (`MemStorage`) for user data, designed to be swappable with database implementations.

### Data Architecture

**Database ORM**: Drizzle ORM configured for PostgreSQL with schema definitions in TypeScript.

**Schema Design**: Currently defines a basic users table with UUID primary keys, designed to be extended for storing user creations, recordings, and preferences.

**Session Management**: Connect-pg-simple for PostgreSQL-backed session storage (dependency included but not yet implemented).

### Component Architecture

**Page Components**:
- Home: Landing page with hero section, feature cards, genre selection
- Studio: Full interactive music studio with instrument selection and recording controls
- Genre: Dynamic genre exploration pages with history, artists, instruments

**Instrument Components**: Modular virtual instruments (Piano, DrumKit, Guitar, Synthesizer) with:
- Visual feedback on interaction
- Audio playback integration
- Recording integration
- Responsive touch-friendly interfaces

**Shared UI Components**: Reusable shadcn/ui components for buttons, cards, dialogs, sliders, navigation, etc.

### Styling Strategy

**Utility-First CSS**: Tailwind with custom configuration for:
- Brand colors and gradients per genre
- Consistent spacing scale (4px increments)
- Responsive breakpoints
- Custom shadow and elevation system
- Hover and active state utilities

**CSS Architecture**:
- Global styles in `index.css` with CSS custom properties
- Component-scoped styles using Tailwind utilities
- Animation classes from Framer Motion
- Dark mode support via class-based theming

## External Dependencies

### UI Framework & Components
- **React 18** with TypeScript for component-based UI
- **Vite** for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** (Radix UI primitives) for accessible component library
- **Framer Motion** for animations and transitions
- **lucide-react** for icon system

### Data & State Management
- **@tanstack/react-query** for server state and data fetching
- **wouter** for lightweight client-side routing
- **react-hook-form** with **@hookform/resolvers** and **zod** for form validation

### Backend & Database
- **Express.js** for HTTP server
- **Drizzle ORM** with **@neondatabase/serverless** for PostgreSQL database access
- **drizzle-zod** for schema validation
- **connect-pg-simple** for session storage (prepared but not yet active)

### Development Tools
- **TypeScript** for type safety across client and server
- **esbuild** for server-side bundling
- **tsx** for running TypeScript in development
- **@replit** plugins for development environment integration

### Utility Libraries
- **date-fns** for date manipulation
- **clsx** and **tailwind-merge** for conditional className utilities
- **class-variance-authority** for component variant management
- **nanoid** for unique ID generation

### Asset Management
Generated images stored in `attached_assets/generated_images/` for instruments and hero imagery, referenced via Vite aliases.