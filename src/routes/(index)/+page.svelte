<script lang="ts">
    import { LANG_KEY, type LanguageStateType } from "$lib/i18n.svelte";
    import { getContext, onMount } from "svelte";

    const lang = getContext<LanguageStateType>(LANG_KEY);

    let imgModal = $state(false);
    let imgPath = $state("");
    let showMap = $state(false);
    let imgLinks = $state([
        "/courts/snimka1.jpg",
        "/courts/snimka2.jpg",
        "/courts/snimka3.jpg",
        "/courts/snimka4.jpg",
        "/courts/snimka5.jpg",
        "/courts/snimka6.jpg",
    ]);

    onMount(() => {
        setTimeout(() => {
            showMap = true;
        }, 3000);
    });
</script>

<svelte:head>
    <title>Grebna Beach Court</title>
    <meta
        name="description"
        content="Discover Grebna Beach Court - the premier destination for beach volleyball enthusiasts. Experience top-notch facilities, vibrant community, and unforgettable matches. Join us for an unparalleled beach volleyball experience!"
    />
</svelte:head>

<main class="bg-slate-900 text-white overflow-x-hidden">
    <nav class="absolute top-0 w-full z-50 p-6">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <a href="/" class="text-2xl font-black tracking-tighter uppercase italic">
                G<span class="text-orange-500">BC</span>
            </a>
            <div class="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-widest">
                <a href="#pricing" class="hover:text-orange-500 transition">
                    {lang.t("pricing")}
                </a>
                <a href="#gallery" class="hover:text-orange-500 transition">
                    {lang.t("gallery")}
                </a>
                <a href="#contacts" class="hover:text-orange-500 transition">
                    {lang.t("contact")}
                </a>
            </div>
            <button
                onclick={() => lang.toggle()}
                class="px-3 py-1 bg-orange-500 rounded text-xs font-black uppercase cursor-pointer"
            >
                <span class="text-slate-900">{lang.current === "en" ? "EN" : "BG"}</span>
            </button>
        </div>
    </nav>

    <section class="relative h-screen flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
            <div
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-300 h-300 opacity-100"
                style="background: radial-gradient(circle, rgba(234, 88, 12, 0.2) 0%, rgba(234, 88, 12, 0) 70%);"
            ></div>
        </div>

        <div class="relative z-10 text-center px-4">
            <h1 class="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-4 italic">
                Grebna <br />
                <span class="text-orange-500 drop-shadow-2xl">Beach Court</span>
            </h1>
            <p class="max-w-xl mx-auto text-slate-400 text-lg md:text-xl mb-10 font-medium leading-relaxed">
                <span>{lang.t("info")}</span>
            </p>

            <div class="flex flex-col md:flex-row items-center justify-center gap-4">
                <a
                    href="/booking"
                    class="group relative px-10 py-5 bg-orange-500 hover:bg-orange-400 text-slate-900 font-black uppercase tracking-widest rounded-full transition-all transform hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
                >
                    <span>{lang.t("book_now")}</span>
                    <span class="ml-2 group-hover:translate-x-2 inline-block transition-transform">&rarr;</span>
                </a>
            </div>
        </div>
    </section>

    <section id="pricing" class="py-32 bg-slate-900 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-6 relative z-10">
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-6xl font-black uppercase italic">
                    {lang.t("pricing_section_title")}
                    <span class="text-orange-500 text-md">{lang.t("pricing_section_title_2")}</span>
                </h2>
                <p class="text-slate-400 mt-4 uppercase tracking-widest font-bold text-sm">
                    {lang.t("pricing_section_desc")}
                </p>
            </div>

            <div class="glass p-7 rounded-3xl border-2 border-orange-500/30 text-center w-75 md:w-1/2 mx-auto">
                <div class="text-orange-500 font-black uppercase tracking-widest text-sm mb-2">
                    {lang.t("court_price")}
                </div>
                <div class="text-7xl font-black mb-4">
                    €25
                    <span class="text-2xl text-slate-500">/{lang.t("hour_label_short")}</span>
                </div>
                <ul class="text-slate-300 space-y-4 mb-8 font-medium">
                    <li class="flex items-center justify-center gap-2">
                        <span class="text-green-500">✓</span>
                        <span>{lang.t("court_price_desc")}</span>
                    </li>
                    <li class="flex items-center justify-center gap-2">
                        <span class="text-green-500">✓</span>
                        <span>{lang.t("court_price_desc_2")}</span>
                    </li>
                    <li class="flex items-center justify-center gap-2 text-orange-400 font-bold">
                        <span class="text-orange-500 font-black">★</span>
                        <span>{lang.t("court_price_desc_3")}</span>
                    </li>
                </ul>
            </div>
        </div>
    </section>

    <section id="gallery" class="py-32 bg-slate-950">
        <div class="max-w-7xl mx-auto px-6">
            <div class="flex justify-between items-end mb-12">
                <div>
                    <h2 class="text-4xl font-black uppercase italic">
                        {#if lang.current === "en"}
                            <span>{lang.t("courts_title")}</span>
                        {/if}

                        <span class="text-orange-500">
                            {lang.t(lang.current === "en" ? "courts_title_2" : "courts_title")}
                        </span>
                    </h2>
                    <p class="text-slate-500 uppercase tracking-widest text-xs font-bold mt-2">
                        <span>{lang.t("courts_desc")}</span>
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                {#each imgLinks as img (img)}
                    <div
                        class="overflow-hidden rounded-2xl aspect-square glass cursor-zoom-in group"
                        onclick={() => {
                            imgPath = img;
                            imgModal = true;
                        }}
                    >
                        <img
                            width="800"
                            height="400"
                            src={img}
                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale hover:grayscale-0"
                            alt="Court view"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <section id="contacts" class="py-32 bg-slate-900">
        <div class="max-w-4xl mx-auto px-6 text-center">
            <h2 class="text-4xl font-black uppercase italic mb-12 text-orange-500 decoration-white">
                <span>{lang.t("questions")}</span>
            </h2>

            <div class="grid grid-cols-2 gap-8 mb-12">
                <div
                    class="glass p-10 rounded-3xl border-b-4 border-green-500 flex flex-col justify-center items-center"
                >
                    <a
                        href="https://chat.whatsapp.com/Fxgfdx6CTOUGs92OH60LvV"
                        target="_blank"
                        class="bg-green-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-green-600 transition-all inline-block"
                    >
                        WhatsApp
                    </a>
                </div>

                <div
                    class="glass p-10 rounded-3xl border-b-4 border-orange-500 flex flex-col justify-center items-center"
                >
                    <a
                        href="tel:+359888907078"
                        class="bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-orange-600 transition-all inline-block"
                    >
                        {lang.current === "bg" ? "Телефон" : "Phone"}
                    </a>
                </div>

                <div
                    class="glass p-10 rounded-3xl border-b-4 border-pink-500 flex flex-col justify-center items-center"
                >
                    <a
                        href="https://www.instagram.com/grebnabeachcourt"
                        target="_blank"
                        class="bg-pink-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-pink-600 transition-all inline-block"
                    >
                        Instagram
                    </a>
                </div>

                <div
                    class="glass p-10 rounded-3xl border-b-4 border-blue-500 flex flex-col justify-center items-center"
                >
                    <a
                        href="https://www.facebook.com/grebnabeachcourt"
                        target="_blank"
                        class="bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-blue-600 transition-all inline-block"
                    >
                        Facebook
                    </a>
                </div>
            </div>

            <div class="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/10 glass">
                {#if !showMap}
                    <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                        <p class="text-sm font-medium">Loading Map...</p>
                    </div>
                {:else}
                    <iframe
                        title="Location Map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2958.1517754057472!2d24.7153753770172!3d42.14703884853166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14acd1d703583cb5%3A0x62887000b29d6d89!2z0J_Qu9Cw0LbQtdC9INCy0L7Qu9C10LnQsdC-0Lsg0J_Qu9C-0LLQtNC40LI!5e0!3m2!1sen!2sbg!4v1777241867953!5m2!1sen!2sbg"
                        class="w-full h-full"
                        style="border: 0"
                        allowfullscreen
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                {/if}
            </div>
        </div>
    </section>

    <footer
        class="py-12 border-t border-slate-800 text-center text-slate-600 text-sm font-medium uppercase tracking-widest"
    >
        &copy; {new Date().getFullYear()} Grebna Beach Court.
        <span>{lang.t("rights_reserved")}</span>
    </footer>

    {#if imgModal}
        <div
            class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
            onclick={() => (imgModal = false)}
        >
            <button class="absolute top-10 right-10 text-white text-4xl font-light hover:text-orange-500 transition">
                &times;
            </button>

            <img
                src={imgPath}
                class="max-w-full max-h-[90vh] rounded-xl shadow-2xl border-4 border-white/10"
                alt="Court view"
            />
        </div>
    {/if}
</main>
