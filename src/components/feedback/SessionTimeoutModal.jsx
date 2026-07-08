import useFocusTrap from '../../hooks/useFocusTrap';

export default function SessionTimeoutModal({ timeLeft, onStayLoggedIn }) {
  const modalRef = useFocusTrap(true);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div ref={modalRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-dark/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-sand bg-white p-6 shadow-elevated text-center" role="dialog" aria-modal="true" aria-label="Session expiring">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-alert/10">
          <span className="text-2xl">⏰</span>
        </div>

        <h2 className="text-lg font-bold font-heading text-slate mb-1">
          Session expiring
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          You've been inactive. You'll be logged out in:
        </p>

        <div aria-live="polite" aria-atomic="true" className={`text-3xl font-extrabold font-numbers mb-5 ${timeLeft <= 30 ? 'text-danger animate-pulse' : 'text-terracotta'}`}
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>

        <button
          onClick={onStayLoggedIn}
          className="w-full rounded-lg bg-terracotta px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-clay active:scale-[0.98]"
        >
          Stay logged in
        </button>
      </div>
    </div>
  );
}
