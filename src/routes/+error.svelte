<main
    class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 py-24 sm:py-32 lg:px-8"
>
    <div
        class="absolute left-1/2 top-0 -z-10 h-100 w-200 -translate-x-1/2 opacity-20 blur-[120px] bg-linear-to-r from-blue-600 to-cyan-400"
    ></div>

    <div class="text-center relative z-10">
        <p class="text-6xl font-black text-orange-500 drop-shadow-sm animate-pulse">404</p>

        <h1 class="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">Page lost in the sand</h1>

        <p class="mt-6 text-base leading-7 text-slate-400 max-w-md mx-auto">
            Sorry, we couldn't find the court you were looking for. It might have been moved or the match ended.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
            <a
                href="/booking"
                class="glass w-full sm:w-auto rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-xl transition-all hover:scale-105 hover:bg-white/10 active:scale-95 text-center"
            >
                Book a Court
            </a>

            <a href="/" class="text-sm font-semibold text-slate-300 hover:text-white transition-colors py-2">
                Go back home <span aria-hidden="true">&rarr;</span>
            </a>
        </div>
    </div>

    <div
        class="absolute inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
    ></div>
</main>
