import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Music } from "lucide-react";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const playerRef = useRef(null);

  // YouTube Video ID for Ungu - Selamat Lebaran
  const videoId = "GjYJ5P-L6xY";

  useEffect(() => {
    // Load YouTube IFrame Player API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };

    function createPlayer() {
      playerRef.current = new window.YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          showinfo: 0,
          rel: 0,
          loop: 1,
          playlist: videoId,
        },
        events: {
          onReady: () => setIsLoaded(true),
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
        },
      });
    }

    // If API already loaded (e.g. HMR)
    if (window.YT && window.YT.Player) {
      createPlayer();
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  return (
    <>
      <div id="youtube-player" className="hidden" />
      
      <div className="fixed bottom-24 right-6 sm:bottom-8 sm:right-8 z-50 flex items-center gap-3 animate-fade-in group">
        {/* Visualizer animation when playing */}
        {isPlaying && (
          <div className="flex items-end gap-[2px] h-4 mb-1 px-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-accent rounded-full animate-music-bar"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  height: "100%",
                }}
              />
            ))}
          </div>
        )}

        <div className="relative flex items-center bg-white/80 backdrop-blur-xl border border-line p-1.5 rounded-full shadow-2xl shadow-accent/10 transition-all duration-500 hover:scale-105 active:scale-95">
          {/* Mute toggle */}
          {isPlaying && (
            <button
              onClick={toggleMute}
              className="w-10 h-10 flex items-center justify-center rounded-full text-ink-muted hover:bg-paper transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}

          {/* Main Play/Pause Button */}
          <button
            onClick={togglePlay}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 shadow-lg ${
              isPlaying 
                ? "bg-accent text-white shadow-accent/30 rotate-[360deg]" 
                : "bg-ink text-white shadow-ink/30"
            }`}
          >
            {!isLoaded ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Song Info Tooltip (Desktop) */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 hidden md:block opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="bg-ink text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-xl border border-white/10">
              <div className="flex gap-2 items-center">
                <Music size={12} className="text-accent" />
                <span>Ungu — Selamat Lebaran</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-music-bar {
          animation: music-bar 0.8s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
