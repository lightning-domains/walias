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
import { Loader2, AlertCircle, XCircle, Trophy, Sparkles } from "lucide-react";
import { DomainItem } from "@/types/domain";
import ClaimDomain from "./claim-domain";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
          <div className='flex flex-col items-center justify-center py-6'>
            <div className='rounded-full p-2 bg-white shadow-xl mb-4'>
              <Avatar className='h-20 w-20'>
                <AvatarImage src={domain.logo || ""} alt={domain.title} />
                <AvatarFallback>
                  {domain.title.substring(0, 1).toLocaleUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <h2 className='text-2xl text-center mb-2'>
              <b>{walias}</b>
              <span className='text-blue-500'>@</span>
              <b>{domain.name}</b> is available!
            </h2>
            <p className='text-center mb-4'>
              Congratulations, the walias <b>{walias}</b> is free to claim!
              <p>
                You can instantly <b>Claim Walias</b>!
              </p>
            </p>
            <Sparkles className='h-8 w-8 text-purple-500 mb-4' />
            <p className='text-sm text-center text-gray-500'>
              Make it yours for <Badge>300 sats</Badge>
            </p>
          </div>
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
            >
              <DialogHeader>
                <DialogTitle className='text-lg mt-2 mb-6'>
                  Add walias at {domain.title}
                </DialogTitle>
              </DialogHeader>
              <div className='flex flex-col gap-2'>
                <div className='col-span-4 flex px-1 relative mb-4'>
                  <Input
                    className='flex-1 rounded-r-none text-lg'
                    value={walias}
                    onChange={(e) => setWalias(e.target.value)}
                    placeholder='Enter your walias'
                  />
                  <span className='absolute z-10 right-0 top-0 bottom-0 inline-flex px-4 mr-1 rounded-r-md border  border-gray-300 bg-gray-50 text-gray-500 text-lg flex-col items-center justify-center'>
                    @{domain.name}
                  </span>
                </div>
                {status !== null && (
                  <div className='relative min-h-[5rem] transition-all duration-300 ease-in-out mt-2'>
                    <div
                      className={`absolute inset-0 flex justify-center items-center transition-opacity duration-300 ${
                        isLoading || !status ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {isLoading && (
                        <Loader2 className='animate-spin h-5 w-5' />
                      )}
                    </div>
                    <div
                      className={`transition-opacity duration-300 ${
                        !isLoading && status ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {getStatusAlert()}
                    </div>
                  </div>
                )}
              </div>
              <div className='flex justify-end'>
                {walias && (
                  <Button
                    type='submit'
                    disabled={
                      !walias ||
                      isLoading ||
                      (status !== "AVAILABLE" && status !== "YOURS")
                    }
                  >
                    {isLoading ? "Checking..." : getButtonLabel()}
                  </Button>
                )}
              </div>
            </form>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
