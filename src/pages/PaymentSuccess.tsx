import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Gamepad2, Home } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-cosmic-black flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success animation */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-eclipse-gold to-rift-cyan rounded-full flex items-center justify-center shadow-glow">
            <CheckCircle className="w-12 h-12 text-cosmic-white" />
          </div>
        </div>

        {/* Success card */}
        <Card className="bg-gradient-card border-eclipse-gold/30">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Badge className="bg-eclipse-gold/20 text-eclipse-gold border-eclipse-gold/40">
                Payment Successful
              </Badge>
            </div>
            <CardTitle className="text-3xl text-cosmic-white">
              Welcome to <span className="text-gradient-eclipse">Eclipse Realms</span>!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-cosmic-white/70 text-lg">
              Your payment has been processed successfully. You now have access to all the amazing features of Eclipse Realms.
            </p>

            {sessionId && (
              <div className="bg-mystic-purple/10 border border-mystic-purple/20 rounded-lg p-4">
                <p className="text-sm text-cosmic-white/60">
                  Order ID: <span className="font-mono text-eclipse-gold">{sessionId}</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-eclipse-gold/10 to-transparent border border-eclipse-gold/20 rounded-lg p-4">
                <Gamepad2 className="w-6 h-6 text-eclipse-gold mb-2" />
                <h3 className="font-semibold text-cosmic-white mb-1">Game Access</h3>
                <p className="text-sm text-cosmic-white/70">Play across all platforms</p>
              </div>
              
              <div className="bg-gradient-to-r from-rift-cyan/10 to-transparent border border-rift-cyan/20 rounded-lg p-4">
                <Download className="w-6 h-6 text-rift-cyan mb-2" />
                <h3 className="font-semibold text-cosmic-white mb-1">Download</h3>
                <p className="text-sm text-cosmic-white/70">Get the game now</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                className="bg-gradient-to-r from-eclipse-gold to-rift-cyan hover:from-eclipse-gold/80 hover:to-rift-cyan/80 text-cosmic-white border-0"
              >
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Game
                </a>
              </Button>
              
              <Button 
                asChild
                variant="outline"
                className="border-mystic-purple/40 text-mystic-purple hover:bg-mystic-purple/20"
              >
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-cosmic-white/50 text-sm mt-8">
          Questions? Contact our support team for assistance.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;