import NavSeller from "./NavSeller";
import Footerseller from "./FooterSeller";
import Carousel from "../GraphicComponent/Carosile";
import OthersProductList from "./OthersProducts";

function Seller() {
    return (
        <div>
            <NavSeller />
            <Carousel/>
            <div className="h-40 w-full"></div>
            <div>
                <OthersProductList/>
            </div>

            <div className="h-40 w-full"></div>
            <Footerseller />
        </div>
    )
}


export default Seller;