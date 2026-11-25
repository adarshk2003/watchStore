import { Link } from 'react-router-dom';
import { FaArrowRight, FaBoxOpen, FaCommentDots, FaHandHoldingUsd } from 'react-icons/fa';

const shoppingDetails = [
  {
    icon: FaBoxOpen,
    title: 'Product details up front',
    description: 'Review the listing description, specifications, and available stock before you order.',
  },
  {
    icon: FaHandHoldingUsd,
    title: 'Pay on delivery',
    description: 'Cash on delivery is available at checkout, so payment is collected when your order arrives.',
  },
  {
    icon: FaCommentDots,
    title: 'Help when you need it',
    description: 'Questions about a listing or an order? Get in touch with the Clyro support team.',
  },
];

export default function SecurityContent() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">A clearer way to shop</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          The details matter
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          From product information to payment and support, here are a few things to know before you choose.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {shoppingDetails.map(({ icon: Icon, title, description }) => (
          <article key={title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
              <Icon aria-hidden="true" size={19} />
            </span>
            <h3 className="mt-5 font-serif text-xl font-semibold text-stone-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
          </article>
        ))}
      </div>

      <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl bg-emerald-950 px-6 py-6 text-white sm:flex-row sm:px-8">
        <div>
          <p className="font-serif text-xl font-semibold">Need help choosing?</p>
          <p className="mt-1 text-sm text-white/70">We’re here to help with questions about your shopping experience.</p>
        </div>
        <Link
          to="/support"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50"
        >
          Contact support <FaArrowRight aria-hidden="true" size={12} />
        </Link>
      </div>
    </div>
  );
}
