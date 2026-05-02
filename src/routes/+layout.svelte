<script lang="ts">
    import "./layout.css";
    import { createLanguageState, LANG_KEY } from "$lib/i18n.svelte";
    import { setContext } from "svelte";
    import Loader from "$lib/components/Loader.svelte";
    import { afterNavigate, beforeNavigate } from "$app/navigation";

    let { children } = $props();

    // Initialize the state
    let loading = $state(false);
    const langState = createLanguageState();

    // Provide it to the whole app
    setContext(LANG_KEY, langState);

    beforeNavigate(() => {
        loading = true;
    });

    afterNavigate(() => {
        loading = false;
    });
</script>

<svelte:head><link rel="icon" href="/favicon.ico" /></svelte:head>

{@render children()}

{#if loading}
    <Loader />
{/if}
