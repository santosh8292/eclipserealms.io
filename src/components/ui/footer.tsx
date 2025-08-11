import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Github, 
  Twitter, 
  MessageSquare, 
  Youtube,
  Mail,
  Globe,
  Download,
  Gamepad2
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-void-darker border-t border-mystic-purple/20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-eclipse-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-rift-blue/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main footer content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand section */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-2xl font-bold">
                  <span className="text-gradient-eclipse">ECLIPSE</span>{" "}
                  <span className="text-gradient-rift">REALMS</span>
                </h3>
                <p className="text-cosmic-white/70 mt-2 max-w-md">
                  Traverse infinite realities. Master dimensional powers. 
                  Shape the multiverse. Your legend begins now.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button variant="eclipse" className="cosmic-glow">
                  <Download className="mr-2 h-4 w-4" />
                  Download Free
                </Button>
                <Button variant="cosmic">
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  Play in Browser
                </Button>
              </div>

              {/* Social links */}
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="hover:text-eclipse-gold">
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-eclipse-gold">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-eclipse-gold">
                  <Youtube className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-eclipse-gold">
                  <Github className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Game links */}
            <div>
              <h4 className="text-lg font-semibold text-cosmic-white mb-4">Game</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-cosmic-white/70 hover:text-eclipse-gold transition-colors">
                    Download
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cosmic-white/70 hover:text-eclipse-gold transition-colors">
                    System Requirements
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cosmic-white/70 hover:text-eclipse-gold transition-colors">
                    Release Notes
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cosmic-white/70 hover:text-eclipse-gold transition-colors">
                    Leaderboards
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cosmic-white/70 hover:text-eclipse-gold transition-colors">
                    Game Guide
                  </a>
                </li>
              </ul>
            </div>

            {/* Community links */}
            <div>
              <h4 className="text-lg font-semibold text-cosmic-white mb-4">Community</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-cosmic-white/70 hover:text-eclipse-gold transition-colors">
                    Discord Server
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cosmic-white/70 hover:text-eclipse-gold transition-colors">
                    Forums
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cosmic-white/70 hover:text-eclipse-gold transition-colors">
                    Reddit
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cosmic-white/70 hover:text-eclipse-gold transition-colors">
                    Content Creators
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cosmic-white/70 hover:text-eclipse-gold transition-colors">
                    Tournaments
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="bg-mystic-purple/20" />

        {/* Bottom section */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-cosmic-white/50 text-sm mb-4 md:mb-0">
            © 2024 Eclipse Realms. All rights reserved. Traverse responsibly.
          </div>
          
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-cosmic-white/50 hover:text-eclipse-gold transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-cosmic-white/50 hover:text-eclipse-gold transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-cosmic-white/50 hover:text-eclipse-gold transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;