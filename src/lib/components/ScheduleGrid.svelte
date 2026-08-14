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
		onLoadSampleTemplate?: () => void;
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
		onAddBlock,
		onLoadSampleTemplate
	}: Props = $props();

	let timeTextColor = $derived(textColorFor(timeBgColor));
	let dayTextColor = $derived(textColorFor(dayHeaderBgColor));
</script>

{#if blocks.length === 0 && !isExporting}
	<div
		class="mx-auto mb-5 flex max-w-lg flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#3f3f46] bg-[#18181b]/90 p-6 text-center shadow-xl backdrop-blur-sm"
	>
		<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563eb]/20 text-[#60a5fa]">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
				<line x1="16" y1="2" x2="16" y2="6" />
				<line x1="8" y1="2" x2="8" y2="6" />
				<line x1="3" y1="10" x2="21" y2="10" />
			</svg>
		</div>
		<div class="flex flex-col gap-1">
			<h3 class="m-0 text-base font-bold text-white">{m.empty_grid_title()}</h3>
			<p class="m-0 text-xs text-[#a1a1aa]">{m.empty_grid_subtitle()}</p>
		</div>
		{#if onLoadSampleTemplate}
			<button
				type="button"
				class="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 font-[inherit] text-xs font-semibold text-white shadow-lg transition-all hover:bg-[#1d4ed8]"
				onclick={onLoadSampleTemplate}
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
				</svg>
				{m.load_sample_template()}
			</button>
		{/if}
	</div>
{/if}

<div class="max-w-full overflow-x-auto">
	<div
		class="box-border grid shrink-0 overflow-hidden rounded border-[3px] border-solid"
		style="border-color: {gridLineColor}; grid-template-columns: 110px repeat({days.length}, {dayColumnWidth}px); grid-template-rows: 70px repeat({slots.length}, {isWallpaperMode
			? `${slotRowHeight}px`
			: 'minmax(150px, auto)'});"
	>
		<div
			class="box-border border-r-[3px] border-b-[3px] border-solid"
			style="background: {timeBgColor}; border-color: {gridLineColor};"
		></div>

		{#each days as day, colIdx (day.id)}
			<div
				class="box-border flex items-center justify-center border-r-[3px] border-b-[3px] border-solid font-bold tracking-[1px] uppercase"
				style="background: {dayHeaderBgColor}; color: {dayTextColor}; border-color: {gridLineColor}; border-right-style: {colIdx ===
				days.length - 1
					? 'none'
					: 'solid'}; font-size: {fontSizeDay}px;"
			>
				{day.name}
			</div>
		{/each}

		{#each slots as slot, rowIdx (slot.id)}
			<div
				class="box-border flex items-center justify-center border-r-[3px] border-b-[3px] border-solid font-[JetBrains_Mono,monospace] font-bold"
				style="background: {timeBgColor}; color: {timeTextColor}; border-color: {gridLineColor}; border-bottom-style: {rowIdx ===
				slots.length - 1
					? 'none'
					: 'solid'}; font-size: {fontSizeTime}px;"
			>
				{slot.label}
			</div>
			{#each days as day, colIdx (day.id)}
				{@const cellBlocks = blocks.filter((b) => b.dayId === day.id && b.timeSlotId === slot.id)}
				{@const hasBlock = cellBlocks.length > 0}
				<div
					class="relative box-border flex h-full w-full flex-col border-r-[3px] border-b-[3px] border-solid p-2"
					style="background: {cellBgColor}; border-color: {gridLineColor}; border-right-style: {colIdx ===
					days.length - 1
						? 'none'
						: 'solid'}; border-bottom-style: {rowIdx === slots.length - 1 ? 'none' : 'solid'};"
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
							class="box-border flex h-full min-h-[50px] w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[#cbd5e1] bg-transparent px-0 py-1.5 font-[inherit] text-xs text-[#94a3b8] transition-colors hover:border-[#2563eb] hover:text-[#2563eb]"
							onclick={() => onAddBlock(day.id, slot.id)}>{m.add_subject()}</button
						>
					{/if}
				</div>
			{/each}
		{/each}
	</div>
</div>
