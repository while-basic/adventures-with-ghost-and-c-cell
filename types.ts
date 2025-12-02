
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

export const THEME_COLOR = "#D8B4FE"; // Light Purple

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

export interface StoryTheme {
  id: string;
  title: string;
  desc: string;
}

export const CHARACTERS = {
  GHOST: {
    name: "Ghost",
    desc: "17yo African-American female rapper with long braids, wearing a white graphic tee, holding a smartphone and microphone, purple ambient lighting, studio setting, confident expression, masterpiece comic art style."
  },
  CCELL: {
    name: "C-Cell",
    desc: "17yo male producer, short hair, wearing a blue and white striped button-down shirt, sitting in a messy home studio with monitors, awkward tech genius vibe, masterpiece comic art style."
  }
};

export const STORY_THEMES: StoryTheme[] = [
  {
    id: "label_wars",
    title: "Label Wars",
    desc: "Ruthless executives. Contract traps. Artists forming covert alliances."
  },
  {
    id: "underground_circuit",
    title: "Underground Circuit",
    desc: "Illegal basement venues, hacker-DJs, sonic fight clubs."
  },
  {
    id: "sample_curse",
    title: "The Sample Curse",
    desc: "A forbidden sample unleashes a supernatural force."
  },
  {
    id: "neon_dystopia",
    title: "Neon Tour Dystopia",
    desc: "Artists fight through cyber-controlled venues to perform."
  },
  {
    id: "ai_rival",
    title: "AI vs Human",
    desc: "A synthetic star rises. One artist fights to preserve soul."
  }
];
