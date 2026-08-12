<script lang="ts">
	import type { Day, Slot, ClassBlock, PaletteColor } from '$lib/types';
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
		onSelectBlock,
		onAddBlock
	}: Props = $props();
</script>

<div
	class="scheduleGrid"
	style="grid-template-columns: 110px repeat({days.length}, {dayColumnWidth}px); grid-template-rows: 70px repeat({slots.length}, {isWallpaperMode
		? `${slotRowHeight}px`
		: 'minmax(150px, auto)'});"
>
	<div class="cornerCell"></div>

	{#each days as day (day.id)}
		<div class="dayHeader">{day.name}</div>
	{/each}

	{#each slots as slot (slot.id)}
		<div class="timeCell">{slot.label}</div>
		{#each days as day (day.id)}
			{@const cellBlocks = blocks.filter((b) => b.dayId === day.id && b.timeSlotId === slot.id)}
			<div class="dayCell">
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
		border: 3px solid #111111;
		border-radius: 4px;
		overflow: hidden;
		box-sizing: border-box;
	}

	.cornerCell {
		background: #111111;
		border-right: 3px solid #111111;
		border-bottom: 3px solid #111111;
		box-sizing: border-box;
	}

	.dayHeader {
		display: flex;
		align-items: center;
		justify-content: center;
		border-right: 3px solid #111111;
		border-bottom: 3px solid #111111;
		font-weight: 700;
		font-size: 20px;
		letter-spacing: 1px;
		text-transform: uppercase;
		background: #ffffff;
		box-sizing: border-box;
	}

	.timeCell {
		background: #111111;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'JetBrains Mono', monospace;
		font-size: 16px;
		border-right: 3px solid #111111;
		border-bottom: 3px solid #111111;
		box-sizing: border-box;
	}

	.dayCell {
		border-right: 3px solid #111111;
		border-bottom: 3px solid #111111;
		padding: 10px;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 8px;
		background: #ffffff;
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
