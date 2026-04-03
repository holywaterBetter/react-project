import {
  DEFAULT_DEV_USER_MODE_ID,
  DEV_USER_MODES,
  getDevUserModeById,
  type DevUserMode
} from '@features/auth/types/devUserMode';
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';

const STORAGE_KEY = 'enterprise-react-starter/dev-user-mode';

type DevUserModeContextValue = {
  activeUser: DevUserMode;
  availableModes: DevUserMode[];
  setActiveModeId: (id: string) => void;
};

const DevUserModeContext = createContext<DevUserModeContextValue | undefined>(undefined);

const readStoredModeId = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_DEV_USER_MODE_ID;
  }

  return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_DEV_USER_MODE_ID;
};

export const DevUserModeProvider = ({ children }: PropsWithChildren) => {
  const [activeModeId, setActiveModeId] = useState(() => readStoredModeId());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, activeModeId);
  }, [activeModeId]);

  const value = useMemo<DevUserModeContextValue>(
    () => ({
      activeUser: getDevUserModeById(activeModeId),
      availableModes: DEV_USER_MODES,
      setActiveModeId: (id: string) => {
        startTransition(() => {
          setActiveModeId(id);
        });
      }
    }),
    [activeModeId]
  );

  return <DevUserModeContext.Provider value={value}>{children}</DevUserModeContext.Provider>;
};

export const useDevUserMode = () => {
  const context = useContext(DevUserModeContext);

  if (!context) {
    throw new Error('useDevUserMode must be used within DevUserModeProvider');
  }

  return context;
};
