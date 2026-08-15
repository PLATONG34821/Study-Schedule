<script lang="ts">
	import { draggable, droppable } from '@thisux/sveltednd';
	import type { Day, Slot, ClassBlock, PaletteColor } from '$lib/types';
	import { textColorFor, formatTimeRange } from '$lib/utils';
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
		gridBorderRadius?: number;
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
		onMoveBlock?: (blockId: string, targetDayId: string, targetTimeSlotId: string) => void;
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
		gridBorderRadius = 16,
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
		onMoveBlock
	}: Props = $props();

	let timeTextColor = $derived(textColorFor(timeBgColor));
	let dayTextColor = $derived(textColorFor(dayHeaderBgColor));
</script>

<div class="relative max-w-full overflow-x-auto">
	<div
		class="box-border grid shrink-0 overflow-hidden border-[3px] border-solid"
		style="border-color: {gridLineColor}; border-radius: {gridBorderRadius}px; grid-template-columns: 110px repeat({days.length}, {dayColumnWidth}px); grid-template-rows: 70px repeat({slots.length}, {isWallpaperMode
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
				{formatTimeRange(slot.label)}
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
					use:droppable={{
						container: 'scheduleGrid',
						disabled: isExporting,
						callbacks: {
							onDrop: (state) => {
								const dragged = state.draggedItem as ClassBlock;
								if (dragged && (dragged.dayId !== day.id || dragged.timeSlotId !== slot.id)) {
									onMoveBlock?.(dragged.id, day.id, slot.id);
								}
							}
						}
					}}
				>
					{#each cellBlocks as block (block.id)}
						<div
							role="presentation"
							class="svelte-dnd-draggable h-full w-full touch-none"
							draggable={false}
							use:draggable={{
								container: 'scheduleGrid',
								dragData: block,
								disabled: isExporting
							}}
							ondragstart={(e) => e.preventDefault()}
						>
							<BlockCard
								{block}
								{palette}
								{fontSizeTitle}
								{fontSizeBadge}
								isSelected={selectedId === block.id}
								onSelect={() => onSelectBlock(block.id)}
							/>
						</div>
					{/each}

					{#if !hasBlock && !isExporting}
						<button
							type="button"
							class="box-border flex h-full min-h-12.5 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[#cbd5e1] bg-transparent px-0 py-1.5 font-[inherit] text-xs text-[#94a3b8] transition-colors hover:border-[#2563eb] hover:text-[#2563eb]"
							onclick={() => onAddBlock(day.id, slot.id)}>{m.add_subject()}</button
						>
					{/if}
				</div>
			{/each}
		{/each}
	</div>
</div>
