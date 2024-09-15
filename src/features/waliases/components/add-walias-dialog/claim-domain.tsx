import { DomainItem } from "@/types/domain";
import PayInvoice from "./pay-invoice";

export interface ClaimDomainProps {
  domain: DomainItem;
  walias: string;
}

export default function ClaimDomain({ domain, walias }: ClaimDomainProps) {
  return domain.apiEndpoint ? (
    <PayInvoice domain={domain} walias={walias} />
  ) : (
    <div className='flex flex-col gap-2'>
      <p>Not a valid Lightning Domain. </p>
      <p>You should register your walias in their website. {domain.name}</p>
    </div>
  );
}
