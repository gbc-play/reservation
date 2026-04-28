import { browser } from "$app/environment";

const translations = {
    en: {
        pricing: "Pricing",
        gallery: "Gallery",
        contact: "Contact Us",
        book_now: "Book a Court Now",
        info: "Experience premium sand courts. Professional net systems, lights for night games, and a vibrant community.",
        pricing_section_title: "Simple",
        pricing_section_title_2: "Pricing",
        pricing_section_desc: "No hidden fees. Just play.",
        court_price: "Court hourly rate",
        court_price_desc: "Professional Net System",
        court_price_desc_2: "High-Quality Sand",
        court_price_desc_3: "LED Lights Included",
        hour_label_short: "hr",
        courts_title: "The",
        courts_title_2: "Courts",
        courts_desc: "Visuals from our courts",
        questions: "Have questions?",
        management: "Management",
        phone_label: "Direct Line",
        rights_reserved: "All rights reserved.",
        court_reservation: "Court Reservation",
        select_court: "Select Your Court",
        duration: "Duration",
        available_times: "Available Times",
        closed_title: "Closed Today",
        closed_desc: "This court is unavailable.",
        closed_desc_2: "Please pick another day.",
        summary: "Booking Summary",
        for: "for",
        hours_long: "hour(s)",
        book: "Book Now",
        finish_booking: "Finish Booking",
        enter_details: "Please enter your details",
        name: "Full Name",
        phone: "Phone Number",
        valid_phone: "Please enter a valid phone number",
        cancel: "Cancel",
        confirm: "Confirm Reservation",
        select: "Select",
        unavailable: "Unavailable",
        minute_short: "min",
        court_a: "Court 1",
        court_b: "Court 2",
        reservation_confirmed: "Your reservation is confirmed!",
        reservation_failed: "Error processing your reservation. Please try again.",
    },
    bg: {
        pricing: "Цени",
        gallery: "Галерия",
        contact: "Контакти",
        book_now: "Резервирай игрище",
        info: "Премиум пясъчни игрища. Професионални мрежи, осветление за нощни игри и оживена общност.",
        pricing_section_title: "Ценова",
        pricing_section_title_2: "Политика",
        pricing_section_desc: "Без скрити такси. Просто играйте.",
        court_price: "Часова ставка за игрище",
        court_price_desc: "Професионална мрежа",
        court_price_desc_2: "Висококачествен пясък",
        court_price_desc_3: "Включено LED осветление",
        hour_label_short: "ч",
        courts_title: "Игрищата",
        courts_title_2: "",
        courts_desc: "Снимки от нашите игрища",
        questions: "Имате въпроси?",
        management: "Управление",
        phone_label: "Телефон",
        rights_reserved: "Всички права запазени.",
        court_reservation: "Резервация на игрище",
        select_court: "Изберете игрище",
        duration: "Продължителност",
        available_times: "Свободни часове",
        closed_title: "Затворено днес",
        closed_desc: "Това игрище не е налично.",
        closed_desc_2: "Моля, изберете друг ден.",
        summary: "Детайли за резервацията",
        for: "за",
        hours_long: "час(а)",
        book: "Резервирай",
        finish_booking: "Завърши резервацията",
        enter_details: "Моля, въведете вашите данни",
        name: "Имена",
        phone: "Телефонен номер",
        valid_phone: "Моля, въведете валиден телефонен номер",
        cancel: "Отказ",
        confirm: "Потвърди резервацията",
        select: "Изберете",
        unavailable: "Неналичен",
        minute_short: "мин",
        court_a: "Игрище 1",
        court_b: "Игрище 2",
        reservation_confirmed: "Резервацията е потвърдена!",
        reservation_failed: "Грешка при резервацията. Моля, опитайте отново.",
    },
};

class LanguageState {
    // Initial state: check localStorage if in browser, otherwise default to 'bg'
    current = $state(browser ? localStorage.getItem("app_lang") || "bg" : "bg");

    // Toggle function
    toggle = () => {
        this.current = this.current === "en" ? "bg" : "en";
        if (browser) {
            localStorage.setItem("app_lang", this.current);
        }
    };

    // Translation function (t)
    // We use a getter or a method; $derived ensures it updates when 'current' changes
    t = (key: string): string => {
        const lang = this.current as keyof typeof translations;
        return translations[lang][key as keyof (typeof translations)["en"]] || key;
    };
}

// We will use this key to identify our context
export const LANG_KEY = Symbol("language");

export function createLanguageState() {
    return new LanguageState();
}

export type LanguageStateType = ReturnType<typeof createLanguageState>;
