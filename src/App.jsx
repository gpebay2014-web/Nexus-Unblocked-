import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Search, Globe, LayoutGrid, Zap, History, ShieldCheck, Maximize, Sparkles, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import gamesData from './games.json';

// Lazy AI Initialization
let aiClient = null;
const getAiClient = () => {
  if (!aiClient) {
    // Try to get API key from various possible sources
    const apiKey = (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || 
                   (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) || 
                   "";

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined. Please configure it in your environment.');
    }
    aiClient = new GoogleGenAI(apiKey);
  }
  return aiClient;
};

export default function App() {
  const [view, setView] = useState('home');
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // AI State
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiConsole, setShowAiConsole] = useState(false);

  const getAiRecommendation = async () => {
    setIsAiLoading(true);
    setShowAiConsole(true);
    try {
      const client = getAiClient();
      const prompt = `You are the Nexus.json Celestial Guide. Based on these games: ${gamesData.map(g => g.title).join(', ')}, recommend one game to the user in a short, mysterious, and tech-forward cosmic style. Keep it under 40 words.`;
      const model = client.getGenerativeModel({ model: "gemini-2.0-flash" }); // Use stable model
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiRecommendation(response.text());
    } catch (err) {
      console.error('Gemini API Error:', err);
      setAiRecommendation('VOID_CALIBRATION_FAILED::CHECK_API_KEY_OR_QUOTA');
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredGames = useMemo(() => {
    return gamesData.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(activeSearchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || game.id.toLowerCase().includes(activeCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [activeSearchQuery, activeCategory]);

  const musicContainerRef = useRef(null);
  const moviesContainerRef = useRef(null);

  const toggleMusicFullscreen = () => {
    if (musicContainerRef.current) {
      if (!document.fullscreenElement) {
        musicContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const toggleMoviesFullscreen = () => {
    if (moviesContainerRef.current) {
      if (!document.fullscreenElement) {
        moviesContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const categories = ['All', 'Action', 'Retro', 'Strategy', 'Trending'];

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const input = e.target.value.trim();
      if (!input) {
        setActiveSearchQuery('');
        return;
      }

      // If it's a URL, use proxy
      const isUrl = input.includes('.') && !input.includes(' ');
      if (isUrl) {
        let targetUrl = input;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = 'https://' + targetUrl;
        }
        try {
          const encodedUrl = btoa(targetUrl);
          window.location.href = `/main/${encodedUrl}`;
        } catch (err) {
          console.error('Failed to encode URL:', err);
        }
        return;
      }

      // If it's a search term, trigger internal search
      setActiveSearchQuery(input);
      setView('arcade');
      setSelectedGame(null);
    }
  };

  const resetToHome = () => {
    setView('home');
    setSelectedGame(null);
    setSearchQuery('');
    setActiveSearchQuery('');
    setActiveCategory('All');
  };

  return (
    <div className="flex min-h-screen bg-black selection:bg-accent/30 font-sans text-white relative">
      {/* Dynamic Starfield Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 0.5px, transparent 0.5px)', backgroundSize: '150px 150px', transform: 'rotate(45deg)' }} />
      </div>

      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-72 border-r border-border flex-col p-10 bg-black/40 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto z-10">
        <div 
          onClick={resetToHome}
          className="font-serif italic text-3xl tracking-tight mb-12 flex items-center gap-2 cursor-pointer group"
        >
          <span>Nexus.<span className="text-accent group-hover:text-white transition-colors">json</span></span>
        </div>

        <nav className="flex-1">
          <ul className="space-y-6">
            <li 
              onClick={() => setView('home')}
              className={`text-[11px] uppercase tracking-[0.2em] cursor-pointer transition-all ${
                view === 'home' ? 'text-accent font-bold opacity-100' : 'text-white/40 hover:text-white/60'
              }`}
            >
              Overview
            </li>
            <li 
              onClick={() => setView('music')}
              className={`text-[11px] uppercase tracking-[0.2em] cursor-pointer transition-all ${
                view === 'music' ? 'text-accent font-bold opacity-100' : 'text-white/40 hover:text-white/60'
              }`}
            >
              Music
            </li>
            <li 
              onClick={() => setView('movies')}
              className={`text-[11px] uppercase tracking-[0.2em] cursor-pointer transition-all ${
                view === 'movies' ? 'text-accent font-bold opacity-100' : 'text-white/40 hover:text-white/60'
              }`}
            >
              Movies
            </li>
            <div className="pt-4 pb-2 border-b border-white/5 mb-4">
              <span className="text-[9px] text-white/20 uppercase tracking-widest">Collections</span>
            </div>
            {categories.map((cat) => (
              <li 
                key={cat}
                onClick={() => {
                  setView('arcade');
                  setActiveCategory(cat);
                }}
                className={`text-[11px] uppercase tracking-[0.2em] cursor-pointer transition-all ${
                  view === 'arcade' && activeCategory === cat ? 'text-accent font-bold opacity-100' : 'text-white/40 hover:text-white/60'
                }`}
              >
                {cat}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-10 text-[10px] uppercase tracking-[0.1em] text-white/20 leading-relaxed">
          Deep space arcade.<br />
          Stored via dynamic JSON.<br />
          Celestial latency verified.
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-black relative z-10">
        {/* Mobile Header */}
        <header className="h-16 flex items-center px-6 lg:px-10 border-b border-border sticky top-0 bg-black/20 backdrop-blur-md z-40">
          <div 
            onClick={resetToHome}
            className="lg:hidden font-serif italic text-xl mr-6 cursor-pointer"
          >
            Nexus.json
          </div>

          <AnimatePresence>
            {view === 'arcade' && !selectedGame && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 relative max-w-md group ml-4 lg:ml-0"
              >
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-accent transition-colors" />
                <input 
                  type="text" 
                  placeholder="SEARCH THE VOID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="bg-transparent w-full text-[10px] uppercase tracking-widest pl-7 pr-4 py-2 focus:outline-none placeholder:text-white/10"
                  id="header-search"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="hidden sm:flex items-center gap-6 ml-auto">
            <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-tighter text-white/30">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
              COMPUTER_COMPATABLE
            </div>
            <Globe className="w-4 h-4 text-white/20" />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.section
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-6"
            >
              {/* AI Floating Console */}
              <AnimatePresence>
                {showAiConsole && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute top-10 right-10 w-72 p-4 bg-black/60 border border-accent/20 backdrop-blur-xl z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-accent/10 pb-2">
                       <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-accent">CELESTIAL_AI_LOGS</span>
                       <button onClick={() => setShowAiConsole(false)} className="text-white/20 hover:text-white"><X className="w-3 h-3" /></button>
                    </div>
                    {isAiLoading ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-2 w-full bg-accent/10" />
                        <div className="h-2 w-3/4 bg-accent/10" />
                      </div>
                    ) : (
                      <div className="text-[10px] text-accent font-mono leading-relaxed uppercase">
                        {aiRecommendation || "READY_TO_GUIDE_YOU_THROUGH_THE_VEX_ARCHIVE."}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full max-w-2xl text-center z-10">
                <div className="mb-16">
                  <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-accent drop-shadow-[0_0_10px_#00f0ff] mb-4 block">CENTRAL_NEXUS</span>
                  <h1 className="font-serif text-6xl md:text-8xl tracking-[-0.05em] uppercase italic">
                    Universal.<span className="text-white/40">Link</span>
                  </h1>
                </div>

                <div className="relative group mb-12">
                  <button 
                    onClick={getAiRecommendation}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-accent/20 transition-all rounded"
                    title="CELESTIAL_GUIDE"
                  >
                    <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                  </button>
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-all" />
                  <input 
                    type="text" 
                    placeholder="QUERY THE ARCHIVE..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="w-full bg-white/[0.03] border border-white/5 py-6 pl-14 pr-6 text-xs uppercase tracking-[0.3em] font-medium focus:outline-none focus:border-accent/40 focus:bg-white/[0.05] transition-all backdrop-blur-xl"
                  />
                  <div className="absolute inset-0 -z-10 bg-accent/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  {[
                    { name: 'Music', icon: Zap },
                    { name: 'Games', icon: LayoutGrid },
                    { name: 'Movies', icon: Play }
                  ].map((btn) => (
                    <button 
                      key={btn.name}
                      onClick={() => {
                        if (btn.name === 'Music') {
                          setView('music');
                        } else if (btn.name === 'Movies') {
                          setView('movies');
                        } else {
                          setView('arcade');
                          setActiveCategory(btn.name === 'Games' ? 'All' : btn.name);
                        }
                      }}
                      className="group flex flex-col items-center gap-4 px-10 py-8 border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-accent/30 transition-all backdrop-blur-md min-w-[140px]"
                    >
                      <btn.icon className="w-5 h-5 text-white/20 group-hover:text-accent transition-colors" />
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 group-hover:text-white transition-colors">
                        {btn.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative side text */}
              <div className="absolute left-10 bottom-10 hidden xl:block">
                <div className="font-mono text-[8px] text-white/10 uppercase tracking-widest vertical-text rotate-180" style={{ writingMode: 'vertical-rl' }}>
                  LATENCY::0.00ms // CONNECTED_TO_SOURCE
                </div>
              </div>
            </motion.section>
          )}

          {view === 'arcade' && (
            <motion.div
              key="arcade"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Hero Section */}
              {!activeSearchQuery && gamesData.length > 0 ? (
                <section className="p-6 lg:p-14 border-b border-border bg-gradient-to-br from-black to-black/40 overflow-hidden relative">
                  <div className="relative z-10">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold mb-4 block">PRIORITY SESSION 01</span>
                    <h1 className="font-serif text-7xl md:text-8xl lg:text-[10rem] leading-[0.8] tracking-[-0.04em] mb-10 hyphens-auto uppercase">
                      GAMES
                    </h1>
                  </div>
                </section>
              ) : activeSearchQuery && (
                <section className="p-6 lg:p-10 border-b border-border bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <Search className="w-4 h-4 text-accent" />
                    <h2 className="text-sm uppercase tracking-[0.4em] font-medium">
                      Results for: <span className="text-accent">"{activeSearchQuery}"</span>
                    </h2>
                    <button 
                      onClick={() => {
                        setActiveSearchQuery('');
                        setSearchQuery('');
                      }}
                      className="ml-auto text-[10px] uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                    >
                      [ CLEAR_FILTER ]
                    </button>
                  </div>
                </section>
              )}

              {/* Game Grid */}
              <section className="editorial-grid">
                {filteredGames.length > 0 ? (
                  filteredGames.map((game, index) => (
                    <div 
                      key={game.id}
                      onClick={() => setSelectedGame(game)}
                      className="cell-border p-8 lg:p-10 flex flex-col justify-between aspect-square group cursor-pointer hover:bg-white/[0.03] transition-all relative overflow-hidden"
                      id={`game-card-${game.id}`}
                    >
                      {/* Thumbnail Layer - Cosmic Fade */}
                      <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-30 transition-all duration-1000 blur-[2px] group-hover:blur-0">
                        <img 
                          src={game.thumbnail} 
                          alt="" 
                          className="w-full h-full object-cover scale-125 group-hover:scale-100 transition-transform duration-[2s]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                      </div>

                      <span className="font-serif text-4xl lg:text-6xl absolute top-8 right-8 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all z-10 text-white">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      
                      <div className="relative z-10 transition-transform group-hover:-translate-y-2">
                        <div className="w-12 h-0.5 bg-accent/20 mb-6 group-hover:w-full group-hover:bg-accent transition-all duration-700" />
                        <h3 className="text-lg lg:text-xl font-medium mb-2 tracking-tight uppercase group-hover:text-accent transition-colors">{game.title}</h3>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-mono">STAR_TYPE // WEBGL_CORE</p>
                      </div>

                      <div className="flex items-center justify-between mt-auto relative z-10">
                        <div className="font-mono text-[9px] text-white/20 px-2 py-1 border border-white/5 bg-black/40">
                          COSMIC_STABLE
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                          <Play className="w-4 h-4 text-accent fill-accent shadow-[0_0_10px_#00f0ff]" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center text-white/20 border-b border-border px-6 text-center">
                    {gamesData.length === 0 ? (
                      <>
                        <LayoutGrid className="w-12 h-12 mb-6 opacity-5" />
                        <h2 className="text-xl font-serif italic mb-2 text-white/40">The Void is Infinite</h2>
                        <p className="text-[11px] uppercase tracking-[0.2em] max-w-xs leading-relaxed opacity-50">
                          Add celestial data to <code className="text-accent/40">src/games.json</code> to begin.
                        </p>
                      </>
                    ) : (
                      <>
                        <Search className="w-12 h-12 mb-6 opacity-20" />
                        <p className="text-[11px] uppercase tracking-[0.2em]">0 particles found in this sector</p>
                      </>
                    )}
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {view === 'music' && (
            <motion.div
              key="music"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col p-6 lg:p-14"
            >
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold mb-4 block">AUDIO_ENGINE 01</span>
                  <h1 className="font-serif text-7xl md:text-8xl tracking-[-0.04em] uppercase">MUSIC</h1>
                </div>
                <button 
                  onClick={toggleMusicFullscreen}
                  className="mb-2 p-4 border border-white/10 bg-white/5 hover:bg-accent/20 hover:border-accent/40 transition-all group"
                  title="FULLSCREEN_MODE"
                >
                  <Maximize className="w-5 h-5 text-white/40 group-hover:text-accent group-hover:scale-110 transition-all" />
                </button>
              </div>
              <div 
                ref={musicContainerRef}
                className="flex-1 bg-black/40 border border-white/5 overflow-hidden min-h-[400px] relative"
              >
                 <iframe 
                   src="https://lossless.wtf/"
                   className="w-full h-full border-none"
                   title="Music Player"
                   allowFullScreen
                 />
              </div>
            </motion.div>
          )}

          {view === 'movies' && (
            <motion.div
              key="movies"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col p-6 lg:p-14"
            >
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold mb-4 block">CINEMATIC_CORE 01</span>
                  <h1 className="font-serif text-7xl md:text-8xl tracking-[-0.04em] uppercase">MOVIES</h1>
                </div>
                <button 
                  onClick={toggleMoviesFullscreen}
                  className="mb-2 p-4 border border-white/10 bg-white/5 hover:bg-accent/20 hover:border-accent/40 transition-all group"
                  title="FULLSCREEN_MODE"
                >
                  <Maximize className="w-5 h-5 text-white/40 group-hover:text-accent group-hover:scale-110 transition-all" />
                </button>
              </div>
              <div 
                ref={moviesContainerRef}
                className="flex-1 bg-black/40 border border-white/5 overflow-hidden min-h-[400px] relative"
              >
                 <iframe 
                   src="https://dulo.tv/"
                   className="w-full h-full border-none"
                   title="Movie Player"
                   allowFullScreen
                 />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Footer */}
        <footer className="h-12 flex items-center px-6 lg:px-10 border-t border-border mt-auto justify-between bg-black/40 backdrop-blur-md">
          <div className="flex gap-8">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/20">
              <History className="w-3 h-3" />
              EPOCH: 2026.05.07
            </div>
          </div>
          <div className="text-[9px] uppercase tracking-widest text-white/20">
            SECTOR: US-EAST-VOID
          </div>
        </footer>
      </main>

      {/* Game Player Overlay */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black"
            id="game-overlay"
          >
            <header className="h-14 border-b border-border flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">LIVE::EXECUTION</span>
                <span className="text-[10px] uppercase tracking-[0.1em] text-white/40">/</span>
                <h3 className="text-xs uppercase tracking-widest font-medium text-white/80">{selectedGame.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedGame(null)}
                className="p-2 hover:bg-white/5 transition-colors border border-border group"
                title="TERMINATE SESSION"
                id="close-game-btn"
              >
                <X className="w-4 h-4 text-white/40 group-hover:text-accent" />
              </button>
            </header>

            <div className="flex-1 bg-black overflow-hidden">
              <iframe
                src={selectedGame.iframeSrc}
                className="w-full h-full border-none"
                title={selectedGame.title}
                allowFullScreen
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
