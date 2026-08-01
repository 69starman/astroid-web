'use client';

import Link from 'next/link';
import { ArrowUpRight, Check, Clock, X } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { QueryBoundary } from '@/components/dashboard/query-boundary';
import { SectionLabel } from '@/components/dashboard/stat-card';
import { RiskBadge } from '@/components/dashboard/risk-badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { BellIllustration } from '@/components/illustrations';
import { useProposals } from '@/hooks/use-queries';
import { proposalStatus } from '@/lib/status';
import { formatCurrency, formatRelativeTime } from '@/lib/format';

export default function ApprovalsPage() {
  const proposals = useProposals();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operate"
        title="Approvals"
        description="Pending decisions awaiting your review — every one traceable to a proposed transaction."
      />

      <QueryBoundary
        query={proposals}
        loading={
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        }
        isEmpty={(data) => data.length === 0}
        empty={
          <EmptyState
            illustration={<BellIllustration />}
            title="Nothing to approve"
            description="You're all caught up. New proposals will appear here as agents request approval."
          />
        }
      >
        {(data) => {
          const pending = data.filter((p) => p.status === 'pending').length;
          return (
            <div className="space-y-6">
              <SectionLabel>
                {pending} of {data.length} awaiting decision
              </SectionLabel>
              <div className="space-y-4">
                {data.map((proposal) => {
                  const status = proposalStatus(proposal.status);
                  const approved = proposal.approvals.filter(
                    (a) => a.decision === 'approved',
                  ).length;
                  const isPending = proposal.status === 'pending';
                  return (
                    <Card key={proposal.id}>
                      <CardContent className="pt-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-foreground">
                                {proposal.title}
                              </p>
                              <Badge variant={status.variant} size="sm">
                                {status.label}
                              </Badge>
                              <Badge variant="outline" size="sm" className="capitalize">
                                {proposal.kind}
                              </Badge>
                              <RiskBadge score={proposal.riskScore} showScore />
                            </div>
                            <p className="max-w-prose text-xs leading-relaxed text-foreground-secondary">
                              {proposal.description}
                            </p>
                            <p className="text-2xs text-foreground-muted">
                              {proposal.agentName} · to {proposal.counterparty}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-display text-lg font-semibold tabular">
                              {formatCurrency(proposal.amount, proposal.asset, {
                                compact: true,
                              })}
                            </p>
                            <p className="mt-1 inline-flex items-center gap-1 text-2xs text-foreground-muted">
                              <Clock className="h-3 w-3" aria-hidden />
                              expires {formatRelativeTime(proposal.expiresAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {proposal.approvals.map((decision) => (
                                <Avatar
                                  key={decision.id}
                                  name={decision.userName}
                                  src={decision.userAvatar}
                                  size="xs"
                                  className="ring-2 ring-surface"
                                />
                              ))}
                            </div>
                            <span className="text-2xs text-foreground-secondary">
                              {approved} of {proposal.requiredApprovals} approvals
                            </span>
                          </div>
                          <Link
                            href={`/transactions/${proposal.transactionId}`}
                            className="inline-flex items-center gap-1 text-2xs font-medium text-gold-strong hover:underline"
                          >
                            View transaction
                            <ArrowUpRight className="h-3 w-3" aria-hidden />
                          </Link>
                        </div>
                      </CardContent>
                      {isPending && (
                        <CardFooter>
                          <Button variant="gold" size="sm" leftIcon={<Check className="h-4 w-4" />}>
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" leftIcon={<X className="h-4 w-4" />}>
                            Reject
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        }}
      </QueryBoundary>
    </div>
  );
}
