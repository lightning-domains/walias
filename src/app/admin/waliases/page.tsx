"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import WaliasesList from "@/features/waliases/components/waliases-list";
import useDomains from "@/features/domains/hooks/use-domains";
import NoWalias from "@/features/waliases/components/no-walias";
import waliases from "@/mocks/waliases";
import AddWaliasDialog from "@/features/waliases/components/add-walias-dialog/add-walias-dialog";

export default function WaliasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentDomain } = useDomains();

  if (!currentDomain) {
    return "Loading Domain";
  }

  if (waliases.length === 0) {
    return <NoWalias />;
  }

  return (
    <>
      <AddWaliasDialog
        open={isModalOpen}
        onOpenChange={() => setIsModalOpen(false)}
        domain={currentDomain}
      />
      <div className='flex items-center justify-between'>
        <h1 className='text-lg font-semibold md:text-2xl'>
          Walias @{currentDomain.name}
        </h1>
        <div>
          <Button
            size='sm'
            className='h-8 gap-1'
            onClick={() => setIsModalOpen(true)}
            disabled={!currentDomain.apiEndpoint}
          >
            <PlusCircle className='h-3.5 w-3.5' />
            <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
              Add new walias
            </span>
          </Button>
        </div>
      </div>

      <div
        className='flex flex-1 rounded-lg border border-dashed shadow-sm'
        x-chunk='dashboard-02-chunk-1'
      >
        <WaliasesList domain={currentDomain.name} />
      </div>
    </>
  );
}
