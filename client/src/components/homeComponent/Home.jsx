import NavBar from "../navComponent/Nav";
import Carousel from "../GraphicComponent/Carosile";
import Footer from "./Footer";
import ProductGrid from "./ProductGrid";
function Home(){
    return(
    <>
        <NavBar/> 
        <Carousel />
        <div className="h-40 w-full"></div>
        <ProductGrid/>
        <div className="h-40 w-full "></div>
        <Footer />

    </>
    )
}
export default Home;