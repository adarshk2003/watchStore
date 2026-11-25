import { Link } from 'react-router-dom';
import { FaArrowLeft, FaLifeRing, FaLock } from 'react-icons/fa';

export default function WarningBlocked() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f6f2] px-4 py-10">
      <section className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
          <FaLock aria-hidden="true" size={25} />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-amber-800">Account access</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Your account is currently restricted</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-stone-600">
          You can’t access your account right now. If you think this is a mistake or need more information, contact our support team.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/support?subject=Account%20access%20help" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800">
            <FaLifeRing aria-hidden="true" /> Contact support
          </Link>
          <Link to="/home" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-700 transition hover:border-stone-500">
            <FaArrowLeft aria-hidden="true" /> Return to store
          </Link>
        </div>
      </section>
    </main>
  );
}
