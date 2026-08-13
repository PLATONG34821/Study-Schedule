<script lang="ts">
	import type { Day, Slot, ClassBlock, PaletteColor } from '$lib/types';
	import { textColorFor } from '$lib/utils';
	import * as m from '$lib/paraglide/messages';
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
		dayHeaderBgColor?: string;
		cellBgColor?: string;
		fontSizeDay?: number;
		fontSizeTime?: number;
		fontSizeTitle?: number;
		fontSizeBadge?: number;
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
		dayHeaderBgColor = '#ffffff',
		cellBgColor = '#ffffff',
		fontSizeDay = 20,
		fontSizeTime = 16,
		fontSizeTitle = 20,
		fontSizeBadge = 11,
		onSelectBlock,
		onAddBlock
	}: Props = $props();

	let timeTextColor = $derived(textColorFor(timeBgColor));
	let dayTextColor = $derived(textColorFor(dayHeaderBgColor));
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
			class="flex items-center justify-center font-bold tracking-[1px] uppercase border-r-[3px] border-b-[3px] border-solid box-border"
			style="background: {dayHeaderBgColor}; color: {dayTextColor}; border-color: {gridLineColor}; border-right-style: {colIdx === days.length - 1 ? 'none' : 'solid'}; font-size: {fontSizeDay}px;"
		>
			{day.name}
		</div>
	{/each}

	{#each slots as slot, rowIdx (slot.id)}
		<div
			class="flex items-center justify-center font-[JetBrains_Mono,monospace] font-bold border-r-[3px] border-b-[3px] border-solid box-border"
			style="background: {timeBgColor}; color: {timeTextColor}; border-color: {gridLineColor}; border-bottom-style: {rowIdx === slots.length - 1 ? 'none' : 'solid'}; font-size: {fontSizeTime}px;"
		>
			{slot.label}
		</div>
		{#each days as day, colIdx (day.id)}
			{@const cellBlocks = blocks.filter((b) => b.dayId === day.id && b.timeSlotId === slot.id)}
			{@const hasBlock = cellBlocks.length > 0}
			<div
				class="p-2 relative flex flex-col border-r-[3px] border-b-[3px] border-solid box-border h-full w-full"
				style="background: {cellBgColor}; border-color: {gridLineColor}; border-right-style: {colIdx === days.length - 1 ? 'none' : 'solid'}; border-bottom-style: {rowIdx === slots.length - 1 ? 'none' : 'solid'};"
			>
				{#each cellBlocks as block (block.id)}
					<BlockCard
						{block}
						{palette}
						{fontSizeTitle}
						{fontSizeBadge}
						isSelected={selectedId === block.id}
						onSelect={() => onSelectBlock(block.id)}
					/>
				{/each}

				{#if !hasBlock && !isExporting}
					<button
						type="button"
						class="border-2 border-dashed border-[#cbd5e1] rounded-lg bg-transparent text-[#94a3b8] text-xs py-1.5 px-0 cursor-pointer font-[inherit] w-full h-full min-h-[50px] flex items-center justify-center box-border hover:border-[#6366f1] hover:text-[#6366f1] transition-colors"
						onclick={() => onAddBlock(day.id, slot.id)}>{m.add_subject()}</button
					>
				{/if}
			</div>
		{/each}
	{/each}
</div>
