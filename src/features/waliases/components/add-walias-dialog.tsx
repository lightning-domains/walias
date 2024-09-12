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

type HandleStatus = "TAKEN" | "YOURS" | "AVAILABLE" | null;

export interface AddWaliasDialog {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function AddWaliasDialog({
  open,
  onOpenChange,
}: AddWaliasDialog) {
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState<HandleStatus>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (handle) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const statuses: HandleStatus[] = ["TAKEN", "YOURS", "AVAILABLE"];
        setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setStatus(null);
    }
  }, [handle]);

  const getStatusAlert = () => {
    switch (status) {
      case "TAKEN":
        return (
          <Alert variant='destructive'>
            <XCircle className='h-4 w-4' />
            <AlertTitle>Unavailable</AlertTitle>
            <AlertDescription>
              This handle is already taken. Please choose another.
            </AlertDescription>
          </Alert>
        );
      case "YOURS":
        return (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Already Yours</AlertTitle>
            <AlertDescription>
              You already own this handle. Click on <b>Add Walias</b>.
            </AlertDescription>
          </Alert>
        );
      case "AVAILABLE":
        return (
          <Alert variant='default' className='border-green-500 text-green-700'>
            <CheckCircle2 className='h-4 w-4' />
            <AlertTitle>Available</AlertTitle>
            <AlertDescription>
              This handle is available. You can claim it now.
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
        return "Add Walias";
      case "AVAILABLE":
        return "Claim";
      default:
        return "Check Availability";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Choose your wallet alias</DialogTitle>
        </DialogHeader>
        <div className='grid gap-2 py-2'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <div className='col-span-4 flex'>
              <Input
                className='flex-1 rounded-r-none'
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder='Enter your handle'
              />
              <span className='inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm'>
                @lacrypta
              </span>
            </div>
          </div>
          <div className='relative min-h-[5rem] transition-all duration-300 ease-in-out'>
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
        <div className='flex justify-end mt-2'>
          <Button
            type='button'
            disabled={
              !handle ||
              isLoading ||
              (status !== "AVAILABLE" && status !== "YOURS")
            }
          >
            {isLoading ? "Checking..." : getButtonLabel()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
