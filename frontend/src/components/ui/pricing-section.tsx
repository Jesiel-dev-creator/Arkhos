'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, StarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';

type FREQUENCY = 'monthly' | 'yearly';
const frequencies: FREQUENCY[] = ['monthly', 'yearly'];

interface Plan {
  name: string; info: string;
  price: { monthly: number; yearly: number; };
  features: { text: string; tooltip?: string; }[];
  btn: { text: string; href: string; };
  highlighted?: boolean;
}

interface PricingSectionProps extends React.ComponentProps<'div'> {
  plans: Plan[];
  heading: string;
  description?: string;
}

type BorderTrailProps = {
  className?: string; size?: number; transition?: Transition;
  delay?: number; onAnimationComplete?: () => void; style?: React.CSSProperties;
};

export function BorderTrail({ className, size = 60, transition, delay, onAnimationComplete, style }: BorderTrailProps) {
  const BASE_TRANSITION = { repeat: Infinity, duration: 5, ease: 'linear' };
  return (
    <div className='pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]'>
      <motion.div
        className={cn('absolute aspect-square bg-zinc-500', className)}
        style={{ width: size, offsetPath: `rect(0 auto auto 0 round ${size}px)`, ...style }}
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={{ ...(transition ?? BASE_TRANSITION), delay }}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}

export function PricingSection({ plans, heading, description, ...props }: PricingSectionProps) {
  const [frequency, setFrequency] = React.useState<FREQUENCY>('monthly');
  return (
    <div className={cn('flex w-full flex-col items-center justify-center space-y-5 p-4', props.className)} {...props}>
      <div className="mx-auto max-w-xl space-y-2">
        <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">{heading}</h2>
        {description && <p className="text-muted-foreground text-center text-sm md:text-base">{description}</p>}
      </div>
      <div className={cn('bg-muted/30 mx-auto flex w-fit rounded-full border p-1')}>
        {frequencies.map((freq) => (
          <button key={freq} onClick={() => setFrequency(freq)} className="relative px-4 py-1 text-sm capitalize">
            <span className="relative z-10">{freq}</span>
            {frequency === freq && (
              <motion.span layoutId="frequency" transition={{ type: 'spring', duration: 0.4 }}
                className="bg-foreground absolute inset-0 z-10 rounded-full mix-blend-difference" />
            )}
          </button>
        ))}
      </div>
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className={cn('relative flex w-full flex-col rounded-lg border')}>
            {plan.highlighted && (
              <BorderTrail style={{ boxShadow: '0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%)' }} size={100} />
            )}
            <div className={cn('rounded-t-lg border-b border-white/5 p-4', plan.highlighted ? 'bg-[rgba(255,93,58,0.06)]' : 'bg-white/[0.02]')}>
              <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                {plan.highlighted && (
                  <p className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: 'var(--ember-glow)', color: 'var(--ember)', border: '1px solid rgba(255,93,58,0.3)' }}>
                    <StarIcon className="h-3 w-3 fill-current" />Popular
                  </p>
                )}
                {frequency === 'yearly' && (
                  <p className="bg-primary text-primary-foreground flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs">
                    {Math.round(((plan.price.monthly * 12 - plan.price.yearly) / plan.price.monthly / 12) * 100)}% off
                  </p>
                )}
              </div>
              <div className="text-lg font-medium">{plan.name}</div>
              <p className="text-muted-foreground text-sm">{plan.info}</p>
              <h3 className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-bold">€{plan.price[frequency]}</span>
                <span className="text-muted-foreground">{plan.name !== 'Free' ? '/' + (frequency === 'monthly' ? 'month' : 'year') : ''}</span>
              </h3>
            </div>
            <div className={cn('text-muted-foreground space-y-4 px-4 py-6 text-sm')}>
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircleIcon className="text-foreground h-4 w-4" />
                  <p>{feature.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-auto w-full border-t border-white/5 p-3">
              {plan.highlighted ? (
                <a href={plan.btn.href}
                  className="flex items-center justify-center w-full px-4 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, var(--ember) 0%, #FF8C5A 100%)',
                    boxShadow: '0 0 20px rgba(255,93,58,0.3)',
                  }}>
                  {plan.btn.text}
                </a>
              ) : (
                <a href={plan.btn.href}
                  className="flex items-center justify-center w-full px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:bg-white/5"
                  style={{ color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {plan.btn.text}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PricingSection;
