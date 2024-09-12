"use client";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/DKdQvvw8RV5
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import Logo from "@/components/shared/logo/logo";

export default function Home() {
  const router = useRouter();

  const { loginWithExtension, userPubkey } = useAuth();

  useEffect(() => {
    if (userPubkey) {
      router.push("/admin");
    }
  }, [router, userPubkey]);

  return (
    <div className='flex flex-col min-h-dvh'>
      <main className='flex-1 main-bg'>
        <section className='w-full py-12 md:py-20 lg:py-24 border-y'>
          <div className='flex justify-center items-center mb-6 md:mb-12 lg:mb-24'>
            <Logo />
          </div>

          <div className='container px-4 md:px-6 space-y-10 xl:space-y-16'>
            <div className='grid max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16'>
              <div>
                <h1 className='lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]'>
                  Set up your Lightning Domain
                </h1>
                <p className='mx-auto max-w-[700px] text-muted-foreground md:text-xl'>
                  Easily create a custom domain for your Lightning Network
                  payments.
                </p>
              </div>
              <div className='flex flex-col items-start space-y-4'>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className='w-full'>Start Setup</Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[500px]'>
                    <DialogHeader>
                      <DialogTitle>Set up your Lightning Domain</DialogTitle>
                      <DialogDescription>
                        Enter the details below to create your custom Lightning
                        Domain.
                      </DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                      <div className='grid gap-2'>
                        <Label htmlFor='domain'>Domain Name</Label>
                        <Input
                          id='domain'
                          type='text'
                          placeholder='example.lightning'
                        />
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='pubkey'>Admin Pubkey</Label>
                        <Input
                          id='pubkey'
                          type='text'
                          placeholder='npub1234567...'
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type='submit'
                        onClick={() => {
                          loginWithExtension();
                          // router.push("/admin");
                        }}
                      >
                        Connect with Alby
                      </Button>
                      <div>
                        <Button variant='outline'>Cancel</Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className='flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t'>
        <p className='text-xs text-muted-foreground'>
          &copy; 2024 Lightning Domain. All rights reserved.
        </p>
        <nav className='sm:ml-auto flex gap-4 sm:gap-6'>
          <Link
            href='#'
            className='text-xs hover:underline underline-offset-4'
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href='#'
            className='text-xs hover:underline underline-offset-4'
            prefetch={false}
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
