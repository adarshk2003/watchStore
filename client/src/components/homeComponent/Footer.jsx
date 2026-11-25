import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import PropTypes from 'prop-types';

const linkClass = 'text-sm text-white/65 transition hover:text-white';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-14 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link to="/home" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white font-serif text-lg font-bold text-emerald-950">C</span>
              <span className="font-serif text-xl font-bold tracking-[0.18em]">CLYRO</span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-white/65">
              Discover watches with character, and find a timepiece that feels like your own.
            </p>
            <Link to="/shop" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-emerald-200">
              Explore the collection <FaArrowRight aria-hidden="true" size={12} />
            </Link>
          </div>

          <FooterLinks title="Discover" links={[
            { label: 'Shop all watches', to: '/shop' },
            { label: 'Browse brands', to: '/shop' },
            { label: 'Wishlist', to: '/wishlist' },
          ]} />
          <FooterLinks title="Your account" links={[
            { label: 'My profile', to: '/profile' },
            { label: 'My orders', to: '/orders' },
            { label: 'Shopping bag', to: '/cart' },
          ]} />
          <FooterLinks title="We can help" links={[
            { label: 'Contact support', to: '/support' },
            { label: 'Cookie policy', to: '/cookies' },
            { label: 'Privacy policy', to: '/privacy' },
            { label: 'Terms & conditions', to: '/terms' },
          ]} />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Clyro. All rights reserved.</p>
          <p>Thoughtful watches. A more personal way to shop.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">{title}</h2>
      <ul className="mt-4 space-y-3">
        {links.map(({ label, to }) => (
          <li key={label}><Link to={to} className={linkClass}>{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

FooterLinks.propTypes = {
  title: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  })).isRequired,
};
