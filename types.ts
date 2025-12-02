
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const MAX_STORY_PAGES = 8;
export const BACK_COVER_PAGE = 9;
export const TOTAL_PAGES = 9;
export const INITIAL_PAGES = 2;
export const GATE_PAGE = 2;
export const BATCH_SIZE = 4;
export const DECISION_PAGES = [3, 7]; // Cliffhanger decision at the end

export interface ComicFace {
  id: string;
  type: 'cover' | 'story' | 'back_cover';
  imageUrl?: string;
  narrative?: Beat;
  choices: string[];
  resolvedChoice?: string;
  isLoading: boolean;
  pageIndex?: number;
  isDecisionPage?: boolean;
}

export interface Beat {
  caption?: string;
  dialogue?: string;
  scene: string;
  choices: string[];
  focus_char: 'hero' | 'friend' | 'other';
}

export interface Persona {
  base64: string;
  desc: string;
}

export const CHARACTERS = {
  GHOST: {
    name: "Ghost",
    desc: "17yo African-American female rapper, oversized streetwear hoodie, glowing white eyes, holding a vintage microphone, confident swagger, masterpiece comic art style."
  },
  CCELL: {
    name: "C-Cell",
    desc: "17yo skinny tech genius male, messy locs, wearing VR visor on forehead, sitting at multi-screen setup, cyberpunk aesthetic, masterpiece comic art style."
  }
};
