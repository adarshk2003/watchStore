import React, { useRef } from "react";
import NavBar from "../navComponent/Nav";
import Carousel from "../GraphicComponent/Carosile";
import Footer from "./Footer";
import ProductGrid from "./ProductGrid";

function Home() {

    return (
        <>
            {/* Pass scroll function as a prop to NavBar */}
            <NavBar/>
            <Carousel />
            <div className="h-40 w-full"></div>
            
            <div>
                <ProductGrid />
            </div>
            <div className="h-40 w-full"></div>
            <Footer />
        </>
    );
}

export default Home;