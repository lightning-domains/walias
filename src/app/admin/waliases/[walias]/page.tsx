"use client";

import useDomains from "@/features/domains/hooks/use-domains";
import WaliasSettings from "@/features/waliases/components/walias-settings";
import { useParams } from "next/navigation";

export default function WaliasSettingsPage() {
  const { currentDomain } = useDomains();
  const { walias } = useParams();

  if (!currentDomain) {
    return <div>No domain</div>;
  }
  return (
    <>
      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Walias settings</h1>
      </div>
      <div className='flex flex-1 rounded-lg border border-dashed shadow-sm w-full pt-4'>
        <WaliasSettings walias={walias as string} domain={currentDomain} />
      </div>
    </>
  );
}
