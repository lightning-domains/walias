import { ComponentType } from "react";
import { SetupComponentProps } from "@/features/providers/types/setup";

export interface Wallet {
  display_name: string;
  provider: WalletProvider;
  config: Record<string, any>;
  canSend: boolean;
  canReceive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletProvider {
  name: string;
  category: WalletCategory;
  image?: string;
  canSend?: boolean;
  canReceive?: boolean;
  hasLUD16?: boolean;
  hasNIP05?: boolean;
  soon?: boolean;
  disabled?: boolean;
  setupComponent?: ComponentType<SetupComponentProps>;
}

export type WalletCategory =
  | "exchange"
  | "wallet"
  | "protocol"
  | "swap"
  | "unknown";
