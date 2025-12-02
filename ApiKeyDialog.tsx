
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface ApiKeyDialogProps {
  onContinue: () => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-mono">
      <div className="relative max-w-lg w-full bg-black border-2 border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.3)] p-8">
        
        <h2 className="text-4xl text-[#39FF14] mb-4 uppercase tracking-wide leading-none font-bold">
          ACCESS DENIED
        </h2>
        
        <p className="text-white mb-6 leading-relaxed">
          Yo, producer. To run the <span className="text-[#39FF14]">Ghost & C-Cell protocol</span>, you need a paid API Key. The simulation ain't free.
        </p>

        <div className="bg-gray-900 border border-gray-700 p-4 mb-6">
             <p className="text-xs text-gray-400">
                Gemini 3 Pro Image Preview requires a billing-enabled project. 
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-white underline ml-2">Check Docs</a>
             </p>
        </div>

        <button 
          onClick={onContinue}
          className="w-full bg-[#39FF14] text-black text-xl px-8 py-4 font-bold hover:bg-white transition-colors uppercase"
        >
          AUTHENTICATE
        </button>
        
        <p className="text-center text-[10px] text-gray-600 mt-4">ERROR: PAYWALL_FIREWALL_ACTIVE</p>
      </div>
    </div>
  );
};
