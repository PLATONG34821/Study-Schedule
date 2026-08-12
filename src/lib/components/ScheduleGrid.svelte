<script lang="ts">
	import type { Day, Slot, ClassBlock, PaletteColor } from '$lib/types';
	import { textColorFor } from '$lib/utils';
	import BlockCard from './BlockCard.svelte';

	interface Props {
		days: Day[];
		slots: Slot[];
		blocks: ClassBlock[];
		palette: PaletteColor[];
		selectedId: string | null;
		isExporting: boolean;
		dayColumnWidth: number;
		slotRowHeight: number;
		isWallpaperMode: boolean;
		gridLineColor?: string;
		timeBgColor?: string;
		onSelectBlock: (id: string) => void;
		onAddBlock: (dayId: string, timeSlotId: string) => void;
	}

	let {
		days,
		slots,
		blocks,
		palette,
		selectedId,
		isExporting,
		dayColumnWidth,
		slotRowHeight,
		isWallpaperMode,
		gridLineColor = '#111111',
		timeBgColor = '#111111',
		onSelectBlock,
		onAddBlock
	}: Props = $props();

	let timeTextColor = $derived(textColorFor(timeBgColor));
</script>

<div
	class="grid border-[3px] border-solid rounded overflow-hidden box-border"
	style="border-color: {gridLineColor}; grid-template-columns: 110px repeat({days.length}, {dayColumnWidth}px); grid-template-rows: 70px repeat({slots.length}, {isWallpaperMode
		? `${slotRowHeight}px`
		: 'minmax(150px, auto)'});"
>
	<div class="border-r-[3px] border-b-[3px] border-solid box-border" style="background: {timeBgColor}; border-color: {gridLineColor};"></div>

	{#each days as day, colIdx (day.id)}
		<div
			class="flex items-center justify-center font-bold text-xl tracking-[1px] uppercase bg-white border-r-[3px] border-b-[3px] border-solid box-border"
			style="border-color: {gridLineColor}; border-right-style: {colIdx === days.length - 1 ? 'none' : 'solid'};"
		>
			{day.name}
		</div>
	{/each}

	{#each slots as slot, rowIdx (slot.id)}
		<div
			class="flex items-center justify-center font-[JetBrains_Mono,monospace] text-base font-bold border-r-[3px] border-b-[3px] border-solid box-border"
			style="background: {timeBgColor}; color: {timeTextColor}; border-color: {gridLineColor}; border-bottom-style: {rowIdx === slots.length - 1 ? 'none' : 'solid'};"
		>
			{slot.label}
		</div>
		{#each days as day, colIdx (day.id)}
			{@const cellBlocks = blocks.filter((b) => b.dayId === day.id && b.timeSlotId === slot.id)}
			<div
				class="p-2.5 relative flex flex-col gap-2 bg-white border-r-[3px] border-b-[3px] border-solid box-border"
				style="border-color: {gridLineColor}; border-right-style: {colIdx === days.length - 1 ? 'none' : 'solid'}; border-bottom-style: {rowIdx === slots.length - 1 ? 'none' : 'solid'};"
			>
				{#each cellBlocks as block (block.id)}
					<BlockCard
						{block}
						{palette}
						isSelected={selectedId === block.id}
						onSelect={() => onSelectBlock(block.id)}
					/>
				{/each}

				{#if !isExporting}
					<button
						type="button"
						class="border-2 border-dashed border-[#cbd5e1] rounded-lg bg-transparent text-[#94a3b8] text-xs py-1.5 px-0 cursor-pointer font-[inherit] w-full box-border"
						onclick={() => onAddBlock(day.id, slot.id)}>+ เพิ่มวิชา</button
					>
				{/if}
			</div>
		{/each}
	{/each}
</div>
