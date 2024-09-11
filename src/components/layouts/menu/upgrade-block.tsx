import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpgradeBlock({ isLoading }: { isLoading?: boolean }) {
  return isLoading ? (
    <Skeleton className='w-full h-32' />
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade to Pro</CardTitle>
        <CardDescription>
          Soon you&apos;ll be able to unlock new special features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button disabled={true} size='sm' className='w-full'>
          Upgrade
        </Button>
      </CardContent>
    </Card>
  );
}
