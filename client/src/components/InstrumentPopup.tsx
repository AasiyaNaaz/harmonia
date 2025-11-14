import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

interface Instrument {
  name: string;
  image: string;
  tutorial: string[];
  audioSample: string;
}

interface InstrumentPopupProps {
  instrument: Instrument;
  onClose: () => void;
}

export default function InstrumentPopup({ instrument, onClose }: InstrumentPopupProps) {
  const playAudio = () => {
    console.log(`Playing audio sample: ${instrument.audioSample}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-2xl"
        >
          <Card className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{instrument.name}</h2>
                  <p className="text-muted-foreground">Interactive Tutorial</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                data-testid="button-close-popup"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="aspect-video rounded-md overflow-hidden mb-6 bg-muted">
              <img 
                src={instrument.image} 
                alt={instrument.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">How to Play</h3>
              <div className="space-y-3">
                {instrument.tutorial.map((step, index) => (
                  <div 
                    key={index} 
                    className="flex gap-3"
                    data-testid={`tutorial-step-${index}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={playAudio}
                className="flex-1"
                data-testid="button-play-sample"
              >
                <Play className="mr-2 h-4 w-4" />
                Play Audio Sample
              </Button>
              <Link href="/studio">
                <Button 
                  variant="outline"
                  className="flex-1"
                  data-testid="button-try-studio-popup"
                >
                  Try It in Studio
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
