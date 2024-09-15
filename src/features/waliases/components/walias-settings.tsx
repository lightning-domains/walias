import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusIcon, RefreshCw, Trash2 } from "lucide-react";
import { DomainItem } from "@/types/domain";
import { useProfile } from "nostr-hooks";
import { useAuth } from "@/hooks/use-auth";

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
    alby: false,
    laWallet: false,
    lndHub: false,
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

  return (
    <div className='p-6 space-y-6 bg-background rounded-lg shadow-md max-w-md mx-auto'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='flex justify-center items-center space-x-4'>
          <Avatar className='h-20 w-20'>
            <AvatarImage src={profile?.image || ""} alt='Avatar 1' />
            <AvatarFallback>A1</AvatarFallback>
          </Avatar>
          <PlusIcon className='h-8 w-8 text-primary' />
          <Avatar className='h-20 w-20'>
            <AvatarImage src={domain.logo} alt='Avatar 2' />
            <AvatarFallback>A2</AvatarFallback>
          </Avatar>
        </div>
        <span className='text-3xl font-bold text-primary'>
          {walias}@{domain.name}
        </span>
      </div>

      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-foreground'>
          Wallet Providers
        </h3>
        <div className='flex items-center justify-between pb-2 border-b'>
          <Label
            htmlFor='enable-all'
            className='text-base font-semibold cursor-pointer'
          >
            Enable All
          </Label>
          <Switch
            id='enable-all'
            checked={allEnabled}
            onCheckedChange={() => handleToggle("all")}
          />
        </div>
        <div className='flex items-center justify-between'>
          <Label htmlFor='alby' className='text-base cursor-pointer'>
            Alby
          </Label>
          <Switch
            id='alby'
            checked={providers.alby}
            onCheckedChange={() => handleToggle("alby")}
          />
        </div>
        <div className='flex items-center justify-between'>
          <Label htmlFor='laWallet' className='text-base cursor-pointer'>
            LaWallet
          </Label>
          <Switch
            id='laWallet'
            checked={providers.laWallet}
            onCheckedChange={() => handleToggle("laWallet")}
          />
        </div>
        <div className='flex items-center justify-between'>
          <Label htmlFor='lndHub' className='text-base cursor-pointer'>
            LndHub
          </Label>
          <Switch
            id='lndHub'
            checked={providers.lndHub}
            onCheckedChange={() => handleToggle("lndHub")}
          />
        </div>
      </div>

      <div className='flex space-x-2'>
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
              <Trash2 className='mr-2 h-4 w-4' />
              Remove
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
