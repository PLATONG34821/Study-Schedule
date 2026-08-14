<script lang="ts">
	export interface ToastItem {
		id: string;
		message: string;
		type: 'success' | 'error' | 'info';
	}

	interface Props {
		toasts: ToastItem[];
		onDismiss: (id: string) => void;
	}

	let { toasts, onDismiss }: Props = $props();
</script>

<div
	class="pointer-events-none fixed top-5 left-1/2 z-[1000] flex -translate-x-1/2 flex-col items-center gap-2"
>
	{#each toasts as toast (toast.id)}
		<div
			class="pointer-events-auto flex animate-popIn items-center gap-2.5 rounded-full border px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all {toast.type ===
			'success'
				? 'border-[#22c55e]/40 bg-[#18181b]/95 text-white'
				: toast.type === 'error'
					? 'border-[#ef4444]/40 bg-[#18181b]/95 text-white'
					: 'border-[#2563eb]/40 bg-[#18181b]/95 text-white'}"
		>
			{#if toast.type === 'success'}
				<span
					class="flex h-5 w-5 items-center justify-center rounded-full bg-[#22c55e]/20 text-[#22c55e]"
				>
					✓
				</span>
			{:else if toast.type === 'error'}
				<span
					class="flex h-5 w-5 items-center justify-center rounded-full bg-[#ef4444]/20 text-[#ef4444]"
				>
					✕
				</span>
			{:else}
				<span
					class="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563eb]/20 text-[#60a5fa]"
				>
					ℹ
				</span>
			{/if}
			<span>{toast.message}</span>
			<button
				type="button"
				class="ml-1 cursor-pointer border-none bg-transparent text-sm text-[#a1a1aa] hover:text-white"
				onclick={() => onDismiss(toast.id)}
				aria-label="Dismiss toast">✕</button
			>
		</div>
	{/each}
</div>
