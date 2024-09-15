"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Clock, Bitcoin, QrCode } from "lucide-react";
import { DomainItem } from "@/types/domain";
import { useRouter } from "next/navigation";

export interface PayInvoiceProps {
  domain: DomainItem;
  walias: string;
}

export default function PayInvoice({ domain, walias }: PayInvoiceProps) {
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [payReq, setPayReq] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePayment = () => {
    router.push(`/admin/waliases/${walias}`);
  };

  const requestInvoice = () => {
    setPayReq("asasd");
  };

  return (
    <div className='flex items-center justify-center p-4'>
      <div className='w-full max-w-4xl'>
        <div className='pb-4'>
          <div className='text-2xl font-bold text-center'>
            Buy walias from {domain.title}
          </div>
        </div>
        <div className='space-y-4 md:flex md:gap-8'>
          <div className='md:w-1/2 space-y-4'>
            <div className='flex flex-col items-center space-y-2'>
              <Image
                src={domain.logo}
                alt='Domain Avatar'
                width={100}
                height={100}
                className='rounded-full'
              />
              <span className='text-lg font-medium'>
                agustin@<span className='text-gray-500'>gorila</span>
              </span>
            </div>
            <div className='flex flex-col items-center space-y-1'>
              <div className='flex items-center space-x-2'>
                <Bitcoin className='h-5 w-5 text-orange-500' />
                <span className='text-2xl font-bold'>300 sats</span>
              </div>
              <span className='text-sm text-gray-500'>(USD 1)</span>
            </div>
          </div>
          <div className='md:w-1/2 flex flex-col items-center justify-center space-y-4'>
            <div className='relative'>
              <QrCode className='h-40 w-40 text-gray-800' />
              <div className='absolute inset-0 flex items-center justify-center'>
                <Button
                  onClick={requestInvoice}
                  variant='secondary'
                  size='sm'
                  className='z-10'
                >
                  Generar factura
                </Button>
              </div>
            </div>
            <div className='flex justify-center items-center space-x-2 text-orange-500'>
              <Clock className='h-5 w-5' />
              <span className='text-lg font-semibold'>
                Expires in: {formatTime(timeLeft)}
              </span>
            </div>
            <Button
              className='w-full text-lg'
              size='lg'
              onClick={handlePayment}
            >
              Pay Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
