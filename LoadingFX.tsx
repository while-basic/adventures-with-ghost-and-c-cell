
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

const LOADING_FX = [
    "POW!", "BAM!", "ZAP!", "KRAK!", "SKREEE!", 
    "WHOOSH!", "THWIP!", "BOOM!", "GLITCH!", "HYPE!", 
    "LOADING...", "BUFFERING...", "VIRAL!", "DROP!", "BASS!"
];

export const LoadingFX: React.FC = () => {
    const [particles, setParticles] = useState<{id: number, text: string, x: string, y: string, rot: number, color: string}[]>([]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            const id = Date.now();
            const text = LOADING_FX[Math.floor(Math.random() * LOADING_FX.length)];
            const x = `${10 + Math.random() * 80}%`;
            const y = `${10 + Math.random() * 80}%`;
            const rot = Math.random() * 60 - 30;
            // Purple, White, and slight accents
            const colors = ['text-[#D8B4FE]', 'text-white', 'text-purple-400', 'text-fuchsia-300', 'text-gray-200'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            setParticles(prev => [...prev, { id, text, x, y, rot, color }].slice(-6));
        }, 300); // Faster interval for more seamless feeling
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full bg-[#0a0510] overflow-hidden relative border-r-4 border-gray-800">
            <style>{`
              @keyframes comic-pop {
                  0% { transform: translate(-50%, -50%) scale(0.2) rotate(var(--rot)); opacity: 0; }
                  15% { transform: translate(-50%, -50%) scale(1.4) rotate(var(--rot)); opacity: 1; }
                  30% { transform: translate(-50%, -50%) scale(1.0) rotate(var(--rot)); opacity: 1; }
                  85% { opacity: 1; }
                  100% { transform: translate(-50%, -50%) scale(1.1) rotate(var(--rot)); opacity: 0; }
              }
              @keyframes scanline {
                  0% { transform: translateY(-100%); }
                  100% { transform: translateY(100%); }
              }
            `}</style>
            
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
            </div>
            
            {/* Scanline */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent h-full w-full pointer-events-none animate-[scanline_2s_linear_infinite]"></div>

            {particles.map(p => (
                <div key={p.id} 
                     className={`absolute font-comic text-4xl md:text-6xl font-bold ${p.color} select-none whitespace-nowrap z-10`}
                     style={{ 
                         left: p.x, 
                         top: p.y, 
                         '--rot': `${p.rot}deg`, 
                         animation: 'comic-pop 1.2s forwards ease-out', 
                         textShadow: '3px 3px 0px #4c1d95, 0 0 15px rgba(216, 180, 254, 0.5)' 
                     } as React.CSSProperties}>
                    {p.text}
                </div>
            ))}
            
            <div className="absolute bottom-12 inset-x-0 text-center">
                 <p className="font-mono text-xl text-[#D8B4FE] animate-pulse tracking-widest">GENERATING...</p>
                 <div className="w-32 h-1 bg-gray-800 mx-auto mt-2 overflow-hidden rounded">
                    <div className="h-full bg-[#D8B4FE] animate-[width_1s_ease-in-out_infinite]" style={{width: '50%'}}></div>
                 </div>
            </div>
        </div>
    );
};
