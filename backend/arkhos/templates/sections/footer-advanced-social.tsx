"use client";

import {
    Share2,
    MessageCircle,
    Link as LinkIcon,
    Globe,
    Feather,
    Send,
} from 'lucide-react';

const links = [
    {
        group: 'Product',
        items: [
            { title: 'Features', href: '#' },
            { title: 'Solution', href: '#' },
            { title: 'Customers', href: '#' },
            { title: 'Pricing', href: '#' },
            { title: 'Help', href: '#' },
            { title: 'About', href: '#' },
        ],
    },
    {
        group: 'Solution',
        items: [
            { title: 'Startup', href: '#' },
            { title: 'Freelancers', href: '#' },
            { title: 'Organizations', href: '#' },
            { title: 'Students', href: '#' },
            { title: 'Collaboration', href: '#' },
            { title: 'Design', href: '#' },
            { title: 'Management', href: '#' },
        ],
    },
    {
        group: 'Company',
        items: [
            { title: 'About', href: '#' },
            { title: 'Careers', href: '#' },
            { title: 'Blog', href: '#' },
            { title: 'Press', href: '#' },
            { title: 'Contact', href: '#' },
            { title: 'Help', href: '#' },
        ],
    },
    {
        group: 'Legal',
        items: [
            { title: 'Licence', href: '#' },
            { title: 'Privacy', href: '#' },
            { title: 'Cookies', href: '#' },
            { title: 'Security', href: '#' },
        ],
    },
];

const socialLinks = [
    { label: 'Share', icon: Share2 },
    { label: 'Message', icon: MessageCircle },
    { label: 'Link', icon: LinkIcon },
    { label: 'Website', icon: Globe },
    { label: 'Blog', icon: Feather },
    { label: 'Contact', icon: Send },
];

export default function FooterAdvancedSocial() {
    return (
        <footer className="border-b bg-white pt-20 dark:bg-transparent">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-12 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <a
                            href="/"
                            aria-label="go home"
                            className="block size-fit text-xl font-bold"
                        >
                            Brand
                        </a>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-3">
                        {links.map((linkGroup, groupIndex) => (
                            <div
                                key={groupIndex}
                                className="space-y-4 text-sm"
                            >
                                <span className="block font-medium">{linkGroup.group}</span>
                                {linkGroup.items.map((item, itemIndex) => (
                                    <a
                                        key={itemIndex}
                                        href={item.href}
                                        className="text-muted-foreground hover:text-primary block duration-150"
                                    >
                                        <span>{item.title}</span>
                                    </a>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
                    <span className="text-muted-foreground order-last block text-center text-sm md:order-first">
                        &copy; {new Date().getFullYear()} Company, All rights reserved
                    </span>
                    <div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last">
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
                </div>
            </div>
        </footer>
    );
}
