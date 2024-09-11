// create react context
import { useAuth } from "@/hooks/use-auth";
import { Domain, DomainItem } from "@/types/domain";
import { createContext, useCallback, useEffect, useState } from "react";

export interface DomainContextType {
  isLoading: boolean;
  domainList: DomainItem[];
  currentDomain: DomainItem | undefined;
  addDomainViaHandle: (
    handle: string,
    domain: Domain,
    isAdmin: boolean
  ) => void;
  setCurrentDomain: (domain: DomainItem) => void;
  refreshDomainList: () => void;
}

export const DomainContext = createContext<DomainContextType>({
  isLoading: true,
  domainList: [],
  currentDomain: undefined,
  setCurrentDomain: () => {},
  refreshDomainList: () => {},
  addDomainViaHandle: (_handle: string, _domain: Domain, _isAdmin: boolean) => {
    throw new Error("Function not ready.");
  },
});

interface DomainProviderProps {
  children: React.ReactNode;
}

export function DomainProvider({ children }: DomainProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDomain, setCurrentDomain] = useState<DomainItem>();
  const [domainList, setDomainList] = useState<DomainItem[]>([]);

  const { userPubkey } = useAuth();

  const refreshDomainList = useCallback(async () => {
    setIsLoading(true);
    return fetch(`/api/domains/list`, {
      method: "POST",
      body: JSON.stringify({ nostr: "event" }),
    })
      .then((res) => res.json())
      .then((res) => {
        setDomainList(res.data);
        return res.data;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const addDomainViaHandle = useCallback(
    (handle: string, domain: Domain, isAdmin: boolean) => {
      const currentDomainIndex = domainList.findIndex(
        (d) => d.name === domain.name
      );

      if (currentDomainIndex === -1) {
        console.info("Domain not found, adding new domain");
        domainList.push({ ...domain, isAdmin, waliases: [handle] });
      } else {
        const handleExist = domainList[currentDomainIndex].waliases.findIndex(
          (h) => h === handle
        );
        if (handleExist) {
          console.info("Handle already exist");
          return;
        }
        console.info("Pushing handle...");
        domainList[currentDomainIndex].waliases.push(handle);
      }
      setDomainList([...domainList]);
    },
    [domainList]
  );

  useEffect(() => {
    if (!userPubkey) {
      setCurrentDomain(undefined);
      setDomainList([]);
      return;
    }
    refreshDomainList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPubkey]);

  // Auto select
  useEffect(() => {
    if (!currentDomain && domainList.length > 0) {
      console.info("domainList:");
      console.dir(domainList);
      setCurrentDomain(domainList[0]);
    }
  }, [currentDomain, domainList]);

  return (
    <DomainContext.Provider
      value={{
        isLoading,
        domainList,
        currentDomain,
        addDomainViaHandle,
        setCurrentDomain,
        refreshDomainList,
      }}
    >
      {children}
    </DomainContext.Provider>
  );
}
