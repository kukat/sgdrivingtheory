import { createContext, useContext, type ReactNode } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStorage } from '@/hooks/use-storage';
import { isSkinId, resolveSkin, type ResolvedSkin, type SkinId } from '@/theme/skins';

const SKIN_KEY = 'driving-bible.skin';

type SkinContextValue = {
  skinId: SkinId;
  setSkinId: (id: SkinId) => void;
  skin: ResolvedSkin;
};

const SkinContext = createContext<SkinContextValue | null>(null);

export function SkinProvider({ children }: { children: ReactNode }) {
  const osScheme = useColorScheme();
  const [stored, setStored] = useStorage<string>(SKIN_KEY, 'system');
  const skinId: SkinId = isSkinId(stored) ? stored : 'system';
  const skin = resolveSkin(skinId, osScheme);

  return (
    <SkinContext.Provider
      value={{ skinId, setSkinId: (id) => setStored(id), skin }}>
      {children}
    </SkinContext.Provider>
  );
}

export function useSkin(): SkinContextValue {
  const value = useContext(SkinContext);
  if (!value) {
    throw new Error('useSkin must be used inside SkinProvider');
  }
  return value;
}
