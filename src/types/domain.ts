export interface Domain {
  title: string;
  name: string;
  logo: string;
  description?: string;
  apiEndpoint?: string;
  adminPubkey?: string;
  hasProfileJson?: boolean;
}

export interface DomainItem extends Domain {
  isAdmin: boolean;
  waliases: string[];
}
