import { useState, useRef, useEffect, useMemo } from 'react';
import { Sparkles, Play, Pause, ArrowRight, Music, X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

// Magical Dust Particles Component (Pixie Dust / Falling Petals aesthetic)
const FloatingParticles = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2px to 6px radii
      x: Math.random() * 100, // randomized 0-100% width position
      duration: Math.random() * 20 + 20, // 20s-40s float time
      delay: Math.random() * 10,
      driftX: (Math.random() - 0.5) * 80, // organic horizontal drift
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/40 block"
          style={{ 
            width: `${p.size}px`, 
            height: `${p.size}px`, 
            left: `${p.x}%`, 
            top: `-10vh`,
            boxShadow: `0 0 ${p.size * 2}px rgba(255, 182, 193, 0.8)` 
          }}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{ 
            opacity: [0, 0.8, 1, 0],
            y: [0, 1200], // Fall elegantly from the absolute top to the bottom
            x: [0, p.driftX] 
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// Pulsating rings that glow around the play button when music is active
const PulsatingRings = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border border-primary/30"
        initial={{ scale: 1, opacity: 0.4 }}
        animate={{ scale: 1.8 + i * 0.4, opacity: 0 }}
        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
        style={{ width: '100%', height: '100%' }}
      />
    ))}
  </div>
);

// Real-time audio visualizer using Web Audio API rendered on a canvas
const AudioVisualizer = ({ audioRef, isPlaying }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    if (!audioRef?.current) return;

    // Bootstrap the Web Audio API context once
    if (!contextRef.current) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        contextRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch (e) {
        console.warn('AudioContext setup failed:', e);
      }
    }

    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const ctx2d = canvas.getContext('2d');

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const W = canvas.width;
      const H = canvas.height;
      ctx2d.clearRect(0, 0, W, H);

      const bars = 16;
      const barW = W / bars - 3;

      for (let i = 0; i < bars; i++) {
        const value = dataArray[Math.floor(i * (bufferLength / bars))];
        const percent = value / 255;
        const barH = Math.max(3, percent * H * 0.55);

        // Soft pastel gradient
        const gradient = ctx2d.createLinearGradient(0, H - barH, 0, H);
        gradient.addColorStop(0, 'rgba(255,182,193,0.55)');
        gradient.addColorStop(1, 'rgba(255,105,180,0.25)');
        ctx2d.fillStyle = gradient;
        ctx2d.globalAlpha = 0.75;

        const x = i * (barW + 3);
        const radius = barW / 2;
        ctx2d.beginPath();
        ctx2d.moveTo(x + radius, H - barH);
        ctx2d.arcTo(x + barW, H - barH, x + barW, H, radius);
        ctx2d.arcTo(x + barW, H, x, H, radius);
        ctx2d.arcTo(x, H, x, H - barH, radius);
        ctx2d.arcTo(x, H - barH, x + barW, H - barH, radius);
        ctx2d.closePath();
        ctx2d.fill();
        ctx2d.globalAlpha = 1.0;
      }
    };

    if (isPlaying) {
      if (contextRef.current?.state === 'suspended') {
        contextRef.current.resume();
      }
      draw();
    } else {
      cancelAnimationFrame(animFrameRef.current);
      // Draw a flat idle state
      const canvas2 = canvasRef.current;
      if (canvas2) {
        const c = canvas2.getContext('2d');
        c.clearRect(0, 0, canvas2.width, canvas2.height);
        const barW2 = canvas2.width / 16 - 3;
        for (let i = 0; i < 16; i++) {
          c.fillStyle = 'rgba(255,182,193,0.12)';
          c.fillRect(i * (barW2 + 3), canvas2.height - 3, barW2, 3);
        }
      }
    }

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, audioRef]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={40}
      className="w-full h-10 opacity-70"
    />
  );
};

const cards = [
  {
    id: 1,
    title: 'Khud jaisa hona hi kaafi hai',
    desc: 'May your day be as beautiful and adorable as you! Hold onto all the happiness the world has to offer.',
    img: '/images/img2.jpg'
  },
  {
    id: 2,
    title: 'Make a Wish 🎂',
    desc: 'Puff! Blow out the candles and let all your dreams take flight. This year is yours to conquer!',
    img: '/images/img4.jpg'
  },
  {
    id: 3,
    title: 'Magical Times ✨',
    desc: 'May your life overflow with magical moments, surprises, and endless love!',
    img: '/images/img5.webp'
  }
];

const galleryItems = [
  {
    id: 1,
    title: 'Memories',
    src: '/enna sona.mp3',
    img: '/images/img6.jpg',
    poetry: "Like a gentle breeze on a summer's day,\nYour smile chases all the clouds away.\nEvery moment spent with you is art,\nForever etched deeply in my heart."
  },
  {
    id: 2,
    title: 'Celebration',
    src: '/TereNainaLyrical.mp3',
    img: '/images/img7.jpg',
    poetry: "Candles glow and wishes fly so high,\nSparkling brighter than the starry sky.\nMay this day bring joy that never ends,\nSurrounded by your family and friends."
  },
  {
    id: 3,
    title: 'Magic',
    src: '/Tu Aisa Kaise.mp3',
    img: '/images/img10.jpeg',
    poetry: "A pinch of stardust, a touch of grace,\nA magical aura fills this place.\nThe universe aligned to let you shine,\nA destiny so beautiful and fine."
  },
  {
    id: 4,
    title: 'Forever',
    src: '/Pehli_Dafa_Song.mp3',
    img: '/images/img9.jpeg',
    poetry: "Through seasons changing and pages turned,\nThe brightest lessons I have ever learned.\nTogether we walk this ongoing mile,\nAlways finding heaven in your smile."
  }
];

function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'gallery'
  const [activeTrack, setActiveTrack] = useState('/song.mp3');
  const [isPlaying, setIsPlaying] = useState(false);

  const [selectedCard, setSelectedCard] = useState(null); // stores the currently opened gallery modal item
  const [showSecret, setShowSecret] = useState(false); // stores the Easter egg visibility

  const audioRef = useRef(null);
  const bufferRef = useRef(""); // stores keystrokes for the easter egg

  const handleOpenGift = () => {
    setIsOpened(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  const toggleAudio = (trackSrc = null) => {
    if (!audioRef.current) return;

    // If changing track
    if (trackSrc && trackSrc !== activeTrack) {
      setActiveTrack(trackSrc);
      setIsPlaying(true);
      return;
    }

    // Just toggling current track
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  // Play automatically when activeTrack changes
  useEffect(() => {
    if (isOpened && audioRef.current && isPlaying) {
      setTimeout(() => {
        audioRef.current.play().catch(e => {
          console.warn("Autoplay block on track change:", e);
          setIsPlaying(false);
        });
      }, 50); // slight delay for DOM source update
    }
  }, [activeTrack, isOpened]);

  // Scroll to the top of the page immediately when navigating to an entirely new view
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Secret Easter Egg Keyboard Listener
  useEffect(() => {
    const secretCode = "forever";
    const handleKeyDown = (e) => {
      if (e.key.length !== 1) return; // Ignore modifier keys (Shift, Ctrl, etc.)
      
      bufferRef.current = (bufferRef.current + e.key).slice(-secretCode.length).toLowerCase();
      
      if (bufferRef.current === secretCode) {
        setShowSecret(true);
        bufferRef.current = ""; // Reset buffer after unlocking
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-bg-dark overflow-hidden text-white font-outfit relative">
      <FloatingParticles />

      {/* Global Audio Element */}
      <audio ref={audioRef} loop src={activeTrack} preload="auto" />

      {/* Intro Overlay */}
      <AnimatePresence>
        {!isOpened && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(circle,#4a2130_0%,#1a0b12_100%)]"
          >
            <motion.h1
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="font-dancing text-6xl md:text-8xl text-primary mb-12 text-shadow text-center px-4 leading-normal"
            >
              A Special Gift For You...
            </motion.h1>
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(255,105,180,0.8)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenGift}
              className="group relative px-10 py-5 bg-gradient-to-r from-secondary to-primary rounded-full text-2xl font-bold shadow-[0_4px_20px_rgba(255,105,180,0.5)] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Sparkles className="w-8 h-8 animate-pulse text-white" /> Open the Gift ✨
              </span>
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-out -translate-x-full" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Poetry Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              transition={{ type: "spring", bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()} // prevent closing when interacting inside
              className="w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-bg-dark to-black border border-white/20 rounded-[2rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col md:flex-row relative"
            >
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-2 bg-black/40 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors border border-white/10"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Image side */}
              <div className="w-full md:w-1/2 relative h-64 md:h-auto shrink-0 overflow-hidden">
                <motion.img
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  src={selectedCard.img}
                  alt={selectedCard.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 md:from-black/50 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 md:to-bg-dark" />
              </div>

              {/* Content side */}
              <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative overflow-y-auto">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />

                <motion.h2
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-dancing text-6xl md:text-7xl text-secondary mb-10 leading-tight drop-shadow-[0_0_15px_rgba(255,105,180,0.4)]"
                >
                  {selectedCard.title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-outfit text-xl md:text-2xl font-light text-gray-100 whitespace-pre-line leading-loose italic tracking-wide"
                >
                  "{selectedCard.poetry}"
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-10 flex flex-col gap-4"
                >
                  {/* Visualizer waveform inside the poetry modal */}
                  <AnimatePresence>
                    {activeTrack === selectedCard.src && isPlaying && (
                      <motion.div
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full px-2"
                      >
                        <AudioVisualizer audioRef={audioRef} isPlaying={activeTrack === selectedCard.src && isPlaying} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {activeTrack === selectedCard.src && isPlaying && <PulsatingRings />}
                      <button
                        onClick={() => toggleAudio(selectedCard.src)}
                        className={`relative z-10 p-6 transition-all border rounded-full flex items-center justify-center group ${activeTrack === selectedCard.src && isPlaying
                          ? 'bg-primary/50 border-primary shadow-[0_0_30px_rgba(255,182,193,0.6)] text-white'
                          : 'bg-white/5 border-white/20 hover:bg-white/10 text-white/80 hover:text-white'
                          }`}
                      >
                        {activeTrack === selectedCard.src && isPlaying
                          ? <Pause className="w-8 h-8 group-hover:scale-110 transition-transform" />
                          : <Play className="w-8 h-8 ml-1 group-hover:scale-110 transition-transform" />}
                      </button>
                    </div>
                    <div>
                      <span className="font-outfit block uppercase tracking-widest text-sm text-primary mb-1">
                        {activeTrack === selectedCard.src && isPlaying ? 'Now Playing' : 'Track Paused'}
                      </span>
                      <span className="font-outfit text-xs text-white/30 tracking-wider lowercase">
                        {selectedCard.src}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret Letter Modal Overlay */}
      <AnimatePresence>
        {showSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-3xl"
            onClick={() => setShowSecret(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[url('/images/hero_background.png')] bg-cover bg-center rounded-[2rem] shadow-[0_0_50px_rgba(255,105,180,0.4)] border border-primary/30 p-8 md:p-12 text-center"
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-[2rem]" />
              
              <button 
                onClick={() => setShowSecret(false)} 
                className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors border border-white/20"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="relative z-10 flex flex-col items-center">
                <Sparkles className="w-12 h-12 text-primary mb-6 animate-pulse" />
                <h2 className="font-dancing text-5xl md:text-6xl text-secondary mb-8 drop-shadow-[0_0_15px_rgba(255,105,180,0.5)]">
                  My Secret Letter to You
                </h2>
                
                <div className="font-outfit text-lg md:text-xl font-light text-gray-200 leading-relaxed space-y-6 text-left w-full">
                  <p>
                    I hid this letter here knowing only you would ever find it. When I look back at all our memories, I realize how much you mean to me.
                  </p>
                  <p>
                    You are the brightness in my days and the calm in my nights. I wanted to build this little world just for you to celebrate exactly how special you are. 
                  </p>
                  <p>
                    Every moment with you feels like a dream I never want to wake up from. May this birthday be as magical as the love you bring to my life.
                  </p>
                  <p className="text-right italic mt-8 text-primary/90 font-medium">
                    Forever & Always, <br/>
                    Yours ❤️
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Floating Audio Control */}
      <AnimatePresence>
        {isOpened && !selectedCard && (
          <motion.button
            key="audio-btn"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ delay: 1, duration: 0.8, type: "spring" }}
            onClick={() => toggleAudio()}
            className="fixed bottom-6 right-6 z-40 p-4 bg-primary/20 backdrop-blur-md border border-white/20 rounded-full shadow-[0_4px_15px_rgba(255,105,180,0.3)] hover:bg-primary/40 transition-colors flex items-center justify-center group"
            aria-label={isPlaying ? "Pause music" : "Play music"}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
            ) : (
              <Play className="w-6 h-6 text-primary group-hover:text-white transition-colors ml-1" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Page Content transitions */}
      {isOpened && (
        <AnimatePresence mode="wait">
          {currentPage === 'home' ? (
            <motion.main
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -200, filter: "blur(10px)" }}
              transition={{ duration: 0.8 }}
            >
              {/* Hero Section */}
              <section className="relative h-screen flex items-center justify-center overflow-hidden perspective-[1000px] bg-bg-dark">
                {/* Deeper Blurred backdrop for a rich focal length effect */}
                <motion.div
                  initial={{ scale: 1.2, opacity: 0, x: '-50%', y: '-50%', rotate: -90 }}
                  animate={{ scale: 1.1, opacity: 0.6, x: '-50%', y: '-50%', rotate: -90 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 bg-cover bg-center blur-[40px] z-0"
                  style={{ width: '100vh', height: '100vw', backgroundImage: 'url(/images/img1.jpg)' }}
                />

                {/* Foreground image with an aggressive radial mask to completely hide the sharp, rectangular image edges */}
                <motion.div
                  initial={{ scale: 1, opacity: 0, x: '-50%', y: '-50%', rotate: -90 }}
                  animate={{ scale: 0.85, opacity: 1, x: '-50%', y: '-50%', rotate: -90 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 bg-contain bg-no-repeat bg-center z-0"
                  style={{
                    width: '100vh',
                    height: '100vw',
                    backgroundImage: 'url(/images/img1.jpg)',
                    WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, black 40%, transparent 85%)',
                    maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, black 40%, transparent 85%)'
                  }}
                />

                {/* Wider, softer vignette to leave the eyes and face perfectly clear */}
                <div
                  className="absolute inset-0 z-[5] pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse 85% 65% at 50% 40%, transparent 45%, rgba(26,11,18,0.6) 85%, #1a0b12 100%)' }}
                />
                {/* Darken the top specifically so the text placed on the forehead area is highly readable */}
                <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/90 via-bg-dark/50 to-transparent h-[40%] bottom-auto z-10 pointer-events-none" />
                {/* Darken the bottom to anchor the scroll prompt */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/60 to-transparent h-[40%] top-auto z-10 pointer-events-none" />

                {/* Text aligned at the top (justify-start) so it sits gorgeously on the "forehead" area */}
                <div className="relative z-10 text-center px-4 w-full h-full flex flex-col items-center justify-start pt-[12vh] md:pt-[15vh]">
                  <motion.h1
                    initial={{ y: -50, opacity: 0, rotateX: 40 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    transition={{ delay: 0.5, duration: 1.5, type: "spring", bounce: 0.4 }}
                    className="font-dancing text-6xl md:text-8xl lg:text-9xl text-primary mb-4 text-shadow leading-snug drop-shadow-[0_0_20px_rgba(255,182,193,0.9)]"
                  >
                    Happy Birthday
                  </motion.h1>
                  <motion.p
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="text-xl md:text-3xl lg:text-4xl text-shadow drop-shadow-md font-light text-white/90"
                  >
                    To the most wonderful girl in the world! 💖
                  </motion.p>

                  {/* Scroll down indicator and beautiful cursive writing effect container */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-full pointer-events-none">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2, duration: 1 }}
                      className="text-primary font-bold animate-bounce text-xs md:text-sm tracking-widest uppercase"
                    >
                      ↓ Scroll Down ↓
                    </motion.div>

                    <div className="font-dancing text-2xl md:text-4xl text-secondary font-bold drop-shadow-[0_0_15px_rgba(255,182,193,0.8)] whitespace-nowrap overflow-visible">
                      {"koi hoor jaise tu".split("").map((char, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, filter: "blur(8px)", y: 5, scale: 0.9 }}
                          animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
                          transition={{
                            delay: 2.2 + index * 0.1,
                            duration: 0.7,
                            ease: "easeOut"
                          }}
                          className="inline-block"
                        >
                          {char === " " ? "\u00A0" : char}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Cards Section */}
              <section className="py-32 px-6 md:px-12 bg-bg-dark flex flex-col gap-32 items-center overflow-hidden perspective-[1200px]">
                {cards.map((card, idx) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 150, rotateX: 20, rotateY: idx % 2 === 0 ? 15 : -15, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
                    className="w-full max-w-5xl"
                  >
                    <Tilt
                      tiltMaxAngleX={10}
                      tiltMaxAngleY={10}
                      perspective={1000}
                      transitionSpeed={1500}
                      scale={1.02}
                      gyroscope={true}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div 
                        className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} relative rounded-[40px]`}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* True 3D Base Background Layer */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-br from-card-bg to-black/40 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-none"
                          style={{ transform: 'translateZ(-20px)' }}
                        />
                        
                        {card.id === 2 ? (
                          <div 
                            className={`w-full md:w-1/2 overflow-hidden relative group aspect-video md:aspect-[4/3] bg-black/40 ${idx % 2 === 0 ? 'rounded-t-[40px] md:rounded-none md:rounded-l-[40px]' : 'rounded-t-[40px] md:rounded-none md:rounded-r-[40px]'}`}
                            style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                          >
                            <img
                              src={card.img}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 scale-125"
                            />
                            <img
                              src={card.img}
                              alt={card.title}
                              className="relative z-10 w-full h-full object-contain drop-shadow-2xl transition-transform duration-[2000ms] group-hover:scale-105"
                            />
                            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                          </div>
                        ) : (
                          <div 
                            className={`w-full md:w-1/2 overflow-hidden relative group aspect-square ${idx % 2 === 0 ? 'rounded-t-[40px] md:rounded-none md:rounded-l-[40px]' : 'rounded-t-[40px] md:rounded-none md:rounded-r-[40px]'}`}
                            style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                          >
                            <img
                              src={card.img}
                              alt={card.title}
                              className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-125"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                          </div>
                        )}
                        <div 
                          className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center relative backdrop-blur-sm rounded-[40px]"
                          style={{ transform: 'translateZ(60px)', transformStyle: 'preserve-3d' }}
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" style={{ transform: 'translateZ(-10px)' }} />
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" style={{ transform: 'translateZ(-10px)' }} />

                          <h2 
                            className="font-dancing text-5xl md:text-7xl text-secondary mb-8 leading-tight drop-shadow-lg relative z-10"
                            style={{ transform: 'translateZ(80px)' }}
                          >
                            {card.title}
                          </h2>
                          <p 
                            className="text-xl md:text-2xl text-gray-200 leading-relaxed font-light relative z-10 drop-shadow-md"
                            style={{ transform: 'translateZ(40px)' }}
                          >
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    </Tilt>
                  </motion.div>
                ))}
              </section>

              {/* Navigation to Gallery Region */}
              <section className="py-24 flex justify-center items-center bg-gradient-to-t from-[rgba(26,11,18,1)] to-bg-dark border-t border-white/5">
                <motion.button
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage('gallery')}
                  className="flex items-center gap-4 px-10 py-6 bg-gradient-to-r from-primary to-secondary text-bg-dark rounded-full font-bold text-2xl shadow-[0_10px_30px_rgba(255,105,180,0.3)] hover:shadow-[0_10px_40px_rgba(255,105,180,0.5)] transition-all"
                >
                  <Music className="w-8 h-8" />
                  Explore Music Gallery
                  <ArrowRight className="w-8 h-8" />
                </motion.button>
              </section>

              {/* Footer */}
              <footer className="text-center py-16 bg-[#11070c] font-dancing text-4xl text-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/hero_background.png')] opacity-10 bg-cover bg-center" />
                <p className="relative z-10 flex items-center justify-center gap-3">
                  Made with <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-red-500 text-5xl drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] mx-2"
                  >
                    ❤️
                  </motion.span> just for you
                </p>
                <p className="relative z-10 font-outfit text-[10px] uppercase tracking-[0.5em] text-white/20 mt-8 mb-[-1rem] hover:text-white/60 transition-colors cursor-crosshair">
                  HINT: type "forever" anywhere
                </p>
              </footer>
            </motion.main>
          ) : (
            <motion.main
              key="gallery"
              initial={{ opacity: 0, x: 200, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.8 }}
              className="py-24 px-6 md:px-12 min-h-screen relative flex flex-col"
            >
              {/* Dynamic Animated Background */}
              <div className="fixed inset-0 bg-[url('/images/hero_background.png')] opacity-10 bg-cover bg-fixed mix-blend-screen pointer-events-none" />

              <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center flex-1">
                <motion.button
                  whileHover={{ x: -5 }}
                  onClick={() => setCurrentPage('home')}
                  className="self-start text-primary mb-12 hover:text-white transition-colors flex items-center gap-3 text-xl tracking-widest font-light uppercase"
                >
                  ← Back to Home
                </motion.button>

                <h1 className="font-outfit font-thin tracking-[0.2em] text-5xl md:text-7xl mb-6 text-center text-white drop-shadow-md">
                  MUSIC <span className="text-primary font-dancing font-bold tracking-normal capitalize">Gallery</span>
                </h1>
                <p className="text-xl text-primary/80 mb-20 font-light text-center max-w-2xl leading-relaxed">
                  A beautiful collection of audio tracks mapped to memories.
                  <br />
                  <span className="text-white/50 text-base mt-2 block">(Click any card to read its poetry and change the atmosphere)</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full pb-20">
                  {galleryItems.map((item, idx) => {
                    const isCardActive = activeTrack === item.src;
                    const isActiveAndPlaying = isCardActive && isPlaying;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15, duration: 0.8 }}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedCard(item);
                          if (activeTrack !== item.src) {
                            setActiveTrack(item.src);
                            setIsPlaying(true);
                          } else if (!isPlaying) {
                            if (audioRef.current) {
                              audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
                            }
                          }
                        }}
                      >
                        <Tilt
                          tiltMaxAngleX={7}
                          tiltMaxAngleY={7}
                          scale={1.03}
                          className="relative rounded-[2rem] overflow-hidden group shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-white/10 aspect-[4/3] hover:shadow-[0_20px_50px_rgba(255,182,193,0.3)] transition-shadow duration-500"
                        >
                          <img
                            src={item.img}
                            alt={item.title}
                            className={`w-full h-full object-cover transition-all duration-[2000ms] ${isCardActive ? 'scale-110 saturate-50' : 'group-hover:scale-110 saturate-100'}`}
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-700 ${isCardActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />

                          <div className="absolute inset-0 p-6 flex flex-col justify-end gap-3">
                            {/* Audio Visualizer Waveform — visible only when this track is active */}
                            <AnimatePresence>
                              {isActiveAndPlaying && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <AudioVisualizer audioRef={audioRef} isPlaying={isActiveAndPlaying} />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="flex justify-between items-end w-full">
                              <div>
                                <h3 className={`font-dancing text-4xl md:text-5xl drop-shadow-lg mb-2 transition-colors duration-500 ${isActiveAndPlaying ? 'text-secondary' : 'text-white'}`}>
                                  {item.title}
                                </h3>
                                <p className={`font-outfit font-light tracking-[0.2em] text-xs uppercase transition-colors duration-500 ${isActiveAndPlaying ? 'text-primary' : 'text-white/60'}`}>
                                  {isActiveAndPlaying ? '🎵 Playing now' : 'Click to View & Play'}
                                </p>
                              </div>

                              <div className={`relative p-4 rounded-full backdrop-blur-md transition-all duration-500 border shadow-lg ${isActiveAndPlaying
                                ? 'bg-primary/50 text-white border-white/50 shadow-[0_0_30px_rgba(255,182,193,0.8)] opacity-100'
                                : 'bg-black/40 text-white border-white/20 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0'
                                }`}
                              >
                                {isActiveAndPlaying && <PulsatingRings />}
                                {isActiveAndPlaying ? <Pause className="w-6 h-6 relative z-10" /> : <Play className="w-6 h-6 ml-1 relative z-10" />}
                              </div>
                            </div>
                          </div>
                        </Tilt>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.main>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

export default App;
