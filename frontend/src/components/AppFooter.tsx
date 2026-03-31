import { SocialIcons } from '@/components/ui/social-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AppFooter() {
  return (
    <footer className="relative bg-[#020408] border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[180px] font-bold text-white/[0.03] font-[Syne] whitespace-nowrap tracking-tighter">
          Build something
        </span>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center">
                <span className="text-white font-bold text-sm font-[Syne]">A</span>
              </div>
              <span className="text-white font-bold text-lg font-[Syne]">ArkhosAI</span>
            </div>
            <p className="text-[#DCE9F5]/50 text-sm leading-relaxed">
              EU-sovereign AI website generator.
              Built in France, powered by Mistral.
            </p>
            <div className="flex flex-wrap gap-2">
              {['🇪🇺 GDPR', 'MIT', 'Scaleway', 'Mistral AI'].map(badge => (
                <span key={badge} className="px-2 py-1 rounded-md border border-white/10 text-[10px] text-[#DCE9F5]/50 font-mono">{badge}</span>
              ))}
            </div>
            <SocialIcons />
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm">Product</h4>
            <ul className="space-y-3">
              {['Generator', 'Gallery', 'Pricing', 'Changelog', 'Roadmap'].map(link => (
                <li key={link}><a href={`/${link.toLowerCase()}`} className="text-[#DCE9F5]/50 hover:text-[#DCE9F5] text-sm transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Imprint', 'DPA'].map(link => (
                <li key={link}><a href={`/${link.toLowerCase().replace(/ /g, '-')}`} className="text-[#DCE9F5]/50 hover:text-[#DCE9F5] text-sm transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm">Stay updated</h4>
            <p className="text-[#DCE9F5]/50 text-sm">Get notified of new features and releases.</p>
            <div className="flex gap-2">
              <Input placeholder="your@email.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm" />
              <Button size="sm" className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white shrink-0">Join</Button>
            </div>
            <p className="text-[#DCE9F5]/30 text-xs">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#DCE9F5]/30 text-xs">© 2026 Bleucommerce SAS · Orléans, France 🇫🇷</p>
          <p className="text-[#DCE9F5]/30 text-xs">
            Powered by <a href="https://github.com/Jesiel-dev-creator/Arkhos" className="text-[#FF6B35] hover:underline">Tramontane</a>
            {' · '}<a href="https://mistral.ai" className="hover:text-[#DCE9F5]/60 transition-colors">Mistral AI</a>
            {' · '}<a href="https://scaleway.com" className="hover:text-[#DCE9F5]/60 transition-colors">Scaleway</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
