import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileContract, FaCheckCircle } from 'react-icons/fa';

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-9 sm:px-8 sm:py-12">
      <article className="mx-auto max-w-4xl">
        <Link to="/home" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-emerald-950">
          <FaArrowLeft aria-hidden="true" size={12} /> Back to Clyro
        </Link>

        <header className="mt-6 rounded-3xl bg-emerald-950 px-6 py-8 text-white sm:px-9 sm:py-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-emerald-100">
            <FaFileContract aria-hidden="true" size={21} />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Legal Agreement</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Terms & Conditions</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-100">
            Please read these terms carefully before browsing, ordering, or listing timepieces on Clyro Watches.
          </p>
        </header>

        <section className="mt-6 space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-stone-900">
              <FaCheckCircle className="text-emerald-900" /> 1. Marketplace Authenticity
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              All watches listed by authorized sellers on Clyro must be genuine and accurately represented. Any seller listing counterfeit or misrepresented goods will be permanently suspended.
            </p>
          </div>

          <div className="border-t border-stone-100 pt-5">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-stone-900">
              <FaCheckCircle className="text-emerald-900" /> 2. Ordering & Payment
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Orders placed on Clyro represent a binding offer to purchase. Cash on Delivery orders must be accepted and paid for in full upon courier arrival.
            </p>
          </div>

          <div className="border-t border-stone-100 pt-5">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-stone-900">
              <FaCheckCircle className="text-emerald-900" /> 3. Returns & Inquiries
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Customers may request support or file order inquiries within 7 days of delivery for damaged or defective items through the Support portal.
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}
