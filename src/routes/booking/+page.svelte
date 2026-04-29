<script lang="ts">
    import { invalidate } from "$app/navigation";
    import Loader from "$lib/components/Loader.svelte";
    import { LANG_KEY, type LanguageStateType } from "$lib/i18n.svelte";
    import { getContext } from "svelte";

    const lang = getContext<LanguageStateType>(LANG_KEY);
    let { data } = $props();

    // --- State ---
    const now = new Date();
    let month = $state(now.getMonth());
    let year = $state(now.getFullYear());
    let selectedDate = $state<{ year: number; month: number; date: number } | null>({
        year: now.getFullYear(),
        month: now.getMonth(),
        date: now.getDate(),
    });

    let selectedTime = $state<number | null>(null);
    let duration = $state(1);
    let activeCourt = $state<"court_a" | "court_b">("court_a");
    let loading = $state(false);

    // Modal & Form State
    let showModal = $state(false);
    let userName = $state("");
    let userPhone = $state("");

    let toast = $state({ show: false, message: "", type: "success" });

    // --- Constants ---
    const timeSlots = [
        "08:00",
        "08:30",
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30",
        "19:00",
        "19:30",
        "20:00",
        "20:30",
        "21:00",
        "21:30",
    ];

    // --- Optimized Reactive Memos ---
    const bookedData = $derived(() => {
        const serverData = data.bookedDataFromServer || { court_a: {}, court_b: {} };
        return serverData;
    });
    const offDays = $derived(() => data.offDaysFromServer || { weekdays: [], specificDates: [] });

    // Automatically recalculates whenever month() or year() changes
    const calendar = $derived(() => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const dayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        return {
            blanks: Array.from({ length: dayOffset }, (_, i) => i),
            days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
        };
    });

    const phoneValid = $derived(() => {
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        const cleanPhone = userPhone.replace(/[\s\-\(\)]/g, "");
        return phoneRegex.test(cleanPhone);
    });

    const courts = $derived(() => [
        { id: "court_a", name: lang.t("court_a") },
        { id: "court_b", name: lang.t("court_b") },
    ]);

    const DAYS_MON_START = $derived(() =>
        lang.current === "bg"
            ? ["Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"]
            : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    );

    const MONTH_NAMES = $derived(() =>
        lang.current === "bg"
            ? [
                  "Януари",
                  "Февруари",
                  "Март",
                  "Април",
                  "Май",
                  "Юни",
                  "Юли",
                  "Август",
                  "Септември",
                  "Октомври",
                  "Ноември",
                  "Декември",
              ]
            : [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
              ],
    );

    // --- Helper Functions ---
    const isOffDay = (date: number) => {
        const d = new Date(year, month, date);
        const dateString = `${year}-${month + 1}-${date}`;
        return offDays().weekdays.includes(d.getDay()) || offDays().specificDates.includes(dateString);
    };

    const isBooked = (index: number) => {
        const date = selectedDate;
        if (!date || index >= timeSlots.length) return true;
        const dateKey = `${date.year}-${date.month + 1}-${date.date}`;
        return bookedData()[activeCourt]?.[dateKey]?.includes(timeSlots[index]) ?? false;
    };

    const canBookBlock = (startIndex: number) => {
        const numSlotsNeeded = duration / 0.5;
        if (startIndex + numSlotsNeeded > timeSlots.length) return false;
        for (let i = 0; i < numSlotsNeeded; i++) {
            if (isBooked(startIndex + i)) return false;
        }
        return true;
    };

    const isSelected = (date: number) =>
        selectedDate?.date === date && selectedDate?.month === month && selectedDate?.year === year;
    const isToday = (date: number) => new Date().toDateString() === new Date(year, month, date).toDateString();
    const isPast = (date: number) => {
        const d = new Date(year, month, date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d < today;
    };

    const selectDate = (date: number) => {
        selectedDate = { date, month: month, year: year };
        selectedTime = null;
    };

    const formatDate = (obj: { year: number; month: number; date: number } | null) => {
        if (!obj) return "";
        const langCode = lang.current === "bg" ? "bg-BG" : "en-US";
        return new Date(obj.year, obj.month, obj.date).toLocaleDateString(langCode, {
            weekday: "long",
            month: "short",
            day: "numeric",
        });
    };

    const changeMonth = (delta: number) => {
        let newMonth = month + delta;
        let newYear = year;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        month = newMonth;
        year = newYear;
    };

    const makeBooking = async () => {
        const date = selectedDate;
        const timeIdx = selectedTime;
        if (!phoneValid() || !date || timeIdx === null) return;

        const numSlots = duration / 0.5;
        const reservedSlots = timeSlots.slice(timeIdx, timeIdx + numSlots);

        const payload = {
            userName: userName,
            userPhone: userPhone,
            courtId: activeCourt,
            courtName: courts().find((c) => c.id === activeCourt)?.name || "",
            date: `${date.year}-${date.month + 1}-${date.date}`,
            dateLabel: formatDate(date),
            slots: reservedSlots,
            duration: duration,
            timeLabel: timeSlots[timeIdx],
        };

        loading = true;
        try {
            const response = await fetch("/api/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            await invalidate("booking:data");
            showModal = false;
            selectedTime = null;

            if (!result.error) {
                userName = "";
                userPhone = "";
                toast = { show: true, message: lang.t("reservation_confirmed"), type: "success" };
            } else {
                toast = { show: true, message: lang.t(result.error), type: "error" };
            }
        } catch (e) {
            toast = { show: true, message: "Error", type: "error" };
        } finally {
            loading = false;
            setTimeout(() => (toast = { ...toast, show: false }), 3000);
        }
    };
</script>

<svelte:head>
    <title>Grebna Beach Court - Booking</title>
    <meta
        name="description"
        content="Book your court at Grebna Beach with our easy-to-use reservation system. Choose your date, time, and duration, and secure your spot for an unforgettable beach volleyball experience."
    />
</svelte:head>

<main class="bg-slate-50 p-4 md:p-8 font-sans">
    <div class="max-w-6xl mx-auto space-y-6">
        <nav class="flex items-center justify-between">
            <a href="/" class="text-slate-800 hover:text-orange-500">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        d="M11.25 18C11.25 18.4142 11.5858 18.75 12 18.75C12.4142 18.75 12.75 18.4142 12.75 18V15C12.75 14.5858 12.4142 14.25 12 14.25C11.5858 14.25 11.25 14.5858 11.25 15V18Z"
                        fill="currentColor"
                    />
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12 1.25C11.2919 1.25 10.6485 1.45282 9.95055 1.79224C9.27585 2.12035 8.49642 2.60409 7.52286 3.20832L5.45628 4.4909C4.53509 5.06261 3.79744 5.5204 3.2289 5.95581C2.64015 6.40669 2.18795 6.86589 1.86131 7.46263C1.53535 8.05812 1.38857 8.69174 1.31819 9.4407C1.24999 10.1665 1.24999 11.0541 1.25 12.1672V13.7799C1.24999 15.6837 1.24998 17.1866 1.4027 18.3616C1.55937 19.567 1.88856 20.5401 2.63236 21.3094C3.37958 22.0824 4.33046 22.4277 5.50761 22.5914C6.64849 22.75 8.10556 22.75 9.94185 22.75H14.0581C15.8944 22.75 17.3515 22.75 18.4924 22.5914C19.6695 22.4277 20.6204 22.0824 21.3676 21.3094C22.1114 20.5401 22.4406 19.567 22.5973 18.3616C22.75 17.1866 22.75 15.6838 22.75 13.7799V12.1672C22.75 11.0541 22.75 10.1665 22.6818 9.4407C22.6114 8.69174 22.4646 8.05812 22.1387 7.46263C21.8121 6.86589 21.3599 6.40669 20.7711 5.95581C20.2026 5.5204 19.4649 5.06262 18.5437 4.49091L16.4771 3.20831C15.5036 2.60409 14.7241 2.12034 14.0494 1.79224C13.3515 1.45282 12.7081 1.25 12 1.25ZM8.27953 4.50412C9.29529 3.87371 10.0095 3.43153 10.6065 3.1412C11.1882 2.85833 11.6002 2.75 12 2.75C12.3998 2.75 12.8118 2.85833 13.3935 3.14119C13.9905 3.43153 14.7047 3.87371 15.7205 4.50412L17.7205 5.74537C18.6813 6.34169 19.3559 6.76135 19.8591 7.1467C20.3487 7.52164 20.6303 7.83106 20.8229 8.18285C21.0162 8.53589 21.129 8.94865 21.1884 9.58104C21.2492 10.2286 21.25 11.0458 21.25 12.2039V13.725C21.25 15.6959 21.2485 17.1012 21.1098 18.1683C20.9736 19.2163 20.717 19.8244 20.2892 20.2669C19.8649 20.7058 19.2871 20.9664 18.2858 21.1057C17.2602 21.2483 15.9075 21.25 14 21.25H10C8.09247 21.25 6.73983 21.2483 5.71422 21.1057C4.71286 20.9664 4.13514 20.7058 3.71079 20.2669C3.28301 19.8244 3.02642 19.2163 2.89019 18.1683C2.75149 17.1012 2.75 15.6959 2.75 13.725V12.2039C2.75 11.0458 2.75076 10.2286 2.81161 9.58104C2.87103 8.94865 2.98385 8.53589 3.17709 8.18285C3.36965 7.83106 3.65133 7.52164 4.14092 7.1467C4.6441 6.76135 5.31869 6.34169 6.27953 5.74537L8.27953 4.50412Z"
                        fill="currentColor"
                    />
                </svg>
            </a>
            <button
                onclick={() => lang.toggle()}
                class="px-3 py-1 bg-orange-500 rounded text-xs font-black uppercase cursor-pointer"
            >
                <span class="text-slate-900">{lang.current === "en" ? "EN" : "BG"}</span>
            </button>
        </nav>
        <div
            class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
            <div>
                <h1 class="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {lang.t("court_reservation")}
                </h1>
                <p class="text-xs text-slate-500 font-bold uppercase tracking-widest">{lang.t("select_court")}</p>
            </div>

            <div class="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                {#each courts() as court (court.id)}
                    <button
                        onclick={() => {
                            activeCourt = court.id as "court_a" | "court_b";
                            selectedTime = null;
                        }}
                        class={`flex-1 md:px-8 py-2 rounded-lg text-sm font-bold transition-all w-35 cursor-pointer ${activeCourt === court.id ? "bg-white shadow-sm text-orange-600" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        {court.name}
                    </button>
                {/each}
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 space-y-6">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div class="flex justify-between items-center mb-6">
                        <button onclick={() => changeMonth(-1)} class="p-2 hover:bg-slate-100 rounded-lg">
                            &larr;
                        </button>
                        <span class="font-bold text-slate-700">{`${MONTH_NAMES()[month]} ${year}`}</span>
                        <button onclick={() => changeMonth(1)} class="p-2 hover:bg-slate-100 rounded-lg">
                            &rarr;
                        </button>
                    </div>

                    <div class="grid grid-cols-7 gap-1 mb-2">
                        {#each DAYS_MON_START() as day (day)}
                            <div class="text-center text-[10px] font-bold text-slate-400 uppercase">
                                {day}
                            </div>
                        {/each}
                    </div>

                    <div class="grid grid-cols-7 gap-1">
                        {#each calendar().blanks as _, index (index)}
                            <div class="h-10"></div>
                        {/each}
                        {#each calendar().days as date (date)}
                            <button
                                onclick={() => {
                                    if (!isOffDay(date)) selectDate(date);
                                }}
                                disabled={isPast(date) || isOffDay(date)}
                                class={`h-10 w-full flex items-center justify-center rounded-xl text-sm ${isSelected(date) ? "bg-orange-600 text-white shadow-lg shadow-orange-200 font-bold" : ""} ${isOffDay(date) || isPast(date) ? "text-slate-200 cursor-not-allowed bg-slate-50 border-dashed border border-slate-100" : ""} ${!isSelected(date) && !isPast(date) && !isOffDay(date) ? "text-slate-600 hover:bg-orange-50" : ""} ${isToday(date) && !isSelected(date) ? "underline decoration-orange-500 decoration-2 underline-offset-4" : ""}`}
                            >
                                {date}
                            </button>
                        {/each}
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 class="text-sm font-black text-slate-800 uppercase mb-4 tracking-widest">
                        {lang.t("duration")}
                    </h2>
                    <div class="grid grid-cols-2 gap-2">
                        <button
                            onclick={() => {
                                duration = 1;
                                selectedTime = null;
                            }}
                            class={`py-2 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${duration === 1 ? "border-orange-500 bg-orange-50 text-orange-600" : "border-slate-100 text-slate-400 hover:border-slate-200"}`}
                        >
                            1 {lang.t("hours_long")}
                        </button>
                        <button
                            onclick={() => {
                                duration = 2;
                                selectedTime = null;
                            }}
                            class={`py-2 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${duration === 2 ? "border-orange-500 bg-orange-50 text-orange-600" : "border-slate-100 text-slate-400 hover:border-slate-200"}`}
                        >
                            2 {lang.t("hours_long")}
                        </button>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-8">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-full">
                    {#if !isOffDay(selectedDate!.date)}
                        <h2 class="text-lg font-bold text-slate-800 mb-1">{lang.t("available_times")}</h2>
                        <p class="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest">
                            <span class="text-orange-500">
                                {courts().find((c) => c.id === activeCourt)?.name}
                            </span>
                            &bull;
                            <span>{formatDate(selectedDate)}</span>
                        </p>

                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {#each timeSlots as slot, index (slot + index)}
                                <button
                                    onclick={() => {
                                        if (canBookBlock(index)) {
                                            selectedTime = index;
                                            setTimeout(() => {
                                                document
                                                    .getElementById("summary")
                                                    ?.scrollIntoView({ behavior: "smooth" });
                                            }, 0);
                                        }
                                    }}
                                    disabled={!canBookBlock(index)}
                                    class={`py-4 px-2 rounded-xl border-2 transition-all text-center relative group ${selectedTime === index ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100" : ""} ${!canBookBlock(index) ? "border-slate-50 opacity-40 cursor-not-allowed bg-slate-50 " : ""} ${canBookBlock(index) && selectedTime !== index ? "border-slate-100 hover:border-orange-200" : ""}`}
                                >
                                    <span class="block text-sm font-black text-slate-700">{slot}</span>
                                    <span
                                        class={`text-[9px] uppercase font-bold ${canBookBlock(index) ? "text-green-500" : "text-slate-400"}`}
                                    >
                                        {canBookBlock(index) ? lang.t("select") : lang.t("unavailable")}
                                    </span>
                                </button>
                            {/each}
                        </div>
                    {:else}
                        <div class="flex flex-col items-center justify-center py-20 text-center">
                            <div class="bg-slate-100 p-4 rounded-full mb-4 text-slate-400 font-black text-2xl">!</div>
                            <h3 class="text-xl font-bold text-slate-800">{lang.t("closed_title")}</h3>
                            <p class="text-slate-500 max-w-xs mx-auto">
                                <span>{lang.t("closed_desc")}</span>
                                <br />
                                <span>{lang.t("closed_desc_2")}</span>
                            </p>
                        </div>
                    {/if}

                    {#if selectedTime !== null && !isOffDay(selectedDate!.date)}
                        <div
                            id="summary"
                            class="mt-12 p-6 bg-slate-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6"
                        >
                            <div class="text-center md:text-left">
                                <p class="text-orange-400 text-xs font-black uppercase tracking-[0.2em]">
                                    {lang.t("summary")}
                                </p>
                                <p class="text-lg flex items-center gap-1">
                                    <span>{courts().find((c) => c.id === activeCourt)?.name}:</span>
                                    <span>{timeSlots[selectedTime!]}</span>
                                    <span>{lang.t("for")}</span>
                                    <span>{duration}</span>
                                    <span>{lang.t("hours_long")}</span>
                                </p>
                            </div>
                            <button
                                onclick={() => (showModal = true)}
                                class="w-full md:w-auto bg-orange-500 hover:bg-orange-400 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all"
                            >
                                <span>{lang.t("book")}</span>
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        {#if showModal}
            <div
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm m-0"
                onclick={(e) => {
                    if (e.target === e.currentTarget) showModal = false;
                }}
            >
                <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-hidden relative">
                    <h2 class="text-2xl font-black text-slate-800 mb-2 italic uppercase">
                        {lang.t("finish_booking")}
                    </h2>
                    <p class="text-slate-500 text-sm mb-6 uppercase tracking-widest font-bold">
                        {lang.t("enter_details")}
                    </p>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">
                                {lang.t("name")}
                            </label>
                            <input
                                type="text"
                                value={userName}
                                oninput={(e) => (userName = e.currentTarget.value)}
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700 font-bold"
                                placeholder="e.g. Ivan Ivanov"
                            />
                        </div>
                        <div>
                            <label class="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">
                                {lang.t("phone")}
                            </label>
                            <input
                                type="tel"
                                value={userPhone}
                                oninput={(e) => (userPhone = e.currentTarget.value)}
                                class={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700 font-bold ${userPhone && !phoneValid() ? "border-red-500 ring-1 ring-red-100" : ""}`}
                                placeholder="+359 888 123 456"
                            />

                            {#if userPhone && !phoneValid()}
                                <p class="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase">
                                    <span>{lang.t("valid_phone")}</span>
                                </p>
                            {/if}
                        </div>
                    </div>

                    <div class="mt-8 flex gap-3">
                        <button
                            onclick={() => (showModal = false)}
                            class="flex-1 py-4 bg-slate-100 text-slate-400 font-black uppercase text-xs rounded-xl hover:bg-slate-200 transition"
                        >
                            <span>{lang.t("cancel")}</span>
                        </button>
                        <button
                            onclick={() => makeBooking()}
                            disabled={!phoneValid() || loading || !userName}
                            class="flex-2 py-4 bg-orange-500 text-white font-black uppercase text-xs rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>{lang.t("confirm")}</span>
                        </button>
                    </div>
                </div>
            </div>
        {/if}

        {#if toast.show}
            <div class="fixed top-10 left-1/2 -translate-x-1/2 z-100 min-w-[320px]">
                <div
                    class={`border-l-4 p-4 rounded-xl shadow-2xl flex items-center gap-3 ${toast.type === "success" ? "bg-slate-900 border-green-500" : "bg-red-900 border-red-500"}`}
                >
                    {#if toast.type === "success"}
                        <span class="text-green-500 text-xl">✓</span>
                    {/if}

                    {#if toast.type === "error"}
                        <span class="text-white text-xl">✕</span>
                    {/if}

                    <p class="text-white font-bold text-sm uppercase tracking-wider">{toast.message}</p>
                </div>
            </div>
        {/if}

        {#if loading}
            <Loader />
        {/if}
    </div>
</main>
