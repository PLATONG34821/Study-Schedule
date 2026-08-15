<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Toaster } from 'svelte-sonner';

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});
</script>

{#if browser && mounted}
	<Toaster theme="dark" position="top-center" richColors />
{/if}
