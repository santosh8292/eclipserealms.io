import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gamepad2, 
  Globe, 
  Zap, 
  Users, 
  Sparkles, 
  Shield,
  RefreshCw,
  Trophy
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Cross-Platform Play",
    description: "Seamlessly play across PC, mobile, and tablets with cloud save progression",
    badge: "Universal",
    color: "rift-blue"
  },
  {
    icon: RefreshCw,
    title: "Procedural Realms",
    description: "Infinite replayability with dynamically generated worlds and challenges",
    badge: "Infinite",
    color: "mystic-purple"
  },
  {
    icon: Users,
    title: "Social Multiplayer",
    description: "Drop-in co-op, competitive arenas, and global realm events",
    badge: "Social",
    color: "eclipse-gold"
  },
  {
    icon: Sparkles,
    title: "Multiverse Narrative",
    description: "Your actions in one realm affect others, shaping the cosmic story",
    badge: "Dynamic",
    color: "rift-cyan"
  },
  {
    icon: Gamepad2,
    title: "Adaptive Controls",
    description: "Optimized controls for every platform with full customization",
    badge: "Responsive",
    color: "mystic-magenta"
  },
  {
    icon: Shield,
    title: "Fair Monetization",
    description: "Cosmetic-only purchases with no pay-to-win mechanics",
    badge: "Ethical",
    color: "celestial-gold"
  },
  {
    icon: Zap,
    title: "Real-time Events",
    description: "Weekly cosmic events that reshape reality across all realms",
    badge: "Live",
    color: "lava-red"
  },
  {
    icon: Trophy,
    title: "Competitive Leagues",
    description: "Climb the ranks in PvP arenas and global leaderboards",
    badge: "Ranked",
    color: "cyber-neon"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-mystic-purple/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-eclipse-gold/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-mystic-purple/20 text-mystic-purple border-mystic-purple/30">
            Game Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-eclipse">Epic Features</span> for{" "}
            <span className="text-gradient-rift">Every Player</span>
          </h2>
          <p className="text-xl text-cosmic-white/70 max-w-3xl mx-auto">
            Experience cutting-edge gameplay mechanics designed for the next generation of gaming
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-gradient-card border-mystic-purple/20 hover:border-eclipse-gold/40 transition-all duration-300 group cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${feature.color}/20 group-hover:bg-${feature.color}/30 transition-colors duration-300`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`border-${feature.color}/40 text-${feature.color} text-xs`}
                  >
                    {feature.badge}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold text-cosmic-white mb-2 group-hover:text-eclipse-gold transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-cosmic-white/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-cosmic-white/60 mb-4">Ready to explore infinite realms?</p>
          <div className="w-16 h-0.5 bg-gradient-eclipse mx-auto rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;