<script lang="ts">
	import type { Day, Slot, PaletteColor } from '$lib/types';

	interface Props {
		days: Day[];
		slots: Slot[];
		palette: PaletteColor[];
		isExporting?: boolean;
		onExport: () => void;
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
		isExporting = false,
		onExport,
		onAddDay,
		onRemoveDay,
		onAddSlot,
		onRemoveSlot,
		onAddColor,
		onRemoveColor
	}: Props = $props();
</script>

<aside
	class="w-80 bg-[#18181b] text-[#e4e4e7] p-6 box-border overflow-y-auto flex flex-col gap-3 border-r border-[#27272a] shadow-none z-10 shrink-0"
>
	<div>
		<h1 class="text-[22px] font-bold m-0 -tracking-[0.5px] text-white">Schedule Editor</h1>
		<p class="text-xs text-[#a1a1aa] mt-1">จัดการวัน เวลา และชุดสีตาราง</p>
	</div>

	<button
		class="bg-[#6366f1] text-white border-none px-4 py-3 rounded-lg font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors duration-150 ease-in-out mt-2 mb-2 font-[inherit] hover:not-disabled:bg-[#4f46e5] disabled:opacity-60 disabled:cursor-not-allowed"
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
			Exporting...
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
			Export as PNG
		{/if}
	</button>

	<div class="text-[11px] font-bold tracking-[0.8px] uppercase text-[#a1a1aa] mt-2">
		คอลัมน์ / วัน (Days)
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
		onclick={onAddDay}>+ เพิ่มวัน</button
	>

	<div class="text-[11px] font-bold tracking-[0.8px] uppercase text-[#a1a1aa] mt-3.5">
		แถว / เวลา (Rows)
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
		onclick={onAddSlot}>+ เพิ่มแถว</button
	>

	<div class="text-[11px] font-bold tracking-[0.8px] uppercase text-[#a1a1aa] mt-3.5">
		สีวิชา (Subject Colors)
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
		onclick={onAddColor}>+ เพิ่มสี</button
	>
</aside>
