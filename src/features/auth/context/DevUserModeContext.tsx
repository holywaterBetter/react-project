import { mockUserApi } from '@api/mockUserApi';
import type { DevUserMode } from '@features/auth/types/devUserMode';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

type DevUserModeContextValue = {
  activeUser: DevUserMode;
  availableModes: DevUserMode[];
  isLoadingUsers: boolean;
  setActiveModeEmpNo: (empNo: number) => Promise<void>;
};

const DevUserModeContext = createContext<DevUserModeContextValue | undefined>(undefined);

const FALLBACK_USER: DevUserMode = {
  empNo: 17100208,
  name: '김삼성',
  nameEn: 'Holywater',
  role: 'GLOBAL_HR',
  divisionCode: 'C100001'
};

export const DevUserModeProvider = ({ children }: PropsWithChildren) => {
  const [activeUser, setActiveUser] = useState<DevUserMode>(FALLBACK_USER);
  const [availableModes, setAvailableModes] = useState<DevUserMode[]>([FALLBACK_USER]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      setIsLoadingUsers(true);

      try {
        const [users, current] = await Promise.all([mockUserApi.getUsers(), mockUserApi.getActiveUser()]);

        if (!mounted) {
          return;
        }

        setAvailableModes(users);
        setActiveUser(current);
      } finally {
        if (mounted) {
          setIsLoadingUsers(false);
        }
      }
    };

    void loadUsers();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<DevUserModeContextValue>(
    () => ({
      activeUser,
      availableModes,
      isLoadingUsers,
      setActiveModeEmpNo: async (empNo: number) => {
        const nextUser = await mockUserApi.setActiveUser(empNo);
        setActiveUser(nextUser);
      }
    }),
    [activeUser, availableModes, isLoadingUsers]
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
