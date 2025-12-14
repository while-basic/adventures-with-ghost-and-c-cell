
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComicFace, Persona, StoryTheme } from './types';

const DB_NAME = 'GhostCCellDB';
const STORE_NAME = 'session';
const VERSION = 1;
const LOCAL_STORAGE_KEY = 'GhostCCell_Backup';

interface AppState {
    issueNumber: number;
    hero: Persona | null;
    friend: Persona | null;
    comicFaces: ComicFace[];
    history: ComicFace[];
    showContext: string;
    currentTheme: StoryTheme | null;
}

export const Storage = {
    async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            // Check if IDB is available
            if (!('indexedDB' in window)) return reject("IDB not supported");

            const req = indexedDB.open(DB_NAME, VERSION);
            req.onupgradeneeded = (e) => {
                const db = (e.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async saveState(state: AppState) {
        // Strategy: Try IndexedDB (Full Save). If fail, LocalStorage (Text Only).
        try {
            const db = await this.openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(state, 'currentState');
            
            return new Promise<void>((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch (e) {
            console.warn("IndexedDB Save failed, falling back to LocalStorage (Text Only)", e);
            try {
                // Strip images for LocalStorage to avoid 5MB quota limit
                const lightState = {
                    ...state,
                    hero: state.hero ? { ...state.hero, base64: '' } : null,
                    friend: state.friend ? { ...state.friend, base64: '' } : null,
                    comicFaces: state.comicFaces.map(f => ({ ...f, imageUrl: undefined })),
                    // Keep history narratives but remove images if they exist there
                    history: state.history.map(f => ({ ...f, imageUrl: undefined }))
                };
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightState));
            } catch (lsError) {
                console.error("LocalStorage Save also failed", lsError);
            }
        }
    },

    async loadState(): Promise<AppState | null> {
        // Strategy: Try IndexedDB. If empty/fail, try LocalStorage.
        try {
            const db = await this.openDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get('currentState');
            
            const idbData = await new Promise<AppState | undefined>((resolve, reject) => {
                req.onsuccess = () => resolve(req.result as AppState);
                req.onerror = () => reject(req.error);
            });

            if (idbData) return idbData;
        } catch (e) {
            console.warn("IndexedDB Load failed/empty, checking LocalStorage", e);
        }

        // Fallback
        try {
            const lsData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (lsData) {
                return JSON.parse(lsData) as AppState;
            }
        } catch (e) {
            console.error("LocalStorage Load failed", e);
        }

        return null;
    },

    async clearState() {
        try {
            const db = await this.openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
        } catch(e) { /* ignore */ }
        
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
};
