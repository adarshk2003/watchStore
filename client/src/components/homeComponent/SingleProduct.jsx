import React, { useState, useEffect } from 'react';

const productData = {
  id: 1,
  bestSeller:"best Seller",
  name: "Titan Neo Splash Quartz Multifunction Black Dial Stainless Steel Strap",
  category: "mens watch",
  price: 2000.00,
  img1: "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dw65f44689/images/Titan/Catalog/1805QM04_2.jpg?sw=600&sh=600",
  img2: "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dw5edbbb63/images/Titan/Catalog/1805QM04_5.jpg?sw=600&sh=600",
  img3: "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dwa418c108/images/Titan/Catalog/1805QM04_4.jpg?sw=600&sh=600",
  img4: "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dwb7513c89/images/Titan/Catalog/1805QM04_6.jpg?sw=600&sh=600"
};

const ProductPage = () => {
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImage] = useState("");
  const [amount, setAmount] = useState(1);

  useEffect(() => {
    // Use the local product data
    setProduct(productData);
    setActiveImage(productData.img1);
  }, []);

  if (!product) {
    return <div>Loading...</div>; // Show loading state while fetching data
  }

  const images = [product.img1, product.img2, product.img3, product.img4];

  return (
    <div className='flex flex-col justify-between lg:flex-row gap-16 lg:items-center'>
      <div className='flex flex-col gap-6 lg:w-2/4'>
        <img src={activeImg} alt="Active" className='w-full h-full aspect-square object-cover rounded-xl cursor-pointer'/>
        <div className='flex flex-row justify-between h-24'>
          {images.map((img, index) => (
            <img 
              key={index} 
              src={img} 
              alt={`Product ${index + 1}`} 
              className='w-24 h-24 rounded-md cursor-pointer' 
              onClick={() => setActiveImage(img)} 
            />
          ))}
        </div>
      </div>
      {/* ABOUT */}
      <div className='flex flex-col gap-4 lg:w-2/4'>
        <div>
          <span className='font-semibold text-emerald-800   '>{product.bestSeller}</span>
          <h1 className='text-3xl font-bold'>{product.name}</h1>
        </div>
        <p className='text-gray-700'>
          {product.category}
        </p>
        <h6 className='text-2xl font-semibold'>${product.price.toFixed(2)}</h6>
        <div className='flex flex-row items-center gap-12'>
          <div className='flex flex-row items-center'>
            <button 
              className='bg-gray-200 py-2 px-5 rounded-lg text-emerald-800 text-3xl' 
              onClick={() => setAmount(amount > 1 ? amount - 1 : 1)}
            >
              -
            </button>
            <span className='py-4 px-6 rounded-lg'>{amount}</span>
            <button 
              className='bg-gray-200 py-2 px-4 rounded-lg text-emerald-800 text-3xl' 
              onClick={() => setAmount(amount + 1)}
            >
              +
            </button>
          </div>
          <button className='bg-emerald-900 text-white font-semibold py-3 px-16 rounded-xl h-full'>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
