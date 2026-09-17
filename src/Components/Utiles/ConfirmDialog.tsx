import type { ReactNode } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="ui-panel w-full max-w-md p-5 sm:p-6"
      >
        <div className="mb-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Validation requise</p>
          <h2 id="confirm-dialog-title" className="text-xl font-bold text-slate-900">{title}</h2>
          <div className="mt-2 text-sm leading-6 text-slate-600">{description}</div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="ui-button ui-button-quiet" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className="ui-button ui-button-primary" onClick={onConfirm} disabled={busy}>
            {busy && <span className="ui-spinner" aria-hidden="true" />}
            {busy ? "Traitement..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
