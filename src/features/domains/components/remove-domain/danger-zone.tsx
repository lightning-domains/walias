"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Domain, DomainItem } from "@/types/domain";

interface TagProps {
  alias: string;
  isSelected: boolean;
  onClick: () => void;
}

const Tag: React.FC<TagProps> = ({ alias, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`m-0.5 px-2 py-0.5 rounded-full text-sm font-semibold transition-colors ${
      isSelected
        ? "bg-gray-600 text-white"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`}
    aria-pressed={isSelected}
  >
    {alias}
  </button>
);

export default function DangerZone({ domain }: { domain: DomainItem }) {
  const [aliases, setAliases] = useState<string[]>([]);
  const [selectedAliases, setSelectedAliases] = useState<string[]>([]);

  const toggleAlias = (alias: string) => {
    setSelectedAliases((prev) =>
      prev.includes(alias) ? prev.filter((a) => a !== alias) : [...prev, alias]
    );
  };

  const isDeleteEnabled = aliases.every((alias) =>
    selectedAliases.includes(alias)
  );

  const handleDeleteDomain = () => {
    console.log("Deleting domain:", domain.title);
    setSelectedAliases([]);
  };

  useEffect(() => {
    setAliases(domain.waliases || []);
    setSelectedAliases([]);
  }, [domain]);

  return (
    <div className='container mx-auto p-4 max-w-[800px]'>
      <Card className='border-destructive'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-destructive'>Danger Zone</CardTitle>
          <CardDescription>
            Deleting your domain will permanently remove it and all associated
            data.
          </CardDescription>
        </CardHeader>
        <CardContent className='pb-2'>
          {aliases.length > 0 && (
            <div className='space-y-2'>
              <div>
                <h3 className='text-sm font-semibold mb-1'>
                  Select all aliases to confirm deletion:
                </h3>
                <div className='flex flex-wrap bg-gray-50 p-1 rounded-md'>
                  {aliases.map((alias) => (
                    <Tag
                      key={alias}
                      alias={alias}
                      isSelected={selectedAliases.includes(alias)}
                      onClick={() => toggleAlias(alias)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className='pt-2'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='destructive'
                disabled={!isDeleteEnabled}
                className='w-full'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Remove Domain
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the domain {domain.title} from this admin
                  dashboard and remove all associated data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteDomain}>
                  Remove Domain
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
