import { useState } from 'react';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const brands = [
  { name: 'Rolex', image: '/icons/rolex.webp' },
  { name: 'Patek Philippe', image: '/icons/patric.webp' },
  { name: 'Audemars Piguet', image: '/icons/piquit.webp' },
  { name: 'Panerai', image: '/icons/paneri.webp' },
  { name: 'Omega', image: '/icons/omega.webp' },
  { name: 'Cronoswiss', image: '/icons/cronoswiss.webp' },
  { name: 'Jaeger-LeCoultre', image: '/icons/jaeger.webp' },
  { name: 'Blancpain', image: '/icons/blancpain.webp' },
  { name: 'IWC Schaffhausen', image: '/icons/iwc.webp' },
  { name: 'TAG Heuer', image: '/icons/tag.webp' },
  { name: 'Hublot', image: '/icons/hublot.webp' },
  { name: 'Mauric Lacroix', image: '/icons/mauric.webp' },
  { name: 'Cartier', image: '/icons/cartier.webp' },
  { name: 'Breitling', image: '/icons/berlting.webp' },
  { name: 'Zenith', image: '/icons/zenth.webp' },
  { name: 'Girard-Perregaux', image: '/icons/gp.webp' },
  { name: 'Ranck Muller', image: '/icons/muller.webp' },
  { name: 'A. Lange & Söhne', image: '/icons/sohene.webp' },
  { name: 'Chopard', image: '/icons/chopard.webp' },
  { name: 'Longines', image: '/icons/longines.webp' },
];

const brandsPerPage = 5;

export default function PopularBrands() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageCount = Math.ceil(brands.length / brandsPerPage);
  const displayedBrands = brands.slice(
    currentPage * brandsPerPage,
    (currentPage + 1) * brandsPerPage
  );

  const previousPage = () => setCurrentPage((page) => Math.max(0, page - 1));
  const nextPage = () => setCurrentPage((page) => Math.min(pageCount - 1, page + 1));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">Explore the names</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Browse by brand</h2>
        </div>
        <Link to="/shop" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-emerald-950 transition hover:text-emerald-700">
          View all watches <FaArrowRight aria-hidden="true" size={12} />
        </Link>
      </div>

      <div className="mt-7 flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={previousPage}
          disabled={currentPage === 0}
          aria-label="Previous brands"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:border-emerald-900 hover:text-emerald-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FaChevronLeft aria-hidden="true" size={12} />
        </button>

        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {displayedBrands.map((brand) => (
            <Link
              key={brand.name}
              to={`/category/${encodeURIComponent(brand.name)}`}
              className="group flex min-h-36 flex-col items-center justify-center rounded-2xl border border-stone-200 bg-[#fbfaf7] p-4 text-center transition hover:-translate-y-1 hover:border-emerald-900/30 hover:bg-white hover:shadow-md sm:min-h-40"
            >
              <span className="flex h-16 w-full items-center justify-center">
                <img
                  src={brand.image}
                  alt=""
                  loading="lazy"
                  className="max-h-14 max-w-[85%] object-contain grayscale transition group-hover:grayscale-0"
                />
              </span>
              <span className="mt-3 line-clamp-1 text-xs font-semibold text-stone-700 transition group-hover:text-emerald-950 sm:text-sm">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={nextPage}
          disabled={currentPage === pageCount - 1}
          aria-label="Next brands"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:border-emerald-900 hover:text-emerald-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FaChevronRight aria-hidden="true" size={12} />
        </button>
      </div>

      <div className="mt-5 flex justify-center gap-2" aria-label="Brand pages">
        {Array.from({ length: pageCount }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentPage(index)}
            aria-label={`Show brand page ${index + 1}`}
            aria-current={currentPage === index ? 'true' : undefined}
            className={`h-1.5 rounded-full transition-all ${currentPage === index ? 'w-7 bg-emerald-950' : 'w-1.5 bg-stone-300 hover:bg-stone-500'}`}
          />
        ))}
      </div>
    </div>
  );
}
