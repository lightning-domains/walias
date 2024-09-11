import { WalletProvider } from "./wallet";

export interface Walias {
  name: string;
  pubkey: string;
  domain: string;
  nip05: boolean;
  lud16: WaliasLud16Status;
  providers: WalletProvider[];
}

export type WaliasLud16Status = "walias" | "external" | "absent";
