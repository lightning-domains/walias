import { Button } from "@/components/ui/button";

export default function NoWalias() {
  return (
    <div className='flex flex-col justify-center w-full h-full items-center gap-1 text-center'>
      <h3 className='text-2xl font-bold tracking-tight'>
        You have no walias on this domain
      </h3>
      <p className='text-sm text-muted-foreground'>
        Click on <b>Add walias</b> to start.
      </p>
      <Button className='mt-4'>Add Walias</Button>
    </div>
  );
}
