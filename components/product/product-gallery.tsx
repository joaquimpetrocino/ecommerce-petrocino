"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

const IMAGE_FALLBACK = "/images/placeholder.png";

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});
    const internalScrollRef = useRef<HTMLDivElement>(null);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleImageError = (index: number) => {
        setBrokenImages(prev => ({ ...prev, [index]: true }));
    };

    const scroll = (direction: "left" | "right") => {
        if (internalScrollRef.current) {
            const { scrollLeft, clientWidth } = internalScrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            internalScrollRef.current.scrollTo({
                left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: "smooth"
            });
        }
    };

    if (!images || images.length === 0) {
        return (
            <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 flex items-center justify-center">
                <Image
                    src={IMAGE_FALLBACK}
                    alt={productName}
                    fill
                    className="object-cover opacity-50 transition-transform duration-300"
                />
                <span className="absolute bottom-4 text-xs font-bold uppercase text-neutral-400 bg-white/80 px-3 py-1 rounded-full shadow-sm z-10 italic">Sem imagem disponível</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Imagem principal */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 max-w-lg mx-auto border border-neutral-100 shadow-sm">
                <Image
                    src={brokenImages[currentIndex] ? IMAGE_FALLBACK : (images[currentIndex] || IMAGE_FALLBACK)}
                    alt={`${productName} - Imagem ${currentIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                    onError={() => handleImageError(currentIndex)}
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg z-10 transition-all active:scale-95 border border-neutral-100"
                        >
                            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-800" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg z-10 transition-all active:scale-95 border border-neutral-100"
                        >
                            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-800" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails Carousel */}
            {images.length > 1 && (
                <div className="relative group mx-auto w-full max-w-lg overflow-hidden rounded-xl">
                    {/* Botões de navegação - mais sutis e internos para evitar overflow */}
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-1.5 rounded-full shadow-md border border-neutral-100 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronLeft className="h-4 w-4 text-neutral-800" />
                    </button>

                    <div
                        ref={internalScrollRef}
                        className="flex gap-3 overflow-x-auto py-3 px-4 scrollbar-hide snap-x scroll-smooth"
                    >
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all snap-center ${index === currentIndex
                                    ? "border-primary ring-2 ring-primary/20 scale-95"
                                    : "border-transparent bg-neutral-100 hover:border-neutral-300"
                                    }`}
                            >
                                <Image
                                    src={brokenImages[index] ? IMAGE_FALLBACK : image}
                                    alt={`${productName} - Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    onError={() => handleImageError(index)}
                                />
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-1.5 rounded-full shadow-md border border-neutral-100 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronRight className="h-4 w-4 text-neutral-800" />
                    </button>
                </div>
            )}
        </div>
    );
}
