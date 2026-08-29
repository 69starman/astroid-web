'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, ShieldAlert, ShieldCheck, Wallet2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/cn';
import type { Proposal } from '@/types/domain';

export type MultisigSignerState = 'signed' | 'pending' | 'missing';

export interface MultisigSigner {
  id: string;
  label: string;
  publicKey: string;
  weight: number;
  state: MultisigSignerState;
}

export function validateXdrPayload(value: string): { valid: boolean; reason?: string } {
  const xdr = value.trim();

  if (!xdr) {
    return { valid: false, reason: 'XDR payload is required before dispatch.' };
  }

  if (xdr.length < 24) {
    return { valid: false, reason: 'XDR payload looks incomplete.' };
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(xdr)) {
    return { valid: false, reason: 'XDR payload contains invalid characters.' };
  }

  return { valid: true };
}

function createDemoXdr(proposal: Proposal): string {
  const seed = `${proposal.id}${proposal.transactionId}${proposal.amount}${proposal.counterparty}`
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 48)
    .padEnd(48, 'A');

  return `${seed}AAAA${proposal.requiredApprovals.toString(16).padStart(4, 'A')}`;
}

export function buildMultisigSigners(
  approvals: Proposal['approvals'],
  requiredApprovals: number,
): MultisigSigner[] {
  const signerList: Proposal['approvals'] = approvals.length > 0 ? [...approvals] : [];

  while (signerList.length < requiredApprovals) {
    const missingIndex = signerList.length + 1;
    signerList.push({
      id: `pending-signer-${missingIndex}`,
      userId: `pending-${missingIndex}`,
      userName: `Signer ${missingIndex}`,
      decision: 'pending',
    });
  }

  return signerList.map((approval, index) => {
    const state: MultisigSignerState =
      approval.decision === 'approved'
        ? 'signed'
        : approval.decision === 'rejected'
          ? 'missing'
          : 'pending';

    const safeKey = approval.userId.replace(/[^A-Za-z0-9]/g, '').slice(0, 16) || `key-${index + 1}`;

    return {
      id: approval.id,
      label: approval.userName || `Signer ${index + 1}`,
      publicKey: `G${safeKey.padEnd(14, 'A').slice(0, 14)}...${safeKey.slice(-4)}`,
      weight: Math.max(1, requiredApprovals - index),
      state,
    };
  });
}

function getStateTone(state: MultisigSignerState): string {
  switch (state) {
    case 'signed':
      return 'bg-success-soft text-success border-success/30';
    case 'pending':
      return 'bg-warning-soft text-warning border-warning/30';
    default:
      return 'bg-danger-soft text-danger border-danger/30';
  }
}

export function MultisigReviewCard({ proposal }: { proposal: Proposal }) {
  const signers = useMemo(
    () => buildMultisigSigners(proposal.approvals, proposal.requiredApprovals),
    [proposal.approvals, proposal.requiredApprovals],
  );
  const signedCount = signers.filter((signer) => signer.state === 'signed').length;
  const missingCount = Math.max(0, proposal.requiredApprovals - signedCount);
  const progress = Math.min(100, (signedCount / Math.max(proposal.requiredApprovals, 1)) * 100);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card className="border-gold/20 bg-gradient-to-r from-gold/5 via-surface to-surface">
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-2xs font-medium uppercase tracking-[0.14em] text-foreground-secondary">
                Multisig review queue
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {signedCount} of {proposal.requiredApprovals} signatures collected
              </p>
            </div>
            <Badge variant={missingCount === 0 ? 'success' : 'warning'} size="sm">
              {missingCount === 0 ? 'Threshold met' : `${missingCount} missing`}
            </Badge>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-accent"
              style={{ width: `${progress}%` }}
              aria-label={`Signature threshold progress ${signedCount} of ${proposal.requiredApprovals}`}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {signers.map((signer) => (
              <span
                key={signer.id}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-2xs font-medium',
                  getStateTone(signer.state),
                )}
              >
                {signer.state === 'signed' ? (
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                ) : signer.state === 'pending' ? (
                  <Wallet2 className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
                )}
                {signer.label}
              </span>
            ))}
          </div>
        </CardContent>

        <CardFooter className="items-center justify-between gap-3">
          <p className="text-2xs text-foreground-secondary">
            {missingCount === 0
              ? 'Threshold reached — ready to submit.'
              : `${missingCount} signer${missingCount === 1 ? '' : 's'} still required.`}
          </p>
          <Button variant="gold" size="sm" onClick={() => setIsOpen(true)}>
            Review signatures
          </Button>
        </CardFooter>
      </Card>

      <MultisigReviewModal proposal={proposal} open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export function MultisigReviewModal({
  proposal,
  open,
  onClose,
}: {
  proposal: Proposal;
  open: boolean;
  onClose: () => void;
}) {
  const signers = useMemo(
    () => buildMultisigSigners(proposal.approvals, proposal.requiredApprovals),
    [proposal.approvals, proposal.requiredApprovals],
  );
  const xdrPayload = useMemo(() => createDemoXdr(proposal), [proposal]);
  const [isSigning, setIsSigning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFreighterSign = async (): Promise<void> => {
    setIsSigning(true);
    setStatusMessage(null);

    try {
      const validation = validateXdrPayload(xdrPayload);
      if (!validation.valid) {
        throw new Error(validation.reason ?? 'XDR payload is invalid.');
      }

      const freighterApi = (await import('@stellar/freighter-api')) as Record<string, unknown>;
      const signTransaction = freighterApi.signTransaction as
        | ((payload: string, options?: Record<string, string>) => Promise<unknown>)
        | undefined;
      const signBlob = freighterApi.signBlob as
        | ((payload: string, options?: Record<string, string>) => Promise<unknown>)
        | undefined;

      if (typeof signTransaction === 'function') {
        await signTransaction(xdrPayload, {
          networkPassphrase: 'Test SDF Network ; September 2015',
        });
      } else if (typeof signBlob === 'function') {
        await signBlob(xdrPayload, {
          networkPassphrase: 'Test SDF Network ; September 2015',
        });
      } else {
        throw new Error('Freighter is unavailable or this browser does not expose signing APIs.');
      }

      setStatusMessage('Signature request was prepared for Freighter and validated against the XDR payload.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to collect a signature.';
      setStatusMessage(message);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Threshold approval review"
      description={`Review ${proposal.requiredApprovals}-of-${signers.length} signature requirements before dispatch.`}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="gold" size="sm" loading={isSigning} onClick={() => void handleFreighterSign()}>
            Collect signature
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-card border border-border bg-surface-secondary p-3">
          <div>
            <p className="text-2xs font-medium uppercase tracking-[0.14em] text-foreground-secondary">
              Threshold
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {signers.filter((signer) => signer.state === 'signed').length} of {proposal.requiredApprovals} approved
            </p>
          </div>
          <ShieldCheck className="h-5 w-5 text-success" aria-hidden />
        </div>

        <div className="space-y-2">
          {signers.map((signer) => (
            <div
              key={signer.id}
              className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{signer.label}</p>
                <p className="mt-1 truncate text-2xs text-foreground-secondary">{signer.publicKey}</p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-1 text-2xs font-medium',
                  getStateTone(signer.state),
                )}
              >
                {signer.state}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-card border border-border bg-surface-secondary p-3">
          <p className="text-2xs font-medium uppercase tracking-[0.14em] text-foreground-secondary">
            XDR payload
          </p>
          <p className="mt-2 break-all font-mono text-2xs text-foreground">{xdrPayload}</p>
        </div>

        {statusMessage && (
          <p className="text-xs text-foreground-secondary">{statusMessage}</p>
        )}
      </div>
    </Dialog>
  );
}
