"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Story {
  id: string | number
  title: string
  thumbnail: string
  author?: {
    name: string
    avatar?: string
  }
  videoUrl?: string
}

interface StoriesCarouselProps {
  /** Array of story items to display */
  stories: Story[]
  /** Called when a story card is clicked */
  onStoryClick?: (story: Story) => void
  /** Additional className for the root container */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  StoryCard                                                          */
/* ------------------------------------------------------------------ */

function StoryCard({
  story,
  onClick,
}: {
  story: Story
  onClick?: (story: Story) => void
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (story.videoUrl && videoRef.current) {
      videoRef.current.play().catch(() => {
        /* autoplay may be blocked */
      })
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (story.videoUrl && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <button
      onClick={() => onClick?.(story)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-[#1C2E42] bg-[#0D1B2A] outline-none transition-all duration-300 hover:border-[#00D4EE]/30 focus-visible:ring-2 focus-visible:ring-[#00D4EE]/40"
    >
      {/* Thumbnail image */}
      <img
        src={story.thumbnail}
        alt={story.title}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-transform duration-300",
          isHovered && "scale-[1.02]"
        )}
      />

      {/* Video overlay (plays on hover) */}
      {story.videoUrl && (
        <video
          ref={videoRef}
          src={story.videoUrl}
          muted
          loop
          playsInline
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-[#020408]/30 to-transparent" />

      {/* Author avatar (top-left) */}
      {story.author && (
        <div className="absolute left-2.5 top-2.5">
          <Avatar size="sm">
            {story.author.avatar ? (
              <AvatarImage src={story.author.avatar} alt={story.author.name} />
            ) : (
              <AvatarFallback className="bg-[#1C2E42] text-xs text-[#DCE9F5]">
                {story.author.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      )}

      {/* Title overlay (bottom) */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="truncate font-['DM_Sans'] text-sm font-semibold text-[#DCE9F5]">
          {story.title}
        </p>
        {story.author && (
          <p className="mt-0.5 truncate font-['DM_Sans'] text-xs text-[#7B8FA3]">
            {story.author.name}
          </p>
        )}
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  StoriesCarousel                                                    */
/* ------------------------------------------------------------------ */

export default function StoriesCarousel({
  stories,
  onStoryClick,
  className,
}: StoriesCarouselProps) {
  return (
    <div className={cn("w-full", className)}>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {stories.map((story) => (
            <CarouselItem
              key={story.id}
              className="basis-[140px] pl-3 sm:basis-[180px] md:basis-[200px]"
            >
              <StoryCard story={story} onClick={onStoryClick} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

export { StoriesCarousel }
