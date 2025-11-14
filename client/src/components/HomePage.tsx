import { motion } from "framer-motion";
import { Music, Guitar, Drum, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/Hero_musical_scene_bb6ab737.png";


export default function HomePage() {
  const features = [
    {
      icon: Music,
      title: "Explore Genres",
      description: "Discover Pop, Classical, Electronic, Qawwali, and Folk music with rich history and culture",
      gradient: "from-pink-500 to-purple-600"
    },
    {
      icon: Drum,
      title: "Play Studio",
      description: "Interactive virtual instruments with realistic sounds and animations",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      icon: Sparkles,
      title: "Learn Instruments",
      description: "Hands-on tutorials and tips for every instrument in our collection",
      gradient: "from-amber-500 to-orange-600"
    }
  ];


  const genres = [
    { name: "Pop", color: "from-pink-500 to-purple-600", path: "/genre/pop" },
    { name: "Classical", color: "from-yellow-600 to-red-800", path: "/genre/classical" },
    { name: "Electronic", color: "from-cyan-400 to-blue-600", path: "/genre/electronic" },
    { name: "Qawwali", color: "from-emerald-500 to-amber-500", path: "/genre/qawwali" },
    { name: "Folk", color: "from-amber-700 to-orange-500", path: "/genre/folk" }
  ];


  return (
    <div className="min-h-screen bg-background">
      <div 
        className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">
              Discover Your Musical Journey
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Learn various music genres and play instruments virtually in our interactive GarageBand-inspired studio
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/studio">
                <Button 
                  size="lg" 
                  className="text-lg px-8 bg-black bg-opacity-50 backdrop-blur-md border border-white/20 text-white hover:bg-black hover:bg-opacity-70"
                  data-testid="button-start-studio"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Try the Studio
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 bg-black bg-opacity-40 backdrop-blur-md border-white/30 text-white hover:bg-black hover:bg-opacity-60"
                data-testid="button-explore-genres"
              >
                <Music className="mr-2 h-5 w-5" />
                Explore Genres
              </Button>
            </div>
          </motion.div>
        </div>


        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-white text-opacity-90 text-sm drop-shadow-md font-semibold">Scroll to explore</div>
        </motion.div>
      </div>


      <div className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Start Learning Today</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Interactive, musical, and lively - everything you need to explore music
            </p>
          </motion.div>


          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="p-8 h-full hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-feature-${index}`}>
                  <div className={`w-16 h-16 rounded-md bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>


          <div className="mb-24">
            <h2 className="text-3xl font-bold mb-8 text-center">Explore Music Styles</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {genres.map((genre, index) => (
                <Link key={genre.name} href={genre.path}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`p-6 text-center hover-elevate active-elevate-2 cursor-pointer bg-gradient-to-br ${genre.color} border-0`}
                      data-testid={`card-genre-${genre.name.toLowerCase()}`}
                    >
                      <h3 className="text-xl font-bold text-white">{genre.name}</h3>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>


          <motion.div
            className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-md p-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Create Music?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Tap any instrument to learn and play! Start exploring your favorite instrument and style.
            </p>
            <Link href="/studio">
              <Button size="lg" className="text-lg px-8" data-testid="button-cta-studio">
                <Guitar className="mr-2 h-5 w-5" />
                Launch Studio
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
