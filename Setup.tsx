
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { STORY_THEMES, StoryTheme } from './types';
import { SoundEngine } from './SoundEngine';

interface SetupProps {
    show: boolean;
    isTransitioning: boolean;
    loadingMessage: string;
    issueNumber: number;
    onLaunch: (theme: StoryTheme) => void;
    onReset: () => void;
}

const Footer = ({ onReset }: { onReset: () => void }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white py-2 px-6 flex justify-between items-center z-[300] border-t border-[#D8B4FE] font-mono text-xs md:text-sm">
        <span className="text-[#D8B4FE] animate-pulse">SYSTEM_STATUS: ONLINE</span>
        <div className="flex gap-4">
             <button onClick={onReset} className="text-red-400 hover:text-red-200 uppercase text-[10px]">Reset Save</button>
             <span className="opacity-50">POWERED BY GEMINI 2.0 FLASH</span>
        </div>
    </div>
  );
};

export const Setup: React.FC<SetupProps> = ({ show, isTransitioning, loadingMessage, issueNumber, onLaunch, onReset }) => {
    if (!show && !isTransitioning) return null;

    return (
        <>
        <style>{`
             @keyframes glitch {
               0% { transform: translate(0) }
               20% { transform: translate(-2px, 2px) }
               40% { transform: translate(-2px, -2px) }
               60% { transform: translate(2px, 2px) }
               80% { transform: translate(2px, -2px) }
               100% { transform: translate(0) }
             }
             .glitch-text { animation: glitch 2s infinite; }
             .theme-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(216, 180, 254, 0.3); }
          `}</style>
        
        <div className={`fixed inset-0 z-[200] overflow-y-auto bg-black flex flex-col items-center justify-start p-4 transition-all duration-1000 ${isTransitioning ? 'scale-110 opacity-0 pointer-events-none' : 'opacity-100'}`}>
            
            {/* Background Noise */}
            <div className="absolute inset-0 opacity-20 pointer-events-none fixed" 
                 style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%221%22/%3E%3C/svg%3E")'}}>
            </div>

            <div className="relative z-10 max-w-4xl w-full text-center mt-12 mb-12">
                <div className="mb-10">
                     <h2 className="font-mono text-[#D8B4FE] text-xs md:text-sm mb-2 tracking-[0.5em] uppercase">Infinite Series Generator</h2>
                     <h1 className="font-comic text-6xl md:text-8xl text-white leading-none glitch-text" style={{textShadow: '3px 3px 0px #7c3aed'}}>
                         GHOST<br/>& C-CELL
                     </h1>
                     <p className="font-mono text-black text-lg md:text-xl mt-4 bg-[#D8B4FE] inline-block px-4 py-1 font-bold transform -rotate-1 shadow-[4px_4px_0px_white]">
                         VIRAL FREQUENCY
                     </p>
                </div>

                {isTransitioning ? (
                     <div className="flex flex-col items-center justify-center h-64">
                        <div className="text-3xl font-comic text-[#D8B4FE] animate-pulse tracking-widest mb-4">
                            {loadingMessage || "INITIALIZING..."}
                        </div>
                        <div className="w-64 h-2 bg-gray-800 rounded overflow-hidden">
                             <div className="h-full bg-white animate-[width_2s_ease-in-out_infinite]" style={{width: '30%'}}></div>
                        </div>
                     </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <h3 className="font-mono text-white text-sm mb-6 uppercase tracking-widest border-b border-gray-800 pb-2">Select Plot For Issue #{issueNumber}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4">
                            {STORY_THEMES.map((theme) => (
                                <button 
                                    key={theme.id}
                                    onMouseEnter={() => SoundEngine.playHover()}
                                    onClick={() => onLaunch(theme)}
                                    className="theme-card group relative bg-gray-900 border border-gray-700 p-6 text-left hover:bg-[#1a1025] hover:border-[#D8B4FE] transition-all duration-200"
                                >
                                    <h4 className="font-comic text-2xl text-white mb-2 group-hover:text-[#D8B4FE]">{theme.title}</h4>
                                    <p className="font-mono text-xs text-gray-400 leading-relaxed">{theme.desc}</p>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[#D8B4FE] font-bold text-xl">
                                        &rarr;
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="mt-12 flex justify-center gap-8 opacity-50">
                    <div className="text-left">
                         <p className="font-mono text-[10px] text-gray-500 uppercase">Protagonist 01</p>
                         <p className="font-comic text-xl text-white">GHOST</p>
                    </div>
                    <div className="text-left">
                         <p className="font-mono text-[10px] text-gray-500 uppercase">Protagonist 02</p>
                         <p className="font-comic text-xl text-white">C-CELL</p>
                    </div>
                </div>
            </div>
        </div>

        <Footer onReset={onReset} />
        </>
    );
}
