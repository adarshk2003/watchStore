import { Link, useLocation } from 'react-router-dom';
import { FaCheck, FaClock, FaShoppingBag } from 'react-icons/fa';
import NavBaruser from '../navComponent/userNav';

export default function OrderConfirmation() {
  const { state } = useLocation();

  return (
    <>
      <NavBaruser />
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f7f6f2] px-4 py-12 sm:px-8">
        <section className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
            <FaCheck aria-hidden="true" size={26} />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">Order received</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-stone-950 sm:text-4xl">Thank you for choosing Clyro</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-stone-600">
            Your order has been placed. You can follow its progress and review delivery details in your order history.
          </p>
          {state?.orderId && (
            <div className="mt-6 rounded-xl bg-[#f7f6f2] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Order reference</p>
              <p className="mt-1 font-mono text-sm font-semibold text-stone-900">#{String(state.orderId).slice(-10).toUpperCase()}</p>
            </div>
          )}
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-600">
            <FaClock aria-hidden="true" className="text-emerald-900" />
            Payment is due on delivery (cash on delivery).
          </div>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/orders" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
              View my orders
            </Link>
            <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-emerald-900 hover:text-emerald-950">
              <FaShoppingBag aria-hidden="true" /> Continue shopping
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
