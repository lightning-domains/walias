import { Walias } from "@/types/walias";
import providers from "@/features/providers/lib/list";

export default [
  {
    name: "agustin",
    domain: "lacrypta.ar",
    nip05: true,
    lud16: "walias",
    providers: [
      providers.find((p) => p.name === "LaWallet")!,
      providers.find((p) => p.name === "Alby")!,
    ],
  },
  {
    name: "gorila",
    domain: "hodl.ar",
    nip05: true,
    lud16: "external",
    providers: [
      {
        name: "External",
        canReceive: true,
        category: "unknown",
      },
    ],
  },
  {
    name: "rapax",
    domain: "hodl.ar",
    nip05: true,
    lud16: "absent",
    providers: [],
  },
  {
    name: "ktyo",
    domain: "kytoo.ar",
    nip05: false,
    lud16: "absent",
    providers: [],
  },
] as Walias[];
