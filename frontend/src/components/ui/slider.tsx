"use client";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    showTooltip?: boolean;
    tooltipContent?: (value: number) => React.ReactNode;
  }
>(({ className, showTooltip = false, tooltipContent, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState<number[]>(
    (props.defaultValue as number[]) ?? (props.value as number[]) ?? [0],
  );
  const handleValueChange = (newValue: number[]) => { setInternalValue(newValue); props.onValueChange?.(newValue); };
  return (
    <SliderPrimitive.Root ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center data-[disabled]:opacity-50", className)}
      onValueChange={handleValueChange} {...props}>
      <SliderPrimitive.Track className="relative grow overflow-hidden rounded-full bg-secondary data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full">
        <SliderPrimitive.Range className="absolute bg-primary data-[orientation=horizontal]:h-full" />
      </SliderPrimitive.Track>
      {internalValue?.map((_, index) => (
        <SliderPrimitive.Thumb key={index}
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring/40" />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;
export { Slider };
export default Slider;
