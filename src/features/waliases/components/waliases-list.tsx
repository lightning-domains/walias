import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Wallet,
  MoreHorizontal,
  Edit,
  Webhook,
} from "lucide-react";

import waliases from "@/mocks/waliases";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface WaliasesListProps {
  domain: string;
}

export default function WaliasesList({ domain }: WaliasesListProps) {
  return (
    <Table>
      <TooltipProvider>
        <TableHeader>
          <TableRow>
            <TableHead>Walias</TableHead>
            <TableHead>NIP05</TableHead>
            <TableHead>LUD16</TableHead>
            <TableHead>Wallet Providers</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {waliases.map((walias, index) => (
            <TableRow key={index}>
              <TableCell className='font-medium'>{walias.name}</TableCell>
              <TableCell>
                <Tooltip>
                  {walias.nip05 ? (
                    <>
                      <TooltipTrigger>
                        <CheckCircle2 className='text-green-500' />
                      </TooltipTrigger>
                      <TooltipContent>Valid and working NIP05</TooltipContent>
                    </>
                  ) : (
                    <>
                      <TooltipTrigger>
                        <XCircle className='text-red-500' />
                      </TooltipTrigger>
                      <TooltipContent>
                        NIP05 not working or public key doesn&apos;t match
                      </TooltipContent>
                    </>
                  )}
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip>
                  {walias.lud16 === "walias" && (
                    <>
                      <TooltipTrigger>
                        <Wallet className='text-blue-500' />
                      </TooltipTrigger>
                      <TooltipContent>
                        Provided by a Walias instance (Lightning Domain)
                      </TooltipContent>
                    </>
                  )}
                  {walias.lud16 === "external" && (
                    <>
                      <TooltipTrigger>
                        <ExternalLink className='text-orange-500' />
                      </TooltipTrigger>
                      <TooltipContent>
                        Provided by an external service (non-Lightning Domain)
                      </TooltipContent>
                    </>
                  )}
                  {walias.lud16 === "absent" && (
                    <>
                      <TooltipTrigger>
                        <XCircle className='text-gray-500' />
                      </TooltipTrigger>
                      <TooltipContent>
                        LUD16 not responding or not present
                      </TooltipContent>
                    </>
                  )}
                </Tooltip>
              </TableCell>
              <TableCell>
                <div className='flex flex-wrap gap-1'>
                  {walias.providers.map((provider, idx) => (
                    <Badge key={idx} variant='secondary'>
                      {provider.name}
                    </Badge>
                  ))}
                  {walias.providers.length === 0 && (
                    <span className='text-gray-500 italic'>None</span>
                  )}
                </div>
              </TableCell>
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='h-8 w-8 p-0'>
                      <span className='sr-only'>Open menu</span>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem>
                      <Edit className='mr-2 h-4 w-4' />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Webhook className='mr-2 h-4 w-4' />
                      <span>Add Trigger</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TooltipProvider>
    </Table>
  );
}
