import NavBar from './Nav';
import Carousel from '../GraphicComponent/Carosile';
import Footer from './Footer';
import ProductGrid from './ProductGrid';
import PopularBrands from './Brands';
import SecurityContent from './Security';
import PropTypes from 'prop-types';

function Home() {
  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <NavBar />
      <main>
        <Carousel />
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-stone-200 px-4 py-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-12">
            <StorePromise title="A considered collection" description="Watches selected for distinct style and character." />
            <StorePromise title="Find your fit" description="Browse by brand, category, and the details you value." />
            <StorePromise title="Here when you need us" description="Our support team is ready to help with your order." />
          </div>
        </section>

        <ProductGrid />

        <section className="border-y border-stone-200 bg-white px-4 py-14 sm:px-8 sm:py-16">
          <PopularBrands />
        </section>

        <section className="px-4 py-14 sm:px-8 sm:py-16">
          <SecurityContent />
        </section>
      </main>
      <Footer />
    </div>
  );
}

function StorePromise({ title, description }) {
  return (
    <div className="px-2 py-4 text-center sm:px-6 sm:py-2">
      <h2 className="font-serif text-base font-semibold text-stone-950">{title}</h2>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-stone-500">{description}</p>
    </div>
  );
}

StorePromise.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default Home;
