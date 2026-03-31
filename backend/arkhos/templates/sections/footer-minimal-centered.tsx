"use client";

import {
    Globe,
    Share2,
    MessageCircle,
    Link as LinkIcon,
    Send,
    Feather,
} from 'lucide-react';

const links = [
    { title: 'Features', href: '#' },
    { title: 'Solution', href: '#' },
    { title: 'Customers', href: '#' },
    { title: 'Pricing', href: '#' },
    { title: 'Help', href: '#' },
    { title: 'About', href: '#' },
];

const socialLinks = [
    { label: 'Share', icon: Share2 },
    { label: 'Message', icon: MessageCircle },
    { label: 'Link', icon: LinkIcon },
    { label: 'Website', icon: Globe },
    { label: 'Send', icon: Send },
    { label: 'Blog', icon: Feather },
];

export default function FooterMinimalCentered() {
    return (
        <footer className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <a
                    href="/"
                    aria-label="go home"
                    className="mx-auto block size-fit text-xl font-bold"
                >
                    Brand
                </a>

                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    {links.map((link, index) => (
                        <a
                            key={index}
                            href={link.href}
                            className="text-muted-foreground hover:text-primary block duration-150"
                        >
                            <span>{link.title}</span>
                        </a>
                    ))}
                </div>
                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    {socialLinks.map((social) => {
                        const Icon = social.icon;
                        return (
                            <a
                                key={social.label}
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                className="text-muted-foreground hover:text-primary block"
                            >
                                <Icon className="size-6" />
                            </a>
                        );
                    })}
                </div>
                <span className="text-muted-foreground block text-center text-sm">
                    &copy; {new Date().getFullYear()} Company, All rights reserved
                </span>
            </div>
        </footer>
    );
}
