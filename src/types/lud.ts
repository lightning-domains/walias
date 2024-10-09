export interface LNURLResponse {
  tag: string;
  callback: string;
  k1?: string;
  metadata?: string;
  commentAllowed?: number;
  minWithdrawable?: number;
  maxWithdrawable?: number;
  minSendable?: number;
  maxSendable?: number;
  payerData?: { [_key: string]: { mandatory: boolean } };
  defaultDescription?: string;
  nostrPubkey?: string;
  allowsNostr?: boolean;
  accountPubKey?: string;
  federationId?: string;
}

export interface LNURLPayCallbackResponse {
  pr: string;
  routes?: any[];
  verify?: string;
}
