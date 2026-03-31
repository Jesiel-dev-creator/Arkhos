"use client";

import React from 'react';
import { Grid2x2PlusIcon, MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NavbarFloatingGlass() {
	const [open, setOpen] = React.useState(false);

	const links = [
		{
			label: 'Features',
			href: '#',
		},
		{
			label: 'Pricing',
			href: '#',
		},
		{
			label: 'About',
			href: '#',
		},
	];

	return (
		<header
			className={cn(
				'sticky top-5 z-50',
				'mx-auto w-full max-w-3xl rounded-lg border shadow',
				'bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg',
			)}
		>
			<nav className="mx-auto flex items-center justify-between p-1.5">
				<div className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 duration-100">
					<Grid2x2PlusIcon className="size-5" />
					<p className="font-mono text-base font-bold">Brand</p>
				</div>
				<div className="hidden items-center gap-1 lg:flex">
					{links.map((link) => (
						<a
							className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 px-3"
							href={link.href}
							key={link.label}
						>
							{link.label}
						</a>
					))}
				</div>
				<div className="flex items-center gap-2">
					<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3">
						Login
					</button>
					<button
						onClick={() => setOpen(!open)}
						className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 lg:hidden"
					>
						<MenuIcon className="size-4" />
					</button>
				</div>
			</nav>
			{open && (
				<div className="lg:hidden border-t p-4">
					<div className="grid gap-y-2">
						{links.map((link) => (
							<a
								className="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground px-3 py-2 justify-start"
								href={link.href}
								key={link.label}
							>
								{link.label}
							</a>
						))}
					</div>
					<div className="mt-4 flex flex-col gap-2">
						<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
							Sign In
						</button>
						<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
							Get Started
						</button>
					</div>
				</div>
			)}
		</header>
	);
}
