<script lang="ts">
	import type { Day, Slot, PaletteColor, PhonePreset } from '$lib/types';

	interface Props {
		phonePresets: PhonePreset[];
		selectedPresetId: string;
		gridRotationAngle: number;
		customTopGapPercent: number;
		scaleMode: 'fillWidth' | 'fitBoth';
		gridScaleModifier: number;
		slotRowHeight: number;
		dayColumnWidth: number;
		bgColor: string;
		days: Day[];
		slots: Slot[];
		palette: PaletteColor[];
		currentPreset: PhonePreset;
		isWallpaperMode: boolean;
		onExport: () => void;
		onAddDay: () => void;
		onRemoveDay: (id: string) => void;
		onAddSlot: () => void;
		onRemoveSlot: (id: string) => void;
		onAddColor: () => void;
		onRemoveColor: (id: string) => void;
	}

	let {
		phonePresets,
		selectedPresetId = $bindable(),
		gridRotationAngle = $bindable(),
		customTopGapPercent = $bindable(),
		scaleMode = $bindable(),
		gridScaleModifier = $bindable(),
		slotRowHeight = $bindable(),
		dayColumnWidth = $bindable(),
		bgColor = $bindable(),
		days = $bindable(),
		slots = $bindable(),
		palette = $bindable(),
		currentPreset,
		isWallpaperMode,
		onExport,
		onAddDay,
		onRemoveDay,
		onAddSlot,
		onRemoveSlot,
		onAddColor,
		onRemoveColor
	}: Props = $props();
</script>

<aside class="rightDrawer">
	<div class="headerTitle">
		<h2>ตั้งค่าตาราง & วอลเปเปอร์</h2>
		<p>ปรับขนาด สี และโครงสร้างตาราง</p>
	</div>

	<button class="exportBtn" onclick={onExport}>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="7 10 12 15 17 10" />
			<line x1="12" y1="15" x2="12" y2="3" />
		</svg>
		Export as PNG
	</button>

	<div class="sectionLabel">ขนาด / วอลเปเปอร์ (Preset)</div>
	<select class="presetSelect" bind:value={selectedPresetId}>
		{#each phonePresets as preset (preset.id)}
			<option value={preset.id}>{preset.name}</option>
		{/each}
	</select>

	{#if isWallpaperMode}
		<div class="wallpaperOptions">
			<div class="presetBadge">
				{currentPreset.width} × {currentPreset.height} px
			</div>

			<label class="edLabel" for="gridRotationSelect">หมุนตาราง (Rotate Grid)</label>
			<select id="gridRotationSelect" class="edInput" bind:value={gridRotationAngle}>
				<option value={90}>หมุน 90° (แนวตั้ง / Rotated 90°)</option>
				<option value={180}>หมุน 180° (กลับหัว / Upside Down 180°)</option>
				<option value={270}>หมุน 270° (Rotated 270°)</option>
				<option value={0}>ไม่หมุน 0° (แนวขนาน / Original 0°)</option>
			</select>

			<label class="edLabel" for="scaleModeSelect">ขยายขนาดตาราง (Scale Mode)</label>
			<select id="scaleModeSelect" class="edInput" bind:value={scaleMode}>
				<option value="fillWidth">ยืดเต็มขอบด้านข้าง (Full Width Edge-to-Edge)</option>
				<option value="fitBoth">พอดีทั้งกว้างและสูง (Fit Inside Screen)</option>
			</select>

			<div class="sliderRow">
				<label class="edLabel" for="clockSpaceRange">
					เว้นพื้นที่นาฬิกา: {customTopGapPercent}%
				</label>
				<input
					id="clockSpaceRange"
					type="range"
					min="15"
					max="45"
					bind:value={customTopGapPercent}
				/>
			</div>

			<div class="sliderRow">
				<label class="edLabel" for="gridScaleRange">
					ปรับขนาดย่อ/ขยายตาราง: {Math.round(gridScaleModifier * 100)}%
				</label>
				<input
					id="gridScaleRange"
					type="range"
					min="0.70"
					max="1.15"
					step="0.01"
					bind:value={gridScaleModifier}
				/>
			</div>

			<div class="sliderRow">
				<label class="edLabel" for="slotRowHeightRange">
					ความสูงแถวตาราง: {slotRowHeight} px
				</label>
				<input
					id="slotRowHeightRange"
					type="range"
					min="140"
					max="300"
					step="5"
					bind:value={slotRowHeight}
				/>
			</div>

			<div class="sliderRow">
				<label class="edLabel" for="dayColWidthRange">
					ปรับความยาวตารางแนวตั้ง (Column Width): {dayColumnWidth} px
				</label>
				<input
					id="dayColWidthRange"
					type="range"
					min="150"
					max="350"
					step="5"
					bind:value={dayColumnWidth}
				/>
			</div>
		</div>
	{/if}

	<div class="sectionLabel slotLabelMargin">พื้นหลังตาราง (Background)</div>
	<div class="bgRow">
		<input class="bgInput" type="color" bind:value={bgColor} />
		<span class="bgLabel">{bgColor}</span>
	</div>

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
	.rightDrawer {
		width: 360px;
		background: #18181b;
		color: #e4e4e7;
		padding: 24px;
		box-sizing: border-box;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 12px;
		border-left: 1px solid #27272a;
		box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
		z-index: 10;
		flex-shrink: 0;
	}

	.headerTitle h2 {
		font-size: 20px;
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
		font-family: inherit;
	}

	.exportBtn:hover {
		background: #4f46e5;
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

	.presetSelect {
		width: 100%;
		padding: 10px 12px;
		border-radius: 8px;
		border: 1px solid #3f3f46;
		background: #27272a;
		color: #fff;
		font-size: 13px;
		font-family: inherit;
		cursor: pointer;
	}

	.wallpaperOptions {
		background: #27272a;
		padding: 12px;
		border-radius: 8px;
		border: 1px solid #3f3f46;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.presetBadge {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #a1a1aa;
		margin-bottom: 10px;
	}

	.sliderRow {
		margin-top: 10px;
	}

	.sliderRow input[type='range'] {
		width: 100%;
		accent-color: #6366f1;
		cursor: pointer;
	}

	.bgRow {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 24px;
	}

	.bgInput {
		width: 40px;
		height: 32px;
		border: none;
		border-radius: 6px;
		background: none;
		cursor: pointer;
		padding: 0;
	}

	.bgLabel {
		font-family: 'JetBrains Mono', monospace;
		font-size: 12px;
		opacity: 0.7;
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

	.edLabel {
		font-size: 12px;
		color: #a1a1aa;
		display: block;
	}

	.edInput {
		width: 100%;
		padding: 8px 10px;
		border-radius: 6px;
		border: 1px solid #3f3f46;
		background: #18181b;
		color: #fff;
		font-size: 13px;
		box-sizing: border-box;
		font-family: inherit;
	}
</style>
