"use client";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";

interface GalleryItem { id: string; title: string; summary: string; url: string; image: string; }
interface Gallery6Props { heading?: string; demoUrl?: string; items?: GalleryItem[]; }

export const Gallery6 = ({ heading = "Gallery", demoUrl = "#", items = [] }: Gallery6Props) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  useEffect(() => {
    if (!carouselApi) return;
    const update = () => { setCanScrollPrev(carouselApi.canScrollPrev()); setCanScrollNext(carouselApi.canScrollNext()); };
    update(); carouselApi.on("select", update);
    return () => { carouselApi.off("select", update); };
  }, [carouselApi]);
  return (
    <section className="py-16">
      <div className="container">
        <div className="mb-8 flex flex-col justify-between md:mb-14 md:flex-row md:items-end">
          <div>
            <h2 className="mb-3 text-3xl font-semibold md:text-4xl">{heading}</h2>
            <a href={demoUrl} className="group flex items-center gap-1 text-sm font-medium">
              View all <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <div className="mt-8 flex shrink-0 items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => carouselApi?.scrollPrev()} disabled={!canScrollPrev}><ArrowLeft className="size-5" /></Button>
            <Button size="icon" variant="outline" onClick={() => carouselApi?.scrollNext()} disabled={!canScrollNext}><ArrowRight className="size-5" /></Button>
          </div>
        </div>
      </div>
      <Carousel setApi={setCarouselApi} opts={{ breakpoints: { "(max-width: 768px)": { dragFree: true } } }} className="relative left-[-1rem]">
        <CarouselContent className="-mr-4 ml-8">
          {items.map((item) => (
            <CarouselItem key={item.id} className="pl-4 md:max-w-[452px]">
              <a href={item.url} className="group flex flex-col justify-between">
                <div className="flex aspect-[3/2] overflow-clip rounded-xl">
                  <div className="flex-1 relative h-full w-full origin-bottom transition duration-300 group-hover:scale-105">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover object-center" />
                  </div>
                </div>
                <div className="mb-2 line-clamp-3 pt-4 text-lg font-medium md:text-xl">{item.title}</div>
                <div className="mb-8 line-clamp-2 text-sm text-muted-foreground">{item.summary}</div>
                <div className="flex items-center text-sm">Build something like this <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" /></div>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default Gallery6;
