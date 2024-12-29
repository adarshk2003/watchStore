import React, { useState } from "react";
import NavBar from "../navComponent/Nav";
import Carousel from "../GraphicComponent/Carosile";
import Footer from "./Footer";
import ProductGrid from "./ProductGrid";

function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    return (
        <>
            {/* Pass scroll function as a prop to NavBar */}
            <NavBar onSearch={setSearchQuery}/>
            <Carousel />
            <div className="h-40 w-full"></div>
            
            <div>
                <ProductGrid  searchQuery={searchQuery} />
            </div>
            <div className="h-40 w-full"></div>
            <Footer />
        </>
    );
}

export default Home;