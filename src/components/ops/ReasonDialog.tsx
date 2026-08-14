/**
 * Reason-gated confirmation dialog for privileged actions.
 *
 * INTEGRATION NOTE: every destructive/privileged mutation MUST go through this
 * component. It enforces a >= 8 character reason client-side; the server must
 * enforce the same rule and persist the reason into the audit log.
 */
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const MIN_REASON = 8;

export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive,
  extraFields,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  extraFields?: ReactNode;
  onConfirm: (reason: string) => Promise<void> | void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setBusy(false);
    }
  }, [open]);

  const valid = reason.trim().length >= MIN_REASON;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {extraFields}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (required, audited)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Bounce rate above 10% for 36h on transactional stream"
            />
            <p className="text-xs text-muted-foreground">
              Minimum {MIN_REASON} characters. Stored in the audit log with your operator
              identity and IP.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={!valid || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm(reason.trim());
                onOpenChange(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
