"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { DomainItem } from "@/types/domain";
import ClaimDomain from "./claim-domain";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type HandleStatus = "TAKEN" | "YOURS" | "AVAILABLE" | "CLAIMING" | null;

export interface AddWaliasDialog {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  domain: DomainItem;
}

export default function AddWaliasDialog({
  open,
  onOpenChange,
  domain,
}: AddWaliasDialog) {
  const [walias, setWalias] = useState("");
  const [status, setStatus] = useState<HandleStatus>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (walias) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const statuses: HandleStatus[] = ["TAKEN", "YOURS", "AVAILABLE"];
        setStatus("AVAILABLE");
        // setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setStatus(null);
    }
  }, [walias]);

  useEffect(() => {
    if (open) {
      setWalias("");
      setStatus(null);
    }
  }, [open]);

  const getStatusAlert = () => {
    switch (status) {
      case "TAKEN":
        return (
          <Alert variant='destructive'>
            <XCircle className='h-4 w-4' />
            <AlertTitle>Unavailable</AlertTitle>
            <AlertDescription>
              This walias is already taken. Please choose another.
            </AlertDescription>
          </Alert>
        );
      case "YOURS":
        return (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Already Yours</AlertTitle>
            <AlertDescription>
              <p>You already own this walias.</p>
              <p>
                Click on <b>Add Walias</b>.
              </p>
            </AlertDescription>
          </Alert>
        );
      case "AVAILABLE":
        return (
          <Alert variant='default' className='border-green-500 text-green-700'>
            <CheckCircle2 className='h-4 w-4' />
            <AlertTitle>Available</AlertTitle>
            <AlertDescription>
              This walias is available. You can claim it now.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  const getButtonLabel = () => {
    switch (status) {
      case "TAKEN":
        return "Try Another";
      case "YOURS":
        return "Add walias";
      case "AVAILABLE":
        return "Claim walias";
      case "CLAIMING":
        return "Claim walias";
      default:
        return "Check Availability";
    }
  };

  const handleNext = () => {
    if (status === "YOURS") {
      // Add walias using addWalias
      // soon
      // page walias/[single]

      router.push(`/admin/waliases/${walias}`);
    } else if (status === "AVAILABLE") {
      // Claim walias
      setStatus("CLAIMING");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-full"
          // status === "CLAIMING" ? "h-[calc(100vh-20px)] p-0" : ""
        )}
      >
        <ScrollArea className='w-full'>
          {status === "CLAIMING" ? (
            <ClaimDomain domain={domain} walias={walias} />
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className='text-lg mt-2 mb-6'>
                  Add walias from {domain.title}
                </DialogTitle>
              </DialogHeader>
              <div className='flex flex-col gap-2'>
                <div className='col-span-4 flex px-1'>
                  <Input
                    className='flex-1 rounded-r-none'
                    value={walias}
                    onChange={(e) => setWalias(e.target.value)}
                    placeholder='Enter your walias'
                  />
                  <span className='inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm'>
                    {domain.name}
                  </span>
                </div>
                <div className='relative min-h-[5rem] transition-all duration-300 ease-in-out mt-2'>
                  <div
                    className={`absolute inset-0 flex justify-center items-center transition-opacity duration-300 ${
                      isLoading || !status ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {isLoading && <Loader2 className='animate-spin h-5 w-5' />}
                  </div>
                  <div
                    className={`transition-opacity duration-300 ${
                      !isLoading && status ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {getStatusAlert()}
                  </div>
                </div>
              </div>
              <div className='flex justify-end'>
                <Button
                  type='button'
                  disabled={
                    !walias ||
                    isLoading ||
                    (status !== "AVAILABLE" && status !== "YOURS")
                  }
                  onClick={handleNext}
                >
                  {isLoading ? "Checking..." : getButtonLabel()}
                </Button>
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
