"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ----- contexts --------------------------------------------------------- */
interface StepperContextValue {
  activeStep: number;
  setActiveStep: (step: number) => void;
  orientation: "horizontal" | "vertical";
  indicators: {
    completed?: React.ReactNode;
  };
}

const StepperContext = React.createContext<StepperContextValue | null>(null);

function useStepper() {
  const ctx = React.useContext(StepperContext);
  if (!ctx) throw new Error("useStepper must be used within <Stepper>");
  return ctx;
}

interface StepItemContextValue {
  step: number;
  state: "completed" | "active" | "inactive";
}

const StepItemContext = React.createContext<StepItemContextValue | null>(null);

function useStepItem() {
  const ctx = React.useContext(StepItemContext);
  if (!ctx) throw new Error("useStepItem must be used within <StepperItem>");
  return ctx;
}

/* ----- Stepper ---------------------------------------------------------- */
interface StepperProps extends React.ComponentProps<"div"> {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  orientation?: "horizontal" | "vertical";
  indicators?: { completed?: React.ReactNode };
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      defaultValue = 1,
      value,
      onValueChange,
      orientation = "horizontal",
      indicators = {},
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalStep, setInternalStep] = React.useState(defaultValue);
    const activeStep = value ?? internalStep;

    const setActiveStep = React.useCallback(
      (step: number) => {
        if (onValueChange) onValueChange(step);
        else setInternalStep(step);
      },
      [onValueChange],
    );

    return (
      <StepperContext.Provider
        value={{ activeStep, setActiveStep, orientation, indicators }}
      >
        <div
          ref={ref}
          data-orientation={orientation}
          className={cn(
            "group/stepper flex data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </StepperContext.Provider>
    );
  },
);
Stepper.displayName = "Stepper";

/* ----- StepperItem ------------------------------------------------------ */
interface StepperItemProps extends React.ComponentProps<"div"> {
  step: number;
}

const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
  ({ step, className, children, ...props }, ref) => {
    const { activeStep } = useStepper();
    const state: StepItemContextValue["state"] =
      activeStep > step
        ? "completed"
        : activeStep === step
          ? "active"
          : "inactive";

    return (
      <StepItemContext.Provider value={{ step, state }}>
        <div
          ref={ref}
          data-state={state}
          className={cn("group/step flex flex-col", className)}
          {...props}
        >
          {children}
        </div>
      </StepItemContext.Provider>
    );
  },
);
StepperItem.displayName = "StepperItem";

/* ----- StepperTrigger --------------------------------------------------- */
const StepperTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, children, ...props }, ref) => {
  const { setActiveStep } = useStepper();
  const { step } = useStepItem();

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setActiveStep(step)}
      className={cn(
        "flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
StepperTrigger.displayName = "StepperTrigger";

/* ----- StepperIndicator ------------------------------------------------- */
const StepperIndicator = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span">
>(({ className, children, style, ...props }, ref) => {
  const { indicators } = useStepper();
  const { step, state } = useStepItem();

  return (
    <span
      ref={ref}
      data-state={state}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors",
        "data-[state=inactive]:bg-white/10 data-[state=inactive]:text-white/40",
        className,
      )}
      style={style}
      {...props}
    >
      {state === "completed" && indicators.completed
        ? indicators.completed
        : children ?? step}
    </span>
  );
});
StepperIndicator.displayName = "StepperIndicator";

/* ----- StepperSeparator ------------------------------------------------- */
const StepperSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, style, ...props }, ref) => {
  const { orientation } = useStepper();
  const { state } = useStepItem();

  return (
    <div
      ref={ref}
      data-state={state}
      data-orientation={orientation}
      className={cn(
        "transition-colors",
        orientation === "horizontal"
          ? "h-0.5 flex-1"
          : "ml-4 h-8 w-0.5",
        state === "completed"
          ? "bg-[var(--green,#22D68A)]"
          : "bg-white/10",
        className,
      )}
      style={style}
      {...props}
    />
  );
});
StepperSeparator.displayName = "StepperSeparator";

/* ----- StepperTitle ----------------------------------------------------- */
const StepperTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"h3">
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
StepperTitle.displayName = "StepperTitle";

/* ----- StepperDescription ----------------------------------------------- */
const StepperDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
));
StepperDescription.displayName = "StepperDescription";

/* ----- StepperNav ------------------------------------------------------- */
const StepperNav = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"nav">
>(({ className, ...props }, ref) => {
  const { orientation } = useStepper();

  return (
    <nav
      ref={ref}
      className={cn(
        "flex",
        orientation === "horizontal"
          ? "flex-row items-center gap-2"
          : "flex-col",
        className,
      )}
      {...props}
    />
  );
});
StepperNav.displayName = "StepperNav";

/* ----- StepperPanel ----------------------------------------------------- */
const StepperPanel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { step: number }
>(({ step, className, children, ...props }, ref) => {
  const { activeStep } = useStepper();
  if (activeStep !== step) return null;

  return (
    <div ref={ref} className={cn("mt-4", className)} {...props}>
      {children}
    </div>
  );
});
StepperPanel.displayName = "StepperPanel";

/* ----- StepperContent --------------------------------------------------- */
const StepperContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1", className)} {...props} />
));
StepperContent.displayName = "StepperContent";

/* ----- exports ---------------------------------------------------------- */
export {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperNav,
  StepperPanel,
  StepperContent,
};
