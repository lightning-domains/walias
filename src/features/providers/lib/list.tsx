import { Skeleton } from "@/components/ui/skeleton";
import { WalletProvider } from "@/types/wallet";
import dynamic from "next/dynamic";

const providers: WalletProvider[] = [
  {
    name: "Binance",
    canReceive: true,
    category: "exchange",
    soon: true,
  },
  {
    name: "Bitget",
    canReceive: true,
    category: "exchange",
    soon: true,
  },
  {
    name: "Bitfinex",
    canReceive: true,
    category: "exchange",
    soon: true,
  },
  {
    name: "Ripio",
    canReceive: true,
    hasLUD16: true,
    category: "exchange",
    soon: true,
  },
  {
    name: "LaWallet",
    canReceive: true,
    canSend: true,
    hasLUD16: true,
    hasNIP05: true,
    category: "wallet",
    setupComponent: dynamic(
      () => import("../components/providers/lawallet/setup-component"),
      {
        loading: () => <ComponentLoading />,
      }
    ),
  },
  {
    name: "LNBits",
    canReceive: true,
    canSend: true,
    hasLUD16: true,
    hasNIP05: true,
    category: "wallet",
    soon: true,
  },
  {
    name: "LND",
    canReceive: true,
    canSend: true,
    category: "wallet",
    soon: true,
  },
  {
    name: "LNC",
    canReceive: true,
    canSend: true,
    category: "wallet",
    soon: true,
  },
  {
    name: "Core Lightning",
    canReceive: true,
    canSend: true,
    category: "wallet",
    soon: true,
  },
  {
    name: "Citadel",
    canReceive: true,
    canSend: true,
    category: "wallet",
    soon: true,
  },
  {
    name: "Alby",
    canReceive: true,
    canSend: true,
    hasLUD16: true,
    category: "wallet",
    soon: true,
  },
  {
    name: "BTC Pay Server",
    canReceive: true,
    category: "wallet",
    soon: true,
  },
  {
    name: "Voltage",
    canReceive: true,
    canSend: true,
    category: "wallet",
    soon: true,
  },
  {
    name: "Blink",
    canReceive: true,
    canSend: true,
    category: "wallet",
    soon: true,
  },
  {
    name: "Bitcoin Jungle",
    canReceive: true,
    canSend: true,
    category: "wallet",
    soon: true,
  },
  {
    name: "LNDHub",
    canReceive: true,
    canSend: true,
    category: "wallet",
    soon: true,
  },
  {
    name: "Eclair",
    canReceive: true,
    canSend: true,
    category: "wallet",
    soon: true,
  },
  {
    name: "BOLT12",
    canReceive: true,
    canSend: true,
    category: "protocol",
    soon: true,
  },
  {
    name: "NWC",
    canReceive: true,
    canSend: true,
    category: "protocol",
    soon: true,
  },
  {
    name: "LUD06",
    canReceive: true,
    category: "protocol",
    soon: true,
  },
  {
    name: "LUD16",
    canReceive: true,
    hasLUD16: true,
    category: "protocol",
    soon: true,
  },
  {
    name: "NIP05",
    canReceive: true,
    hasNIP05: true,
    category: "protocol",
    soon: true,
  },
  {
    name: "CashuMint",
    canReceive: true,
    canSend: true,
    category: "protocol",
    soon: true,
  },
  {
    name: "FixedFloat",
    canReceive: true,
    category: "swap",
    soon: true,
  },
  {
    name: "SimpleSwap",
    canReceive: true,
    category: "swap",
    soon: true,
  },
];

function ComponentLoading() {
  return (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-8 w-1/3' />
      <Skeleton className='h-8 w-1/2' />
      <div className='flex flex-row gap-4'>
        <Skeleton className='h-8 w-1/3' />
        <Skeleton className='h-8 w-2/3' />
      </div>
      <div className='flex flex-row gap-4'>
        <Skeleton className='h-8 w-1/4' />
        <Skeleton className='h-8 w-2/4' />
      </div>
      <Skeleton className='h-8 w-1/3' />
      <div className='flex flex-row gap-4'>
        <Skeleton className='h-8 w-3/4' />
        <Skeleton className='h-8 w-1/4' />
      </div>
    </div>
  );
}

export default providers;
