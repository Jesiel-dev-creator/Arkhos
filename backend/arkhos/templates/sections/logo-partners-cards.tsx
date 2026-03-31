"use client";

interface Partner {
  name: string;
  logoSrc: string;
  description?: string;
}

const defaultPartners: Partner[] = [
  { name: "Nvidia", logoSrc: "https://html.tailus.io/blocks/customers/nvidia.svg", description: "GPU Computing" },
  { name: "OpenAI", logoSrc: "https://html.tailus.io/blocks/customers/openai.svg", description: "AI Research" },
  { name: "GitHub", logoSrc: "https://html.tailus.io/blocks/customers/github.svg", description: "Developer Platform" },
  { name: "Nike", logoSrc: "https://html.tailus.io/blocks/customers/nike.svg", description: "Sportswear" },
  { name: "Vercel", logoSrc: "https://html.tailus.io/blocks/customers/vercel.svg", description: "Web Platform" },
  { name: "Laravel", logoSrc: "https://html.tailus.io/blocks/customers/laravel.svg", description: "PHP Framework" },
];

export default function LogoPartnersCards({
  partners = defaultPartners,
  title = "Our Partners",
  subtitle = "Trusted by industry leaders across the globe",
}: {
  partners?: Partner[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
          <p className="mt-3 text-muted-foreground text-sm max-w-lg mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            >
              <img
                src={partner.logoSrc}
                alt={`${partner.name} logo`}
                className="h-8 w-auto object-contain dark:invert opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                crossOrigin="anonymous"
              />
              <span className="mt-3 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {partner.name}
              </span>
              {partner.description && (
                <span className="text-[10px] text-muted-foreground/60">
                  {partner.description}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
