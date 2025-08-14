import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Plane, Stars, Environment, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Gamepad2, 
  Zap, 
  Heart,
  Trophy,
  Coins,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  X,
  Crown,
  Lock
} from "lucide-react";

interface Character {
  name: string;
  color: string;
  abilities: string[];
  model: string;
  emoji: string;
  image: string;
}

interface Realm {
  name: string;
  theme: string;
  bgColor: string;
  fogColor: string;
  description: string;
  ambientColor: string;
}

interface GameState {
  health: number;
  coins: number;
  score: number;
  distance: number;
  isPlaying: boolean;
  isGameOver: boolean;
  isFullscreen: boolean;
  playerLane: number;
  selectedCharacter: string;
  selectedRealm: number;
  speed: number;
  playerY: number;
  isJumping: boolean;
  isPremium: boolean;
}

interface GameObject3D {
  id: number;
  position: THREE.Vector3;
  type: 'obstacle' | 'coin' | 'enemy' | 'powerup';
  lane: number;
}

const characters: Character[] = [
  {
    name: "Swift Deer",
    color: "#8B4513",
    abilities: ["Nature Speed", "Forest Jump", "Leaf Shield"],
    model: "deer",
    emoji: "🦌",
    image: "/lovable-uploads/1553f121-294a-449a-9875-8fc8cf5af1fe.png"
  },
  {
    name: "Thunder Bull", 
    color: "#2F2F2F",
    abilities: ["Charge Power", "Iron Defense", "Earth Stomp"],
    model: "bull",
    emoji: "🐂",
    image: "/lovable-uploads/3e714f8a-640d-40be-823e-f7cfb80868d7.png"
  },
  {
    name: "Doraemon",
    color: "#4169E1", 
    abilities: ["Magic Gadgets", "Time Travel", "Future Tech"],
    model: "doraemon",
    emoji: "🤖",
    image: "/lovable-uploads/3bd507a9-98f7-4f34-8089-2044ac8bec6f.png"
  },
  {
    name: "Pikachu",
    color: "#FFD700",
    abilities: ["Thunder Bolt", "Quick Attack", "Electric Shield"],
    model: "pikachu",
    emoji: "⚡",
    image: "/lovable-uploads/366e6244-0d91-41b8-8fa1-1e5264a0351a.png"
  }
];

const realms: Realm[] = [
  {
    name: "Mystic Forest",
    theme: "forest",
    bgColor: "#228B22",
    fogColor: "#90EE90",
    ambientColor: "#98FB98",
    description: "A magical forest realm where ancient spirits dwell"
  },
  {
    name: "Celestial Sanctum", 
    theme: "celestial",
    bgColor: "#191970",
    fogColor: "#483D8B",
    ambientColor: "#E6E6FA",
    description: "A divine realm among the stars where cosmic energy flows"
  },
  {
    name: "Lava Forge",
    theme: "fire",
    bgColor: "#FF4500",
    fogColor: "#FF6347",
    ambientColor: "#FFE4E1",
    description: "A volcanic realm of molten power with rivers of lava"
  },
  {
    name: "Cyber Core",
    theme: "cyber",
    bgColor: "#000011",
    fogColor: "#0F0F23",
    ambientColor: "#E0FFFF",
    description: "A digital realm of infinite data streams and neon lights"
  }
];

// 3D Character Component with Image Texture
function Character3D({ character, position, isPlayer = false }: { character: Character, position: THREE.Vector3, isPlayer?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isPlayer) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05; // Slower animation
    }
  });

  return (
    <group position={position}>
      {/* Character Body */}
      <Box ref={meshRef} args={[0.8, 1.6, 0.4]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color={character.color} metalness={0.3} roughness={0.7} />
      </Box>
      
      {/* Character Head */}
      <Sphere args={[0.3]} position={[0, 1.8, 0]}>
        <meshStandardMaterial color={character.color} metalness={0.2} roughness={0.8} />
      </Sphere>
      
      {/* Character Glow Effect */}
      <Sphere args={[1.2]} position={[0, 1, 0]}>
        <meshBasicMaterial color={character.color} transparent opacity={0.05} />
      </Sphere>
      
      {/* Character Name */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {character.name}
      </Text>
    </group>
  );
}

// 3D Obstacle Component (slower)
function Obstacle3D({ position, type }: { position: THREE.Vector3, type: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01; // Slower rotation
    }
  });

  const color = type === 'enemy' ? '#FF0000' : '#8B0000';
  
  return (
    <Box ref={meshRef} args={[1, 2, 1]} position={position}>
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </Box>
  );
}

// 3D Coin Component (slower)
function Coin3D({ position }: { position: THREE.Vector3 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.03; // Slower rotation
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.1; // Slower float
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.3}>
      <Sphere ref={meshRef} args={[0.3]} position={position}>
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </Sphere>
    </Float>
  );
}

// 3D Game World Component
function GameWorld3D({ gameState, obstacles, coins, selectedCharacter, selectedRealm }: {
  gameState: GameState;
  obstacles: GameObject3D[];
  coins: GameObject3D[];
  selectedCharacter: Character;
  selectedRealm: Realm;
}) {
  const { camera } = useThree();
  
  useFrame(() => {
    // Camera follows player (slower movement)
    const targetX = gameState.playerLane * 2;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = 8 + gameState.playerY * 0.05;
    camera.position.z = 10;
    camera.lookAt(targetX, 0, -5);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color={selectedRealm.ambientColor} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 10, 0]} intensity={0.5} color={selectedRealm.bgColor} />
      
      {/* Environment */}
      <Stars radius={300} depth={60} count={1000} factor={7} saturation={0} fade />
      
      {/* Ground/Platform */}
      <Plane args={[20, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -10]}>
        <meshStandardMaterial color="#2D1B69" metalness={0.3} roughness={0.7} />
      </Plane>
      
      {/* Lane Markers */}
      {[-2, 0, 2].map((x, i) => (
        <Box key={i} args={[0.1, 0.2, 100]} position={[x, -0.8, -10]}>
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.2} />
        </Box>
      ))}
      
      {/* Player Character */}
      <Character3D 
        character={selectedCharacter} 
        position={new THREE.Vector3(gameState.playerLane * 2, gameState.playerY, 0)}
        isPlayer={true}
      />
      
      {/* Obstacles */}
      {obstacles.map((obstacle) => (
        <Obstacle3D 
          key={obstacle.id} 
          position={obstacle.position} 
          type={obstacle.type}
        />
      ))}
      
      {/* Coins */}
      {coins.map((coin) => (
        <Coin3D key={coin.id} position={coin.position} />
      ))}
      
      {/* Realm-specific Effects */}
      {selectedRealm.theme === 'forest' && (
        <>
          {Array.from({ length: 30 }).map((_, i) => (
            <Float key={i} speed={0.5 + Math.random() * 0.5} rotationIntensity={0.3}>
              <Sphere 
                args={[0.05]} 
                position={[
                  (Math.random() - 0.5) * 20,
                  Math.random() * 10,
                  (Math.random() - 0.5) * 50
                ]}
              >
                <meshStandardMaterial color="#90EE90" transparent opacity={0.6} />
              </Sphere>
            </Float>
          ))}
        </>
      )}
    </>
  );
}

// Payment Modal Component
function PaymentModal({ isOpen, onClose, onPurchase }: { isOpen: boolean; onClose: () => void; onPurchase: (tier: string) => void }) {
  if (!isOpen) return null;

  const tiers = [
    {
      name: "Cosmetics Pack",
      price: "$2.99",
      description: "Unlock special skins and effects",
      features: ["Character skins", "Special effects", "Victory animations"],
      tier: "cosmetics"
    },
    {
      name: "Battle Pass",
      price: "$9.99", 
      description: "Seasonal content and premium characters",
      features: ["All 4 characters", "Seasonal rewards", "Weekly challenges"],
      tier: "battlepass"
    },
    {
      name: "Full Game",
      price: "$49.99",
      description: "Complete Eclipse Realms experience",
      features: ["Unlimited access", "All future content", "No ads", "Premium support"],
      tier: "fullgame"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-cosmic-void border-eclipse-gold max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-eclipse-gold flex items-center justify-center gap-2">
            <Crown className="h-6 w-6" />
            Eclipse Realms - Premium Tiers
          </CardTitle>
          <p className="text-cosmic-white/80">Choose your adventure level</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <Card key={tier.tier} className="border-cosmic-gray hover:border-eclipse-gold transition-colors">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-cosmic-white mb-2">{tier.name}</h3>
                  <div className="text-3xl font-bold text-eclipse-gold mb-2">{tier.price}</div>
                  <p className="text-cosmic-white/70 mb-4">{tier.description}</p>
                  <div className="space-y-2 mb-6">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-cosmic-white/80">
                        <div className="w-2 h-2 bg-eclipse-gold rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => onPurchase(tier.tier)} 
                    className="w-full bg-eclipse-gold text-cosmic-void hover:bg-eclipse-gold/90"
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline" onClick={onClose} className="px-8">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Character Selection Component
function CharacterSelection({ characters, selectedCharacter, onSelect }: {
  characters: Character[];
  selectedCharacter: string;
  onSelect: (character: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {characters.map((char) => {
        const isSelected = char.model === selectedCharacter;
        
        return (
          <Card 
            key={char.model}
            className={`cursor-pointer transition-all duration-300 relative ${
              isSelected 
                ? 'border-eclipse-gold bg-eclipse-gold/10' 
                : 'border-cosmic-gray hover:border-eclipse-gold/50'
            }`}
            onClick={() => onSelect(char.model)}
          >
            <CardContent className="p-4 text-center">
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-3 bg-cover bg-center rounded-lg border-2 border-eclipse-gold shadow-lg" 
                     style={{ backgroundImage: `url(${char.image})` }}>
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-eclipse-gold rounded-full flex items-center justify-center">
                    <span className="text-cosmic-void text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
              <h4 className="font-bold text-cosmic-white mb-2 text-sm">{char.name}</h4>
              <div className="text-3xl mb-3">{char.emoji}</div>
              <div className="text-xs text-cosmic-white/70 leading-relaxed">
                {char.abilities.slice(0, 2).join(" • ")}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Difficulty Selection Component
function DifficultySelection({ selectedDifficulty, onSelect }: {
  selectedDifficulty: string;
  onSelect: (difficulty: string) => void;
}) {
  const difficulties = [
    { name: "Slow", value: "slow", speed: 0.6, description: "Perfect for beginners" },
    { name: "Medium", value: "medium", speed: 1.0, description: "Balanced challenge" },
    { name: "Hard", value: "hard", speed: 1.8, description: "For experienced players" }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-cosmic-white mb-4 text-center">Choose Difficulty</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {difficulties.map((diff) => (
          <Card 
            key={diff.value}
            className={`cursor-pointer transition-all duration-300 ${
              selectedDifficulty === diff.value 
                ? 'border-eclipse-gold bg-eclipse-gold/10' 
                : 'border-cosmic-gray hover:border-eclipse-gold/50'
            }`}
            onClick={() => onSelect(diff.value)}
          >
            <CardContent className="p-4 text-center">
              <h4 className="font-semibold text-cosmic-white mb-2">{diff.name}</h4>
              <p className="text-sm text-cosmic-white/60 mb-2">{diff.description}</p>
              <div className="text-eclipse-gold font-bold">Speed: {diff.speed}x</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main Game Component
const EclipseRealmsGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    coins: 0,
    score: 0,
    distance: 0,
    isPlaying: false,
    isGameOver: false,
    isFullscreen: false,
    playerLane: 0,
    selectedCharacter: "deer",
    selectedRealm: 0,
    speed: 0.8, // Even slower initial speed
    playerY: 0,
    isJumping: false,
    isPremium: true // All characters unlocked
  });

  const [obstacles, setObstacles] = useState<GameObject3D[]>([]);
  const [coins, setCoins] = useState<GameObject3D[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("slow");
  const [showCharacterSelect, setShowCharacterSelect] = useState(true);
  const gameLoopRef = useRef<number>();

  const selectedChar = characters.find(c => c.model === gameState.selectedCharacter) || characters[0];
  const selectedRealm = realms[gameState.selectedRealm];

  // Slower game loop
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const gameLoop = () => {
      setGameState(prev => {
        const newState = { ...prev };
        
        // Handle jumping (slower)
        if (newState.isJumping) {
          if (newState.playerY < 2.5) {
            newState.playerY += 0.15; // Slower jump
          } else {
            newState.isJumping = false;
          }
        } else if (newState.playerY > 0) {
          newState.playerY -= 0.15; // Slower fall
        } else {
          newState.playerY = 0;
        }

        // Update distance and score (much slower)
        newState.distance += 0.2;
        newState.score += 1;
        newState.speed = Math.min(3, 0.8 + newState.distance / 300); // Much slower progression

        return newState;
      });

      // Move and spawn obstacles (slower)
      setObstacles(prev => {
        const updated = prev.map(obs => ({
          ...obs,
          position: new THREE.Vector3(obs.position.x, obs.position.y, obs.position.z + gameState.speed * 0.8)
        })).filter(obs => obs.position.z < 15);

        // Spawn new obstacles (much less frequent)
        if (Math.random() < 0.008) {
          const lane = Math.floor(Math.random() * 3) - 1;
          updated.push({
            id: Date.now() + Math.random(),
            position: new THREE.Vector3(lane * 2, 0, -35),
            type: Math.random() < 0.7 ? 'obstacle' : 'enemy',
            lane
          });
        }

        return updated;
      });

      // Move and spawn coins (slower)
      setCoins(prev => {
        const updated = prev.map(coin => ({
          ...coin,
          position: new THREE.Vector3(coin.position.x, coin.position.y, coin.position.z + gameState.speed * 0.8)
        })).filter(coin => coin.position.z < 15);

        // Spawn new coins (much less frequent)
        if (Math.random() < 0.006) {
          const lane = Math.floor(Math.random() * 3) - 1;
          updated.push({
            id: Date.now() + Math.random(),
            position: new THREE.Vector3(lane * 2, 1, -30),
            type: 'coin',
            lane
          });
        }

        return updated;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.speed]);

  // Collision detection
  useEffect(() => {
    if (!gameState.isPlaying) return;

    // Check obstacle collisions
    obstacles.forEach(obstacle => {
      if (obstacle.position.z > -2 && obstacle.position.z < 2 &&
          obstacle.lane === gameState.playerLane &&
          gameState.playerY < 1.5) {
        setGameState(prev => {
          const newHealth = prev.health - 20; // Less damage
          if (newHealth <= 0) {
            toast({
              title: "Eclipse Eclipsed!",
              description: `Your journey ends. Score: ${prev.score}`,
              variant: "destructive"
            });
            return { ...prev, health: 0, isPlaying: false, isGameOver: true };
          }
          return { ...prev, health: newHealth };
        });
        setObstacles(prev => prev.filter(obs => obs.id !== obstacle.id));
      }
    });

    // Check coin collisions
    coins.forEach(coin => {
      if (coin.position.z > -2 && coin.position.z < 2 &&
          coin.lane === gameState.playerLane) {
        setGameState(prev => ({
          ...prev,
          coins: prev.coins + 1,
          score: prev.score + 100
        }));
        setCoins(prev => prev.filter(c => c.id !== coin.id));
        toast({
          title: "Cosmic Coin!",
          description: "+100 Score",
          duration: 1000
        });
      }
    });
  }, [obstacles, coins, gameState.playerLane, gameState.playerY, gameState.isPlaying]);

  // Touch and Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setGameState(prev => ({
            ...prev,
            playerLane: Math.max(-1, prev.playerLane - 1)
          }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setGameState(prev => ({
            ...prev,
            playerLane: Math.min(1, prev.playerLane + 1)
          }));
          break;
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (!gameState.isJumping && gameState.playerY <= 0.1) {
            setGameState(prev => ({ ...prev, isJumping: true }));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, gameState.isJumping, gameState.playerY]);

  const backToSelection = () => {
    setShowCharacterSelect(true);
    setGameState(prev => ({ ...prev, isPlaying: false, isGameOver: false }));
  };

  const stopGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      health: 100,
      coins: 0,
      score: 0,
      distance: 0,
      isPlaying: false,
      isGameOver: false,
      playerLane: 0,
      speed: 1.5,
      playerY: 0,
      isJumping: false
    }));
    setObstacles([]);
    setCoins([]);
  };

  const handleCharacterSelect = (characterModel: string) => {
    setGameState(prev => ({ ...prev, selectedCharacter: characterModel }));
  };

  const handlePurchase = (tier: string) => {
    // Simulate purchase
    toast({
      title: `${tier} Purchased!`,
      description: "Thank you for your purchase!",
    });
    setShowPayment(false);
  };

  const getDifficultySpeed = (difficulty: string) => {
    switch (difficulty) {
      case "slow": return 0.6;
      case "medium": return 1.0;
      case "hard": return 1.8;
      default: return 0.6;
    }
  };

  const handleStartGame = () => {
    const speed = getDifficultySpeed(selectedDifficulty);
    setGameState(prev => ({
      ...prev,
      health: 100,
      coins: 0,
      score: 0,
      distance: 0,
      isPlaying: true,
      isGameOver: false,
      playerLane: 0,
      speed: speed,
      playerY: 0,
      isJumping: false
    }));
    setObstacles([]);
    setCoins([]);
    setShowCharacterSelect(false);
    toast({
      title: "Eclipse Realms Started!",
      description: `Playing as ${selectedChar.name} on ${selectedDifficulty} mode`,
    });
  };

  const moveLeft = () => {
    if (gameState.isPlaying) {
      setGameState(prev => ({
        ...prev,
        playerLane: Math.max(-1, prev.playerLane - 1)
      }));
    }
  };

  const moveRight = () => {
    if (gameState.isPlaying) {
      setGameState(prev => ({
        ...prev,
        playerLane: Math.min(1, prev.playerLane + 1)
      }));
    }
  };

  const jump = () => {
    if (gameState.isPlaying && !gameState.isJumping && gameState.playerY <= 0.1) {
      setGameState(prev => ({ ...prev, isJumping: true }));
    }
  };

  return (
    <section id="game" className="py-20 bg-cosmic-void relative overflow-hidden">
      <div className="absolute inset-0 starfield opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient-eclipse">Eclipse Realms</span>
          </h2>
          <div className="mb-4">
            <Badge variant="outline" className="text-sm border-eclipse-gold text-eclipse-gold">
              🎮 GAME DEMO - Not Real Game
            </Badge>
          </div>
          <p className="text-xl text-cosmic-white/80 mb-8">
            Choose your Realmwalker and embark on an epic 3D journey!
          </p>
        </div>

        {showCharacterSelect ? (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-cosmic-void/50 border-eclipse-gold backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-eclipse-gold">
                  Setup Your Adventure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Character Selection */}
                <div>
                  <h3 className="text-xl font-bold text-center mb-6 text-eclipse-gold">
                    Choose Your Realmwalker (All Unlocked!)
                  </h3>
                  <CharacterSelection 
                    characters={characters}
                    selectedCharacter={gameState.selectedCharacter}
                    onSelect={handleCharacterSelect}
                  />
                </div>

                {/* Difficulty Selection */}
                <DifficultySelection 
                  selectedDifficulty={selectedDifficulty}
                  onSelect={setSelectedDifficulty}
                />

                <div className="flex flex-col gap-4 items-center">
                  <Button 
                    onClick={handleStartGame} 
                    size="lg"
                    className="bg-eclipse-gold text-cosmic-void hover:bg-eclipse-gold/90 px-8 py-4 text-lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Play Game
                  </Button>
                  
                  <Button 
                    onClick={() => setShowPayment(true)} 
                    variant="outline"
                    className="border-eclipse-gold text-eclipse-gold hover:bg-eclipse-gold/10"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    View Premium Tiers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
          <Card className="bg-cosmic-void/50 border-eclipse-gold backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="bg-eclipse-gold/20 text-eclipse-gold">
                    <Heart className="w-4 h-4 mr-1" />
                    Health: {gameState.health}%
                  </Badge>
                  <Badge variant="secondary" className="bg-rift-blue/20 text-rift-blue">
                    <Coins className="w-4 h-4 mr-1" />
                    Coins: {gameState.coins}
                  </Badge>
                  <Badge variant="secondary" className="bg-eclipse-gold/20 text-eclipse-gold">
                    <Trophy className="w-4 h-4 mr-1" />
                    Score: {gameState.score}
                  </Badge>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {gameState.isPlaying && (
                    <Button onClick={stopGame} variant="outline">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  
                  <Button onClick={resetGame} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>

                  <Button onClick={backToSelection} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Setup
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* 3D Game Canvas */}
              <div className="h-96 md:h-[500px] bg-gradient-to-b from-cosmic-void to-eclipse-purple rounded-lg overflow-hidden relative">
                <Suspense fallback={
                  <div className="h-full flex items-center justify-center text-cosmic-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eclipse-gold mx-auto mb-4"></div>
                      <p>Loading Eclipse Realms...</p>
                    </div>
                  </div>
                }>
                  <Canvas shadows camera={{ position: [0, 8, 10], fov: 60 }}>
                    <GameWorld3D 
                      gameState={gameState}
                      obstacles={obstacles}
                      coins={coins}
                      selectedCharacter={selectedChar}
                      selectedRealm={selectedRealm}
                    />
                  </Canvas>
                </Suspense>
                
                {/* Mobile Controls */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 md:hidden">
                  <Button size="lg" onClick={moveLeft} className="bg-eclipse-gold/20 text-eclipse-gold border-eclipse-gold">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                  <Button size="lg" onClick={jump} className="bg-eclipse-gold/20 text-eclipse-gold border-eclipse-gold">
                    <ArrowUp className="h-6 w-6" />
                  </Button>
                  <Button size="lg" onClick={moveRight} className="bg-eclipse-gold/20 text-eclipse-gold border-eclipse-gold">
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </div>
                
                {/* Game Over Overlay */}
                {gameState.isGameOver && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <h3 className="text-3xl font-bold text-eclipse-gold">Eclipse Eclipsed!</h3>
                      <p className="text-xl text-cosmic-white">Final Score: {gameState.score}</p>
                      <p className="text-lg text-cosmic-white/80">Distance: {Math.floor(gameState.distance)}m</p>
                      <Button onClick={resetGame} className="bg-eclipse-gold text-cosmic-void">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Instructions */}
              <div className="p-6 bg-cosmic-void/30 border-t border-eclipse-gold/20">
                <h4 className="text-lg font-semibold text-eclipse-gold mb-3">Controls</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-cosmic-white/80">
                  <div>
                    <strong className="text-eclipse-gold">Movement:</strong><br />
                    ← → Arrow keys or A/D keys<br />
                    (Mobile: Left/Right buttons)
                  </div>
                  <div>
                    <strong className="text-eclipse-gold">Jump:</strong><br />
                    ↑ Arrow key, W key, or Spacebar<br />
                    (Mobile: Up button)
                  </div>
                  <div>
                    <strong className="text-eclipse-gold">Objective:</strong><br />
                    Avoid obstacles, collect coins,<br />
                    and survive as long as possible!
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onPurchase={handlePurchase}
        />
      </div>
    </section>
  );
};

export default EclipseRealmsGame;