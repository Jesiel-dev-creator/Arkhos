"use client"

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface NewsletterSignUpProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle: string;
  placeholder?: string;
  buttonAriaLabel?: string;
  onSubmit: (email: string) => void;
}

const NewsletterSignUp = React.forwardRef<HTMLDivElement, NewsletterSignUpProps>(
  (
    {
      className,
      title,
      subtitle,
      placeholder = "Email address",
      buttonAriaLabel = "Subscribe to newsletter",
      onSubmit,
      ...props
    },
    ref
  ) => {
    const [email, setEmail] = React.useState("");
    const inputId = React.useId();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email.trim()) return;
      onSubmit(email);
      setEmail("");
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-md rounded-2xl border p-8",
          "border-transparent bg-amber-100 text-amber-950",
          "dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-50",
          className
        )}
        {...props}
      >
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-1 text-amber-800 dark:text-amber-200/80">{subtitle}</p>
        <form onSubmit={handleSubmit} className="mt-6">
          <div
            className={cn(
              "group relative flex items-center rounded-full bg-background shadow-sm",
              "transition-shadow duration-300 ease-in-out",
              "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
              "focus-within:ring-offset-amber-100 dark:focus-within:ring-offset-amber-950/20"
            )}
          >
            <label htmlFor={inputId} className="sr-only">
              {placeholder}
            </label>
            <Input
              id={inputId}
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={cn(
                "h-12 flex-grow rounded-l-full border-none bg-transparent pl-6 pr-2 text-base",
                "focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
            />
            <Button
              type="submit"
              size="icon"
              aria-label={buttonAriaLabel}
              className={cn(
                "mr-1.5 h-9 w-9 flex-shrink-0 rounded-full bg-foreground text-background shadow",
                "transition-transform duration-300 ease-in-out group-hover:scale-105"
              )}
            >
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </form>
      </div>
    );
  }
);

NewsletterSignUp.displayName = "NewsletterSignUp";

export default NewsletterSignUp;
