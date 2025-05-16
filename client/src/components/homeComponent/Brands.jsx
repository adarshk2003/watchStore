import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const brands = [
  { id: 1, name: "Rolex", img: "/icons/rolex.webp" },
  { id: 2, name: "Patek Philippe", img: "/icons/patric.webp" },
  { id: 3, name: "Audemars Piguet", img: "/icons/piquit.webp" },
  { id: 4, name: "Panerai", img: "/icons/paneri.webp" },
  { id: 5, name: "Omega", img: "/icons/omega.webp" },
  { id: 6, name: "Cronoswiss", img: "/icons/cronoswiss.webp" },
  { id: 7, name: "Jaeger-LeCoultre", img: "/icons/jaeger.webp" },
  { id: 8, name: "Blancpain", img: "/icons/blancpain.webp" },
  { id: 9, name: "IWC Schaffhausen", img: "/icons/iwc.webp" },
  { id: 10, name: "Tag Heuer", img: "/icons/tag.webp" },
  { id: 11, name: "Hublot", img: "/icons/hublot.webp" },
  { id: 12, name: "Mauric Lacroix", img: "/icons/mauric.webp" },
  { id: 13, name: "Cartier", img: "/icons/cartier.webp" },
  { id: 14, name: "Breitling", img: "/icons/berlting.webp" },
  { id: 15, name: "Zenith", img: "/icons/zenth.webp" },
  { id: 16, name: "Girard-Perregaux", img: "/icons/gp.webp" },
  { id: 17, name: "Ranck Muller", img: "/icons/muller.webp" },
  { id: 18, name: "A. Lange & Söhne", img: "/icons/sohene.webp" },
  { id: 19, name: "Chopard", img: "/icons/chopard.webp" },
  { id: 20, name: "Longines", img: "/icons/longines.webp" },
];

const PopularBrands = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const maxPage = Math.ceil(brands.length / itemsPerPage) - 1;

  const nextPage = () => {
    if (currentPage < maxPage) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const displayedBrands = brands.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="relative w-full">
      <h2 className="text-xl font-bold mb-4 text-center bg-zinc-950/10 rounded-2xl">Popular Brands</h2>
      <div className="flex items-center justify-between">
        {/* Left Arrow */}
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`${
            currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""
          } bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300`}
        >
          <FaChevronLeft size={20} />
        </button>

        {/* Brands Grid */}
        <div className="grid grid-cols-5 grid-rows-1 gap-4 w-full max-w-4xl mx-auto">
          {displayedBrands.map((brand) => (
            <div
              key={brand.id}
              className="flex flex-col items-center p-2 bg-white rounded-lg shadow hover:shadow-md cursor-pointer"
            >
              <Link to={`/category/${brand.name.toLowerCase()}`}>
                <img
                  src={brand.img}
                  alt={brand.name}
                  className="w-full h-auto object-cover rounded-md"
                />
                <p className="text-sm font-medium mt-2">{brand.name}</p>
              </Link>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextPage}
          disabled={currentPage === maxPage}
          className={`${
            currentPage === maxPage ? "opacity-50 cursor-not-allowed" : ""
          } bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300`}
        >
          <FaChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default PopularBrands;
