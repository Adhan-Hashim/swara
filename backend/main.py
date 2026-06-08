from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import librosa
import numpy as np
import io
import json
import os
import requests
from bs4 import BeautifulSoup

app = FastAPI(
    title="SwaraMind API",
    description="Digital Music Intelligence Platform for Indian Classical Music Practice"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CACHE_FILE = "raga_cache.json"

# Map swara notations to their semitone indices (0-11)
SWARA_SEMITONE_MAP = {
    "S": 0, "S'": 0,
    "R1": 1,
    "R2": 2, "G1": 2,
    "R3": 3, "G2": 3,
    "G3": 4,
    "M1": 5,
    "M2": 6,
    "P": 7,
    "D1": 8,
    "D2": 9, "N1": 9,
    "D3": 10, "N2": 10,
    "N3": 11
}

# Pre-seeded popular ragas for offline fallback and initial launch
PRESEEDED_RAGAS = {
    "mayamalavagowlai": {
        "name": "Mayamalavagowlai",
        "type": "Melakarta (15th Melakarta Raga)",
        "arohanam": ["S", "R1", "G3", "M1", "P", "D1", "N3", "S'"],
        "avarohanam": ["S'", "N3", "D1", "P", "M1", "G3", "R1", "S"],
        "description": "Standard training raga in Carnatic music. Highly symmetrical and meditative, formulations of Purandara Dasa.",
        "audioArohanamAvarohanam": "https://www.ragasurabhi.com/carnatic-music-mp3/raga-mayamalavagowlai-arohanam_avarohanam.mp3",
        "audioSignature": "https://www.ragasurabhi.com/carnatic-music-mp3/raga-mayamalavagowlai-signature.mp3",
        "ragaSurabhiUrl": "https://www.ragasurabhi.com/carnatic-music/raga/raga--mayamalavagowlai.html"
    },
    "mohanam": {
        "name": "Mohanam",
        "type": "Janya Raga of Harikambhoji (28th Melakarta)",
        "arohanam": ["S", "R2", "G3", "P", "D2", "S'"],
        "avarohanam": ["S'", "D2", "P", "G3", "R2", "S"],
        "description": "A sweet, bright pentatonic raga (omitting Ma and Ni) representing the Major Pentatonic scale.",
        "audioArohanamAvarohanam": "https://www.ragasurabhi.com/carnatic-music-mp3/raga-mohanam-arohanam_avarohanam.mp3",
        "audioSignature": "https://www.ragasurabhi.com/carnatic-music-mp3/raga-mohanam-signature.mp3",
        "ragaSurabhiUrl": "https://www.ragasurabhi.com/carnatic-music/raga/raga--mohanam.html"
    },
    "hamsadhwani": {
        "name": "Hamsadhwani",
        "type": "Janya Raga of Dheerasankarabharanam (29th Melakarta)",
        "arohanam": ["S", "R2", "G3", "P", "N3", "S'"],
        "avarohanam": ["S'", "N3", "P", "G3", "R2", "S"],
        "description": "An energetic, auspicious pentatonic raga associated with Ganesha invocations.",
        "audioArohanamAvarohanam": "https://www.ragasurabhi.com/carnatic-music-mp3/raga-hamsadwani-arohanam_avarohanam.mp3",
        "audioSignature": "https://www.ragasurabhi.com/carnatic-music-mp3/raga-hamsadwani-signature.mp3",
        "ragaSurabhiUrl": "https://www.ragasurabhi.com/carnatic-music/raga/raga--hamsadwani.html"
    }
}

def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    # Initialize with preseeded items
    return {"ragas_list": [{"name": v["name"], "slug": k} for k, v in PRESEEDED_RAGAS.items()], "ragas_details": PRESEEDED_RAGAS}

def save_cache(cache):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print("Error saving cache:", e)

# Helper Scrapers
def scrape_ragas_list():
    try:
        r = requests.get("https://www.ragasurabhi.com/carnatic-music/ragas.html", timeout=12)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')
        links = soup.find_all('a', class_='body_indexpage_assetlinktext')
        ragas = []
        for l in links:
            name = l.text.strip()
            href = l.get('href', '')
            if 'raga--' in href:
                slug = href.split('raga--')[-1].replace('.html', '').strip()
                if slug:
                    ragas.append({"name": name, "slug": slug})
        return ragas
    except Exception as e:
        print("Error scraping ragas list:", e)
        return None

def scrape_raga_details(slug: str):
    try:
        url = f"https://www.ragasurabhi.com/carnatic-music/raga/raga--{slug}.html"
        r = requests.get(url, timeout=12)
        if r.status_code != 200:
            return None
        
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Extract title
        title_tag = soup.find('h2', class_='body_heading')
        name = title_tag.text.replace("Raga", "").strip() if title_tag else slug.capitalize()
        
        # Extract type
        alias_tag = soup.find('p', class_='body_assetpage_ragaalias')
        raga_type = alias_tag.text.strip() if alias_tag else "Janya / Melakarta Raga"
        if "Alias:" in raga_type:
            raga_type = raga_type.split("Alias:")[0].strip()
        
        # Extract Arohanam and Avarohanam scale notes
        arohanam = []
        avarohanam = []
        
        for element in soup.find_all(text=True):
            if "Arohanam:" in element:
                parts = element.split("Arohanam:")[-1].strip().split()
                arohanam = [p.strip().replace('\xa0', '') for p in parts if p.strip()]
            if "Avarohanam:" in element:
                parts = element.split("Avarohanam:")[-1].strip().split()
                avarohanam = [p.strip().replace('\xa0', '') for p in parts if p.strip()]
        
        # S' correction at scale terminals
        if arohanam and arohanam[-1].upper() == 'S':
            arohanam[-1] = "S'"
        if avarohanam and avarohanam[0].upper() == 'S':
            avarohanam[0] = "S'"

        # Find MP3 assets
        audio_scale = ""
        audio_signature = ""
        links = soup.find_all('a')
        for l in links:
            href = l.get('href', '')
            if href.endswith('.mp3'):
                full_url = href if href.startswith('http') else f"https://www.ragasurabhi.com{href}"
                if 'arohanam_avarohanam' in href:
                    audio_scale = full_url
                elif 'signature' in href:
                    audio_signature = full_url
                    
        # Extract description
        preamble_tag = soup.find('div', class_='body_preamble_box')
        description = preamble_tag.text.strip() if preamble_tag else ""
        if not description:
            center_tag = soup.find(id='centerpiece_box')
            if center_tag:
                paras = center_tag.find_all('p')
                description = " ".join([p.text.strip() for p in paras[:2]])
                
        # Default fallbacks
        if not audio_scale:
            audio_scale = f"https://www.ragasurabhi.com/carnatic-music-mp3/raga-{slug}-arohanam_avarohanam.mp3"
        if not audio_signature:
            audio_signature = f"https://www.ragasurabhi.com/carnatic-music-mp3/raga-{slug}-signature.mp3"
            
        return {
            "name": name,
            "type": raga_type,
            "arohanam": arohanam,
            "avarohanam": avarohanam,
            "description": description,
            "audioArohanamAvarohanam": audio_scale,
            "audioSignature": audio_signature,
            "ragaSurabhiUrl": url
        }
    except Exception as e:
        print(f"Error scraping raga details for {slug}:", e)
        return None

# Harmonic Pitch Helper Estimators
def estimate_tonic(f0_values: np.ndarray) -> float:
    if len(f0_values) == 0:
        return 138.59  # C#3 default
        
    cents = 1200 * np.log2(f0_values / 65.4)
    cents_folded = cents % 1200
    
    hist, bin_edges = np.histogram(cents_folded, bins=12, range=(0, 1200))
    max_bin = np.argmax(hist)
    
    target_cents = max_bin * 100
    diffs = (cents_folded - target_cents + 600) % 1200 - 600
    in_bin = f0_values[np.abs(diffs) < 50]
    
    if len(in_bin) > 0:
        return float(np.median(in_bin))
    return float(np.median(f0_values))

def calculate_raga_similarities(f0_values: np.ndarray, tonic_hz: float, active_profiles: dict):
    """
    Computes similarities dynamically based on the scales of cached/preloaded ragas.
    """
    if len(f0_values) == 0:
        return "Unknown Raga", 0.0, {}

    cents = 1200 * np.log2(f0_values / tonic_hz)
    cents_folded = cents % 1200
    
    v = np.zeros(12)
    for cents_val in cents_folded:
        semitone = int(round(cents_val / 100)) % 12
        v[semitone] += 1
        
    v_norm = np.linalg.norm(v)
    if v_norm == 0:
        return "Unknown Raga", 0.0, {}
    v_normalized = v / v_norm

    scores = {}
    for slug, details in active_profiles.items():
        # Compile a binary profile scale vector dynamically!
        w = np.zeros(12)
        notes = details.get("arohanam", []) + details.get("avarohanam", [])
        for note in notes:
            clean_note = note.strip().replace("'", "")
            if clean_note in SWARA_SEMITONE_MAP:
                w[SWARA_SEMITONE_MAP[clean_note]] = 1
        
        w_norm = np.linalg.norm(w)
        if w_norm == 0:
            continue
        w_normalized = w / w_norm
        
        similarity = np.dot(v_normalized, w_normalized)
        scores[details.get("name", slug)] = float(similarity)

    if not scores:
        return "Unknown Raga", 0.0, {}

    sorted_scores = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    best_raga, best_score = sorted_scores[0]
    
    return best_raga, best_score, scores

# --- API Routes ---

@app.get("/")
def read_root():
    cache = load_cache()
    return {
        "message": "Welcome to SwaraMind Classical Raga Analysis API",
        "total_scraped_ragas": len(cache["ragas_list"]),
        "endpoints": ["/api/ragas", "/api/raga/{raga_slug}", "/api/analyze"]
    }

@app.get("/api/ragas")
def get_all_ragas():
    """
    Fetches the list of all ragas from Ragasurabhi.
    Uses local cache, updates if empty.
    """
    cache = load_cache()
    
    # If list is empty (or has only preseeds), try to scrape dynamically
    if len(cache["ragas_list"]) <= len(PRESEEDED_RAGAS):
        ragas = scrape_ragas_list()
        if ragas:
            cache["ragas_list"] = ragas
            save_cache(cache)
            
    return cache["ragas_list"]

@app.get("/api/raga/{slug}")
def get_raga_details(slug: str):
    """
    Retrieves details for a specific raga slug.
    Fetches from cache or scrapes dynamically if missing.
    """
    cache = load_cache()
    slug_key = slug.lower().strip()
    
    if slug_key in cache["ragas_details"]:
        return cache["ragas_details"][slug_key]
        
    # Scrape dynamically
    details = scrape_raga_details(slug_key)
    if details:
        cache["ragas_details"][slug_key] = details
        # Ensure it exists in the main directory list as well
        if not any(r["slug"] == slug_key for r in cache["ragas_list"]):
            cache["ragas_list"].append({"name": details["name"], "slug": slug_key})
        save_cache(cache)
        return details
        
    raise HTTPException(
        status_code=404, 
        detail=f"Raga '{slug}' not found on Ragasurabhi or scraping failed."
    )

@app.post("/api/analyze")
async def analyze_audio(
    file: UploadFile = File(...),
    tonic_hz: float = Query(None, description="Optional user-calibrated Sa frequency in Hz")
):
    """
    Analyzes an uploaded audio session. Estimates tonic, folds pitches,
    and dynamically scores match coefficients against all currently cached ragas.
    """
    if not file.filename.endswith(('.wav', '.mp3', '.ogg', '.m4a', '.webm')):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Please upload wav, mp3, ogg, m4a, or webm."
        )
    
    contents = await file.read()
    
    try:
        y, sr = librosa.load(io.BytesIO(contents), sr=16000)
        
        f0, voiced_flag, voiced_probs = librosa.pyin(
            y, 
            fmin=librosa.note_to_hz('C2'), 
            fmax=librosa.note_to_hz('C7')
        )
        
        valid_f0 = f0[~np.isnan(f0)]
        
        if len(valid_f0) > 0:
            sampled_contour = valid_f0[::5].tolist()
            avg_pitch = float(np.mean(valid_f0))
        else:
            sampled_contour = []
            avg_pitch = 0.0

        if tonic_hz is None or tonic_hz <= 0:
            tonic_hz = estimate_tonic(valid_f0)
        
        # Retrieve all currently scraped ragas to compile profiles
        cache = load_cache()
        detected_raga, confidence, raga_scores = calculate_raga_similarities(
            valid_f0, 
            tonic_hz, 
            cache["ragas_details"]
        )

        response = {
            "duration": float(librosa.get_duration(y=y, sr=sr)),
            "average_pitch": avg_pitch,
            "tonic_frequency": float(tonic_hz),
            "pitch_contour": sampled_contour,
            "detected_raga": detected_raga,
            "confidence": confidence,
            "raga_scores": raga_scores,
            "message": "Vocal analysis completed successfully"
        }
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
