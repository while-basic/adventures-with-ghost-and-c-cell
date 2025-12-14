
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ComicFace, INITIAL_PAGES, GATE_PAGE } from './types';
import { LoadingFX } from './LoadingFX';
import { SoundEngine } from './SoundEngine';

interface PanelProps {
    face?: ComicFace;
    allFaces: ComicFace[];
    onChoice: (pageIndex: number, choice: string) => void;
    onOpenBook: () => void;
    onDownload: () => void;
    onReset: () => void;
}

export const Panel: React.FC<PanelProps> = ({ face, allFaces, onChoice, onOpenBook, onDownload, onReset }) => {
    if (!face) return <div className="w-full h-full bg-black" />;
    if (face.isLoading && !face.imageUrl) return <LoadingFX />;
    
    const isFullBleed = face.type === 'cover' || face.type === 'back_cover';

    return (
        <div className={`panel-container relative group ${isFullBleed ? '!p-0 !bg-[#050505]' : ''}`}>
            <div className="gloss"></div>
            {face.imageUrl && <img src={face.imageUrl} alt="Comic panel" className={`panel-image ${isFullBleed ? '!object-cover' : ''}`} />}
            
            {/* Decision Buttons */}
            {face.isDecisionPage && face.choices.length > 0 && (
                <div className={`absolute bottom-0 inset-x-0 p-6 pb-12 flex flex-col gap-3 items-center justify-end transition-opacity duration-500 ${face.resolvedChoice ? 'opacity-0 pointer-events-none' : 'opacity-100'} bg-gradient-to-t from-black via-black/80 to-transparent z-20`}>
                    <p className="text-[#D8B4FE] font-mono text-xl uppercase tracking-widest animate-pulse bg-black px-2">Choose The Vibe</p>
                    {face.choices.map((choice, i) => (
                        <button key={i} 
                          onMouseEnter={() => SoundEngine.playHover()}
                          onClick={(e) => { e.stopPropagation(); if(face.pageIndex) onChoice(face.pageIndex, choice); }}
                          className={`comic-btn w-full py-4 text-xl font-bold tracking-wider uppercase border-2 ${i===0?'bg-[#D8B4FE] text-black border-black hover:bg-white':'bg-black text-white border-[#D8B4FE] hover:bg-gray-900'}`}>
                            {choice}
                        </button>
                    ))}
                </div>
            )}

            {/* Cover Action */}
            {face.type === 'cover' && (
                 <div className="absolute bottom-20 inset-x-0 flex justify-center z-20">
                     <button 
                      onMouseEnter={() => SoundEngine.playHover()}
                      onClick={(e) => { e.stopPropagation(); onOpenBook(); }}
                      disabled={!allFaces.find(f => f.pageIndex === GATE_PAGE)?.imageUrl}
                      className="comic-btn bg-[#D8B4FE] text-black border-black px-10 py-4 text-3xl font-bold hover:scale-105 disabled:bg-gray-600 disabled:text-gray-400 disabled:border-gray-600 shadow-[4px_4px_0px_white]">
                         {(!allFaces.find(f => f.pageIndex === GATE_PAGE)?.imageUrl) ? `RENDERING...` : 'OPEN ISSUE'}
                     </button>
                 </div>
            )}

            {/* Back Cover Actions */}
            {face.type === 'back_cover' && (
                <div className="absolute bottom-24 inset-x-0 flex flex-col items-center gap-4 z-20">
                    <button 
                        onMouseEnter={() => SoundEngine.playHover()}
                        onClick={(e) => { e.stopPropagation(); onDownload(); }} 
                        className="comic-btn bg-white text-black border-black px-8 py-3 text-xl font-bold hover:scale-105 uppercase">
                        SAVE TO CAMERA ROLL
                    </button>
                    <button 
                        onMouseEnter={() => SoundEngine.playHover()}
                        onClick={(e) => { e.stopPropagation(); onReset(); }} 
                        className="comic-btn bg-[#D8B4FE] text-black border-black px-8 py-4 text-2xl font-bold hover:scale-105 uppercase animate-bounce shadow-[4px_4px_0px_white]">
                        DROP NEXT EPISODE 💀
                    </button>
                </div>
            )}
        </div>
    );
}
