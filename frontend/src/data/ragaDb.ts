export interface SwaraInfo {
  note: string;      
  name: string;      
  cents: number;     
}

export interface Raga {
  id: string;
  name: string;
  type: string;      
  parent?: string;   
  arohanam: string[]; 
  avarohanam: string[]; 
  arohanamCents: number[]; 
  avarohanamCents: number[]; 
  arohanamSwaras: string[]; 
  avarohanamSwaras: string[]; 
  description: string;
  ragaSurabhiUrl: string;
  audioArohanamAvarohanam: string;
  audioSignature: string;
}

export interface SongPhrase {
  notation: string[];  // e.g. ["G", "G", "P", "P"]
  syllables: string[]; // e.g. ["Va", "ra", "Vee", "na"]
}

export interface RagaSong {
  title: string;
  taalam: string;
  phrases: SongPhrase[];
}

export interface QuestLevel {
  level: number;
  month: number;
  ragaId: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  focus: string;
}

export const SWARASTHANAS: Record<string, { name: string; cents: number }> = {
  S: { name: "Shadjam (Sa)", cents: 0 },
  R1: { name: "Shuddha Rishabham (Ri1)", cents: 100 },
  R2: { name: "Chathushruti Rishabham (Ri2)", cents: 200 },
  G1: { name: "Shuddha Gandharam (Ga1)", cents: 200 },
  R3: { name: "Shatshruti Rishabham (Ri3)", cents: 300 },
  G2: { name: "Sadharana Gandharam (Ga2)", cents: 300 },
  G3: { name: "Antara Gandharam (Ga3)", cents: 400 },
  M1: { name: "Shuddha Madhyamam (Ma1)", cents: 500 },
  M2: { name: "Prati Madhyamam (Ma2)", cents: 600 },
  P: { name: "Panchamam (Pa)", cents: 700 },
  D1: { name: "Shuddha Dhaivatham (Dha1)", cents: 800 },
  D2: { name: "Chathushruti Dhaivatham (Dha2)", cents: 900 },
  N1: { name: "Shuddha Nishadham (Ni1)", cents: 900 },
  D3: { name: "Shatshruti Dhaivatham (Dha3)", cents: 1000 },
  N2: { name: "Kaisiki Nishadham (Ni2)", cents: 1000 },
  N3: { name: "Kakali Nishadham (Ni3)", cents: 1100 },
  "S'": { name: "Tara Shadjam (Sa')", cents: 1200 },
};

// Autodetects cents for any list of notes
export function getCentsForNotes(notes: string[]): number[] {
  return notes.map((note) => {
    const cleanNote = note.trim();
    return SWARASTHANAS[cleanNote]?.cents ?? 0;
  });
}

// Maps short codes to their full Carnatic swara names
export function getNamesForNotes(notes: string[]): string[] {
  return notes.map((note) => {
    const cleanNote = note.trim();
    return SWARASTHANAS[cleanNote]?.name || note;
  });
}

// Predefined traditional songs/compositions for step-by-step masterclass
export const COMPOSITIONS: Record<string, RagaSong> = {
  mohanam: {
    title: "Vara Veena (Geetham)",
    taalam: "Rupaka Taalam (3 Beats)",
    phrases: [
      { notation: ["G", "G", "P", "P", "D", "D", "S'"], syllables: ["Va", "ra", "Vee", "na", "mri", "du", "pa"] },
      { notation: ["D", "P", "D", "D", "P", "G", "R2", "S"], syllables: ["ni", "va", "na", "ru", "ha", "lo", "cha", "ni"] },
      { notation: ["G", "P", "D", "S'", "D", "P", "G", "R2"], syllables: ["su", "ra", "ru", "chi", "ra", "ti", "ra", "ka"] },
      { notation: ["S", "R2", "G", "P", "G", "R2", "S"], syllables: ["ya", "a", "a", "a", "a", "a", "a"] }
    ]
  },
  mayamalavagowlai: {
    title: "Swarajathi Practice Phrase",
    taalam: "Adi Taalam (8 Beats)",
    phrases: [
      { notation: ["S", "R1", "G3", "M1", "P", "D1", "N3", "S'"], syllables: ["Sa", "Ri", "Ga", "Ma", "Pa", "Dha", "Ni", "Sa'"] },
      { notation: ["S'", "N3", "D1", "P", "M1", "G3", "R1", "S"], syllables: ["Sa'", "Ni", "Dha", "Pa", "Ma", "Ga", "Ri", "Sa"] },
      { notation: ["S", "S", "R1", "R1", "G3", "G3", "M1", "M1"], syllables: ["Sa", "Sa", "Ri", "Ri", "Ga", "Ga", "Ma", "Ma"] },
      { notation: ["P", "P", "D1", "D1", "N3", "N3", "S'", "S'"], syllables: ["Pa", "Pa", "Dha", "Dha", "Ni", "Ni", "Sa'", "Sa'"] }
    ]
  },
  hamsadhwani: {
    title: "Vatapi Ganapatim (Pallavi)",
    taalam: "Adi Taalam (8 Beats)",
    phrases: [
      { notation: ["G", "R2", "S", "N3", "S", "R2", "G3", "P"], syllables: ["Va", "ta", "pi", "Ga", "na", "pa", "tim", "bha"] },
      { notation: ["G", "R2", "S", "R2", "S"], syllables: ["je", "e", "e", "e", "ham"] }
    ]
  }
};

// Dynamically compile a fallback exercise phrase if a raga does not have a predefined composition
export function getFallbackSong(ragaId: string, arohanam: string[], avarohanam: string[]): RagaSong {
  const cleanAro = arohanam.map(n => n.replace("'", ""));
  const cleanAva = avarohanam.map(n => n.replace("'", ""));
  
  return {
    title: "Basic Sanchara / Phrase Practice",
    taalam: "Adi Taalam (Free form)",
    phrases: [
      { 
        notation: cleanAro.slice(0, 4), 
        syllables: cleanAro.slice(0, 4).map(n => n === "S" ? "Sa" : n === "R" || n.startsWith("R") ? "Ri" : n === "G" || n.startsWith("G") ? "Ga" : n === "M" || n.startsWith("M") ? "Ma" : n) 
      },
      { 
        notation: cleanAro.slice(4).concat(cleanAro.slice(-1)), 
        syllables: cleanAro.slice(4).concat(cleanAro.slice(-1)).map(n => n === "P" ? "Pa" : n === "D" || n.startsWith("D") ? "Dha" : n === "N" || n.startsWith("N") ? "Ni" : "Sa'") 
      },
      { 
        notation: cleanAva.slice(0, 4), 
        syllables: cleanAva.slice(0, 4).map(n => n === "S" || n.includes("'") ? "Sa'" : n === "N" || n.startsWith("N") ? "Ni" : n === "D" || n.startsWith("D") ? "Dha" : "Pa")
      },
      { 
        notation: cleanAva.slice(4), 
        syllables: cleanAva.slice(4).map(n => n === "M" || n.startsWith("M") ? "Ma" : n === "G" || n.startsWith("G") ? "Ga" : n === "R" || n.startsWith("R") ? "Ri" : "Sa")
      }
    ]
  };
}

export const MELAKARTA_NAMES = [
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

export const CHAKRA_NAMES = [
  "Indu", "Netra", "Agni", "Veda", "Bana", "Rutu",
  "Rishi", "Vasu", "Brahma", "Disi", "Rudra", "Aditya"
];

export function getRagaSlug(name: string): string {
  const lower = name.toLowerCase().trim();
  if (lower === "hanumatodi") return "todi";
  if (lower === "mechakalyani") return "kalyani";
  if (lower === "dheerasankarabharanam") return "dheerasankarabharanam";
  if (lower === "hamsadhwani") return "hamsadwani";
  return lower.replace(/\s+/g, "-");
}

function getOrdinalSuffix(i: number): string {
  const j = i % 10, k = i % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

const POPULAR_OVERRIDES: Record<string, Partial<Raga>> = {
  mayamalavagowlai: {
    description: "Mayamalavagowlai is a highly symmetrical, ancient scale and the standard training raga in Carnatic music. Formulated by Purandara Dasa, its clear, wide intervals between notes help train students in pitch control, lung capacity, and vocal agility.",
  },
  dheerasankarabharanam: {
    description: "Dheerasankarabharanam (Mela 29) is the direct equivalent of the Western Major scale. It is a majestic, fundamental raga in Carnatic music with a rich framework for compositions.",
  },
  kalyani: {
    description: "Mecha-Kalyani (Mela 65) is characterized by its sharp Madhyamam (Ma 2), creating a bright, energetic, and majestic aesthetic. It is one of the most widely performed and beloved ragas.",
  },
  kharaharapriya: {
    description: "Kharaharapriya (Mela 22) is a highly symmetric and foundational scale in Carnatic music. It offers a rich, expressive framework for microtones and evokes deep, classical emotion.",
  },
  todi: {
    description: "Hanumatodi (Mela 8) is a colossal, challenging raga in Carnatic music. Featuring narrow semitones and flat intervals, it requires advanced vocal microtone control and deep gamaka mastery.",
  },
  rasikapriya: {
    description: "Rasikapriya is the 72nd and final Melakarta. It features highly dissonant, sharp note configurations (Shatshruti Ri, Antara Ga, Prati Ma, Shatshruti Dha, Kakali Ni) representing the ultimate summit of pitch precision.",
  },
  chalanata: {
    description: "Chalanata (Mela 36) features highly compressed double-sharp intervals. Its intense, driving intervals require advanced breath control and precision over notes in fast scales.",
  }
};

function generateMelakartaRagas(): Raga[] {
  return MELAKARTA_NAMES.map((name, index) => {
    const melaNum = index + 1;
    const slug = getRagaSlug(name);

    const chakraIdx = Math.floor((melaNum - 1) / 6);
    const chakraName = CHAKRA_NAMES[chakraIdx];
    const stepInChakra = (melaNum - 1) % 6; // 0 to 5

    const mSwara = melaNum <= 36 ? "M1" : "M2";

    // Calculate R and G notes based on Chakra (cycles every 6 chakras)
    const chakraCycle = chakraIdx % 6;
    let rSwara = "R1";
    let gSwara = "G1";
    if (chakraCycle === 0) { rSwara = "R1"; gSwara = "G1"; }
    else if (chakraCycle === 1) { rSwara = "R1"; gSwara = "G2"; }
    else if (chakraCycle === 2) { rSwara = "R1"; gSwara = "G3"; }
    else if (chakraCycle === 3) { rSwara = "R2"; gSwara = "G2"; }
    else if (chakraCycle === 4) { rSwara = "R2"; gSwara = "G3"; }
    else if (chakraCycle === 5) { rSwara = "R3"; gSwara = "G3"; }

    // Calculate D and N notes based on step in Chakra
    let dSwara = "D1";
    let nSwara = "N1";
    if (stepInChakra === 0) { dSwara = "D1"; nSwara = "N1"; }
    else if (stepInChakra === 1) { dSwara = "D1"; nSwara = "N2"; }
    else if (stepInChakra === 2) { dSwara = "D1"; nSwara = "N3"; }
    else if (stepInChakra === 3) { dSwara = "D2"; nSwara = "N2"; }
    else if (stepInChakra === 4) { dSwara = "D2"; nSwara = "N3"; }
    else if (stepInChakra === 5) { dSwara = "D3"; nSwara = "N3"; }

    const arohanam = ["S", rSwara, gSwara, mSwara, "P", dSwara, nSwara, "S'"];
    const avarohanam = ["S'", nSwara, dSwara, "P", mSwara, gSwara, rSwara, "S"];

    // Human readable Swara labels
    const rLabel = rSwara === "R1" ? "Ri 1" : rSwara === "R2" ? "Ri 2" : "Ri 3";
    const gLabel = gSwara === "G1" ? "Ga 1" : gSwara === "G2" ? "Ga 2" : "Ga 3";
    const mLabel = mSwara === "M1" ? "Ma 1" : "Ma 2";
    const dLabel = dSwara === "D1" ? "Dha 1" : dSwara === "D2" ? "Dha 2" : "Dha 3";
    const nLabel = nSwara === "N1" ? "Ni 1" : nSwara === "N2" ? "Ni 2" : "Ni 3";

    const arohanamSwaras = ["Sa", rLabel, gLabel, mLabel, "Pa", dLabel, nLabel, "Sa'"];
    const avarohanamSwaras = ["Sa'", nLabel, dLabel, "Pa", mLabel, gLabel, rLabel, "Sa"];

    const description = `${name} is the ${melaNum}${getOrdinalSuffix(melaNum)} Melakarta Raga in Carnatic music. It belongs to the ${chakraName} Chakra. It features the notes ${arohanam.join(" ")} in its ascending scale (Arohanam) and ${avarohanam.join(" ")} in its descending scale (Avarohanam).`;

    const raga: Raga = {
      id: slug,
      name,
      type: `Melakarta (No. ${melaNum}, ${chakraName} Chakra)`,
      arohanam,
      avarohanam,
      arohanamCents: getCentsForNotes(arohanam),
      avarohanamCents: getCentsForNotes(avarohanam),
      arohanamSwaras,
      avarohanamSwaras,
      description,
      ragaSurabhiUrl: `https://www.ragasurabhi.com/carnatic-music/raga/raga--${slug}.html`,
      audioArohanamAvarohanam: `https://www.ragasurabhi.com/carnatic-music-mp3/raga-${slug}-arohanam_avarohanam.mp3`,
      audioSignature: `https://www.ragasurabhi.com/carnatic-music-mp3/raga-${slug}-signature.mp3`
    };

    // Apply popular overrides if exist
    if (POPULAR_OVERRIDES[slug]) {
      Object.assign(raga, POPULAR_OVERRIDES[slug]);
    }

    return raga;
  });
}

// Predefined Janya Ragas
const JANYA_RAGAS: Raga[] = [
  {
    id: "mohanam",
    name: "Mohanam",
    type: "Janya Raga",
    parent: "Harikambhoji (28th Melakarta)",
    arohanam: ["S", "R2", "G3", "P", "D2", "S'"],
    avarohanam: ["S'", "D2", "P", "G3", "R2", "S"],
    arohanamCents: [0, 200, 400, 700, 900, 1200],
    avarohanamCents: [1200, 900, 700, 400, 200, 0],
    arohanamSwaras: ["Sa", "Ri 2", "Ga 3", "Pa", "Dha 2", "Sa'"],
    avarohanamSwaras: ["Sa'", "Dha 2", "Pa", "Ga 3", "Ri 2", "Sa"],
    description: "Mohanam is one of the most popular pentatonic ragas. Composed of 5 notes in both ascending and descending scales, it avoids Ma and Ni. It represents the Major Pentatonic scale found in folk and classical music globally.",
    ragaSurabhiUrl: "https://www.ragasurabhi.com/carnatic-music/raga/raga--mohanam.html",
    audioArohanamAvarohanam: "https://www.ragasurabhi.com/carnatic-music-mp3/raga-mohanam-arohanam_avarohanam.mp3",
    audioSignature: "https://www.ragasurabhi.com/carnatic-music-mp3/raga-mohanam-signature.mp3",
  },
  {
    id: "hamsadwani", // matches slug on ragasurabhi
    name: "Hamsadhwani",
    type: "Janya Raga",
    parent: "Dheerasankarabharanam (29th Melakarta)",
    arohanam: ["S", "R2", "G3", "P", "N3", "S'"],
    avarohanam: ["S'", "N3", "P", "G3", "R2", "S"],
    arohanamCents: [0, 200, 400, 700, 1100, 1200],
    avarohanamCents: [1200, 1100, 700, 400, 200, 0],
    arohanamSwaras: ["Sa", "Ri 2", "Ga 3", "Pa", "Ni 3", "Sa'"],
    avarohanamSwaras: ["Sa'", "Ni 3", "Pa", "Ga 3", "Ri 2", "Sa"],
    description: "Hamsadhwani (meaning 'The Call of the Swan') is an energetic, bright pentatonic raga that avoids Ma and Dha. Usually rendered at the beginning of a performance to invoke energy.",
    ragaSurabhiUrl: "https://www.ragasurabhi.com/carnatic-music/raga/raga--hamsadwani.html",
    audioArohanamAvarohanam: "https://www.ragasurabhi.com/carnatic-music-mp3/raga-hamsadwani-arohanam_avarohanam.mp3",
    audioSignature: "https://www.ragasurabhi.com/carnatic-music-mp3/raga-hamsadwani-signature.mp3",
  },
  {
    id: "hindolam",
    name: "Hindolam",
    type: "Janya Raga",
    parent: "Natabhairavi (20th Melakarta)",
    arohanam: ["S", "G2", "M1", "D1", "N2", "S'"],
    avarohanam: ["S'", "N2", "D1", "M1", "G2", "S"],
    arohanamCents: [0, 300, 500, 800, 1000, 1200],
    avarohanamCents: [1200, 1000, 800, 500, 300, 0],
    arohanamSwaras: ["Sa", "Ga 2", "Ma 1", "Dha 1", "Ni 2", "Sa'"],
    avarohanamSwaras: ["Sa'", "Ni 2", "Dha 1", "Ma 1", "Ga 2", "Sa"],
    description: "Hindolam is a beautiful, meditative pentatonic scale that avoids Ri and Pa. Known for its soft, deep classical appeal, it is highly expressive and ideal for evening contemplation.",
    ragaSurabhiUrl: "https://www.ragasurabhi.com/carnatic-music/raga/raga--hindolam.html",
    audioArohanamAvarohanam: "https://www.ragasurabhi.com/carnatic-music-mp3/raga-hindolam-arohanam_avarohanam.mp3",
    audioSignature: "https://www.ragasurabhi.com/carnatic-music-mp3/raga-hindolam-signature.mp3",
  },
  {
    id: "abhogi",
    name: "Abhogi",
    type: "Janya Raga",
    parent: "Kharaharapriya (22nd Melakarta)",
    arohanam: ["S", "R2", "G2", "M1", "D2", "S'"],
    avarohanam: ["S'", "D2", "M1", "G2", "R2", "S"],
    arohanamCents: [0, 200, 300, 500, 900, 1200],
    avarohanamCents: [1200, 900, 500, 300, 200, 0],
    arohanamSwaras: ["Sa", "Ri 2", "Ga 2", "Ma 1", "Dha 2", "Sa'"],
    avarohanamSwaras: ["Sa'", "Dha 2", "Ma 1", "Ga 2", "Ri 2", "Sa"],
    description: "Abhogi is a symmetric pentatonic janya raga omitting Pa and Ni. It provides a sweet, compact structure that creates a warm, pleasing, and lighthearted classical effect.",
    ragaSurabhiUrl: "https://www.ragasurabhi.com/carnatic-music/raga/raga--abhogi.html",
    audioArohanamAvarohanam: "https://www.ragasurabhi.com/carnatic-music-mp3/raga-abhogi-arohanam_avarohanam.mp3",
    audioSignature: "https://www.ragasurabhi.com/carnatic-music-mp3/raga-abhogi-signature.mp3",
  },
  {
    id: "bhairavi",
    name: "Bhairavi",
    type: "Janya Raga (Bhashanga Raga)",
    parent: "Kharaharapriya (22nd Melakarta)",
    arohanam: ["S", "R2", "G2", "M1", "P", "D2", "N2", "S'"],
    avarohanam: ["S'", "N2", "D1", "P", "M1", "G2", "R2", "S"],
    arohanamCents: [0, 200, 300, 500, 700, 900, 1000, 1200],
    avarohanamCents: [1200, 1000, 800, 700, 500, 300, 200, 0],
    arohanamSwaras: ["Sa", "Ri 2", "Ga 2", "Ma 1", "Pa", "Dha 2", "Ni 2", "Sa'"],
    avarohanamSwaras: ["Sa'", "Ni 2", "Dha 1", "Pa", "Ma 1", "Ga 2", "Ri 2", "Sa"],
    description: "Bhairavi is a grand, ancient scale. It employs Chathushruti Dhaivatham (D2) in the ascending scale (arohanam) and Shuddha Dhaivatham (D1) in the descending scale (avarohanam).",
    ragaSurabhiUrl: "https://www.ragasurabhi.com/carnatic-music/raga/raga--bhairavi.html",
    audioArohanamAvarohanam: "https://www.ragasurabhi.com/carnatic-music-mp3/raga-bhairavi-arohanam_avarohanam.mp3",
    audioSignature: "https://www.ragasurabhi.com/carnatic-music-mp3/raga-bhairavi-signature.mp3",
  }
];

export const RAGA_LIST: Raga[] = [...generateMelakartaRagas(), ...JANYA_RAGAS];

export const QUEST_LEVELS: QuestLevel[] = [
  { level: 1, month: 1, ragaId: "mayamalavagowlai", name: "Mayamalavagowlai", difficulty: "Easy", focus: "Tonic Alignment & Symmetrical Semitones" },
  { level: 2, month: 1, ragaId: "mohanam", name: "Mohanam", difficulty: "Easy", focus: "Pentatonic Scale & Sweet Major Intervals" },
  { level: 3, month: 2, ragaId: "hamsadwani", name: "Hamsadhwani", difficulty: "Easy", focus: "Bright Pentatonic & High Notes Practice" },
  { level: 4, month: 2, ragaId: "hindolam", name: "Hindolam", difficulty: "Medium", focus: "Contemplative Pentatonic & Minor Thirds" },
  { level: 5, month: 3, ragaId: "dheerasankarabharanam", name: "Shankarabharanam", difficulty: "Medium", focus: "Major Scale Equivalents & Pure Shrutis" },
  { level: 6, month: 3, ragaId: "kalyani", name: "Kalyani", difficulty: "Medium", focus: "Sharp Madhyamam (Ma2) & Harmonic Tension" },
  { level: 7, month: 4, ragaId: "kharaharapriya", name: "Kharaharapriya", difficulty: "Medium", focus: "Dorian Intervals & Gamaka Foundations" },
  { level: 8, month: 4, ragaId: "abhogi", name: "Abhogi", difficulty: "Hard", focus: "Vakra pentatonic jumps & swift patterns" },
  { level: 9, month: 5, ragaId: "bhairavi", name: "Bhairavi", difficulty: "Hard", focus: "Bhashanga variations (double Dhaivatham)" },
  { level: 10, month: 5, ragaId: "todi", name: "Todi", difficulty: "Hard", focus: "Intricate microtones & delicate flat swaras" },
  { level: 11, month: 6, ragaId: "rasikapriya", name: "Rasikapriya", difficulty: "Extreme", focus: "Dissonant 72nd Melakarta scale summit" },
  { level: 12, month: 6, ragaId: "chalanata", name: "Chalanata", difficulty: "Extreme", focus: "Double-sharp chromatic intervals mastery" }
];
