"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ArticleCardProps {
  headline: string;
  excerpt: string;
  cover?: string;
  tag?: string;
  readingTime?: number;
  writer?: string;
  publishedAt?: Date;
  clampLines?: number;
}

export function formatReadTime(seconds: number): string {
  if (!seconds || seconds < 60) return "Less than 1 min read";
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min read`;
}

export function formatPostDate(date: Date): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  cover,
  tag,
  readingTime,
  headline,
  excerpt,
  writer,
  publishedAt,
  clampLines,
}) => {
  const hasMeta = tag || readingTime;
  const hasFooter = writer || publishedAt;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 overflow-hidden rounded-3xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 shadow-lg">
      {cover && (
        <div className="p-0">
          <div className="relative h-56 w-full overflow-hidden rounded-2xl">
            <img
              src={cover}
              alt={headline}
              crossOrigin="anonymous"
              className="rounded-2xl object-cover w-full h-full"
            />
          </div>
        </div>
      )}

      <div className="flex-grow p-3">
        {hasMeta && (
          <div className="mb-4 flex items-center text-sm text-gray-500">
            {tag && (
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                {tag}
              </span>
            )}
            {tag && readingTime && <span className="mx-2">&bull;</span>}
            {readingTime && <span>{formatReadTime(readingTime)}</span>}
          </div>
        )}

        <h2 className="mb-2 text-2xl font-bold leading-tight">
          {headline}
        </h2>

        <p
          className={cn("text-gray-500", {
            "overflow-hidden text-ellipsis [-webkit-box-orient:vertical] [display:-webkit-box]":
              clampLines && clampLines > 0,
          })}
          style={{
            WebkitLineClamp: clampLines,
          }}
        >
          {excerpt}
        </p>
      </div>

      {hasFooter && (
        <div className="flex items-center justify-between p-3">
          {writer && (
            <div>
              <p className="text-sm text-gray-500">By</p>
              <p className="font-semibold text-gray-500">{writer}</p>
            </div>
          )}
          {publishedAt && (
            <div className={writer ? "text-right" : ""}>
              <p className="text-sm text-gray-500">Published</p>
              <p className="font-semibold text-gray-500">
                {formatPostDate(publishedAt)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleCard;
