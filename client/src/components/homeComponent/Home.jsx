import React, { useState } from "react";
import NavBar from "./Nav";
import Carousel from "../GraphicComponent/Carosile";
import Footer from "./Footer";
import ProductGrid from "./ProductGrid";

function Home() {
    const [selectedProducts, setSelectedProducts] = useState([]);

    const handleProductSelect = (product) => {
      setSelectedProducts((prev) => [...prev, product]);
     }  
       return (
        <>
            {/* Pass scroll function as a prop to NavBar */}
            <NavBar onProductSelect={handleProductSelect}/>
            <Carousel />
            <div className="h-40 w-full"></div>
            
            <div>
                <ProductGrid  selectedProducts={selectedProducts} />
            </div>
            <div className="h-40 w-full"></div>
            <Footer />
        </>
    );
}

export default Home;