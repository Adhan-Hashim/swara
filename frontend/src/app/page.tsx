"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Music, Info, Award, BookOpen, ArrowRight, Play, Pause, 
  Search, Loader2, Compass, Lock, Check, Star, Settings, 
  HelpCircle, X, ChevronLeft, ChevronRight, Sparkles 
} from "lucide-react";
import { RAGA_LIST, Raga, SWARASTHANAS, COMPOSITIONS, getFallbackSong } from "@/data/ragaDb";

const MELAKARTA_NAMES = [
  "Kanakangi", "Ratnangi", "Ganamurthi", "Vanaspati", "Manavati", "Tanarupi",
  "Senavati", "Hanumatodi", "Dhenuka", "Natakapriya", "Kokilapriya", "Rupavati",
  "Gayakapriya", "Vakulabharanam", "Mayamalavagowlai", "Chakravakam", "Suryakantam", "Hatakambari",
  "Jhankaradhvani", "Natabhairavi", "Keeravani", "Kharaharapriya", "Gourimanohari", "Varunapriya",
  "Mararanjani", "Charukesi", "Sarasangi", "Harikambhoji", "Dheerasankarabharanam", "Naganandini",
  "Yagapriya", "Ragavardini", "Gangeyabhushani", "Vagadheeswari", "Shulini", "Chalanata",
  "Salagam", "Jalarnavam", "Jhalavarali", "Navaneetam", "Pavani", "Raghupriya",
  "Gavambodhi", "Shadvidamargini", "Bhavapriya", "Subhapantuvarali", "Suvarnangi", "Divyamani",
  "Dhavalambari", "Namanarayani", "Kamavardhini", "Ramapriya", "Gamanasrama", "Viswambhari",
  "Syamangi", "Shanmukhapriya", "Simhendramadhyamam", "Hemavati", "Dharmavati", "Neethimathi",
  "Kantamani", "Rishabhapriya", "Latangi", "Vachaspati", "Mechakalyani", "Chitrambari",
  "Sucharitra", "Jyotiswarupini", "Dhatuvardhani", "Kosalam", "Nasikabhushani", "Rasikapriya"
];

const CHAKRA_NAMES = [
  "Indu (Moon)", "Netra (Eyes)", "Agni (Fire)", "Veda (Scriptures)", "Bana (Arrows)", "Rutu (Seasons)",
  "Rishi (Sages)", "Vasu (Demi-gods)", "Brahma", "Disi (Directions)", "Rudra", "Aditya (Sun)"
];

const SWARAVALIS = [
  {
    title: "Sarali Varisai - Lesson 1",
    description: "The fundamental straight scale exercise in single speed.",
    raga: "mayamalavagowlai",
    notes: ["S", "R1", "G3", "M1", "P", "D1", "N3", "S'", "S'", "N3", "D1", "P", "M1", "G3", "R1", "S"],
    syllables: ["Sa", "Ri", "Ga", "Ma", "Pa", "Dha", "Ni", "Sa'", "Sa'", "Ni", "Dha", "Pa", "Ma", "Ga", "Ri", "Sa"]
  },
  {
    title: "Jantai Varisai - Lesson 1",
    description: "Double-note exercises to practice stress/force (sphuritha gamaka) on notes.",
    raga: "mayamalavagowlai",
    notes: [
      "S", "S", "R1", "R1", "G3", "G3", "M1", "M1", "P", "P", "D1", "D1", "N3", "N3", "S'", "S'",
      "S'", "S'", "N3", "N3", "D1", "D1", "P", "P", "M1", "M1", "G3", "G3", "R1", "R1", "S", "S"
    ],
    syllables: [
      "Sa", "Sa", "Ri", "Ri", "Ga", "Ga", "Ma", "Ma", "Pa", "Pa", "Dha", "Dha", "Ni", "Ni", "Sa'", "Sa'",
      "Sa'", "Sa'", "Ni", "Ni", "Dha", "Dha", "Pa", "Pa", "Ma", "Ma", "Ga", "Ga", "Ri", "Ri", "Sa", "Sa"
    ]
  },
  {
    title: "Dhattu Varisai - Lesson 1",
    description: "Skip-note exercises to develop finger dexterity and vocal agility.",
    raga: "mayamalavagowlai",
    notes: [
      "S", "G3", "R1", "S", "R1", "M1", "G3", "R1", "G3", "P", "M1", "G3", "M1", "D1", "P", "M1",
      "P", "N3", "D1", "P", "D1", "S'", "N3", "D1", "S'", "D1", "N3", "S'", "N3", "P", "D1", "N3",
      "D1", "M1", "P", "D1", "P", "G3", "M1", "P", "M1", "R1", "G3", "M1", "G3", "S", "R1", "G3"
    ],
    syllables: [
      "Sa", "Ga", "Ri", "Sa", "Ri", "Ma", "Ga", "Ri", "Ga", "Pa", "Ma", "Ga", "Ma", "Dha", "Pa", "Ma",
      "Pa", "Ni", "Dha", "Pa", "Dha", "Sa'", "Ni", "Dha", "Sa'", "Dha", "Ni", "Sa'", "Ni", "Pa", "Dha", "Ni",
      "Dha", "Ma", "Pa", "Dha", "Pa", "Ga", "Ma", "Pa", "Ma", "Ri", "Ga", "Ma", "Ga", "Sa", "Ri", "Ga"
    ]
  }
];

const GEETHAMS = [
  {
    title: "Sree Gananatha (Malahari)",
    taalam: "Rupaka Taalam (3 Beats)",
    description: "Malahari is a janya of Mayamalavagowlai. Traditionally the very first song taught to students, invoking Lord Ganesha.",
    ragaNotes: ["S", "R1", "G3", "M1", "P", "D1", "S'"],
    phrases: [
      { notation: ["M1", "P", "D1", "S'", "R1", "S'"], syllables: ["Sree", "Ga", "na", "na", "tha", "a"] },
      { notation: ["R1", "S'", "D1", "P", "M1", "P"], syllables: ["Lam", "bo", "dha", "ra", "ma", "ma"] },
      { notation: ["M1", "P", "D1", "P", "M1", "R1"], syllables: ["Ka", "ra", "vi", "na", "she", "e"] },
      { notation: ["S", "R1", "G3", "R1", "S", "S"], syllables: ["Su", "ra", "mu", "ni", "se", "va"] }
    ]
  },
  {
    title: "Vara Veena (Mohanam)",
    taalam: "Rupaka Taalam (3 Beats)",
    description: "A beautiful composition in the pentatonic Mohanam scale praising Goddess Saraswathi.",
    ragaNotes: ["S", "R2", "G3", "P", "D2", "S'"],
    phrases: [
      { notation: ["G3", "G3", "P", "P", "D2", "D2"], syllables: ["Va", "ra", "Vee", "na", "mri", "du"] },
      { notation: ["S'", "D2", "P", "D2", "P", "G3"], syllables: ["pa", "ni", "va", "na", "ru", "ha"] },
      { notation: ["R2", "S", "G3", "P", "D2", "S'"], syllables: ["lo", "cha", "ni", "su", "ra", "ru"] },
      { notation: ["D2", "P", "G3", "R2", "S", "S"], syllables: ["chi", "ra", "dha", "a", "a", "a"] }
    ]
  }
];

const VARNAM_PALLAVI = [
  { notation: ["G3", "G3", "R2", "S", "R2", "R2", "S", "S"], syllables: ["Nin", "nu", "ko", "o", "ri", "i", "yee", "e"] },
  { notation: ["D2", "S", "R2", "G3", "R2", "G3", "P", "G3"], syllables: ["yu", "un", "na", "a", "dhi", "i", "raa", "a"] }
];
const VARNAM_ANUPALLAVI = [
  { notation: ["G3", "P", "D2", "P", "D2", "S'", "D2", "S'"], syllables: ["Kan", "na", "dhan", "n", "dri", "i", "yee", "e"] },
  { notation: ["R2", "G3", "R2", "S'", "D2", "P", "G3", "R2"], syllables: ["va", "a", "su", "u", "de", "e", "va", "a"] }
];

const TALA_PRESETS = [
  {
    name: "Adi Taalam",
    beats: 8,
    pattern: ["Clap 👏", "Pinky Finger 👆", "Ring Finger 🖕", "Middle Finger 🖐", "Clap 👏", "Wave 🖐", "Clap 👏", "Wave 🖐"],
    description: "8 beats (1 Laghu of 4 counts + 2 Dhrutams of 2 counts each)."
  },
  {
    name: "Rupaka Taalam",
    beats: 3,
    pattern: ["Clap 👏", "Wave 🖐", "Wave 🖐"],
    description: "3 beats (1 Dhrutam of 2 counts + 1 Anudhrutam of 1 count)."
  },
  {
    name: "Triputa Taalam",
    beats: 7,
    pattern: ["Clap 👏", "Pinky Finger 👆", "Ring Finger 🖕", "Clap 👏", "Wave 🖐", "Clap 👏", "Wave 🖐"],
    description: "7 beats (1 Laghu of 3 counts + 2 Dhrutams of 2 counts each)."
  }
];

const TONIC_PRESETS = [
  { label: "C3 (130.8 Hz)", value: 130.81 },
  { label: "D3 (146.8 Hz)", value: 146.83 },
  { label: "E3 (164.8 Hz)", value: 164.81 },
  { label: "F3 (174.6 Hz)", value: 174.61 },
  { label: "G3 (196.0 Hz)", value: 196.00 },
  { label: "A3 (220.0 Hz)", value: 220.00 },
  { label: "B3 (246.9 Hz)", value: 246.94 },
  { label: "C4 (261.6 Hz)", value: 261.63 },
  { label: "D4 (293.7 Hz)", value: 293.66 }
];

export default function Home() {
  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Raga Search Drawer State
  const [isRagaSelectorOpen, setIsRagaSelectorOpen] = useState(false);
  const [learnMode, setLearnMode] = useState<"quest" | "directory">("quest");
  const [searchQuery, setSearchQuery] = useState("");
  const [ragaFilter, setRagaFilter] = useState<"all" | "melakarta" | "janya">("all");

  // Synthesizer Settings Collapsible state
  const [isSynthSettingsOpen, setIsSynthSettingsOpen] = useState(false);

  // String Vibration Animation state
  const [vibratingString, setVibratingString] = useState<string | null>(null);
  const triggerStringVibration = useCallback((swaraCode: string) => {
    setVibratingString(swaraCode);
    setTimeout(() => {
      setVibratingString(null);
    }, 700);
  }, []);

  // Centisecond digital clock timer
  const [digitalTime, setDigitalTime] = useState("00:00:00:00");
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000).toString().padStart(2, "0");
      const mins = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, "0");
      const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, "0");
      const centis = Math.floor((elapsed % 1000) / 10).toString().padStart(2, "0");
      setDigitalTime(`${hours}:${mins}:${secs}:${centis}`);
    }, 33);
    return () => clearInterval(interval);
  }, []);

  // Progression States
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [levelScores, setLevelScores] = useState<Record<string, number>>({});
  const [selectedQuestLevel, setSelectedQuestLevel] = useState<any>(null);

  // Active Raga State
  const [activeRaga, setActiveRaga] = useState<Raga | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Soundboard Active Hotspot Details
  const [activeHotspot, setActiveHotspot] = useState<any>(null);

  const ragaList = useMemo(() => {
    return RAGA_LIST.map(r => ({ name: r.name, slug: r.id }));
  }, []);

  // Compile roadmap levels
  const roadmapLevels = useMemo(() => {
    return RAGA_LIST.map((r, index) => {
      const levelNum = index + 1;
      let difficulty: "Easy" | "Medium" | "Hard" | "Extreme" = "Easy";
      if (levelNum > 60) difficulty = "Extreme";
      else if (levelNum > 36) difficulty = "Hard";
      else if (levelNum > 18) difficulty = "Medium";

      let focus = `Mastering the tones of ${r.name}`;
      if (r.type.toLowerCase().includes("melakarta")) {
        focus = `${r.type} - Interval ear training and scale recognition.`;
      } else if (r.type.toLowerCase().includes("janya")) {
        focus = `Janya scale of ${r.parent || "parent Melakarta"} - Pentatonic/Vakra scale structure.`;
      }

      return {
        level: levelNum,
        ragaId: r.id,
        name: r.name,
        difficulty,
        focus
      };
    });
  }, []);

  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Web Audio Synthesizer States
  const [tonicFreq, setTonicFreq] = useState<number>(138.59);
  const [synthWaveform, setSynthWaveform] = useState<OscillatorType>("triangle");
  const [tempoBpm, setTempoBpm] = useState<number>(100);

  // Sequencers State
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [activeSeqIndex, setActiveSeqIndex] = useState<number | null>(null);
  const seqTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlayingComp, setIsPlayingComp] = useState(false);
  const [activeCompPhraseIdx, setActiveCompPhraseIdx] = useState<number | null>(null);
  const [activeCompNoteIdx, setActiveCompNoteIdx] = useState<number | null>(null);
  const compTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Metronome States & Players
  const [guideTab, setGuideTab] = useState<"swaravalis" | "geethams" | "varnams" | "tala">("swaravalis");
  const [selectedSwaravali, setSelectedSwaravali] = useState(SWARAVALIS[0]);
  const [selectedGeetham, setSelectedGeetham] = useState(GEETHAMS[0]);
  const [activeTala, setActiveTala] = useState(TALA_PRESETS[0]);
  const [isMetronomeRunning, setIsMetronomeRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState<number | null>(null);
  
  const metroTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopSequence = useCallback(() => {
    if (seqTimeoutRef.current) {
      clearTimeout(seqTimeoutRef.current);
      seqTimeoutRef.current = null;
    }
    setIsPlayingSeq(false);
    setActiveSeqIndex(null);
  }, []);

  const stopCompositionPlay = useCallback(() => {
    if (compTimeoutRef.current) {
      clearTimeout(compTimeoutRef.current);
      compTimeoutRef.current = null;
    }
    setIsPlayingComp(false);
    setActiveCompPhraseIdx(null);
    setActiveCompNoteIdx(null);
  }, []);

  const stopMetronome = useCallback(() => {
    if (metroTimeoutRef.current) {
      clearTimeout(metroTimeoutRef.current);
      metroTimeoutRef.current = null;
    }
    setIsMetronomeRunning(false);
    setCurrentBeat(null);
  }, []);

  const runMetronome = useCallback(() => {
    stopSequence();
    stopCompositionPlay();
    stopMetronome();
    setIsMetronomeRunning(true);

    let beat = 0;
    const beatDuration = 60 / tempoBpm;

    const tick = () => {
      setCurrentBeat(beat);
      
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.value = beat === 0 ? 880 : 440;
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}

      beat = (beat + 1) % activeTala.beats;
      metroTimeoutRef.current = setTimeout(tick, beatDuration * 1000);
    };

    tick();
  }, [activeTala, tempoBpm, stopSequence, stopCompositionPlay, stopMetronome]);

  const playSwaravali = (notes: string[]) => {
    stopSequence();
    stopMetronome();
    setIsPlayingSeq(true);

    let currentIdx = 0;
    const noteDuration = 60 / tempoBpm;

    const playNext = () => {
      if (currentIdx >= notes.length) {
        stopSequence();
        return;
      }

      setActiveSeqIndex(currentIdx);
      const note = notes[currentIdx];
      const cents = SWARASTHANAS[note]?.cents ?? 0;
      playSwaraTone(cents, noteDuration * 0.9);

      currentIdx++;
      seqTimeoutRef.current = setTimeout(playNext, noteDuration * 1000);
    };

    playNext();
  };

  const playGeetham = (phrases: any[], ragaNotes: string[]) => {
    stopSequence();
    stopMetronome();
    setIsPlayingSeq(true);

    let phraseIdx = 0;
    let noteIdx = 0;
    const noteDuration = 60 / tempoBpm;

    const playNext = () => {
      if (phraseIdx >= phrases.length) {
        stopSequence();
        return;
      }

      const phrase = phrases[phraseIdx];
      if (noteIdx >= phrase.notation.length) {
        phraseIdx++;
        noteIdx = 0;
        seqTimeoutRef.current = setTimeout(playNext, noteDuration * 1000 * 1.4);
        return;
      }

      setActiveSeqIndex(phraseIdx * 100 + noteIdx);
      const sym = phrase.notation[noteIdx];
      const resolvedNote = resolveNotationToNote(sym, ragaNotes);
      const cents = SWARASTHANAS[resolvedNote]?.cents ?? 0;

      playSwaraTone(cents, noteDuration * 0.85);

      noteIdx++;
      seqTimeoutRef.current = setTimeout(playNext, noteDuration * 1000);
    };

    playNext();
  };

  const playVarnam = (section: any[], ragaNotes: string[]) => {
    playGeetham(section, ragaNotes);
  };

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load progress
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLevel = localStorage.getItem("swaramind_unlocked_level") || "1";
      setUnlockedLevel(parseInt(savedLevel));

      const savedScores = localStorage.getItem("swaramind_level_scores") || "{}";
      try {
        setLevelScores(JSON.parse(savedScores));
      } catch (e) {
        setLevelScores({});
      }
    }

    const defaultRaga = RAGA_LIST.find(r => r.id === "mayamalavagowlai") || RAGA_LIST[0];
    setActiveRaga(defaultRaga);

    const rootSwara = SWARASTHANAS["S"];
    if (rootSwara) {
      setActiveHotspot({
        code: "S",
        name: rootSwara.name,
        cents: rootSwara.cents,
        freq: 138.59
      });
    }

    const lvl1 = roadmapLevels.find(l => l.level === 1);
    if (lvl1) {
      setSelectedQuestLevel(lvl1);
    }
  }, [roadmapLevels]);

  // Set default active hotspot
  useEffect(() => {
    if (activeRaga) {
      const firstCode = activeRaga.arohanam[0] || "S";
      const info = SWARASTHANAS[firstCode];
      if (info) {
        const freq = tonicFreq * Math.pow(2, info.cents / 1200);
        setActiveHotspot({
          code: firstCode,
          name: info.name,
          cents: info.cents,
          freq: Math.round(freq * 10) / 10
        });
      }
    }
  }, [activeRaga, tonicFreq]);

  // Web Audio Tone Player
  const playSwaraTone = (cents: number, duration: number = 0.5) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const freq = tonicFreq * Math.pow(2, cents / 1200);

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = synthWaveform;
      osc.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.04);
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime + duration - 0.04);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error("Audio synthesis failed:", e);
    }
  };

  const playMasteryCelebration = () => {
    const notes = [0, 200, 400, 700, 900, 1200];
    notes.forEach((cents, index) => {
      setTimeout(() => {
        playSwaraTone(cents, 0.25);
      }, index * 120);
    });
  };



  const playScaleSequence = (scaleNotes: string[], direction: "aro" | "ava") => {
    stopSequence();
    stopCompositionPlay();
    setIsPlayingSeq(true);

    let currentIdx = 0;
    const noteDuration = 60 / tempoBpm;

    const playNext = () => {
      if (currentIdx >= scaleNotes.length) {
        stopSequence();
        return;
      }

      setActiveSeqIndex(currentIdx);
      const note = scaleNotes[currentIdx];
      const info = SWARASTHANAS[note];
      const cents = info?.cents ?? 0;
      
      triggerStringVibration(note);

      if (info) {
        const freq = tonicFreq * Math.pow(2, cents / 1200);
        setActiveHotspot({
          code: note,
          name: info.name,
          cents: cents,
          freq: Math.round(freq * 10) / 10
        });
      }

      playSwaraTone(cents, noteDuration * 0.9);

      currentIdx++;
      seqTimeoutRef.current = setTimeout(playNext, noteDuration * 1000);
    };

    playNext();
  };

  const resolveNotationToNote = (symbol: string, ragaNotes: string[]): string => {
    const cleanSymbol = symbol.trim().toUpperCase();
    if (cleanSymbol === "S'") return ragaNotes.find(n => n === "S'") || "S'";
    const exact = ragaNotes.find(n => n === cleanSymbol);
    if (exact) return exact;
    const prefixMatch = ragaNotes.find(n => n.startsWith(cleanSymbol));
    if (prefixMatch) return prefixMatch;
    return cleanSymbol;
  };

  const playCompositionSequence = (phrases: any[], ragaNotes: string[]) => {
    stopSequence();
    stopCompositionPlay();
    setIsPlayingComp(true);

    let phraseIdx = 0;
    let noteIdx = 0;
    const noteDuration = 60 / tempoBpm;

    const playNextNote = () => {
      if (phraseIdx >= phrases.length) {
        stopCompositionPlay();
        return;
      }

      const phrase = phrases[phraseIdx];
      if (noteIdx >= phrase.notation.length) {
        phraseIdx++;
        noteIdx = 0;
        compTimeoutRef.current = setTimeout(playNextNote, noteDuration * 1000 * 1.5);
        return;
      }

      setActiveCompPhraseIdx(phraseIdx);
      setActiveCompNoteIdx(noteIdx);

      const symbol = phrase.notation[noteIdx];
      const resolvedNote = resolveNotationToNote(symbol, ragaNotes);
      const info = SWARASTHANAS[resolvedNote];
      const cents = info?.cents ?? 0;

      triggerStringVibration(resolvedNote);

      if (info) {
        const freq = tonicFreq * Math.pow(2, cents / 1200);
        setActiveHotspot({
          code: resolvedNote,
          name: info.name,
          cents: cents,
          freq: Math.round(freq * 10) / 10
        });
      }

      playSwaraTone(cents, noteDuration * 0.85);

      noteIdx++;
      compTimeoutRef.current = setTimeout(playNextNote, noteDuration * 1000);
    };

    playNextNote();
  };

  const handleRagaChange = useCallback(async (slug: string, scrollToArena = false) => {
    const local = RAGA_LIST.find(r => r.id === slug || r.name.toLowerCase() === slug.toLowerCase());
    if (local) {
      setActiveRaga(local);
      stopSequence();
      stopCompositionPlay();
      setIsRagaSelectorOpen(false);
      if (scrollToArena) {
        setTimeout(() => {
          document.getElementById("sonic-register")?.scrollIntoView({ behavior: "smooth" });
        }, 80);
      }
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/raga/${slug}`);
      if (res.ok) {
        const details = await res.json();
        setActiveRaga({
          ...details,
          id: slug
        });
      }
    } catch (err) {
      console.error("Failed to load details for raga:", err);
    } finally {
      setIsLoading(false);
      setIsRagaSelectorOpen(false);
      stopSequence();
      stopCompositionPlay();
      if (scrollToArena) {
        setTimeout(() => {
          document.getElementById("sonic-register")?.scrollIntoView({ behavior: "smooth" });
        }, 80);
      }
    }
  }, [stopSequence, stopCompositionPlay]);

  const togglePlayReference = (url: string) => {
    if (playingAudioUrl === url && audioRef.current) {
      audioRef.current.pause();
      setPlayingAudioUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio();
      (audio as any).referrerPolicy = "no-referrer";
      audio.src = url;
      
      audioRef.current = audio;
      setPlayingAudioUrl(url);
      
      audio.play().catch(err => {
        console.warn("Audio play promise rejected:", err);
        setPlayingAudioUrl(null);
      });

      audio.onerror = () => {
        alert("The archive audio stream is currently unavailable. Please train your ears using the Soundboard strings!");
        setPlayingAudioUrl(null);
      };
      
      audio.onended = () => {
        setPlayingAudioUrl(null);
      };
    }
  };

  const handleMarkLevelComplete = () => {
    if (!activeRaga) return;

    playMasteryCelebration();

    const newScores = { ...levelScores, [activeRaga.id]: 100 };
    setLevelScores(newScores);
    localStorage.setItem("swaramind_level_scores", JSON.stringify(newScores));

    if (selectedQuestLevel && selectedQuestLevel.ragaId === activeRaga.id) {
      const currentLevel = selectedQuestLevel.level;
      if (currentLevel === unlockedLevel && currentLevel < roadmapLevels.length) {
        const nextLevel = currentLevel + 1;
        setUnlockedLevel(nextLevel);
        localStorage.setItem("swaramind_unlocked_level", nextLevel.toString());
        const nextLvlData = roadmapLevels.find(l => l.level === nextLevel);
        if (nextLvlData) setSelectedQuestLevel(nextLvlData);
      }
    }
  };



  const activeIndex = useMemo(() => {
    if (!activeRaga) return 0;
    return RAGA_LIST.findIndex(r => r.id === activeRaga.id);
  }, [activeRaga]);

  const prevRaga = () => {
    const idx = (activeIndex - 1 + RAGA_LIST.length) % RAGA_LIST.length;
    handleRagaChange(RAGA_LIST[idx].id);
  };

  const nextRaga = () => {
    const idx = (activeIndex + 1) % RAGA_LIST.length;
    handleRagaChange(RAGA_LIST[idx].id);
  };

  const filteredRagas = ragaList.filter((r) => {
    const ragaData = RAGA_LIST.find(rl => rl.id === r.slug);
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (ragaFilter === "melakarta") {
      return ragaData?.type.toLowerCase().includes("melakarta") ?? false;
    }
    if (ragaFilter === "janya") {
      return ragaData?.type.toLowerCase().includes("janya") ?? false;
    }
    return true;
  });

  const activeComposition = activeRaga
    ? COMPOSITIONS[activeRaga.id] || getFallbackSong(activeRaga.id, activeRaga.arohanam, activeRaga.avarohanam)
    : null;

  return (
    <main className="min-h-screen bg-[#0c0a09] bg-grid text-[#e4e4e7] flex flex-col font-sans uppercase relative selection:bg-[#c5a880]/20 scroll-smooth">
      
      {/* 0. Minimal Atmospheric Landing Screen */}
      <section className="w-full h-screen relative flex flex-col justify-between items-center py-10 px-4 sm:px-8 md:px-12 overflow-hidden bg-[#0c0a09] select-none">
        
        {/* Background Image with sepia and smoky overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity filter sepia-[0.3] brightness-[0.75] contrast-[1.05]"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        
        {/* Fog/smoke gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a09]/40 via-[#0c0a09]/70 to-[#0c0a09] z-0" />
        
        {/* Landing Top Header */}
        <header className="w-full flex justify-between items-center z-10 font-mono text-[9px] tracking-[0.25em] text-[#a1a1aa] uppercase">
          <div className="flex gap-4 sm:gap-6">
            <button onClick={() => handleScrollToSection("sonic-register")} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">ARENA</button>
            <button onClick={() => handleScrollToSection("melakarta-directory")} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">DIAL</button>
            <button onClick={() => handleScrollToSection("composition-guide")} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">GUIDE</button>
          </div>
          
          <div className="text-white font-sans text-lg tracking-[0.35em] font-light lowercase">
            swara
          </div>
          
          <div className="hidden sm:block text-[#71717a]">
            SYSTEM STATUS: ONLINE
          </div>
        </header>

        {/* Center content */}
        <div className="flex flex-col items-center justify-center text-center z-10 max-w-lg">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-serif font-light tracking-[0.35em] text-white leading-none mb-8">
            SWARA
          </h1>
          
          <button 
            onClick={() => {
              document.getElementById("about-swara")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-3.5 border border-[#c5a880] bg-transparent text-[#c5a880] hover:bg-[#c5a880] hover:text-[#0c0a09] transition-all text-[10px] font-mono tracking-[0.3em] uppercase cursor-pointer rounded-none"
          >
            ENTER DECK
          </button>
          
          <span className="text-[8px] text-[#71717a] font-mono tracking-[0.3em] uppercase mt-6">
            CARNATIC EAR TRAINING DECK
          </span>
        </div>

        {/* Footer/Scroll Indicator */}
        <div className="z-10 flex flex-col items-center font-mono text-[8.5px] tracking-[0.2em] text-[#71717a]">
          <span className="animate-bounce mb-2">↓</span>
          <span>SCROLL TO TRAIN</span>
        </div>
      </section>

      {/* 1. Sticky Navigation Bar */}
      <nav className="w-full px-4 sm:px-8 md:px-12 py-4 sm:py-5 flex items-center justify-between border-b border-[#27272a]/20 bg-[#0c0a09]/90 backdrop-blur-md sticky top-0 left-0 z-30 shrink-0 select-none">
        <div 
          className="text-white font-sans text-base sm:text-lg tracking-[0.35em] font-light lowercase cursor-pointer select-none" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          swara
        </div>
      
        {/* Modern text links tabs */}
        <div className="flex items-center gap-4 sm:gap-8 text-xs font-bold tracking-widest font-sans">
          <button
            onClick={() => handleScrollToSection("sonic-register")}
            className="text-[#71717a] hover:text-[#e4e4e7] transition-colors cursor-pointer bg-transparent border-none uppercase text-[9px] sm:text-xs"
          >
            ARENA
          </button>
          <span className="text-[#27272a] text-[10px]">|</span>
          <button
            onClick={() => handleScrollToSection("melakarta-directory")}
            className="text-[#71717a] hover:text-[#e4e4e7] transition-colors cursor-pointer bg-transparent border-none uppercase text-[9px] sm:text-xs"
          >
            DIAL
          </button>
          <span className="text-[#27272a] text-[10px]">|</span>
          <button
            onClick={() => handleScrollToSection("composition-guide")}
            className="text-[#71717a] hover:text-[#e4e4e7] transition-colors cursor-pointer bg-transparent border-none uppercase text-[9px] sm:text-xs"
          >
            GUIDE
          </button>
        </div>

        {/* Digital clock timer — hidden on very small screens */}
        <div className="hidden xs:block sm:block text-sm sm:text-xl font-mono tracking-widest text-white font-bold">
          {digitalTime}
        </div>
      </nav>

      {/* 2. Absolute Drawer Overlay for Raga Search */}
      <AnimatePresence>
        {isRagaSelectorOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRagaSelectorOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-full max-w-sm bg-[#0c0a09]/95 backdrop-blur-md border-r border-[#27272a]/30 z-50 flex flex-col p-8 font-mono"
            >
              <div className="flex items-center justify-between border-b border-[#27272a]/20 pb-4 mb-6">
                <div>
                  <h3 className="font-serif font-black text-white text-xl leading-none tracking-wider">RAGA INDEX</h3>
                  <span className="text-[9px] text-[#c5a880] tracking-wider mt-1 block">SELECT SYSTEM DATASET</span>
                </div>
                <button 
                  onClick={() => setIsRagaSelectorOpen(false)}
                  className="p-1 text-[#71717a] hover:text-[#c5a880] border border-transparent hover:border-[#c5a880] transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 border border-[#27272a] p-0.5 bg-[#0c0a09] mb-4 text-[10px] font-bold">
                <button
                  onClick={() => setLearnMode("quest")}
                  className={`py-2 text-center transition-all cursor-pointer bg-transparent border-none ${
                    learnMode === "quest" ? "bg-[#c5a880] text-white" : "text-[#71717a] hover:text-white"
                  }`}
                >
                  SYLLABUS PATH
                </button>
                <button
                  onClick={() => setLearnMode("directory")}
                  className={`py-2 text-center transition-all cursor-pointer bg-transparent border-none ${
                    learnMode === "directory" ? "bg-[#c5a880] text-white" : "text-[#71717a] hover:text-white"
                  }`}
                >
                  SEARCH ALL
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {learnMode === "quest" ? (
                  <div className="flex flex-col gap-2 pb-6">
                    {roadmapLevels.map((lvl) => {
                      const isUnlocked = lvl.level <= unlockedLevel;
                      const isCompleted = lvl.level < unlockedLevel;
                      const isActive = lvl.level === unlockedLevel;
                      const isSelected = activeRaga?.id === lvl.ragaId;
                      const hasScore = levelScores[lvl.ragaId] || 0;

                      return (
                        <button
                          key={lvl.level}
                          disabled={!isUnlocked}
                          onClick={() => handleRagaChange(lvl.ragaId)}
                          className={`w-full text-left px-4 py-3 border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#c5a880]/15 border-[#c5a880] text-white"
                              : isActive
                              ? "bg-transparent border-[#c5a880]/40 text-[#c5a880] hover:border-[#c5a880]"
                              : isUnlocked
                              ? "bg-[#0c0a09] border-[#27272a] text-[#a1a1aa] hover:border-[#c5a880]/60 hover:text-white"
                              : "bg-transparent border-[#27272a]/20 text-[#3f3f46] cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold opacity-60">L{lvl.level}</span>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold leading-tight">{lvl.name}</span>
                              <span className="text-[8px] text-[#71717a] mt-0.5 tracking-wider">{lvl.difficulty}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {isCompleted || hasScore > 0 ? (
                              <Check className="w-3.5 h-3.5 text-white" />
                            ) : !isUnlocked ? (
                              <Lock className="w-3 h-3 text-[#3f3f46]" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] animate-pulse" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="SEARCH SCALE..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0c0a09] border border-[#27272a] pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-[#c5a880] placeholder-[#52525b] uppercase text-white"
                      />
                      <Search className="w-3.5 h-3.5 text-[#52525b] absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="grid grid-cols-3 border border-[#27272a] p-0.5 bg-[#0c0a09] text-[8px] font-bold text-center">
                      {(["all", "melakarta", "janya"] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setRagaFilter(f)}
                          className={`py-1.5 uppercase transition-colors cursor-pointer bg-transparent border-none ${
                            ragaFilter === f ? "bg-[#c5a880] text-white" : "text-[#71717a] hover:text-white"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {filteredRagas.map(r => {
                        const isSelected = activeRaga?.id === r.slug;
                        const rData = RAGA_LIST.find(rl => rl.id === r.slug);
                        const isMelakarta = rData?.type.toLowerCase().includes("melakarta");

                        return (
                          <button
                            key={r.slug}
                            onClick={() => handleRagaChange(r.slug)}
                            className={`w-full text-left px-4 py-2.5 border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-[#c5a880]/15 border-[#c5a880] text-white font-bold"
                                : "bg-[#0c0a09] border-[#27272a] hover:border-[#c5a880]/50 text-[#71717a] hover:text-white"
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold leading-none">{r.name}</span>
                              <span className="text-[7.5px] text-[#52525b] uppercase mt-1 tracking-wider">
                                {isMelakarta ? "MELAKARTA" : "JANYA"}
                              </span>
                            </div>
                            <ArrowRight className={`w-3 h-3 ${isSelected ? "text-[#c5a880] translate-x-0.5" : "text-[#27272a]"}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (confirm("Reset SwaraMind progress?")) {
                    localStorage.removeItem("swaramind_unlocked_level");
                    localStorage.removeItem("swaramind_level_scores");
                    window.location.reload();
                  }
                }}
                className="text-[8px] font-bold tracking-[0.2em] text-[#71717a] hover:text-[#c5a880] border-t border-[#27272a] pt-4 mt-auto text-center uppercase bg-transparent border-none"
              >
                RESET SYSTEM CONSOLE
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Section 2: About / Science of Swaras */}
      <section id="about-swara" className="w-full py-20 sm:py-32 px-4 sm:px-8 md:px-12 bg-[#0c0a09] border-t border-[#27272a]/20 flex flex-col items-center justify-center relative select-none">
        <div className="max-w-4xl text-center flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-[1px] bg-[#c5a880]" />
            <span className="text-[10px] text-[#c5a880] tracking-[0.4em] font-mono uppercase font-bold">
              THE SCIENCE OF SWARA
            </span>
            <div className="w-8 h-[1px] bg-[#c5a880]" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-light tracking-wide text-white mb-8 leading-tight">
            Acoustic Geometry of Sound
          </h2>

          <p className="text-sm md:text-base text-[#a1a1aa] font-sans leading-relaxed tracking-wide max-w-2xl mb-16 normal-case">
            In the Carnatic tradition, a <strong className="text-white">Swara</strong> is not merely a static pitch; it is a dynamic node of consciousness, defined by its precise microtonal relation to the fundamental tonic (<strong className="text-white">Adhara Shadjam</strong>). The 12 Swarasthanas emerge from natural harmonic ratios, forming a complex mathematical system of ear training, memory, and sonic geometries that have persisted for centuries.
          </p>

          {/* Fun Facts Ticker */}
          <div className="w-full overflow-hidden mt-4 relative" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
            <div className="animate-marquee gap-6">
              {[
                ...([
                  { img: "/fact-melakartas.png",  tag: "DID YOU KNOW?",  label: "72 Parent Scales",        desc: "Carnatic music is built on 72 Melakarta ragas — a complete mathematical system of scales catalogued by the scholar Venkatamakhi in 1620 CE." },
                  { img: "/fact-thyagaraja.png",  tag: "FUN FACT",       label: "700+ Compositions",      desc: "Saint Thyagaraja composed over 700 kritis in Telugu and Sanskrit — many are still sung in concerts every single day, 200 years later." },
                  { img: "/fact-mridangam.png",   tag: "DID YOU KNOW?",  label: "The Drum Speaks Sa",     desc: "The Mridangam is custom-tuned for every concert to match the vocalist's tonic (Sa). Its right face is tuned to Sa, and the bass face a fifth below." },
                  { img: "/fact-microtones.png",  tag: "SCIENCE",        label: "Microtonal Precision",   desc: "Carnatic musicians operate within microtonal divisions smaller than a semitone, using gamakas (ornaments) that bend pitch continuously between notes." },
                  { img: "/fact-concert.png",     tag: "TRADITION",      label: "3-Hour Concerts",        desc: "A typical Carnatic concert (kutcheri) lasts 3 to 4 hours with a single main artist, exploring just 6–8 ragas in immense depth and improvisation." },
                  { img: "/fact-tambura.png",     tag: "FUN FACT",       label: "The Eternal Drone",      desc: "The Tambura plays a continuous four-string drone throughout the entire performance — it never plays a melody, only sustaining the tonic Sa." },
                ]),
                // Duplicate for seamless loop
                ...([
                  { img: "/fact-melakartas.png",  tag: "DID YOU KNOW?",  label: "72 Parent Scales",        desc: "Carnatic music is built on 72 Melakarta ragas — a complete mathematical system of scales catalogued by the scholar Venkatamakhi in 1620 CE." },
                  { img: "/fact-thyagaraja.png",  tag: "FUN FACT",       label: "700+ Compositions",      desc: "Saint Thyagaraja composed over 700 kritis in Telugu and Sanskrit — many are still sung in concerts every single day, 200 years later." },
                  { img: "/fact-mridangam.png",   tag: "DID YOU KNOW?",  label: "The Drum Speaks Sa",     desc: "The Mridangam is custom-tuned for every concert to match the vocalist's tonic (Sa). Its right face is tuned to Sa, and the bass face a fifth below." },
                  { img: "/fact-microtones.png",  tag: "SCIENCE",        label: "Microtonal Precision",   desc: "Carnatic musicians operate within microtonal divisions smaller than a semitone, using gamakas (ornaments) that bend pitch continuously between notes." },
                  { img: "/fact-concert.png",     tag: "TRADITION",      label: "3-Hour Concerts",        desc: "A typical Carnatic concert (kutcheri) lasts 3 to 4 hours with a single main artist, exploring just 6–8 ragas in immense depth and improvisation." },
                  { img: "/fact-tambura.png",     tag: "FUN FACT",       label: "The Eternal Drone",      desc: "The Tambura plays a continuous four-string drone throughout the entire performance — it never plays a melody, only sustaining the tonic Sa." },
                ]),
              ].map((item, idx) => (
                <div key={idx} className="flex-shrink-0 w-[340px] flex gap-4 border border-[#27272a]/60 hover:border-[#c5a880]/40 bg-[#0f0d0c] transition-colors duration-500 p-4 group">
                  {/* Image */}
                  <div className="w-[110px] h-[110px] flex-shrink-0 overflow-hidden relative">
                    <img
                      src={item.img}
                      alt={item.label}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500 filter grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0f0d0c]/40" />
                  </div>
                  {/* Text */}
                  <div className="flex flex-col justify-center gap-1.5 min-w-0">
                    <span className="text-[7.5px] text-[#c5a880] font-mono tracking-[0.3em] uppercase font-bold">{item.tag}</span>
                    <h4 className="text-[11px] text-white font-serif tracking-wide leading-tight">{item.label}</h4>
                    <p className="text-[9px] text-[#52525b] font-sans leading-relaxed normal-case line-clamp-3">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Swara Sonic Register (Teaching Arena) */}
      <section id="sonic-register" className="w-full py-20 sm:py-32 px-4 sm:px-8 md:px-12 bg-[#0c0a09] border-t border-[#27272a]/20 relative overflow-hidden flex flex-col items-center">
        {/* Background watermark overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.06] mix-blend-luminosity filter sepia pointer-events-none z-0"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />

        <div className="max-w-5xl w-full relative z-10 flex flex-col md:flex-row gap-12 items-start justify-between">
          {/* Active Raga Meta Column (Left) */}
          <div className="w-full md:w-[35%] flex flex-col justify-start">
            {activeRaga && (
              <div className="flex items-center gap-2 select-none">
                <div className="w-3.5 h-[1px] bg-[#c5a880] shrink-0" />
                <span className="text-[9px] text-[#c5a880] tracking-widest font-black uppercase font-mono">
                  {activeRaga.type}
                </span>
              </div>
            )}

            <h2 className="text-4xl sm:text-5xl font-serif font-light tracking-widest text-white leading-none uppercase mt-3 select-none">
              {activeRaga ? activeRaga.name : "LOADING..."}
            </h2>

            <div className="flex items-center gap-5 mt-5 text-[9px] font-black text-[#c5a880] font-mono select-none">
              <button 
                onClick={prevRaga} 
                className="hover:text-white cursor-pointer transition-colors flex items-center gap-1 focus:outline-none bg-transparent border-none text-[#c5a880]"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> PREV
              </button>
              <span className="text-[#27272a]">|</span>
              <button 
                onClick={nextRaga} 
                className="hover:text-white cursor-pointer transition-colors flex items-center gap-1 focus:outline-none bg-transparent border-none text-[#c5a880]"
              >
                NEXT <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeRaga && (
              <p className="text-[11px] text-[#a1a1aa] font-sans leading-relaxed tracking-wider normal-case border-l border-[#27272a] pl-4 py-2 mt-8 font-medium">
                {activeRaga.description}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => setIsRagaSelectorOpen(true)}
                className="w-full border border-[#27272a] hover:border-[#c5a880] bg-[#0c0c0e] text-[#71717a] hover:text-white text-[8.5px] font-bold tracking-widest py-3 text-center transition-all cursor-pointer rounded-none uppercase"
              >
                OPEN SYSTEM ARCHIVE SELECTOR
              </button>
              
              {/* Synth options and presets */}
              {activeRaga && (
                <div className="border border-[#27272a]/20 bg-[#0c0a09] p-4 font-mono text-left w-full text-[9px]">
                  <div className="flex justify-between items-center border-b border-[#27272a]/10 pb-2 mb-3">
                    <span className="text-[8.5px] font-bold text-[#71717a] tracking-widest">SYNTH SETTINGS</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-[#71717a] font-bold">
                    <div className="flex items-center justify-between border-r border-[#27272a]/10 pr-2">
                      <span>BASE:</span>
                      <select
                        value={tonicFreq}
                        onChange={(e) => setTonicFreq(parseFloat(e.target.value))}
                        className="bg-transparent text-white border-none focus:outline-none cursor-pointer font-bold font-mono text-[9px]"
                      >
                        {TONIC_PRESETS.map(p => (
                          <option key={p.value} value={p.value} className="bg-[#0c0a09] text-white">
                            {p.label.split(" ")[0]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between pl-2">
                      <span>WAVE:</span>
                      <select
                        value={synthWaveform}
                        onChange={(e) => setSynthWaveform(e.target.value as OscillatorType)}
                        className="bg-transparent text-white border-none focus:outline-none cursor-pointer capitalize font-bold font-mono text-[9px]"
                      >
                        {["sine", "triangle", "sawtooth", "square"].map(w => (
                          <option key={w} value={w} className="bg-[#0c0a09] text-white">
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => playScaleSequence(activeRaga.arohanam, "aro")}
                      className="flex-1 py-2 border border-[#27272a]/60 hover:border-[#c5a880] text-[#71717a] hover:text-white text-[8px] font-bold tracking-widest cursor-pointer rounded-none bg-transparent"
                    >
                      ASCEND
                    </button>
                    <button
                      onClick={() => playScaleSequence(activeRaga.avarohanam, "ava")}
                      className="flex-1 py-2 border border-[#27272a]/60 hover:border-[#c5a880] text-[#71717a] hover:text-white text-[8px] font-bold tracking-widest cursor-pointer rounded-none bg-transparent"
                    >
                      DESCEND
                    </button>
                    {(isPlayingSeq || isPlayingComp) && (
                      <button
                        onClick={() => { stopSequence(); stopCompositionPlay(); }}
                        className="px-3 bg-[#c5a880] text-white hover:bg-[#b0936b] text-[8px] font-bold cursor-pointer rounded-none border-none"
                      >
                        STOP
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Raga Swara Register Column (Right) */}
          <div className="w-full md:w-[60%] flex flex-col">
            {activeRaga && (
              <div className="w-full bg-[#0c0a09]/95 border border-[#27272a]/20 shadow-[0_0_30px_rgba(0,0,0,0.6)] p-6 relative overflow-hidden">
                <div className="flex flex-col gap-0.5 font-mono text-[9px] tracking-wider">
                  {activeRaga.arohanam.map((swaraCode, idx) => {
                    const info = SWARASTHANAS[swaraCode];
                    const cents = info?.cents ?? 0;
                    const isActive = activeHotspot?.code === swaraCode;
                    const isSeqActive = isPlayingSeq && activeSeqIndex === idx;
                    const showActive = isActive || isSeqActive;
                    const freq = tonicFreq * Math.pow(2, cents / 1200);
                    const displayFreq = Math.round(freq * 10) / 10;

                    return (
                      <div
                        key={`${swaraCode}-${idx}`}
                        onClick={() => {
                          stopSequence();
                          stopCompositionPlay();
                          playSwaraTone(cents, 0.7);
                          triggerStringVibration(swaraCode);
                          if (info) {
                            setActiveHotspot({
                              code: swaraCode,
                              name: info.name,
                              cents,
                              freq: displayFreq
                            });
                          }
                        }}
                        className={`w-full py-3.5 px-4 border-b border-[#27272a]/10 hover:border-[#c5a880]/30 flex items-center justify-between cursor-pointer transition-all last:border-0 relative ${
                          showActive 
                            ? "bg-[#c5a880]/5 text-[#c5a880]" 
                            : "text-[#a1a1aa] hover:text-white bg-transparent"
                        }`}
                      >
                        {showActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-[#c5a880]/5 via-transparent to-[#c5a880]/5 pointer-events-none" />
                        )}

                        <div className="flex items-center gap-4 relative z-10">
                          <span className="text-[8px] text-[#52525b] font-mono font-bold w-5 text-right">{idx + 1}</span>
                          <span className={`text-sm font-serif font-black tracking-widest ${showActive ? "text-[#c5a880]" : "text-white"}`}>
                            {swaraCode}
                          </span>
                        </div>

                        <span className="text-[8px] text-left max-w-[150px] truncate uppercase font-bold text-[#71717a] relative z-10 hidden sm:block">
                          {info?.name || "ROOT NOTE"}
                        </span>

                        <div className="flex items-center gap-6 relative z-10">
                          <span className="text-[7.5px] text-[#71717a] font-semibold text-right min-w-[100px]">
                            {displayFreq} HZ / {cents} C
                          </span>
                          
                          <button
                            className={`px-3 py-1 border transition-all text-[7.5px] font-bold tracking-widest rounded-none bg-transparent ${
                              showActive
                                ? "bg-[#c5a880] border-transparent text-[#0c0a09]"
                                : "bg-transparent border-[#27272a] hover:border-[#c5a880] text-[#a1a1aa] hover:text-white"
                            }`}
                          >
                            {showActive ? "PLAYING" : "PLAY"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Raga Reference Audio Streams */}
            {activeRaga && (
              <div className="mt-4 flex gap-3 w-full">
                <button
                  onClick={() => togglePlayReference(activeRaga.audioArohanamAvarohanam)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 border text-[9px] font-bold font-mono tracking-widest transition-all cursor-pointer rounded-none bg-transparent ${
                    playingAudioUrl === activeRaga.audioArohanamAvarohanam
                      ? "bg-[#c5a880] border-transparent text-white"
                      : "bg-transparent border-[#27272a]/60 text-[#a1a1aa] hover:border-[#c5a880] hover:text-white"
                  }`}
                >
                  {playingAudioUrl === activeRaga.audioArohanamAvarohanam ? "STOP SCALE AUDIO" : "PLAY SCALE AUDIO"}
                </button>
                <button
                  onClick={() => togglePlayReference(activeRaga.audioSignature)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 border text-[9px] font-bold font-mono tracking-widest transition-all cursor-pointer rounded-none bg-transparent ${
                    playingAudioUrl === activeRaga.audioSignature
                      ? "bg-[#c5a880] border-transparent text-white"
                      : "bg-transparent border-[#27272a]/60 text-[#a1a1aa] hover:border-[#c5a880] hover:text-white"
                  }`}
                >
                  {playingAudioUrl === activeRaga.audioSignature ? "STOP SIGNATURE" : "PLAY SIGNATURE"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 4: Melakarta Chakra Directory */}
      <section id="melakarta-directory" className="w-full py-20 sm:py-32 px-4 sm:px-8 md:px-12 bg-[#0c0a09] border-t border-[#27272a]/20 flex flex-col items-center select-none">
        <div className="max-w-6xl w-full">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-8 h-[1px] bg-[#c5a880]" />
            <span className="text-[10px] text-[#c5a880] tracking-[0.4em] font-mono uppercase font-bold">
              THE MELAKARTA DIAL INDEX
            </span>
            <div className="w-8 h-[1px] bg-[#c5a880]" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-serif font-light text-center tracking-wide text-white mb-16 leading-tight">
            72 Melakarta Raga Index
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
            {CHAKRA_NAMES.map((chakraName, chakraIdx) => {
              const startNum = chakraIdx * 6 + 1;
              const endNum = startNum + 5;
              const chakraRagas = RAGA_LIST.filter(r => {
                const numMatch = r.type.match(/No\.\s*(\d+)/);
                if (numMatch) {
                  const num = parseInt(numMatch[1]);
                  return num >= startNum && num <= endNum;
                }
                return false;
              });

              return (
                <div key={chakraName} className="border border-[#27272a]/40 bg-[#0c0c0e]/40 p-3 sm:p-5 flex flex-col hover:border-[#c5a880]/30 transition-all duration-300">
                  <div className="border-b border-[#27272a]/20 pb-2 mb-4">
                    <span className="text-[8px] text-[#71717a] font-mono tracking-widest uppercase font-bold">CHAKRA {chakraIdx + 1}</span>
                    <h3 className="text-sm font-serif text-[#c5a880] tracking-wider uppercase mt-0.5">{chakraName}</h3>
                  </div>

                  <div className="flex flex-col gap-2 font-mono text-[9px] tracking-wider">
                    {chakraRagas.map(raga => {
                      const numMatch = raga.type.match(/No\.\s*(\d+)/);
                      const num = numMatch ? numMatch[1] : "";
                      const isSelected = activeRaga?.id === raga.id;

                      return (
                        <button
                          key={raga.id}
                          onClick={() => handleRagaChange(raga.id, true)}
                          className={`w-full text-left py-1.5 px-2 border transition-all flex items-center justify-between cursor-pointer bg-transparent ${
                            isSelected
                              ? "bg-[#c5a880]/15 border-[#c5a880] text-[#c5a880]"
                              : "border-transparent hover:border-[#27272a] text-[#71717a] hover:text-white"
                          }`}
                        >
                          <span className="truncate">{num}. {raga.name}</span>
                          <ArrowRight className={`w-2.5 h-2.5 shrink-0 ${isSelected ? "text-[#c5a880]" : "opacity-0"}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Rhythmic Metronome & Practice Guide */}
      <section id="composition-guide" className="w-full py-20 sm:py-32 px-4 sm:px-8 md:px-12 bg-[#0c0a09] border-t border-[#27272a]/20 flex flex-col items-center select-none">
        <div className="max-w-5xl w-full">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-8 h-[1px] bg-[#c5a880]" />
            <span className="text-[10px] text-[#c5a880] tracking-[0.4em] font-mono uppercase font-bold">
              THE PRACTICE COMPOSITION GUIDE
            </span>
            <div className="w-8 h-[1px] bg-[#c5a880]" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-serif font-light text-center tracking-wide text-white mb-16 leading-tight">
            Metronome & Composition Desk
          </h2>

          {/* Submenu tabs */}
          <div className="flex justify-center border-b border-[#27272a]/20 mb-8 sm:mb-12 overflow-x-auto hide-scrollbar">
            <div className="flex gap-4 sm:gap-8 text-[9px] sm:text-[10px] font-mono tracking-widest font-bold uppercase pb-3 min-w-max px-2">
              {[
                { id: "swaravalis", label: "Swaravali Exercises" },
                { id: "geethams", label: "Traditional Songs" },
                { id: "varnams", label: "Varnam Phrases" },
                { id: "tala", label: "Tala Metronome" }
              ].map(subTab => (
                <button
                  key={subTab.id}
                  onClick={() => setGuideTab(subTab.id as any)}
                  className={`transition-colors cursor-pointer bg-transparent border-none ${
                    guideTab === subTab.id ? "text-[#c5a880]" : "text-[#71717a] hover:text-[#e4e4e7]"
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Panels based on guideTab */}
          <div className="w-full bg-[#0c0c0e]/40 border border-[#27272a]/20 p-8">
            
            {/* SWARAVALIS */}
            {guideTab === "swaravalis" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: list of swaravalis */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[9px] text-[#71717a] font-mono tracking-widest uppercase font-bold mb-1">EXERCISE REGISTER</span>
                  {SWARAVALIS.map((sw, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        stopSequence();
                        stopMetronome();
                        setSelectedSwaravali(sw);
                      }}
                      className={`w-full text-left p-4 border transition-all flex flex-col gap-1 cursor-pointer bg-transparent ${
                        selectedSwaravali.title === sw.title
                          ? "bg-[#c5a880]/15 border-[#c5a880] text-white"
                          : "bg-transparent border-[#27272a]/30 text-[#71717a] hover:text-white hover:border-[#c5a880]/50"
                      }`}
                    >
                      <span className="text-xs font-serif tracking-wide text-white">{sw.title}</span>
                      <span className="text-[8.5px] font-mono uppercase tracking-wider">{sw.notes.length} Swara Sequence</span>
                    </button>
                  ))}
                </div>

                {/* Right: Selected Swaravali detail */}
                <div className="lg:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="border-b border-[#27272a]/20 pb-3 mb-4">
                      <h4 className="text-xl font-serif text-[#c5a880] tracking-wider">{selectedSwaravali.title}</h4>
                      <p className="text-[10px] text-[#71717a] font-mono uppercase tracking-widest mt-1">Scale Exercise</p>
                    </div>
                    <p className="text-[11px] text-[#a1a1aa] font-sans leading-relaxed tracking-wider normal-case mb-8">
                      {selectedSwaravali.description}
                    </p>

                    {/* Interactive notation stream */}
                    <div className="flex flex-wrap gap-2.5 mb-8">
                      {selectedSwaravali.notes.map((note, idx) => {
                        const ragaNotes = activeRaga?.arohanam || selectedSwaravali.notes;
                        const resolvedNote = resolveNotationToNote(note, ragaNotes);
                        const cents = SWARASTHANAS[resolvedNote]?.cents ?? 0;
                        const isPlaying = isPlayingSeq && activeSeqIndex === idx;

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              stopSequence();
                              playSwaraTone(cents, 0.4);
                              triggerStringVibration(resolvedNote);
                            }}
                            className={`w-11 h-11 border flex flex-col items-center justify-center cursor-pointer transition-all ${
                              isPlaying
                                ? "bg-[#c5a880] border-[#c5a880] text-[#0c0a09] font-bold scale-105"
                                : "bg-[#0c0a09] border-[#27272a] text-[#71717a] hover:text-white hover:border-[#c5a880]/40"
                            }`}
                          >
                            <span className="text-xs font-bold font-mono">{note}</span>
                            <span className="text-[7.5px] font-sans opacity-70 mt-0.5">{selectedSwaravali.syllables[idx]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => playSwaravali(selectedSwaravali.notes)}
                      className="px-6 py-2.5 bg-[#c5a880] hover:bg-[#b0936b] text-[#0c0a09] text-[9.5px] font-mono font-bold tracking-widest cursor-pointer uppercase rounded-none border-none"
                    >
                      {isPlayingSeq ? "RESTART EXERCISE" : "PLAY EXERCISE"}
                    </button>
                    {isPlayingSeq && (
                      <button
                        onClick={stopSequence}
                        className="px-6 py-2.5 border border-[#27272a] hover:border-[#c5a880] text-white text-[9.5px] font-mono font-bold tracking-widest cursor-pointer uppercase rounded-none bg-transparent"
                      >
                        STOP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* GEETHAMS */}
            {guideTab === "geethams" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: list of geethams */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[9px] text-[#71717a] font-mono tracking-widest uppercase font-bold mb-1">SONG ARCHIVE</span>
                  {GEETHAMS.map((g, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        stopSequence();
                        stopMetronome();
                        setSelectedGeetham(g);
                      }}
                      className={`w-full text-left p-4 border transition-all flex flex-col gap-1 cursor-pointer bg-transparent ${
                        selectedGeetham.title === g.title
                          ? "bg-[#c5a880]/15 border-[#c5a880] text-white"
                          : "bg-transparent border-[#27272a]/30 text-[#71717a] hover:text-white hover:border-[#c5a880]/50"
                      }`}
                    >
                      <span className="text-xs font-serif tracking-wide text-white">{g.title}</span>
                      <span className="text-[8.5px] font-mono uppercase tracking-wider">{g.taalam}</span>
                    </button>
                  ))}
                </div>

                {/* Right: Selected Geetham detail */}
                <div className="lg:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="border-b border-[#27272a]/20 pb-3 mb-4 flex justify-between items-end">
                      <div>
                        <h4 className="text-xl font-serif text-[#c5a880] tracking-wider">{selectedGeetham.title}</h4>
                        <p className="text-[10px] text-[#71717a] font-mono uppercase tracking-widest mt-1">Geetham composition</p>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-[#c5a880] tracking-wider uppercase border border-[#c5a880]/30 px-2.5 py-1">
                        {selectedGeetham.taalam}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a1a1aa] font-sans leading-relaxed tracking-wider normal-case mb-8">
                      {selectedGeetham.description}
                    </p>

                    {/* Phrase rows */}
                    <div className="flex flex-col gap-4 mb-8">
                      {selectedGeetham.phrases.map((phrase, phraseIdx) => (
                        <div key={phraseIdx} className="flex gap-3 items-center border-b border-[#27272a]/5 pb-3 last:border-0 last:pb-0">
                          <span className="text-[8px] text-[#71717a] shrink-0 font-bold font-mono">PHRASE {phraseIdx + 1}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {phrase.notation.map((sym, noteIdx) => {
                              const ragaNotes = activeRaga?.arohanam || selectedGeetham.ragaNotes;
                              const resolvedNote = resolveNotationToNote(sym, ragaNotes);
                              const cents = SWARASTHANAS[resolvedNote]?.cents ?? 0;
                              const isNoteActive = isPlayingSeq && activeSeqIndex === (phraseIdx * 100 + noteIdx);

                              return (
                                <div
                                  key={noteIdx}
                                  onClick={() => {
                                    stopSequence();
                                    playSwaraTone(cents, 0.4);
                                    triggerStringVibration(resolvedNote);
                                  }}
                                  className={`px-3 py-1.5 text-[10px] border cursor-pointer select-none transition-all flex flex-col items-center ${
                                    isNoteActive
                                      ? "bg-[#c5a880] border-[#c5a880] text-[#0c0a09] font-bold"
                                      : "bg-[#0c0a09] border-[#27272a]/60 text-[#71717a] hover:text-white"
                                  }`}
                                >
                                  <span className="font-bold font-mono">{sym}</span>
                                  <span className="text-[8px] opacity-75 font-sans mt-0.5">{phrase.syllables[noteIdx]}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => playGeetham(selectedGeetham.phrases, activeRaga?.arohanam || selectedGeetham.ragaNotes)}
                      className="px-6 py-2.5 bg-[#c5a880] hover:bg-[#b0936b] text-[#0c0a09] text-[9.5px] font-mono font-bold tracking-widest cursor-pointer uppercase rounded-none border-none"
                    >
                      {isPlayingSeq ? "RESTART COMPOSITION" : "PLAY COMPOSITION"}
                    </button>
                    {isPlayingSeq && (
                      <button
                        onClick={stopSequence}
                        className="px-6 py-2.5 border border-[#27272a] hover:border-[#c5a880] text-white text-[9.5px] font-mono font-bold tracking-widest cursor-pointer uppercase rounded-none bg-transparent"
                      >
                        STOP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VARNAMS */}
            {guideTab === "varnams" && (
              <div className="flex flex-col">
                <div className="border-b border-[#27272a]/20 pb-3 mb-6">
                  <h4 className="text-xl font-serif text-[#c5a880] tracking-wider">Adi Tala Varnam Phrases</h4>
                  <p className="text-[10px] text-[#71717a] font-mono uppercase tracking-widest mt-1">Sri Rajagopala (Mohanam)</p>
                </div>
                <p className="text-[11px] text-[#a1a1aa] font-sans leading-relaxed tracking-wider normal-case mb-8 max-w-xl">
                  A Varnam is a complex, multi-movement composition. Practicing its sections (Pallavi, Anupallavi) trains the mind in structural symmetry and tempo variations.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Pallavi */}
                  <div className="border border-[#27272a]/40 p-6 bg-[#0c0a09]/50 flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-[#c5a880] tracking-widest uppercase font-bold block mb-3">SECTION A: PALLAVI</span>
                      <div className="flex flex-col gap-3 font-mono text-[9px]">
                        {VARNAM_PALLAVI.map((phrase, pIdx) => (
                          <div key={pIdx} className="flex gap-2 flex-wrap">
                            {phrase.notation.map((sym, nIdx) => (
                              <div key={nIdx} className="px-2.5 py-1 border border-[#27272a] bg-[#0c0a09] text-[#71717a] flex flex-col items-center">
                                <span className="font-bold">{sym}</span>
                                <span className="text-[7.5px] opacity-75 mt-0.5">{phrase.syllables[nIdx]}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => playVarnam(VARNAM_PALLAVI, ["S", "R2", "G3", "P", "D2", "S'"])}
                      className="mt-6 w-full py-2 border border-[#c5a880]/60 hover:border-[#c5a880] hover:bg-[#c5a880]/10 text-white text-[8.5px] font-mono font-bold tracking-widest uppercase cursor-pointer bg-transparent"
                    >
                      PLAY PALLAVI
                    </button>
                  </div>

                  {/* Anupallavi */}
                  <div className="border border-[#27272a]/40 p-6 bg-[#0c0a09]/50 flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-[#c5a880] tracking-widest uppercase font-bold block mb-3">SECTION B: ANUPALLAVI</span>
                      <div className="flex flex-col gap-3 font-mono text-[9px]">
                        {VARNAM_ANUPALLAVI.map((phrase, pIdx) => (
                          <div key={pIdx} className="flex gap-2 flex-wrap">
                            {phrase.notation.map((sym, nIdx) => (
                              <div key={nIdx} className="px-2.5 py-1 border border-[#27272a] bg-[#0c0a09] text-[#71717a] flex flex-col items-center">
                                <span className="font-bold">{sym}</span>
                                <span className="text-[7.5px] opacity-75 mt-0.5">{phrase.syllables[nIdx]}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => playVarnam(VARNAM_ANUPALLAVI, ["S", "R2", "G3", "P", "D2", "S'"])}
                      className="mt-6 w-full py-2 border border-[#c5a880]/60 hover:border-[#c5a880] hover:bg-[#c5a880]/10 text-white text-[8.5px] font-mono font-bold tracking-widest uppercase cursor-pointer bg-transparent"
                    >
                      PLAY ANUPALLAVI
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TALA METRONOME */}
            {guideTab === "tala" && (
              <div className="flex flex-col">
                <div className="border-b border-[#27272a]/20 pb-3 mb-6">
                  <h4 className="text-xl font-serif text-[#c5a880] tracking-wider">Carnatic Taala Metronome</h4>
                  <p className="text-[10px] text-[#71717a] font-mono uppercase tracking-widest mt-1">Rhythmic Cycle Metronome</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Settings */}
                  <div className="flex flex-col gap-6">
                    {/* Tala Selector */}
                    <div className="flex flex-col gap-2 font-mono">
                      <label className="text-[9px] text-[#71717a] font-bold tracking-widest uppercase">Select Tala</label>
                      <div className="flex flex-col gap-2">
                        {TALA_PRESETS.map((tala) => (
                          <button
                            key={tala.name}
                            onClick={() => {
                              stopMetronome();
                              setActiveTala(tala);
                            }}
                            className={`w-full text-left p-4 border transition-all flex flex-col gap-1 cursor-pointer bg-transparent ${
                              activeTala.name === tala.name
                                ? "bg-[#c5a880]/15 border-[#c5a880] text-white font-bold"
                                : "bg-transparent border-[#27272a] text-[#71717a] hover:text-white"
                            }`}
                          >
                            <span className="text-xs text-white font-serif">{tala.name}</span>
                            <span className="text-[8.5px] opacity-75">{tala.beats} Beats - {tala.description.split("(")[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tempo Slider */}
                    <div className="flex flex-col gap-2 font-mono">
                      <div className="flex justify-between text-[9px] text-[#71717a] font-bold tracking-widest uppercase">
                        <span>Tempo</span>
                        <span className="text-white">{tempoBpm} BPM</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="180"
                        value={tempoBpm}
                        onChange={(e) => setTempoBpm(parseInt(e.target.value))}
                        className="w-full accent-[#c5a880] bg-[#27272a] h-1 rounded-none outline-none appearance-none"
                      />
                    </div>
                  </div>

                  {/* Right: Timeline Visualizer */}
                  <div className="lg:col-span-2 flex flex-col justify-between p-6 border border-[#27272a]/60 bg-[#0c0a09]/50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-[#c5a880] tracking-widest uppercase font-bold block mb-6">
                        ACTIVE RHYTHMIC TIMELINE (BEAT TRACKER)
                      </span>

                      {/* Horizontal Ticks Timeline */}
                      <div className="w-full h-20 flex items-center justify-between relative border-b border-[#27272a]/30 pb-4 mb-6">
                        {/* Connecting timeline line */}
                        <div className="absolute left-0 right-0 h-[1px] bg-[#27272a] top-1/2 -translate-y-1/2 z-0" />

                        {Array.from({ length: activeTala.beats }).map((_, beatIdx) => {
                          const isActive = currentBeat === beatIdx;
                          const patternText = activeTala.pattern[beatIdx] || "Tick";

                          return (
                            <div
                              key={beatIdx}
                              className="flex flex-col items-center relative z-10 select-none cursor-pointer group"
                              onClick={() => {
                                if (!isMetronomeRunning) {
                                  setCurrentBeat(beatIdx);
                                }
                              }}
                            >
                              {/* Beat number label */}
                              <span className={`text-[8px] font-mono font-bold mb-2 transition-all ${
                                isActive ? "text-[#c5a880]" : "text-[#52525b] group-hover:text-white"
                              }`}>
                                B{beatIdx + 1}
                              </span>

                              {/* Vertical Tick */}
                              <div
                                className={`w-1 transition-all duration-300 ${
                                  isActive
                                    ? "h-8 bg-[#c5a880] shadow-[0_0_10px_#c5a880]"
                                    : "h-4 bg-[#27272a] group-hover:bg-[#a1a1aa]"
                                }`}
                              />

                              {/* Beat action mini-text */}
                              <span className={`text-[7px] font-sans tracking-wide uppercase mt-2 absolute top-12 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
                                isActive ? "opacity-100 text-[#c5a880]" : "text-[#71717a]"
                              }`}>
                                {patternText}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Display current beat details */}
                      <div className="flex items-center gap-4 mt-6">
                        <div className="w-10 h-10 border border-[#27272a] bg-[#0c0a09] flex items-center justify-center font-mono font-bold text-white text-sm">
                          {currentBeat !== null ? currentBeat + 1 : "-"}
                        </div>
                        <div className="flex flex-col leading-none font-mono">
                          <span className="text-[7.5px] text-[#71717a] font-bold uppercase">Current Action</span>
                          <span className="text-xs font-bold text-white mt-1 uppercase">
                            {currentBeat !== null ? activeTala.pattern[currentBeat] || "MUTE TICK" : "STANDBY"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (isMetronomeRunning) {
                          stopMetronome();
                        } else {
                          runMetronome();
                        }
                      }}
                      className="mt-8 w-full py-3 bg-[#c5a880] hover:bg-[#b0936b] text-[#0c0a09] text-center font-mono font-bold text-[10px] tracking-widest uppercase cursor-pointer rounded-none border-none"
                    >
                      {isMetronomeRunning ? "STOP METRONOME" : "START METRONOME"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Footer — redesigned */}
      <footer className="w-full bg-[#0c0a09] select-none overflow-hidden">

        {/* Top gold hairline */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#c5a880]/40 to-transparent" />

        {/* Central wordmark block */}
        <div className="max-w-6xl mx-auto px-8 pt-20 pb-8 flex flex-col items-center text-center">


          {/* Giant wordmark */}
          <div
            className="font-serif font-light leading-none tracking-[0.15em] text-white/10 hover:text-white/20 transition-colors duration-700 cursor-pointer mb-2"
            style={{ fontSize: "clamp(4rem, 14vw, 11rem)" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Back to top"
          >
            swara
          </div>

          {/* Tagline */}
          <p className="text-[10px] text-[#52525b] font-mono tracking-[0.35em] uppercase mt-4 mb-14">
            Carnatic Music &nbsp;·&nbsp; 72 Ragas &nbsp;·&nbsp; Web Audio
          </p>

          {/* Horizontal nav */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 mb-16">
            {[
              { label: "About", id: "about-swara" },
              { label: "Sonic Register", id: "sonic-register" },
              { label: "Melakarta Index", id: "melakarta-directory" },
              { label: "Practice", id: "composition-guide" },
            ].map((link, i, arr) => (
              <span key={link.id} className="flex items-center gap-10">
                <button
                  onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth" })}
                  className="text-[9.5px] font-mono tracking-[0.3em] uppercase text-[#52525b] hover:text-[#c5a880] transition-colors duration-300 cursor-pointer bg-transparent border-none"
                >
                  {link.label}
                </button>
                {i < arr.length - 1 && (
                  <span className="text-[#27272a] text-[8px]">&bull;</span>
                )}
              </span>
            ))}
          </div>

          {/* Active raga strip */}
          {activeRaga && (
            <div className="flex items-center gap-3 mb-10 px-5 py-2.5 border border-[#27272a]/40">
              <div className="w-1 h-1 rounded-full bg-[#c5a880] animate-pulse" />
              <span className="text-[9px] font-mono text-[#52525b] tracking-widest uppercase">Active</span>
              <span className="text-[9px] font-serif text-[#c5a880] tracking-wider">{activeRaga.name}</span>
              <span className="text-[#27272a]">&middot;</span>
              {activeRaga.arohanam.slice(0, 5).map((n, i) => (
                <span key={i} className="text-[8px] font-mono text-[#52525b]">{n}</span>
              ))}
              {activeRaga.arohanam.length > 5 && <span className="text-[8px] text-[#3f3f46] font-mono">+{activeRaga.arohanam.length - 5}</span>}
            </div>
          )}

          {/* Bottom divider */}
          <div className="w-full h-px bg-[#1c1917] mb-6" />

          {/* Copyright row */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
            <span className="text-[8.5px] text-[#3f3f46] font-mono tracking-[0.25em] uppercase">
              &copy; {new Date().getFullYear()} Swara
            </span>
            <a
              href="https://github.com/Adhan-Hashim/swara"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[8.5px] text-[#3f3f46] hover:text-[#c5a880] font-mono tracking-[0.25em] uppercase transition-colors duration-300"
            >
              github.com/Adhan-Hashim/swara &#8599;
            </a>
          </div>

        </div>

      </footer>

    </main>
  );
}

