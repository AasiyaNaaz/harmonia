import { motion } from "framer-motion";
import { Play, Music2, Users, Guitar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState } from "react";
import InstrumentPopup from "./InstrumentPopup";

interface Artist {
  name: string;
  bio: string;
}

interface Instrument {
  name: string;
  image: string;
  tutorial: string[];
  audioSample: string;
}

interface GenreData {
  name: string;
  gradient: string;
  history: string;
  characteristics: string[];
  artists: Artist[];
  instruments: Instrument[];
}

interface GenrePageProps {
  genre: GenreData;
}

export default function GenrePage({ genre }: GenrePageProps) {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div 
        className={`relative min-h-[400px] flex items-center justify-center bg-gradient-to-br ${genre.gradient}`}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="mb-4 text-sm bg-white/20 text-white border-white/30" data-testid="badge-genre-name">
              {genre.name} Music
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {genre.name}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Explore the rich history and vibrant sounds of {genre.name} music
            </p>
            <Link href="/studio">
              <Button 
                size="lg" 
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                data-testid="button-try-studio"
              >
                <Play className="mr-2 h-5 w-5" />
                Try in Studio
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.section
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Music2 className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">History & Characteristics</h2>
          </div>
          <Card className="p-8">
            <p className="text-lg mb-6 leading-relaxed">{genre.history}</p>
            <div className="flex flex-wrap gap-2">
              {genre.characteristics.map((char, index) => (
                <Badge key={index} variant="secondary" data-testid={`badge-characteristic-${index}`}>
                  {char}
                </Badge>
              ))}
            </div>
          </Card>
        </motion.section>

        <motion.section
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Notable Artists</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {genre.artists.map((artist, index) => (
              <motion.div
                key={artist.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-artist-${index}`}>
                  <h3 className="text-xl font-semibold mb-2">{artist.name}</h3>
                  <p className="text-sm text-muted-foreground">{artist.bio}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Guitar className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Key Instruments</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {genre.instruments.map((instrument, index) => (
              <motion.div
                key={instrument.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => setSelectedInstrument(instrument)}
                  data-testid={`card-instrument-${index}`}
                >
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img 
                      src={instrument.image} 
                      alt={instrument.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{instrument.name}</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      data-testid={`button-learn-${index}`}
                    >
                      Learn How to Play
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {selectedInstrument && (
        <InstrumentPopup
          instrument={selectedInstrument}
          onClose={() => setSelectedInstrument(null)}
        />
      )}
    </div>
  );
}
