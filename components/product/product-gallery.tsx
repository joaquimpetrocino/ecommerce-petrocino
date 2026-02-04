"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

const IMAGE_FALLBACK = "/images/placeholder.png";

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleImageError = (index: number) => {
        setBrokenImages(prev => ({ ...prev, [index]: true }));
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
        <div className="space-y-2">
            {/* Imagem principal */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
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
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10 transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6 text-neutral-800" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10 transition-colors"
                        >
                            <ChevronRight className="h-6 w-6 text-neutral-800" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${index === currentIndex
                                ? "border-primary scale-95"
                                : "border-gray-200 hover:border-gray-300"
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
            )}
        </div>
    );
}
