type LoadingOverlayProps = {
  label?: string;
};

const LoadingOverlay = ({ label = "Chargement..." }: LoadingOverlayProps) => (
  <div className="fixed inset-0 z-90 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm" role="status" aria-live="polite">
    <div className="ui-panel flex items-center gap-3 px-5 py-4 text-sm font-semibold text-slate-700">
      <span className="ui-spinner text-blue-600" aria-hidden="true" />
      {label}
    </div>
  </div>
);

export default LoadingOverlay; 
