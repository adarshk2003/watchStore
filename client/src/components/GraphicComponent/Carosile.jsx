import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const slides = [
  {
    image: '/cover_watch.jpg',
    eyebrow: 'Time, thoughtfully chosen',
    title: 'Find the watch that feels like you.',
    description: 'Explore a considered collection of watches for every day, every occasion, and everything in between.',
    action: 'Explore the collection',
  },
  {
    image: '/watch.jpg',
    eyebrow: 'A detail worth noticing',
    title: 'Make every moment yours.',
    description: 'Discover distinctive designs and timeless details from the brands you love.',
    action: 'Discover watches',
  },
  {
    image: '/woodwatch-kSbgs5UPAxo-unsplash.jpg',
    eyebrow: 'The Clyro edit',
    title: 'Good design never rushes.',
    description: 'Find a timepiece that brings a little more intention to your everyday.',
    action: 'Shop the edit',
  },
  {
    image: '/marek-prygiel-7RLztM4KdcE-unsplash.jpg',
    eyebrow: 'Made for your moments',
    title: 'A classic, in your own way.',
    description: 'Browse the collection and find the piece that fits your personal style.',
    action: 'Browse all watches',
  },
  {
    image: '/hi_mac-o57uHkqVgzY-unsplash.jpg',
    eyebrow: 'Wear what moves you',
    title: 'Your next favourite starts here.',
    description: 'From understated to unmistakable, explore watches with character.',
    action: 'Find your watch',
  },
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const showPrevious = () => {
    setCurrentIndex((index) => (index - 1 + slides.length) % slides.length);
  };
  const showNext = () => {
    setCurrentIndex((index) => (index + 1) % slides.length);
  };

  useEffect(() => {
    if (isPaused) return undefined;
    const intervalId = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  return (
    <section
      aria-label="Featured collection"
      aria-roledescription="carousel"
      className="relative isolate overflow-hidden bg-stone-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
      <div className="relative mx-auto min-h-[480px] max-w-[1600px] sm:min-h-[540px] lg:min-h-[620px]">
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            aria-hidden={index !== currentIndex}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt=""
              loading={index === 0 ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/55 to-stone-950/10" />
            <div className="relative flex min-h-[480px] items-center px-6 py-16 sm:min-h-[540px] sm:px-12 lg:min-h-[620px] lg:px-20">
              <div className="max-w-2xl text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100 sm:text-sm">
                  {slide.eyebrow}
                </p>
                <h1 className="mt-5 max-w-xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                  {slide.title}
                </h1>
                <p className="mt-5 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
                  {slide.description}
                </p>
                <Link
                  to="/shop"
                  tabIndex={index === currentIndex ? 0 : -1}
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-stone-950 transition hover:bg-emerald-50"
                >
                  {slide.action} <FaArrowRight aria-hidden="true" size={12} />
                </Link>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={showPrevious}
          aria-label="Previous featured slide"
          className="absolute bottom-4 left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur transition hover:bg-white hover:text-stone-950 sm:bottom-auto sm:left-8 sm:top-1/2 sm:-translate-y-1/2"
        >
          <FaChevronLeft aria-hidden="true" size={14} />
        </button>
        <button
          type="button"
          onClick={showNext}
          aria-label="Next featured slide"
          className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur transition hover:bg-white hover:text-stone-950 sm:bottom-auto sm:right-8 sm:top-1/2 sm:-translate-y-1/2"
        >
          <FaChevronRight aria-hidden="true" size={14} />
        </button>

        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-6" aria-label="Choose featured slide">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
