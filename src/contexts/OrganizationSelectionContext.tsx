import { useOrganizations } from '@hooks/useOrganizations';
import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';

type OrganizationSelectionContextValue = ReturnType<typeof useOrganizations>;

const OrganizationSelectionContext = createContext<OrganizationSelectionContextValue | undefined>(undefined);

export const OrganizationSelectionProvider = ({ children }: PropsWithChildren) => {
  const value = useOrganizations();
  const memoizedValue = useMemo(() => value, [value]);

  return (
    <OrganizationSelectionContext.Provider value={memoizedValue}>{children}</OrganizationSelectionContext.Provider>
  );
};

export const useOrganizationSelection = () => {
  const context = useContext(OrganizationSelectionContext);

  if (!context) {
    throw new Error('useOrganizationSelection must be used within OrganizationSelectionProvider');
  }

  return context;
};
