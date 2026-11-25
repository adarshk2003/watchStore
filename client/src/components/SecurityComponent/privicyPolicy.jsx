import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt, FaUserSecret, FaLock } from 'react-icons/fa';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-9 sm:px-8 sm:py-12">
      <article className="mx-auto max-w-4xl">
        <Link to="/home" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-emerald-950">
          <FaArrowLeft aria-hidden="true" size={12} /> Back to Clyro
        </Link>

        <header className="mt-6 rounded-3xl bg-emerald-950 px-6 py-8 text-white sm:px-9 sm:py-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-emerald-100">
            <FaShieldAlt aria-hidden="true" size={21} />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Customer Security</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-100">
            How Clyro Watches collects, protects, and handles your personal information when you browse, purchase, or sell on our marketplace.
          </p>
        </header>

        <section className="mt-6 space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-stone-900">
              <FaUserSecret className="text-emerald-900" /> Information We Collect
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              When you create an account, browse products, or make a purchase, we collect necessary account details including your name, email address, delivery address, and order transaction history.
            </p>
          </div>

          <div className="border-t border-stone-100 pt-5">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-stone-900">
              <FaLock className="text-emerald-900" /> Data Security & Protection
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Your passwords are cryptographically hashed using salted bcrypt hashes. Sensitive authentication tokens are transmitted securely over HTTPS and stored locally in your browser. We never store raw payment credentials on our servers.
            </p>
          </div>

          <div className="border-t border-stone-100 pt-5">
            <h2 className="font-serif text-xl font-semibold text-stone-900">Your Rights</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              You have the right to access, update, or request the deletion of your account information at any time through your profile settings or by contacting our customer support team.
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}
