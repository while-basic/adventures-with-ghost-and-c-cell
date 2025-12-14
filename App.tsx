
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import jsPDF from 'jspdf';
import { MAX_STORY_PAGES, BACK_COVER_PAGE, TOTAL_PAGES, INITIAL_PAGES, BATCH_SIZE, DECISION_PAGES, CHARACTERS, ComicFace, Beat, Persona, StoryTheme } from './types';
import { Setup } from './Setup';
import { Book } from './Book';
import { useApiKey } from './useApiKey';
import { ApiKeyDialog } from './ApiKeyDialog';
import { SoundEngine } from './SoundEngine';
import { Storage } from './Storage';

// --- Constants ---
const MODEL_V3 = "gemini-3-pro-image-preview";
const MODEL_TEXT_NAME = "gemini-3-pro-preview"; 
const MODEL_IMAGE_GEN_NAME = MODEL_V3;

const App: React.FC = () => {
  // --- API Key Hook ---
  const { validateApiKey, setShowApiKeyDialog, showApiKeyDialog, handleApiKeyDialogContinue } = useApiKey();

  // --- Show State ---
  const [issueNumber, setIssueNumber] = useState(1);
  const [hero, setHeroState] = useState<Persona | null>(null); // Ghost
  const [friend, setFriendState] = useState<Persona | null>(null); // C-Cell
  
  const heroRef = useRef<Persona | null>(null);
  const friendRef = useRef<Persona | null>(null);

  const setHero = (p: Persona | null) => { setHeroState(p); heroRef.current = p; };
  const setFriend = (p: Persona | null) => { setFriendState(p); friendRef.current = p; };
  
  const [comicFaces, setComicFaces] = useState<ComicFace[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  
  // --- Transition States ---
  const [showSetup, setShowSetup] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const generatingPages = useRef(new Set<number>());
  const historyRef = useRef<ComicFace[]>([]);
  const showContextRef = useRef<string>("EPISODE 1 START. Ghost (Voice Powers) and C-Cell (Hacker) are trying to go viral without getting deleted by the Algorithm.");
  const currentThemeRef = useRef<StoryTheme | null>(null);

  // --- Initialization & Storage ---
  useEffect(() => {
    const initApp = async () => {
      const saved = await Storage.loadState();
      if (saved) {
          setIssueNumber(saved.issueNumber);
          setHero(saved.hero);
          setFriend(saved.friend);
          // If we loaded from LocalStorage fallback, images might be missing. 
          // We accept that (better than nothing) and just show the structure.
          setComicFaces(saved.comicFaces);
          historyRef.current = saved.history;
          showContextRef.current = saved.showContext;
          currentThemeRef.current = saved.currentTheme;
          
          if (saved.comicFaces.length > 0) {
              setIsStarted(true);
              setShowSetup(false);
          }
      }
      setIsDataLoaded(true);
    };
    initApp();
  }, []);

  // Auto-Save Effect (Debounced for iPhone performance)
  useEffect(() => {
      if (!isDataLoaded) return;
      
      const saveTimeout = setTimeout(() => {
          Storage.saveState({
              issueNumber,
              hero: heroRef.current,
              friend: friendRef.current,
              comicFaces,
              history: historyRef.current,
              showContext: showContextRef.current,
              currentTheme: currentThemeRef.current
          });
      }, 1000); // Wait 1 second after last change before saving

      return () => clearTimeout(saveTimeout);
  }, [issueNumber, comicFaces, isDataLoaded]);

  // --- AI Helpers ---
  const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

  const handleAPIError = (e: any) => {
    const msg = String(e);
    console.error("API Error:", msg);
    if (msg.includes('Requested entity was not found') || msg.includes('API_KEY_INVALID') || msg.toLowerCase().includes('permission denied')) {
      setShowApiKeyDialog(true);
    }
    SoundEngine.playGlitch();
  };

  const generateBeat = async (history: ComicFace[], isRightPage: boolean, pageNum: number, isDecisionPage: boolean): Promise<Beat> => {
    const isFinalPage = pageNum === MAX_STORY_PAGES;

    const relevantHistory = history
        .filter(p => p.type === 'story' && p.narrative && (p.pageIndex || 0) < pageNum)
        .sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));

    const historyText = relevantHistory.map(p => 
      `[Pg ${p.pageIndex}] (Focus: ${p.narrative?.focus_char}) (Text: "${p.narrative?.caption} ${p.narrative?.dialogue}") (Action: ${p.narrative?.scene}) ${p.resolvedChoice ? `-> DECISION: "${p.resolvedChoice}"` : ''}`
    ).join('\n');

    const instruction = `
      You are the showrunner for "Ghost & C-Cell: Viral Frequency", a Gen Z supernatural drama.
      
      CHARACTERS:
      - GHOST: 17yo Black girl, rapper/singer. Power: Voice manipulates reality/emotions. Mood: Moody, guarded, pure talent.
      - C-CELL: 17yo tech wizard. Power: Code that hacks physics. Mood: Awkward, genius, chronically online.
      
      CURRENT EPISODE THEME: "${currentThemeRef.current?.title}" - ${currentThemeRef.current?.desc}
      CURRENT CONTEXT: ${showContextRef.current}
      
      ISSUE #${issueNumber}, PAGE ${pageNum}/${MAX_STORY_PAGES}.
      
      STYLE GUIDE:
      - Slang: Heavy Gen Z/Alpha (no cap, bet, opps, cooked, lock in).
      - Vibe: Glitchy, neon, high stakes, "Black Mirror" meets "Euphoria".
      - Dialogue: Short, punchy, realistic text-speak energy.
      
      NARRATIVE ARC:
      ${pageNum === 1 ? `COLD OPEN. Immediate hook related to the theme: ${currentThemeRef.current?.title}.` : ""}
      ${isDecisionPage && !isFinalPage ? "A critical moral dilemma about CLOUT vs INTEGRITY or SAFETY vs HYPE." : ""}
      ${isFinalPage ? "SEASON FINALE CLIFFHANGER. Must end with 'TO BE CONTINUED...'. Something specifically dangerous happens to C-Cell or Ghost." : ""}
      
      OUTPUT JSON:
      {
        "caption": "Narrator text (TikTok caption style). Max 15 words.",
        "dialogue": "Character speech. Max 15 words.",
        "scene": "Visual description for comic artist. ALWAYS mention 'GHOST' or 'C-CELL' by name if present. Keep it purple/neon aesthetic.",
        "focus_char": "hero" (Ghost) or "friend" (C-Cell) or "other",
        "choices": ["Option A", "Option B"] (Only if decision page)
      }
    `;

    try {
        const ai = getAI();
        const res = await ai.models.generateContent({ 
            model: MODEL_TEXT_NAME, 
            contents: `PREVIOUS PANELS:\n${historyText}\n\n${instruction}`, 
            config: { responseMimeType: 'application/json' } 
        });
        
        let rawText = res.text || "{}";
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);
        
        if (parsed.dialogue) parsed.dialogue = parsed.dialogue.replace(/^[\w\s\-]+:\s*/i, '').replace(/["']/g, '').trim();
        if (!isDecisionPage) parsed.choices = [];
        if (isDecisionPage && (!parsed.choices || parsed.choices.length < 2)) parsed.choices = ["Risk it all for clout", "Play it safe"];
        if (!['hero', 'friend', 'other'].includes(parsed.focus_char)) parsed.focus_char = 'hero';

        return parsed as Beat;
    } catch (e) {
        handleAPIError(e);
        return { caption: "connection_lost...", scene: "Static noise and glitch art.", focus_char: 'other', choices: [] };
    }
  };

  const generatePersona = async (desc: string): Promise<Persona> => {
      try {
          const ai = getAI();
          const res = await ai.models.generateContent({
              model: MODEL_IMAGE_GEN_NAME,
              contents: { text: `STYLE: Modern 2025 graphic novel character sheet, vibrant digital art, cell shaded, high contrast, purple and neon accents. FULL BODY FRONT VIEW. Character: ${desc}` },
              config: { imageConfig: { aspectRatio: '1:1' } }
          });
          const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
          if (part?.inlineData?.data) return { base64: part.inlineData.data, desc };
          throw new Error("Failed");
      } catch (e) { 
        handleAPIError(e);
        throw e; 
      }
  };

  const generateImage = async (beat: Beat, type: ComicFace['type']): Promise<string> => {
    const contents = [];
    if (heroRef.current?.base64) {
        contents.push({ text: "REFERENCE 1 [GHOST]:" });
        contents.push({ inlineData: { mimeType: 'image/jpeg', data: heroRef.current.base64 } });
    }
    if (friendRef.current?.base64) {
        contents.push({ text: "REFERENCE 2 [C-CELL]:" });
        contents.push({ inlineData: { mimeType: 'image/jpeg', data: friendRef.current.base64 } });
    }

    let promptText = `STYLE: Modern 2025 graphic novel, vibrant neon colors, heavy use of PURPLE and WHITE lighting, glitch aesthetic. `;
    
    if (type === 'cover') {
        promptText += `TYPE: Comic Cover. TITLE: "GHOST & C-CELL: VIRAL FREQUENCY" ISSUE #${issueNumber}. THEME: ${currentThemeRef.current?.title}. Visual: Epic composition of [GHOST] and [C-CELL] facing a digital threat.`;
    } else if (type === 'back_cover') {
        promptText += `TYPE: Teaser Poster. Text: "NEXT EPISODE LOADING...". Visual: A cracked smartphone screen or a mysterious glitch entity.`;
    } else {
        promptText += `TYPE: Comic Panel. SCENE: ${beat.scene}. `;
        promptText += `INSTRUCTIONS: Use REFERENCE 1 for 'GHOST'. Use REFERENCE 2 for 'C-CELL'.`;
        if (beat.caption) promptText += ` INCLUDE CAPTION BOX: "${beat.caption}"`;
        if (beat.dialogue) promptText += ` INCLUDE SPEECH BUBBLE: "${beat.dialogue}"`;
    }

    contents.push({ text: promptText });

    try {
        const ai = getAI();
        const res = await ai.models.generateContent({
          model: MODEL_IMAGE_GEN_NAME,
          contents: contents,
          config: { imageConfig: { aspectRatio: '2:3' } }
        });
        const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        return part?.inlineData?.data ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : '';
    } catch (e) { 
        handleAPIError(e);
        return ''; 
    }
  };

  const updateFaceState = (id: string, updates: Partial<ComicFace>) => {
      setComicFaces(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
      const idx = historyRef.current.findIndex(f => f.id === id);
      if (idx !== -1) historyRef.current[idx] = { ...historyRef.current[idx], ...updates };
  };

  const generateSinglePage = async (faceId: string, pageNum: number, type: ComicFace['type']) => {
      const isDecision = DECISION_PAGES.includes(pageNum);
      let beat: Beat = { scene: "", choices: [], focus_char: 'other' };

      if (type === 'cover' || type === 'back_cover') {
           beat = { scene: "Cover art", choices: [], focus_char: 'other' };
      } else {
           beat = await generateBeat(historyRef.current, pageNum % 2 === 0, pageNum, isDecision);

           // --- Narrative Sound Trigger (Expanded) ---
           const text = (beat.scene + " " + (beat.caption||"") + " " + (beat.dialogue||"")).toLowerCase();
           
           if (text.match(/(punch|hit|crash|slam|boom|fight|attack|break|smash|thud|kick|impact)/)) {
               SoundEngine.playImpact();
           } else if (text.match(/(voice|sing|scream|shout|magic|power|glow|float|energy|wave|song|vibe)/)) {
               SoundEngine.playMagic();
           } else if (text.match(/(hack|code|type|computer|screen|glitch|data|cyber|download|virus|server|login)/)) {
               SoundEngine.playCyber();
           } else if (text.match(/(phone|text|message|viral|notification|ping|alert|trend|live|stream)/)) {
               SoundEngine.playNotification();
           } else if (text.match(/(run|drive|car|speed|fast|zoom|chase|fly|flee|escape)/)) {
               SoundEngine.playSpeed();
           } else if (text.match(/(dark|shadow|scared|trap|danger|quiet|creep|eerie|threat|die|kill|blood)/)) {
               SoundEngine.playSuspense();
           }
      }

      updateFaceState(faceId, { narrative: beat, choices: beat.choices, isDecisionPage: isDecision });
      const url = await generateImage(beat, type);
      if (url) SoundEngine.playGlitch(); // Minimal glitch on successful render
      updateFaceState(faceId, { imageUrl: url, isLoading: false });
  };

  const generateBatch = async (startPage: number, count: number) => {
      const pagesToGen: number[] = [];
      for (let i = 0; i < count; i++) {
          const p = startPage + i;
          if (p <= TOTAL_PAGES && !generatingPages.current.has(p)) {
              pagesToGen.push(p);
          }
      }
      
      if (pagesToGen.length === 0) return;
      pagesToGen.forEach(p => generatingPages.current.add(p));

      const newFaces: ComicFace[] = [];
      pagesToGen.forEach(pageNum => {
          const type = pageNum === BACK_COVER_PAGE ? 'back_cover' : 'story';
          newFaces.push({ id: `issue-${issueNumber}-page-${pageNum}`, type, choices: [], isLoading: true, pageIndex: pageNum });
      });

      setComicFaces(prev => {
          const existing = new Set(prev.map(f => f.id));
          return [...prev, ...newFaces.filter(f => !existing.has(f.id))];
      });
      newFaces.forEach(f => { if (!historyRef.current.find(h => h.id === f.id)) historyRef.current.push(f); });

      try {
          for (const pageNum of pagesToGen) {
               await generateSinglePage(`issue-${issueNumber}-page-${pageNum}`, pageNum, pageNum === BACK_COVER_PAGE ? 'back_cover' : 'story');
               generatingPages.current.delete(pageNum);
          }
      } catch (e) {
          console.error("Batch generation error", e);
      } finally {
          pagesToGen.forEach(p => generatingPages.current.delete(p));
      }
  }

  const launchEpisode = async (theme: StoryTheme) => {
    SoundEngine.playBassDrop(); // Init audio context on user gesture
    const hasKey = await validateApiKey();
    if (!hasKey) return;
    
    currentThemeRef.current = theme;
    setIsTransitioning(true);
    setLoadingMessage("INITIALIZING GHOST & C-CELL PROTOCOL...");

    // 1. Generate Cast if needed
    if (!heroRef.current) {
        setLoadingMessage("CASTING: GHOST (THE VOICE)...");
        try {
            const ghost = await generatePersona(CHARACTERS.GHOST.desc);
            setHero(ghost);
        } catch (e) {
            setIsTransitioning(false);
            return;
        }
    }
    if (!friendRef.current) {
        setLoadingMessage("CASTING: C-CELL (THE BRAINS)...");
        try {
            const ccell = await generatePersona(CHARACTERS.CCELL.desc);
            setFriend(ccell);
        } catch (e) {
            setIsTransitioning(false);
            return;
        }
    }

    setLoadingMessage(`DROPPING EPISODE: ${theme.title.toUpperCase()}...`);

    // 2. Setup Book
    const coverFace: ComicFace = { id: `issue-${issueNumber}-cover`, type: 'cover', choices: [], isLoading: true, pageIndex: 0 };
    setComicFaces([coverFace]);
    historyRef.current = [coverFace]; 
    generatingPages.current.clear();
    generatingPages.current.add(0);

    // 3. Start
    generateSinglePage(`issue-${issueNumber}-cover`, 0, 'cover').finally(() => generatingPages.current.delete(0));
    
    setTimeout(async () => {
        setIsStarted(true);
        setShowSetup(false);
        setIsTransitioning(false);
        await generateBatch(1, INITIAL_PAGES);
        generateBatch(3, 3);
        SoundEngine.playSuccess();
    }, 1500);
  };

  const handleChoice = async (pageIndex: number, choice: string) => {
      SoundEngine.playClick();
      updateFaceState(`issue-${issueNumber}-page-${pageIndex}`, { resolvedChoice: choice });
      const maxPage = Math.max(...historyRef.current.map(f => f.pageIndex || 0));
      if (maxPage + 1 <= TOTAL_PAGES) {
          generateBatch(maxPage + 1, BATCH_SIZE);
      }
  }

  const startNextEpisode = () => {
      SoundEngine.playBassDrop();
      // Summarize previous context
      const lastSummary = historyRef.current
        .filter(f => f.type === 'story')
        .map(f => f.narrative?.scene).join(" -> ");
      
      showContextRef.current = `PREVIOUSLY: ${lastSummary}. ISSUE #${issueNumber} ENDED ON CLIFFHANGER.`;
      
      setIssueNumber(prev => prev + 1);
      setIsStarted(false);
      setShowSetup(true);
      setComicFaces([]);
      setCurrentSheetIndex(0);
      currentThemeRef.current = null;
  };

  const resetRun = async () => {
      SoundEngine.playGlitch();
      if(confirm("DELETE SAVE FILE? THIS WILL ERASE GHOST & C-CELL.")) {
          await Storage.clearState();
          window.location.reload();
      }
  }

  const downloadPDF = () => {
    SoundEngine.playClick();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [480, 720] });
    const pagesToPrint = comicFaces.filter(face => face.imageUrl && !face.isLoading).sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));
    pagesToPrint.forEach((face, index) => {
        if (index > 0) doc.addPage([480, 720], 'portrait');
        if (face.imageUrl) doc.addImage(face.imageUrl, 'JPEG', 0, 0, 480, 720);
    });
    doc.save(`Ghost_and_CCell_Issue_${issueNumber}.pdf`);
  };

  const handleSheetClick = (index: number) => {
      if (!isStarted) return;
      if (index === 0 && currentSheetIndex === 0) return;
      
      if (index < currentSheetIndex) {
          setCurrentSheetIndex(index);
          SoundEngine.playPageFlip();
      }
      else if (index === currentSheetIndex && comicFaces.find(f => f.pageIndex === index)?.imageUrl) {
          setCurrentSheetIndex(prev => prev + 1);
          SoundEngine.playPageFlip();
      }
  };

  if (!isDataLoaded) return <div className="bg-black h-screen flex items-center justify-center text-[#D8B4FE] font-mono animate-pulse">BOOTING SEQUENCE...</div>;

  return (
    <div className="comic-scene">
      {showApiKeyDialog && <ApiKeyDialog onContinue={() => { SoundEngine.playClick(); handleApiKeyDialogContinue(); }} />}
      
      <Setup 
          show={showSetup}
          isTransitioning={isTransitioning}
          loadingMessage={loadingMessage}
          issueNumber={issueNumber}
          onLaunch={launchEpisode}
          onReset={resetRun}
      />
      
      <Book 
          comicFaces={comicFaces}
          currentSheetIndex={currentSheetIndex}
          isStarted={isStarted}
          isSetupVisible={showSetup && !isTransitioning}
          onSheetClick={handleSheetClick}
          onChoice={handleChoice}
          onOpenBook={() => { SoundEngine.playPageFlip(); setCurrentSheetIndex(1); }}
          onDownload={downloadPDF}
          onReset={startNextEpisode}
      />
    </div>
  );
};

export default App;
