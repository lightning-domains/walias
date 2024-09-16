import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AtSignIcon, RefreshCw, Trash2, Unlink } from "lucide-react";
import { DomainItem } from "@/types/domain";
import { useProfile } from "nostr-hooks";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

type ProviderKey = "alby" | "laWallet" | "lndHub";

interface WaliasSettingsProps {
  walias: string;
  domain: DomainItem;
}
export default function WaliasSettings({
  walias,
  domain,
}: WaliasSettingsProps) {
  const { userPubkey } = useAuth();
  const { profile } = useProfile({ pubkey: userPubkey! });

  const [providers, setProviders] = useState({
    alby: true,
    laWallet: true,
    lndHub: true,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleToggle = (provider: ProviderKey | "all") => {
    if (provider === "all") {
      const allEnabled = !Object.values(providers).every(Boolean);
      setProviders({
        alby: allEnabled,
        laWallet: allEnabled,
        lndHub: allEnabled,
      });
    } else {
      setProviders((prev) => ({ ...prev, [provider]: !prev[provider] }));
    }
  };

  const allEnabled = Object.values(providers).every(Boolean);

  const handleUpdate = async () => {
    setIsUpdating(true);
    // Simulate an API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    // Simulate an API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRemoving(false);
  };

  useEffect(() => {
    if (!domain.apiEndpoint) {
      setProviders({
        alby: false,
        laWallet: false,
        lndHub: false,
      });
    }
  }, [domain.apiEndpoint]);

  return (
    <div className='container p-6 space-y-6 bg-background rounded-lg shadow-md mx-auto max-w-[600px] items-center flex flex-col'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='flex justify-center items-center space-x-4'>
          <div className='rounded-full p-2 bg-white dark:bg-blue-950 shadow-xl'>
            <Avatar className='h-20 w-20'>
              <AvatarImage src={profile?.image || ""} alt='Avatar 1' />
              <AvatarFallback>A1</AvatarFallback>
            </Avatar>
          </div>
          <AtSignIcon className='stroke-blue-500 h-14 w-14 text-primary p-2 bg-white dark:bg-blue-950 shadow-2xl dark:drop-shadow-[0_10px_50px_rgba(100,100,100,0.7)] rounded-full' />
          <div className='rounded-full p-2 bg-white dark:bg-blue-950 shadow-xl'>
            <Avatar className='h-20 w-20'>
              <AvatarImage src={domain.logo} alt='Avatar 2' />
              <AvatarFallback>A2</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className='flex flex-col items-center px-4 py-2 gap-2'>
          <div className='text-2xl font-bold'>
            {walias}
            <span className='text-blue-500'>@</span>
            <span className='text-gray-500'>{domain.name}</span>
          </div>
          <div className='border-t-2 drop-shadow-lg w-full m-auto h-2 px-12'></div>
        </div>
      </div>

      {!domain.apiEndpoint && (
        <Alert>
          <Unlink className='h-6 w-6' />
          <div className='ml-2'>
            <AlertTitle>Not a Lightning Domain</AlertTitle>
            <AlertDescription>
              <p>
                <b>{domain.title}</b> needs to implement Lightning Domains to
                enable Wallet Providers. .
              </p>
              <p>
                <Badge variant='default'>Learn More</Badge>
              </p>
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className='w-full max-w-[400px] relative h-full group'>
        <div
          className={cn(
            "space-y-4",
            !domain.apiEndpoint && "group-hover:opacity-30"
          )}
        >
          <h3 className='text-lg font-semibold text-foreground'>
            Wallet Providers{" "}
            <Link href={"/admin/settings/providers"}>
              <Badge>Edit</Badge>
            </Link>
          </h3>
          <div className='flex items-center justify-between pb-2 border-b'>
            <Label
              htmlFor='enable-all'
              className={cn(
                "font-semibold cursor-pointer text-base",
                !allEnabled && "text-slate-400"
              )}
            >
              Enable All
            </Label>
            <Switch
              id='enable-all'
              checked={allEnabled}
              disabled={isUpdating || isRemoving || !domain.apiEndpoint}
              onCheckedChange={() => handleToggle("all")}
            />
          </div>
          <div className='flex items-center justify-between'>
            <Label
              htmlFor='alby'
              className={cn(
                "text-base cursor-pointer",
                !providers.alby && "text-slate-400"
              )}
            >
              Alby
            </Label>
            <Switch
              id='alby'
              checked={providers.alby}
              disabled={isUpdating || isRemoving || !domain.apiEndpoint}
              onCheckedChange={() => handleToggle("alby")}
            />
          </div>
          <div className='flex items-center justify-between'>
            <Label
              htmlFor='laWallet'
              className={cn(
                "text-base cursor-pointer",
                !providers.laWallet && "text-slate-400"
              )}
            >
              LaWallet
            </Label>
            <Switch
              id='laWallet'
              checked={providers.laWallet}
              disabled={isUpdating || isRemoving || !domain.apiEndpoint}
              onCheckedChange={() => handleToggle("laWallet")}
            />
          </div>
          <div className='flex items-center justify-between'>
            <Label
              htmlFor='lndHub'
              className={cn(
                "text-base cursor-pointer",
                !providers.lndHub && "text-slate-400"
              )}
            >
              LndHub
            </Label>
            <Switch
              id='lndHub'
              checked={providers.lndHub}
              disabled={isUpdating || isRemoving || !domain.apiEndpoint}
              onCheckedChange={() => handleToggle("lndHub")}
            />
          </div>
        </div>
        {!domain.apiEndpoint && (
          <div className='relative w-full h-full'>
            <div className='absolute w-full translate-y-[-100%] h-[130px] bg-gradient-to-t from-white to-transparent group-hover:from-gray-100'>
              <div className='h-full w-full flex justify-center items-center opacity-0 group-hover:opacity-100'>
                <Button>Make {domain.title} support Lightning Domains</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='flex space-x-2 w-full max-w-[400px]'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleRemove}
          disabled={isRemoving || isUpdating}
        >
          {isRemoving ? (
            <>
              <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
              Removing...
            </>
          ) : (
            <>
              <Trash2 className='h-4 w-4' />
            </>
          )}
        </Button>
        <Button
          className='flex-1'
          onClick={handleUpdate}
          disabled={isUpdating || isRemoving}
        >
          {isUpdating ? (
            <>
              <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
              Updating...
            </>
          ) : (
            "Update"
          )}
        </Button>
      </div>
    </div>
  );
}
