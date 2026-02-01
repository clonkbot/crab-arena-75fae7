import React, { useState, useEffect, useCallback, useRef } from 'react';

// Types
interface Crab {
  id: number;
  name: string;
  color: string;
  shellColor: string;
  eyeColor: string;
  weapon: string;
  ability: string;
  abilityIcon: string;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  direction: 'left' | 'right';
  isAttacking: boolean;
  isHit: boolean;
  cooldown: number;
  speed: number;
  damage: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  type: 'hit' | 'bubble' | 'sand' | 'sparkle';
  color: string;
}

// Crab character data
const CRAB_ROSTER = [
  { name: 'Pincer Pete', color: '#FF6B35', shellColor: '#D4380D', eyeColor: '#1a1a1a', weapon: '🥊 Boxing Claws', ability: 'Power Punch', abilityIcon: '💥', speed: 5, damage: 20 },
  { name: 'Coral Queen', color: '#FF69B4', shellColor: '#C71585', eyeColor: '#FFD700', weapon: '✨ Magic Wand', ability: 'Coral Blast', abilityIcon: '🌸', speed: 4, damage: 25 },
  { name: 'Shelldon', color: '#4169E1', shellColor: '#1E3A8A', eyeColor: '#FF4500', weapon: '💣 Shell Cannon', ability: 'Bomb Drop', abilityIcon: '💣', speed: 3, damage: 35 },
  { name: 'Bubbles', color: '#00CED1', shellColor: '#008B8B', eyeColor: '#FFB6C1', weapon: '🌊 Bubble Gun', ability: 'Bubble Barrage', abilityIcon: '🫧', speed: 7, damage: 15 },
];

const ARENAS = [
  { name: 'Sunny Beach', bg: 'linear-gradient(180deg, #87CEEB 0%, #E0F7FA 40%, #FFE4B5 60%, #F4A460 100%)', ground: '#F4A460', accent: '#FFD700' },
  { name: 'Deep Ocean', bg: 'linear-gradient(180deg, #001F3F 0%, #003366 50%, #004080 100%)', ground: '#1a365d', accent: '#00CED1' },
  { name: 'Coral Reef', bg: 'linear-gradient(180deg, #20B2AA 0%, #48D1CC 50%, #40E0D0 100%)', ground: '#FF7F50', accent: '#FF69B4' },
  { name: 'Sunset Cove', bg: 'linear-gradient(180deg, #FF6B6B 0%, #FF8E53 30%, #FFD93D 60%, #6BCB77 100%)', ground: '#8B4513', accent: '#FF1493' },
];

// Crab SVG Component
const CrabSprite: React.FC<{ crab: Crab; isPlayer?: boolean }> = ({ crab, isPlayer }) => {
  const scale = crab.direction === 'left' ? -1 : 1;
  
  return (
    <svg 
      viewBox="0 0 120 100" 
      className={`w-full h-full transition-transform duration-100 ${crab.isHit ? 'animate-hit' : ''} ${crab.isAttacking ? 'animate-bounce-attack' : ''}`}
      style={{ transform: `scaleX(${scale})` }}
    >
      {/* Shadow */}
      <ellipse cx="60" cy="95" rx="40" ry="8" fill="rgba(0,0,0,0.3)" />
      
      {/* Legs */}
      {[...Array(3)].map((_, i) => (
        <g key={`leg-${i}`}>
          <path 
            d={`M ${35 - i * 8} 70 Q ${25 - i * 10} ${80 + i * 3} ${15 - i * 8} ${85 + i * 2}`} 
            stroke={crab.shellColor} 
            strokeWidth="6" 
            strokeLinecap="round" 
            fill="none"
            style={{ animation: `wobble 0.3s ease-in-out infinite ${i * 0.1}s` }}
          />
          <path 
            d={`M ${85 + i * 8} 70 Q ${95 + i * 10} ${80 + i * 3} ${105 + i * 8} ${85 + i * 2}`} 
            stroke={crab.shellColor} 
            strokeWidth="6" 
            strokeLinecap="round" 
            fill="none"
            style={{ animation: `wobble 0.3s ease-in-out infinite ${i * 0.1 + 0.15}s` }}
          />
        </g>
      ))}
      
      {/* Body/Shell */}
      <ellipse cx="60" cy="55" rx="38" ry="30" fill={crab.color} />
      <ellipse cx="60" cy="50" rx="32" ry="22" fill={crab.shellColor} />
      <ellipse cx="60" cy="45" rx="20" ry="12" fill={crab.color} opacity="0.5" />
      
      {/* Shell pattern */}
      <path d="M 40 40 Q 60 30 80 40" stroke={crab.color} strokeWidth="3" fill="none" opacity="0.6" />
      <path d="M 45 50 Q 60 42 75 50" stroke={crab.color} strokeWidth="2" fill="none" opacity="0.4" />
      
      {/* Claws */}
      <g style={{ animation: crab.isAttacking ? 'bounce-attack 0.15s ease-in-out' : 'wobble 0.5s ease-in-out infinite' }}>
        {/* Left Claw */}
        <ellipse cx="15" cy="45" rx="15" ry="12" fill={crab.color} />
        <ellipse cx="8" cy="40" rx="8" ry="6" fill={crab.shellColor} />
        <ellipse cx="22" cy="50" rx="8" ry="6" fill={crab.shellColor} />
      </g>
      <g style={{ animation: crab.isAttacking ? 'bounce-attack 0.15s ease-in-out 0.05s' : 'wobble 0.5s ease-in-out infinite 0.25s' }}>
        {/* Right Claw */}
        <ellipse cx="105" cy="45" rx="15" ry="12" fill={crab.color} />
        <ellipse cx="112" cy="40" rx="8" ry="6" fill={crab.shellColor} />
        <ellipse cx="98" cy="50" rx="8" ry="6" fill={crab.shellColor} />
      </g>
      
      {/* Eye stalks */}
      <rect x="42" y="20" width="6" height="18" rx="3" fill={crab.color} />
      <rect x="72" y="20" width="6" height="18" rx="3" fill={crab.color} />
      
      {/* Eyes */}
      <circle cx="45" cy="18" r="8" fill="white" />
      <circle cx="75" cy="18" r="8" fill="white" />
      <circle cx="46" cy="17" r="5" fill={crab.eyeColor} />
      <circle cx="76" cy="17" r="5" fill={crab.eyeColor} />
      <circle cx="47" cy="15" r="2" fill="white" />
      <circle cx="77" cy="15" r="2" fill="white" />
      
      {/* Mouth */}
      <path d="M 52 68 Q 60 73 68 68" stroke={crab.shellColor} strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* Player indicator */}
      {isPlayer && (
        <polygon 
          points="60,0 55,8 65,8" 
          fill="#FFD700" 
          style={{ animation: 'float 1s ease-in-out infinite' }}
        />
      )}
    </svg>
  );
};

// Health Bar Component
const HealthBar: React.FC<{ health: number; maxHealth: number; name: string; color: string; isPlayer?: boolean }> = ({ 
  health, maxHealth, name, isPlayer 
}) => {
  const percentage = (health / maxHealth) * 100;
  const barColor = percentage > 60 ? '#4ADE80' : percentage > 30 ? '#FBBF24' : '#EF4444';
  
  return (
    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 text-center">
      <div className={`font-bangers text-sm mb-1 tracking-wider ${isPlayer ? 'text-yellow-300' : 'text-white'}`} 
           style={{ textShadow: '2px 2px 0 #000' }}>
        {name}
      </div>
      <div className="h-4 bg-gray-900 rounded-full border-2 border-white overflow-hidden shadow-lg">
        <div 
          className="h-full transition-all duration-300 ease-out rounded-full"
          style={{ 
            width: `${percentage}%`, 
            background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}aa 100%)`,
            boxShadow: `0 0 10px ${barColor}`
          }}
        />
      </div>
      <div className="text-xs text-white font-bold mt-0.5" style={{ textShadow: '1px 1px 0 #000' }}>
        {health}/{maxHealth}
      </div>
    </div>
  );
};

// Particle Component
const ParticleEffect: React.FC<{ particle: Particle }> = ({ particle }) => {
  if (particle.type === 'hit') {
    return (
      <div 
        className="absolute animate-explosion pointer-events-none font-bangers text-2xl"
        style={{ left: particle.x, top: particle.y, color: particle.color, textShadow: '2px 2px 0 #000' }}
      >
        POW!
      </div>
    );
  }
  if (particle.type === 'bubble') {
    return (
      <div 
        className="absolute w-4 h-4 rounded-full pointer-events-none"
        style={{ 
          left: particle.x, 
          top: particle.y, 
          background: 'radial-gradient(circle at 30% 30%, white, rgba(0,206,209,0.5))',
          animation: 'bubble-rise 2s ease-out forwards'
        }}
      />
    );
  }
  return null;
};

// Main Game Component
const App: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'select' | 'arena-select' | 'playing' | 'gameover'>('menu');
  const [player1, setPlayer1] = useState<Crab | null>(null);
  const [player2, setPlayer2] = useState<Crab | null>(null);
  const [selectedArena, setSelectedArena] = useState(ARENAS[0]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [comboCount, setComboCount] = useState(0);
  const gameLoopRef = useRef<number>();
  const keysPressed = useRef<Set<string>>(new Set());

  // Initialize crabs for battle
  const initializeCrab = (roster: typeof CRAB_ROSTER[0], id: number, startX: number): Crab => ({
    id,
    ...roster,
    health: 100,
    maxHealth: 100,
    x: startX,
    y: 300,
    direction: id === 1 ? 'right' : 'left',
    isAttacking: false,
    isHit: false,
    cooldown: 0,
  });

  // Start the game
  const startGame = () => {
    if (!player1 || !player2) return;
    setGameState('playing');
    setWinner(null);
    setComboCount(0);
    setPlayer1({ ...player1, health: 100, x: 150, direction: 'right', isAttacking: false, isHit: false, cooldown: 0 });
    setPlayer2({ ...player2, health: 100, x: 650, direction: 'left', isAttacking: false, isHit: false, cooldown: 0 });
  };

  // Handle attacks
  const handleAttack = useCallback((attacker: Crab, defender: Crab, setDefender: React.Dispatch<React.SetStateAction<Crab | null>>) => {
    const distance = Math.abs(attacker.x - defender.x);
    if (distance < 120 && attacker.cooldown <= 0) {
      const newHealth = Math.max(0, defender.health - attacker.damage);
      setDefender(prev => prev ? { ...prev, health: newHealth, isHit: true } : null);
      
      // Add hit particle
      setParticles(prev => [...prev, {
        id: Date.now(),
        x: defender.x + 40,
        y: defender.y - 20,
        type: 'hit',
        color: attacker.color
      }]);
      
      setComboCount(prev => prev + 1);
      
      // Reset hit animation
      setTimeout(() => {
        setDefender(prev => prev ? { ...prev, isHit: false } : null);
      }, 200);
      
      // Check for winner
      if (newHealth <= 0) {
        setWinner(attacker.name);
        setGameState('gameover');
      }
      
      return true;
    }
    return false;
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || !player1 || !player2) return;

    const gameLoop = () => {
      // Player 1 movement (WASD)
      setPlayer1(prev => {
        if (!prev) return null;
        let newX = prev.x;
        let newDirection = prev.direction;
        
        if (keysPressed.current.has('a') || keysPressed.current.has('A')) {
          newX = Math.max(50, prev.x - prev.speed);
          newDirection = 'left';
        }
        if (keysPressed.current.has('d') || keysPressed.current.has('D')) {
          newX = Math.min(750, prev.x + prev.speed);
          newDirection = 'right';
        }
        
        return { ...prev, x: newX, direction: newDirection, cooldown: Math.max(0, prev.cooldown - 1) };
      });

      // Player 2 movement (Arrow keys)
      setPlayer2(prev => {
        if (!prev) return null;
        let newX = prev.x;
        let newDirection = prev.direction;
        
        if (keysPressed.current.has('ArrowLeft')) {
          newX = Math.max(50, prev.x - prev.speed);
          newDirection = 'left';
        }
        if (keysPressed.current.has('ArrowRight')) {
          newX = Math.min(750, prev.x + prev.speed);
          newDirection = 'right';
        }
        
        return { ...prev, x: newX, direction: newDirection, cooldown: Math.max(0, prev.cooldown - 1) };
      });

      // Clean up old particles
      setParticles(prev => prev.filter(p => Date.now() - p.id < 2000));

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, player1, player2]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
      
      if (gameState === 'playing' && player1 && player2) {
        // Player 1 attack (Space)
        if (e.key === ' ' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          if (player1.cooldown <= 0) {
            setPlayer1(prev => prev ? { ...prev, isAttacking: true, cooldown: 30 } : null);
            handleAttack(player1, player2, setPlayer2);
            setTimeout(() => setPlayer1(prev => prev ? { ...prev, isAttacking: false } : null), 150);
          }
        }
        
        // Player 2 attack (Enter or ArrowUp)
        if (e.key === 'Enter' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (player2.cooldown <= 0) {
            setPlayer2(prev => prev ? { ...prev, isAttacking: true, cooldown: 30 } : null);
            handleAttack(player2, player1, setPlayer1);
            setTimeout(() => setPlayer2(prev => prev ? { ...prev, isAttacking: false } : null), 150);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, player1, player2, handleAttack]);

  // Random bubbles in underwater arenas
  useEffect(() => {
    if (gameState !== 'playing' || selectedArena.name === 'Sunny Beach') return;
    
    const interval = setInterval(() => {
      setParticles(prev => [...prev, {
        id: Date.now() + Math.random(),
        x: Math.random() * 800,
        y: 500,
        type: 'bubble',
        color: '#00CED1'
      }]);
    }, 500);
    
    return () => clearInterval(interval);
  }, [gameState, selectedArena]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: selectedArena.bg }}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Title */}
        <h1 
          className="font-bangers text-6xl md:text-8xl text-center mb-4 tracking-wider"
          style={{ 
            color: '#FFD700',
            textShadow: '4px 4px 0 #FF6B35, 8px 8px 0 #FF1493, 12px 12px 0 rgba(0,0,0,0.3)',
            animation: 'float 3s ease-in-out infinite'
          }}
        >
          🦀 CRAB ARENA 🦀
        </h1>

        {/* Menu Screen */}
        {gameState === 'menu' && (
          <div className="text-center animate-float">
            <p className="text-2xl text-white mb-8 font-semibold" style={{ textShadow: '2px 2px 0 #000' }}>
              Battle of the Claws!
            </p>
            <button
              onClick={() => setGameState('select')}
              className="px-12 py-4 text-3xl font-bangers tracking-wider rounded-full transform hover:scale-110 transition-all duration-200"
              style={{
                background: 'linear-gradient(180deg, #FF6B35 0%, #D4380D 100%)',
                color: 'white',
                textShadow: '2px 2px 0 #000',
                boxShadow: '0 6px 0 #8B2500, 0 10px 20px rgba(0,0,0,0.3)'
              }}
            >
              START BATTLE!
            </button>
            <div className="mt-8 text-white/80 text-sm">
              <p>🎮 2 Player Local Battle</p>
              <p className="mt-2">Player 1: WASD + Space | Player 2: Arrows + Enter</p>
            </div>
          </div>
        )}

        {/* Character Select */}
        {gameState === 'select' && (
          <div className="w-full max-w-4xl">
            <h2 className="font-bangers text-4xl text-center text-white mb-6" style={{ textShadow: '3px 3px 0 #000' }}>
              CHOOSE YOUR FIGHTERS!
            </h2>
            
            <div className="grid grid-cols-2 gap-8 mb-6">
              {/* Player 1 Selection */}
              <div>
                <h3 className="font-bangers text-2xl text-yellow-300 text-center mb-4" style={{ textShadow: '2px 2px 0 #000' }}>
                  PLAYER 1
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {CRAB_ROSTER.map((crab, idx) => (
                    <button
                      key={`p1-${idx}`}
                      onClick={() => setPlayer1(initializeCrab(crab, 1, 150))}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        player1?.name === crab.name 
                          ? 'ring-4 ring-yellow-400 scale-105' 
                          : 'hover:scale-102'
                      }`}
                      style={{ 
                        background: `linear-gradient(135deg, ${crab.color}40, ${crab.shellColor}60)`,
                        border: `3px solid ${crab.color}`
                      }}
                    >
                      <div className="w-20 h-16 mx-auto">
                        <CrabSprite crab={initializeCrab(crab, 1, 0)} />
                      </div>
                      <p className="font-bangers text-white text-sm mt-1" style={{ textShadow: '1px 1px 0 #000' }}>
                        {crab.name}
                      </p>
                      <p className="text-xs text-white/70">{crab.weapon}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Player 2 Selection */}
              <div>
                <h3 className="font-bangers text-2xl text-cyan-300 text-center mb-4" style={{ textShadow: '2px 2px 0 #000' }}>
                  PLAYER 2
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {CRAB_ROSTER.map((crab, idx) => (
                    <button
                      key={`p2-${idx}`}
                      onClick={() => setPlayer2(initializeCrab(crab, 2, 650))}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        player2?.name === crab.name 
                          ? 'ring-4 ring-cyan-400 scale-105' 
                          : 'hover:scale-102'
                      }`}
                      style={{ 
                        background: `linear-gradient(135deg, ${crab.color}40, ${crab.shellColor}60)`,
                        border: `3px solid ${crab.color}`
                      }}
                    >
                      <div className="w-20 h-16 mx-auto">
                        <CrabSprite crab={initializeCrab(crab, 2, 0)} />
                      </div>
                      <p className="font-bangers text-white text-sm mt-1" style={{ textShadow: '1px 1px 0 #000' }}>
                        {crab.name}
                      </p>
                      <p className="text-xs text-white/70">{crab.weapon}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {player1 && player2 && (
              <div className="text-center">
                <button
                  onClick={() => setGameState('arena-select')}
                  className="px-10 py-3 text-2xl font-bangers tracking-wider rounded-full transform hover:scale-110 transition-all duration-200"
                  style={{
                    background: 'linear-gradient(180deg, #4ADE80 0%, #16A34A 100%)',
                    color: 'white',
                    textShadow: '2px 2px 0 #000',
                    boxShadow: '0 4px 0 #166534, 0 8px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  SELECT ARENA →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Arena Select */}
        {gameState === 'arena-select' && (
          <div className="w-full max-w-3xl">
            <h2 className="font-bangers text-4xl text-center text-white mb-6" style={{ textShadow: '3px 3px 0 #000' }}>
              CHOOSE YOUR ARENA!
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {ARENAS.map((arena, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedArena(arena)}
                  className={`p-4 rounded-xl transition-all duration-200 h-32 ${
                    selectedArena.name === arena.name 
                      ? 'ring-4 ring-white scale-105' 
                      : 'hover:scale-102'
                  }`}
                  style={{ 
                    background: arena.bg,
                    border: `3px solid ${arena.accent}`
                  }}
                >
                  <p className="font-bangers text-xl text-white" style={{ textShadow: '2px 2px 0 #000' }}>
                    {arena.name}
                  </p>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={startGame}
                className="px-12 py-4 text-3xl font-bangers tracking-wider rounded-full transform hover:scale-110 transition-all duration-200 animate-pulse"
                style={{
                  background: 'linear-gradient(180deg, #FF1493 0%, #C71585 100%)',
                  color: 'white',
                  textShadow: '2px 2px 0 #000',
                  boxShadow: '0 6px 0 #8B008B, 0 10px 20px rgba(0,0,0,0.3)'
                }}
              >
                ⚔️ FIGHT! ⚔️
              </button>
            </div>
          </div>
        )}

        {/* Game Arena */}
        {(gameState === 'playing' || gameState === 'gameover') && player1 && player2 && (
          <div className="w-full max-w-4xl">
            {/* HUD */}
            <div className="flex justify-between items-center mb-4 px-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12">
                  <CrabSprite crab={player1} />
                </div>
                <div>
                  <p className="font-bangers text-yellow-300" style={{ textShadow: '2px 2px 0 #000' }}>
                    {player1.name}
                  </p>
                  <div className="w-32 h-3 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-200"
                      style={{ 
                        width: `${(player1.health / player1.maxHealth) * 100}%`,
                        background: player1.health > 60 ? '#4ADE80' : player1.health > 30 ? '#FBBF24' : '#EF4444'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {comboCount > 2 && (
                <div className="font-bangers text-2xl text-orange-400 neon-text animate-bounce">
                  {comboCount}x COMBO!
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bangers text-cyan-300" style={{ textShadow: '2px 2px 0 #000' }}>
                    {player2.name}
                  </p>
                  <div className="w-32 h-3 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-200 ml-auto"
                      style={{ 
                        width: `${(player2.health / player2.maxHealth) * 100}%`,
                        background: player2.health > 60 ? '#4ADE80' : player2.health > 30 ? '#FBBF24' : '#EF4444'
                      }}
                    />
                  </div>
                </div>
                <div className="w-16 h-12">
                  <CrabSprite crab={player2} />
                </div>
              </div>
            </div>

            {/* Arena */}
            <div 
              className="relative w-full h-96 rounded-2xl overflow-hidden arcade-border"
              style={{ background: selectedArena.bg }}
            >
              {/* Ground */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-20"
                style={{ background: selectedArena.ground }}
              >
                {/* Sand/ground texture */}
                <div className="absolute inset-0 opacity-30">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-white/50"
                      style={{ 
                        left: `${Math.random() * 100}%`, 
                        top: `${Math.random() * 100}%`,
                        animation: `sand-sparkle ${2 + Math.random()}s ease-in-out infinite ${Math.random()}s`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Particles */}
              {particles.map(p => (
                <ParticleEffect key={p.id} particle={p} />
              ))}

              {/* Player 1 */}
              <div 
                className="absolute w-24 h-24 transition-all duration-75 crab-shadow"
                style={{ left: player1.x, bottom: 80 }}
              >
                <HealthBar 
                  health={player1.health} 
                  maxHealth={player1.maxHealth} 
                  name={player1.name}
                  color={player1.color}
                  isPlayer
                />
                <CrabSprite crab={player1} isPlayer />
              </div>

              {/* Player 2 */}
              <div 
                className="absolute w-24 h-24 transition-all duration-75 crab-shadow"
                style={{ left: player2.x, bottom: 80 }}
              >
                <HealthBar 
                  health={player2.health} 
                  maxHealth={player2.maxHealth} 
                  name={player2.name}
                  color={player2.color}
                />
                <CrabSprite crab={player2} />
              </div>

              {/* Game Over Overlay */}
              {gameState === 'gameover' && winner && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                  <h2 
                    className="font-bangers text-5xl text-yellow-400 mb-4 animate-bounce"
                    style={{ textShadow: '4px 4px 0 #FF6B35, 8px 8px 0 #000' }}
                  >
                    🏆 {winner.toUpperCase()} WINS! 🏆
                  </h2>
                  <button
                    onClick={() => setGameState('select')}
                    className="px-8 py-3 text-xl font-bangers rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, #FF6B35 0%, #D4380D 100%)',
                      color: 'white',
                      textShadow: '2px 2px 0 #000',
                      boxShadow: '0 4px 0 #8B2500'
                    }}
                  >
                    REMATCH!
                  </button>
                </div>
              )}
            </div>

            {/* Controls hint */}
            <div className="mt-4 text-center text-white/70 text-sm">
              <span className="bg-black/30 px-3 py-1 rounded-full mr-4">P1: A/D Move | W/Space Attack</span>
              <span className="bg-black/30 px-3 py-1 rounded-full">P2: ←/→ Move | ↑/Enter Attack</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-white/40">
        Requested by @nobody180bc · Built by @clonkbot
      </footer>
    </div>
  );
};

export default App;