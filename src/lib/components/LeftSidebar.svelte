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

<aside class="leftSidebar">
	<div class="headerTitle">
		<h1>Schedule Editor</h1>
		<p>จัดการวัน เวลา และชุดสีตาราง</p>
	</div>

	<button class="exportBtn" onclick={onExport} disabled={isExporting}>
		{#if isExporting}
			<svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
				<path d="M12 2a10 10 0 0 1 10 10" />
			</svg>
			Exporting...
		{:else}
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<polyline points="7 10 12 15 17 10" />
				<line x1="12" y1="15" x2="12" y2="3" />
			</svg>
			Export as PNG
		{/if}
	</button>

	<div class="sectionLabel">คอลัมน์ / วัน (Days)</div>
	{#each days as day (day.id)}
		<div class="rowEdit">
			<input type="text" bind:value={day.name} />
			<button class="miniBtn" onclick={() => onRemoveDay(day.id)}>✕</button>
		</div>
	{/each}
	<button class="addBtn" onclick={onAddDay}>+ เพิ่มวัน</button>

	<div class="sectionLabel slotLabelMargin">แถว / เวลา (Rows)</div>
	{#each slots as slot (slot.id)}
		<div class="rowEdit">
			<input class="monoInput" type="text" bind:value={slot.label} />
			<button class="miniBtn" onclick={() => onRemoveSlot(slot.id)}>✕</button>
		</div>
	{/each}
	<button class="addBtn" onclick={onAddSlot}>+ เพิ่มแถว</button>

	<div class="sectionLabel palLabelMargin">สีวิชา (Subject Colors)</div>
	<div class="paletteGrid">
		{#each palette as item (item.id)}
			<div class="swatchWrap">
				<input type="color" bind:value={item.color} />
				<button class="swatchDel" onclick={() => onRemoveColor(item.id)}>✕</button>
			</div>
		{/each}
	</div>
	<button class="addBtn" onclick={onAddColor}>+ เพิ่มสี</button>
</aside>

<style>
	.leftSidebar {
		width: 320px;
		background: #18181b;
		color: #e4e4e7;
		padding: 24px;
		box-sizing: border-box;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 12px;
		border-right: 1px solid #27272a;
		box-shadow: none;
		z-index: 10;
		flex-shrink: 0;
	}

	.headerTitle h1 {
		font-size: 22px;
		font-weight: 700;
		margin: 0;
		letter-spacing: -0.5px;
		color: #fff;
	}

	.headerTitle p {
		font-size: 12px;
		color: #a1a1aa;
		margin: 4px 0 0 0;
	}

	.exportBtn {
		background: #6366f1;
		color: #fff;
		border: none;
		padding: 12px 16px;
		border-radius: 8px;
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		transition: background 0.15s ease;
		margin-top: 8px;
		margin-bottom: 8px;
		font-family: inherit;
	}

	.exportBtn:hover:not(:disabled) {
		background: #4f46e5;
	}

	.exportBtn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.sectionLabel {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.8px;
		text-transform: uppercase;
		color: #a1a1aa;
		margin-top: 8px;
	}

	.slotLabelMargin {
		margin-top: 14px;
	}

	.palLabelMargin {
		margin-top: 14px;
	}

	.rowEdit {
		display: flex;
		gap: 6px;
		align-items: center;
		margin-bottom: 6px;
	}

	.rowEdit input[type='text'] {
		flex: 1;
		padding: 6px 8px;
		border-radius: 6px;
		border: 1px solid #3f3f46;
		background: #27272a;
		color: #fff;
		font-size: 13px;
		font-family: inherit;
	}

	.monoInput {
		font-family: 'JetBrains Mono', monospace !important;
	}

	.miniBtn {
		background: #3f3f46;
		color: #ef4444;
		border: none;
		border-radius: 6px;
		width: 28px;
		height: 28px;
		cursor: pointer;
		font-weight: 700;
	}

	.miniBtn:hover {
		background: #ef4444;
		color: #fff;
	}

	.addBtn {
		background: transparent;
		color: #818cf8;
		border: 1px dashed #6366f1;
		border-radius: 6px;
		padding: 6px 12px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		margin-bottom: 12px;
		font-family: inherit;
	}

	.addBtn:hover {
		background: rgba(99, 102, 241, 0.1);
	}

	.paletteGrid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 8px;
	}

	.swatchWrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.swatchWrap input[type='color'] {
		width: 36px;
		height: 36px;
		border: 2px solid #3f3f46;
		border-radius: 8px;
		background: none;
		cursor: pointer;
		padding: 0;
	}

	.swatchDel {
		position: absolute;
		top: -4px;
		right: -4px;
		background: #ef4444;
		color: #fff;
		border: none;
		border-radius: 50%;
		width: 16px;
		height: 16px;
		font-size: 9px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
