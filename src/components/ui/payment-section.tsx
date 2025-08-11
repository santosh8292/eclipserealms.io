import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Gamepad2, Crown, Sparkles, Zap } from "lucide-react";

const paymentOptions = [
  {
    id: "game_access",
    title: "Full Game Access",
    description: "Unlock Eclipse Realms with all realms, characters, and features",
    price: "$49.99",
    icon: Gamepad2,
    badge: "Best Value",
    color: "eclipse-gold",
    features: [
      "Access to all realms",
      "All character classes",
      "Cross-platform play",
      "Cloud save progression",
      "Multiplayer features"
    ]
  },
  {
    id: "battle_pass",
    title: "Season Battle Pass",
    description: "Exclusive rewards and challenges for the current season",
    price: "$9.99",
    icon: Crown,
    badge: "Popular",
    color: "mystic-purple",
    features: [
      "Exclusive cosmetics",
      "Season challenges",
      "Premium rewards",
      "Early access content"
    ]
  },
  {
    id: "cosmetic",
    title: "Cosmetic Item",
    description: "Premium skins and customization options",
    price: "$2.99",
    icon: Sparkles,
    badge: "Cosmetic",
    color: "rift-cyan",
    features: [
      "Character skins",
      "Weapon effects",
      "Realm themes",
      "Exclusive animations"
    ]
  }
];

const PaymentSection = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (productType: string) => {
    setLoading(productType);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { productType }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-eclipse-gold/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-mystic-purple/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-eclipse-gold/20 text-eclipse-gold border-eclipse-gold/30">
            <Zap className="w-3 h-3 mr-1" />
            Get Access Now
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-eclipse">Join the</span>{" "}
            <span className="text-gradient-rift">Eclipse</span>
          </h2>
          <p className="text-xl text-cosmic-white/70 max-w-3xl mx-auto">
            Choose your path into the Eclipse Realms. Fair pricing, no pay-to-win mechanics.
          </p>
        </div>

        {/* Payment options grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {paymentOptions.map((option) => (
            <Card 
              key={option.id}
              className="bg-gradient-card border-mystic-purple/20 hover:border-eclipse-gold/40 transition-all duration-300 group relative overflow-hidden"
            >
              {option.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className={`bg-${option.color}/20 text-${option.color} border-${option.color}/40`}>
                    {option.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg bg-${option.color}/20 flex items-center justify-center mb-4 group-hover:bg-${option.color}/30 transition-colors duration-300`}>
                  <option.icon className={`h-6 w-6 text-${option.color}`} />
                </div>
                <CardTitle className="text-xl text-cosmic-white group-hover:text-eclipse-gold transition-colors duration-300">
                  {option.title}
                </CardTitle>
                <CardDescription className="text-cosmic-white/70">
                  {option.description}
                </CardDescription>
                <div className="text-3xl font-bold text-eclipse-gold mt-2">
                  {option.price}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-cosmic-white/80">
                      <div className={`w-2 h-2 rounded-full bg-${option.color} mr-3`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handlePurchase(option.id)}
                  disabled={loading === option.id}
                  className={`w-full bg-gradient-to-r from-${option.color}/80 to-${option.color} hover:from-${option.color} hover:to-${option.color}/80 text-cosmic-white border-0 transition-all duration-300`}
                >
                  {loading === option.id ? "Processing..." : `Get ${option.title}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security notice */}
        <div className="text-center mt-12">
          <p className="text-cosmic-white/50 text-sm">
            Secure payments powered by Stripe • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
};

export default PaymentSection;