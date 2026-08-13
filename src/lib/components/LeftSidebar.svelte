<script lang="ts">
	import type { Day, Slot, PaletteColor } from '$lib/types';
	import * as m from '$lib/paraglide/messages';
	import { setLocale, getLocale } from '$lib/paraglide/runtime';

	interface Props {
		days: Day[];
		slots: Slot[];
		palette: PaletteColor[];
		width?: number;
		isExporting?: boolean;
		linkCopied?: boolean;
		onExport: () => void;
		onOpenExportCode: () => void;
		onOpenImportCode: () => void;
		onShareLink: () => void;
		onAddDay: () => void;
		onRemoveDay: (id: string) => void;
		onAddSlot: () => void;
		onRemoveSlot: (id: string) => void;
		onAddColor: () => void;
		onRemoveColor: (id: string) => void;
	}

	let {
		days = $bindable(),
		slots = $bindable(),
		palette = $bindable(),
		width = $bindable(320),
		isExporting = false,
		linkCopied = false,
		onExport,
		onOpenExportCode,
		onOpenImportCode,
		onShareLink,
		onAddDay,
		onRemoveDay,
		onAddSlot,
		onRemoveSlot,
		onAddColor,
		onRemoveColor
	}: Props = $props();

	let isResizing = $state(false);

	const handlePointerDown = (e: PointerEvent) => {
		isResizing = true;
		const handle = e.currentTarget as HTMLElement;
		handle.setPointerCapture(e.pointerId);
		const startX = e.clientX;
		const startWidth = width;

		const handlePointerMove = (moveEvent: PointerEvent) => {
			if (!isResizing) return;
			const deltaX = moveEvent.clientX - startX;
			width = Math.min(Math.max(startWidth + deltaX, 220), 550);
		};

		const handlePointerUp = () => {
			isResizing = false;
			handle.removeEventListener('pointermove', handlePointerMove as EventListener);
			handle.removeEventListener('pointerup', handlePointerUp as EventListener);
		};

		handle.addEventListener('pointermove', handlePointerMove as EventListener);
		handle.addEventListener('pointerup', handlePointerUp as EventListener);
	};
</script>

<aside
	class="relative bg-[#18181b] text-[#e4e4e7] p-6 box-border overflow-y-auto flex flex-col gap-3 border-r border-[#27272a] shadow-none z-10 shrink-0"
	style="width: {width}px;"
>
	<div
		class="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-[#6366f1]/50 active:bg-[#6366f1] transition-colors z-20"
		onpointerdown={handlePointerDown}
		role="separator"
		aria-label="Resize left sidebar"
	></div>
	<div class="flex items-start justify-between">
		<div>
			<h1 class="text-[22px] font-bold m-0 -tracking-[0.5px] text-white">{m.app_title()}</h1>
			<p class="text-xs text-[#a1a1aa] mt-1">{m.app_subtitle()}</p>
		</div>
		<div class="flex gap-1 bg-[#27272a] p-1 rounded-lg border border-[#3f3f46]">
			<button
				type="button"
				class="px-2 py-0.5 text-xs rounded font-semibold transition-colors {getLocale() === 'th'
					? 'bg-[#6366f1] text-white'
					: 'text-[#a1a1aa] hover:text-white'}"
				onclick={() => setLocale('th')}
			>
				TH
			</button>
			<button
				type="button"
				class="px-2 py-0.5 text-xs rounded font-semibold transition-colors {getLocale() === 'en'
					? 'bg-[#6366f1] text-white'
					: 'text-[#a1a1aa] hover:text-white'}"
				onclick={() => setLocale('en')}
			>
				EN
			</button>
		</div>
	</div>

	<button
		class="bg-[#6366f1] text-white border-none px-4 py-3 rounded-lg font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors duration-150 ease-in-out mt-2 font-[inherit] hover:not-disabled:bg-[#4f46e5] disabled:opacity-60 disabled:cursor-not-allowed"
		onclick={onExport}
		disabled={isExporting}
	>
		{#if isExporting}
			<svg
				class="animate-spin"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
				<path d="M12 2a10 10 0 0 1 10 10" />
			</svg>
			{m.exporting()}
		{:else}
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<polyline points="7 10 12 15 17 10" />
				<line x1="12" y1="15" x2="12" y2="3" />
			</svg>
			{m.export_png()}
		{/if}
	</button>

	<div class="flex gap-2 mb-0.5">
		<button
			type="button"
			class="flex-1 bg-[#27272a] text-white border border-[#3f3f46] py-2 px-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#3f3f46] transition-colors"
			onclick={onOpenExportCode}
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="16 18 22 12 16 6" />
				<polyline points="8 6 2 12 8 18" />
			</svg>
			{m.export_code()}
		</button>
		<button
			type="button"
			class="flex-1 bg-[#27272a] text-white border border-[#3f3f46] py-2 px-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#3f3f46] transition-colors"
			onclick={onOpenImportCode}
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M4 17l6-6-6-6" />
				<path d="M12 19h8" />
			</svg>
			{m.import_code()}
		</button>
	</div>

	<button
		type="button"
		class="bg-[#27272a] text-white border border-[#3f3f46] px-4 py-2 rounded-lg font-semibold text-xs cursor-pointer flex items-center justify-center gap-2 transition-colors duration-150 ease-in-out font-[inherit] hover:bg-[#3f3f46] mb-1"
		onclick={onShareLink}
	>
		{#if linkCopied}
			<span class="text-[#22c55e] flex items-center gap-1.5 font-bold">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<polyline points="20 6 9 17 4 12" />
				</svg>
				{m.link_copied()}
			</span>
		{:else}
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="18" cy="5" r="3" />
				<circle cx="6" cy="12" r="3" />
				<circle cx="18" cy="19" r="3" />
				<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
				<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
			</svg>
			{m.share_link()}
		{/if}
	</button>

	<div class="text-[11px] font-bold tracking-[0.8px] uppercase text-[#a1a1aa] mt-2">
		{m.days_section()}
	</div>
	{#each days as day (day.id)}
		<div class="flex gap-1.5 items-center mb-1.5">
			<input
				type="text"
				bind:value={day.name}
				class="flex-1 px-2 py-1.5 rounded-md border border-[#3f3f46] bg-[#27272a] text-white text-[13px] font-[inherit]"
			/>
			<button
				class="bg-[#3f3f46] text-[#ef4444] border-none rounded-md w-7 h-7 cursor-pointer font-bold hover:bg-[#ef4444] hover:text-white"
				onclick={() => onRemoveDay(day.id)}>✕</button
			>
		</div>
	{/each}
	<button
		class="bg-transparent text-[#818cf8] border border-dashed border-[#6366f1] rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer mb-3 font-[inherit] hover:bg-[#6366f1]/10"
		onclick={onAddDay}>{m.add_day()}</button
	>

	<div class="text-[11px] font-bold tracking-[0.8px] uppercase text-[#a1a1aa] mt-3.5">
		{m.rows_section()}
	</div>
	{#each slots as slot (slot.id)}
		<div class="flex gap-1.5 items-center mb-1.5">
			<input
				type="text"
				bind:value={slot.label}
				class="flex-1 px-2 py-1.5 rounded-md border border-[#3f3f46] bg-[#27272a] text-white text-[13px] font-[JetBrains_Mono,monospace]"
			/>
			<button
				class="bg-[#3f3f46] text-[#ef4444] border-none rounded-md w-7 h-7 cursor-pointer font-bold hover:bg-[#ef4444] hover:text-white"
				onclick={() => onRemoveSlot(slot.id)}>✕</button
			>
		</div>
	{/each}
	<button
		class="bg-transparent text-[#818cf8] border border-dashed border-[#6366f1] rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer mb-3 font-[inherit] hover:bg-[#6366f1]/10"
		onclick={onAddSlot}>{m.add_row()}</button
	>

	<div class="text-[11px] font-bold tracking-[0.8px] uppercase text-[#a1a1aa] mt-3.5">
		{m.subject_colors()}
	</div>
	<div class="flex flex-wrap gap-2 mb-2">
		{#each palette as item (item.id)}
			<div class="relative flex items-center">
				<input
					type="color"
					bind:value={item.color}
					class="w-9 h-9 border-2 border-[#3f3f46] rounded-lg bg-none cursor-pointer p-0"
				/>
				<button
					class="absolute -top-1 -right-1 bg-[#ef4444] text-white border-none rounded-full w-4 h-4 text-[9px] cursor-pointer flex items-center justify-center"
					onclick={() => onRemoveColor(item.id)}>✕</button
				>
			</div>
		{/each}
	</div>
	<button
		class="bg-transparent text-[#818cf8] border border-dashed border-[#6366f1] rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer mb-3 font-[inherit] hover:bg-[#6366f1]/10"
		onclick={onAddColor}>{m.add_color()}</button
	>
</aside>
