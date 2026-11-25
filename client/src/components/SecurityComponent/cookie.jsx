import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCookieBite, FaInfoCircle } from 'react-icons/fa';

const storageItems = [
  {
    name: 'Sign-in state',
    purpose: 'The browser stores the authentication token and account identifiers used to keep you signed in and show the correct workspace.',
    type: 'Required for account features',
  },
  {
    name: 'Guest shopping bag',
    purpose: 'Product identifiers can be saved in browser storage when you use the shopping bag while signed out.',
    type: 'Shopping feature',
  },
  {
    name: 'Display preference',
    purpose: 'Your reduced-motion preference is saved in this browser and applied to the interface.',
    type: 'Optional preference',
  },
  {
    name: 'Legacy cookie notice preference',
    purpose: 'A prior version of the interface stored an accept choice for a cookie notice in browser storage.',
    type: 'Legacy preference',
  },
];

export default function CookiePolicy() {
  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-9 sm:px-8 sm:py-12">
      <article className="mx-auto max-w-4xl">
        <Link to="/home" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-emerald-950">
          <FaArrowLeft aria-hidden="true" size={12} /> Back to Clyro
        </Link>

        <header className="mt-6 rounded-3xl bg-emerald-950 px-6 py-8 text-white sm:px-9 sm:py-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-emerald-100">
            <FaCookieBite aria-hidden="true" size={21} />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Privacy & browser storage</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Cookie and storage notice</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-100">
            This page describes browser storage used by the current Clyro web application. Browser storage and cookies are different technologies.
          </p>
        </header>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3 rounded-xl bg-[#f7f6f2] p-4 text-sm leading-6 text-stone-700">
            <FaInfoCircle aria-hidden="true" className="mt-1 shrink-0 text-emerald-900" />
            <p>
              The current client stores some information in your browser’s local storage for sign-in, shopping, and display preferences. We did not find optional analytics or advertising-cookie setup in the client code reviewed for this page. This notice is an implementation summary, not a complete legal privacy policy.
            </p>
          </div>

          <h2 className="mt-8 font-serif text-2xl font-semibold text-stone-950">What the app stores locally</h2>
          <div className="mt-4 divide-y divide-stone-100 rounded-xl border border-stone-200">
            {storageItems.map((item) => (
              <article key={item.name} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">{item.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{item.purpose}</p>
                </div>
                <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-600">{item.type}</span>
              </article>
            ))}
          </div>

          <h2 className="mt-8 font-serif text-2xl font-semibold text-stone-950">Managing browser storage</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            You can clear site data using your browser&apos;s privacy or site settings. Clearing it may sign you out, remove a guest shopping bag, or reset display preferences.
          </p>

          <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-[#fbfaf7] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-stone-950">Questions about privacy?</h2>
              <p className="mt-1 text-sm text-stone-600">Contact support for help or questions about how the service works.</p>
            </div>
            <Link to="/support?subject=Privacy%20question" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800">
              Contact support
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
