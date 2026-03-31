import React from 'react';
import { MenuIcon } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingHeaderProps {
  logo?: React.ReactNode;
  links?: Array<{ label: string; href: string }>;
  cta?: { label: string; href: string };
}

export function FloatingHeader({ logo, links = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Open Source', href: 'https://github.com/Jesiel-dev-creator/Arkhos' },
], cta = { label: 'Start building free', href: '/generate' } }: FloatingHeaderProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <header className={cn('sticky top-5 z-50 mx-auto w-full max-w-4xl rounded-lg border border-white/10 shadow', 'bg-[#020408]/90 supports-[backdrop-filter]:bg-[#020408]/80 backdrop-blur-lg')}>
      <nav className="mx-auto flex items-center justify-between p-1.5">
        <div className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1">
          {logo || <span className="font-[Syne] font-bold text-white text-lg">ArkhosAI</span>}
        </div>
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a key={link.label} className={buttonVariants({ variant: 'ghost', size: 'sm' })} href={link.href}
              style={{ color: '#DCE9F5', opacity: 0.7 }}>{link.label}</a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white hidden sm:flex">
            <a href={cta.href}>{cta.label}</a>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="lg:hidden border-white/20">
              <MenuIcon className="size-4" />
            </Button>
            <SheetContent side="left" className="bg-[#020408] border-white/10">
              <div className="grid gap-y-2 px-4 pt-12 pb-5">
                {links.map((link) => (
                  <a key={link.label} className={buttonVariants({ variant: 'ghost', className: 'justify-start text-[#DCE9F5]' })} href={link.href}>{link.label}</a>
                ))}
                <Button className="mt-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white">
                  <a href={cta.href}>{cta.label}</a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

export default FloatingHeader;
