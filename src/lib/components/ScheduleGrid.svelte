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
	class="scheduleGrid"
	style="border-color: {gridLineColor}; grid-template-columns: 110px repeat({days.length}, {dayColumnWidth}px); grid-template-rows: 70px repeat({slots.length}, {isWallpaperMode
		? `${slotRowHeight}px`
		: 'minmax(150px, auto)'});"
>
	<div class="cornerCell" style="background: {timeBgColor}; border-color: {gridLineColor};"></div>

	{#each days as day, colIdx (day.id)}
		<div
			class="dayHeader"
			style="border-color: {gridLineColor}; border-right-style: {colIdx === days.length - 1 ? 'none' : 'solid'};"
		>
			{day.name}
		</div>
	{/each}

	{#each slots as slot, rowIdx (slot.id)}
		<div
			class="timeCell"
			style="background: {timeBgColor}; color: {timeTextColor}; border-color: {gridLineColor}; border-bottom-style: {rowIdx === slots.length - 1 ? 'none' : 'solid'};"
		>
			{slot.label}
		</div>
		{#each days as day, colIdx (day.id)}
			{@const cellBlocks = blocks.filter((b) => b.dayId === day.id && b.timeSlotId === slot.id)}
			<div
				class="dayCell"
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
						class="addBlockBtn"
						onclick={() => onAddBlock(day.id, slot.id)}>+ เพิ่มวิชา</button
					>
				{/if}
			</div>
		{/each}
	{/each}
</div>

<style>
	.scheduleGrid {
		display: grid;
		border-width: 3px;
		border-style: solid;
		border-radius: 4px;
		overflow: hidden;
		box-sizing: border-box;
	}

	.cornerCell {
		border-right: 3px solid;
		border-bottom: 3px solid;
		box-sizing: border-box;
	}

	.dayHeader {
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 20px;
		letter-spacing: 1px;
		text-transform: uppercase;
		background: #ffffff;
		border-right: 3px solid;
		border-bottom: 3px solid;
		box-sizing: border-box;
	}

	.timeCell {
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'JetBrains Mono', monospace;
		font-size: 16px;
		font-weight: 700;
		border-right: 3px solid;
		border-bottom: 3px solid;
		box-sizing: border-box;
	}

	.dayCell {
		padding: 10px;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 8px;
		background: #ffffff;
		border-right: 3px solid;
		border-bottom: 3px solid;
		box-sizing: border-box;
	}

	.addBlockBtn {
		border: 2px dashed #cbd5e1;
		border-radius: 8px;
		background: transparent;
		color: #94a3b8;
		font-size: 12px;
		padding: 6px 0;
		cursor: pointer;
		font-family: inherit;
		width: 100%;
		box-sizing: border-box;
	}
</style>
