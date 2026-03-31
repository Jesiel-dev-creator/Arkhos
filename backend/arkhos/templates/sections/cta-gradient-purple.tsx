"use client"

export default function CtaGradientPurple() {
    return (
        <div className="max-w-5xl py-16 md:w-full mx-2 md:mx-auto flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#5524B7] to-[#380B60] rounded-2xl p-10 text-white">
            <div className="flex flex-wrap items-center justify-center p-1 rounded-full bg-purple-600/10 backdrop-blur border border-purple-500/40 text-sm">
                <div className="flex items-center">
                    <img crossOrigin="anonymous" className="size-6 md:size-7 rounded-full border-3 border-white"
                        src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=50" alt="userImage1" />
                    <img crossOrigin="anonymous" className="size-6 md:size-7 rounded-full border-3 border-white -translate-x-2"
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=50" alt="userImage2" />
                    <img crossOrigin="anonymous" className="size-6 md:size-7 rounded-full border-3 border-white -translate-x-4"
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=50&h=50&auto=format&fit=crop"
                        alt="userImage3" />
                </div>
                <p className="-translate-x-2 font-medium">Join community of 1m+ founders </p>
            </div>
            <h1 className="text-4xl md:text-5xl md:leading-[60px] font-semibold max-w-xl mt-5 bg-gradient-to-r from-white to-[#CAABFF] text-transparent bg-clip-text">Unlock your next big opportunity.</h1>
            <button className="px-8 py-3 text-white bg-violet-600 hover:bg-violet-700 transition-all rounded-full uppercase text-sm mt-8">
                Join Discord
            </button>
        </div>
    );
}
