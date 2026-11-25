import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaExternalLinkAlt, FaLifeRing } from 'react-icons/fa';

const SUPPORT_EMAIL = 'support.clyro@gmail.com';
const inputClass = 'mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 bg-[#fbfaf7] px-4 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10';

export default function ContactSupport() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [preparedLink, setPreparedLink] = useState('');
  const [error, setError] = useState('');

  const productTitle = searchParams.get('productTitle')?.slice(0, 120) || '';
  const productId = searchParams.get('productId')?.slice(0, 100) || '';
  const requestedSubject = searchParams.get('subject')?.slice(0, 100) || '';
  const suggestedSubject = productTitle
    ? `Question about ${productTitle}`
    : requestedSubject || 'Clyro support request';

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const normalizedMessage = message.trim();

    if (!normalizedName || !normalizedEmail || !normalizedMessage) {
      setError('Complete each field before continuing.');
      return;
    }
    if (normalizedMessage.length < 10) {
      setError('Please add a little more detail (at least 10 characters).');
      return;
    }

    const details = [
      `Name: ${normalizedName}`,
      `Reply email: ${normalizedEmail}`,
      productId ? `Product reference: ${productId}` : '',
      '',
      normalizedMessage,
    ].filter((line) => line !== undefined);
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(suggestedSubject)}&body=${encodeURIComponent(details.join('\n'))}`;
    setPreparedLink(mailto);
    setError('');
  };

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-9 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link to="/home" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-emerald-950">
          <FaArrowLeft aria-hidden="true" size={12} /> Back to Clyro
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-950">
              <FaLifeRing aria-hidden="true" size={20} />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">We&apos;re here to help</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Contact support</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
              Tell us what you need help with. Your email app will open with a prepared message so you can review it and send it.
            </p>

            {productTitle && (
              <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
                Product question: <span className="font-semibold">{productTitle}</span>
                {productId && <span className="mt-1 block font-mono text-xs text-emerald-800">Reference: {productId}</span>}
              </div>
            )}

            {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="support-name" className="text-sm font-semibold text-stone-800">Your name</label>
                  <input id="support-name" name="name" type="text" autoComplete="name" maxLength="100" required value={name} onChange={(event) => { setName(event.target.value); setPreparedLink(''); }} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="support-email" className="text-sm font-semibold text-stone-800">Reply-to email</label>
                  <input id="support-email" name="email" type="email" autoComplete="email" maxLength="254" required value={email} onChange={(event) => { setEmail(event.target.value); setPreparedLink(''); }} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="support-subject" className="text-sm font-semibold text-stone-800">Subject</label>
                <input id="support-subject" type="text" value={suggestedSubject} readOnly className={`${inputClass} text-stone-600`} />
              </div>
              <div>
                <label htmlFor="support-message" className="text-sm font-semibold text-stone-800">How can we help?</label>
                <textarea
                  id="support-message"
                  name="message"
                  rows="6"
                  maxLength="3000"
                  required
                  value={message}
                  onChange={(event) => { setMessage(event.target.value); setPreparedLink(''); }}
                  placeholder="Describe the issue and include any details that may help us understand it."
                  className={`${inputClass} resize-y`}
                />
                <p className="mt-1 text-right text-xs text-stone-400">{message.length}/3000</p>
              </div>
              {preparedLink ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p role="status" className="text-sm leading-6 text-emerald-950">
                    Your message is ready. Select below to open your email app; it has not been sent yet.
                  </p>
                  <a
                    href={preparedLink}
                    className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    Open email app <FaExternalLinkAlt aria-hidden="true" size={12} />
                  </a>
                </div>
              ) : (
                <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-auto">
                  Prepare email <FaEnvelope aria-hidden="true" />
                </button>
              )}
            </form>
          </section>

          <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Email us directly</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-3 inline-flex items-center gap-2 break-all text-base font-semibold text-emerald-950 underline decoration-emerald-200 underline-offset-4 hover:decoration-emerald-800">
              <FaEnvelope aria-hidden="true" className="shrink-0" /> {SUPPORT_EMAIL}
            </a>
            <p className="mt-4 text-sm leading-6 text-stone-600">
              If your email app does not open, you can copy the address and send your message from another device or service.
            </p>
            <div className="mt-6 border-t border-stone-100 pt-5">
              <h2 className="font-serif text-lg font-semibold text-stone-950">A quick note</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Please avoid including passwords, one-time codes, or payment card details in your message.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
