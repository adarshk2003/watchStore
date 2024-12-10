import React, { useEffect, useState } from "react";
import { FaHeart } from 'react-icons/fa';

const productData = [
    {
        id: 1,
        brand: "Audemars piquet",
        name: "aqua",
        price: 149,
        originalPrice: 199,
        imageUrl: "/Audemars_Piguet .jpeg",
        stock: 10
    },
    {
        id: 2,
        brand: "Brand B",
        name: "Product B",
        price: 99,
        originalPrice: 129,
        imageUrl: "/Audemars_Piguet .jpeg",
        stock: 10
    },
    {
        id: 3,
        brand: "Brand B",
        name: "Product B",
        price: 99,
        originalPrice: 129,
        imageUrl: "/Audemars_Piguet .jpeg",
        stock: 10
    },
    {
        id: 4,
        brand: "Brand B",
        name: "Product B",
        price: 99,
        originalPrice: 129,
        imageUrl: "/Audemars_Piguet .jpeg",
        stock: 10   
    },
    {
        id: 5,
        brand: "Brand B",
        name: "Product B",
        price: 99,
        originalPrice: 129,
        imageUrl: "/Audemars_Piguet .jpeg",
        stock: 10
    },
    {
        id: 5,
        brand: "Brand B",
        name: "Product B",
        price: 99,
        originalPrice: 129,
        imageUrl: "/Audemars_Piguet .jpeg",
        stock: 10
    },
];

function ProductGrid() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Instead of fetching from an external file, use the internal JSON data
        setProducts(productData);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 lg:grid-cols-5  gap-4 p-10">
            {products.map(product => (
                <div key={product.id} className="max-w-xs w-full bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src={product.imageUrl} alt={product.name} className="h-60 w-full object-cover rounded-t-xl" />
                        <div className="px-4 py-3">
                            <span className="text-gray-400 mr-3 uppercase text-xs">{product.brand}</span>
                            <p className="text-lg font-bold text-black truncate block capitalize">{product.name}</p>
                            <div className="flex items-center">
                                <p className="text-lg font-semibold text-black cursor-auto my-3">€{product.price}</p>
                                <del>
                                    <p className="text-sm text-gray-600 cursor-auto ml-2">€{product.originalPrice}</p>
                                </del>
                            </div>
                            <p className={`text-sm font-semibold my-2 ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                                {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                            </p>
                            <div className="flex items-center justify-between">
                                {product.stock > 0 && (
                                    <button className="bg-emerald-900 text-white px-4 py-2 rounded-md hover:bg-emerald-700">Add to Cart</button>
                                )}
                                <FaHeart className="text-red-500 cursor-pointer" />
                            </div>
                        </div>
                    </a>
                </div>
            ))}
        </div>
    );
}

export default ProductGrid;
