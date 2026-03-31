"use client"

import { Button } from '@/components/ui/button'

export default function StatsSection() {
    return (
        <section>
            <div className="py-12">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="space-y-6 text-center">
                        <h2 className="text-foreground text-balance text-3xl font-semibold lg:text-4xl">Build 10x Faster with Mist</h2>
                        <div className="flex justify-center gap-3">
                            <Button
                                asChild
                                size="lg">
                                <a href="#">Get Started</a>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg">
                                <a href="#">Get a Demo</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
