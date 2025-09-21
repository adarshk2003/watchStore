import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';
import { RxDotFilled } from 'react-icons/rx';
import React, { useState ,useEffect} from "react";

function Carousel() {
    const slides = [
        { url: '/watch.jpg' },
        { url: '/aj-garcia-0bgWnyTKsjo-unsplash.jpg' },
        { url: '/marek-prygiel-7RLztM4KdcE-unsplash.jpg' },
        { url: '/woodwatch-kSbgs5UPAxo-unsplash.jpg' },
        { url: '/hi_mac-o57uHkqVgzY-unsplash.jpg' }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        const firstSlide = currentIndex === 0;
        const newIndex = firstSlide ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const lastSlide = currentIndex === slides.length - 1;
        const newIndex = lastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };
    const goToSlide=(slideIndex)=>{
        setCurrentIndex(slideIndex);
    }
     useEffect(() => {
        const interval = setInterval(() => { 
             nextSlide(); }, 7000);
             return () => clearInterval(interval); 
            }, [currentIndex]);


    return (
        <div className="w-full h-96 top-10 px-7 relative flex flex-col justify-center -z-50 group">
            <div style={{ backgroundImage: `url(${slides[currentIndex].url})` }} className="w-full h-full bg-center bg-cover duration-500 rounded-md"></div>

            {/* left arrow */}
            <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-9 text-2xl rounded-full p-2 bg-white/20 cursor-pointer">
                <BsChevronCompactLeft size={30} onClick={prevSlide} />
            </div>
            {/* right arrow */}
            <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-9 text-2xl rounded-full p-2 bg-white/20 cursor-pointer">
                <BsChevronCompactRight size={30} onClick={nextSlide} />
            </div>
            <div className=' bottom-4 left-0 right-0 flex justify-center py-2'>
                {slides.map((slide, slideIndex) => (
                    <div key={slideIndex} onClick={()=>goToSlide(slideIndex)} className='mx-1 text-lg cursor-pointer'><RxDotFilled /></div>
                ))}
            </div>
        </div>
    );
}

export default Carousel;
