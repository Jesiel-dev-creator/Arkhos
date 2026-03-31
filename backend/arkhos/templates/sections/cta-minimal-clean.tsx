"use client"

export default function CtaMinimalClean() {
    return (
        <div className="flex flex-col items-center bg-white py-16 px-4 max-w-5xl w-full text-center border border-gray-200 rounded-2xl">
            <h1 className="text-3xl sm:text-4xl font-semibold sm:font-bold text-gray-800">Start your free trial now.</h1>
            <p className="max-w-2xl text-slate-500 mt-4 max-sm:text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti temporibus, adipisci, quod omnis labore nobis velit, eaque placeat quas rem repellendus architecto!</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-sm:w-full">
                <button type="button" className="group flex items-center justify-center gap-2 px-6 py-2 border border-indigo-500 rounded-full text-indigo-500">
                    Learn More
                    <svg className="mt-0.5 group-hover:translate-x-1 transition-all" width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5.5h13.092M8.949 1l5.143 4.5L8.949 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button type="button" className="bg-indigo-500 hover:bg-indigo-600 transition-all px-4 py-2 text-white font-medium rounded-full">
                    Get Started
                </button>
            </div>
        </div>
    );
}
