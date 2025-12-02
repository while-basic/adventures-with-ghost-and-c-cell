
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

interface SetupProps {
    show: boolean;
    isTransitioning: boolean;
    loadingMessage: string;
    issueNumber: number;
    onLaunch: () => void;
}

const Footer = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white py-2 px-6 flex justify-between items-center z-[300] border-t-2 border-[#39FF14] font-mono text-xs md:text-sm">
        <span className="text-[#39FF14] animate-pulse">SYSTEM_STATUS: ONLINE</span>
        <span className="opacity-50">PRODUCED BY GEMINI 3 PRO</span>
    </div>
  );
};

export const Setup: React.FC<SetupProps> = ({ show, isTransitioning, loadingMessage, issueNumber, onLaunch }) => {
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
          `}</style>
        
        <div className={`fixed inset-0 z-[200] overflow-hidden bg-black flex flex-col items-center justify-center p-4 transition-all duration-1000 ${isTransitioning ? 'scale-110 opacity-0 pointer-events-none' : 'opacity-100'}`}>
            
            {/* Background Noise */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%221%22/%3E%3C/svg%3E")'}}>
            </div>

            <div className="relative z-10 max-w-2xl w-full text-center border-4 border-white p-8 md:p-12 bg-black/80 backdrop-blur">
                <div className="mb-8">
                     <h2 className="font-mono text-[#39FF14] text-sm mb-2 tracking-[0.5em] uppercase">Infinite Series Generator</h2>
                     <h1 className="font-comic text-6xl md:text-8xl text-white leading-none glitch-text" style={{textShadow: '4px 4px 0px #39FF14'}}>
                         GHOST<br/>& C-CELL
                     </h1>
                     <p className="font-mono text-white text-xl mt-4 bg-[#39FF14] text-black inline-block px-4 py-1 font-bold transform -rotate-1">
                         VIRAL FREQUENCY
                     </p>
                </div>

                <div className="flex flex-col gap-6 items-center">
                     <div className="font-mono text-gray-400 text-sm max-w-md mx-auto leading-relaxed border-l-2 border-gray-600 pl-4 text-left">
                        <p className="mb-2"><strong>SUBJECT:</strong> Ghost (Voice) & C-Cell (Tech)</p>
                        <p className="mb-2"><strong>MISSION:</strong> Survive high school, dodge the Algorithm, and go viral without crashing reality.</p>
                        <p><strong>STATUS:</strong> Ready to generate new procedural episode.</p>
                     </div>

                     <button onClick={onLaunch} disabled={isTransitioning}
                        className="group relative bg-white text-black font-comic text-4xl px-12 py-6 hover:bg-[#39FF14] transition-all duration-200 uppercase tracking-widest border-2 border-transparent hover:border-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-wait">
                        {isTransitioning ? (
                            <span className="animate-pulse">{loadingMessage || "LOADING..."}</span>
                        ) : (
                            <span>DROP EPISODE {issueNumber}</span>
                        )}
                        <div className="absolute top-1 left-1 w-full h-full border-2 border-white -z-10 group-hover:top-2 group-hover:left-2 transition-all"></div>
                     </button>
                </div>
                
                <p className="mt-8 font-mono text-xs text-gray-600">
                    BY CELAYA SOLUTIONS • DO NOT SCREENSHOT • NFT NOT INCLUDED 😝
                </p>
            </div>
        </div>

        <Footer />
        </>
    );
}
