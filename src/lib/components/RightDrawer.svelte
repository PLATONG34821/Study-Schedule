<script lang="ts">
	import type { PhonePreset } from '$lib/types';

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
		gridLineColor: string;
		timeBgColor: string;
		currentPreset: PhonePreset;
		isWallpaperMode: boolean;
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
		gridLineColor = $bindable(),
		timeBgColor = $bindable(),
		currentPreset,
		isWallpaperMode
	}: Props = $props();
</script>

<aside class="rightDrawer">
	<div class="headerTitle">
		<h2>ตั้งค่าการแสดงผล</h2>
		<p>วอลเปเปอร์ มุมหมุน และสีตาราง</p>
	</div>

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

	<div class="sectionLabel slotLabelMargin">สีส่วนประกอบตาราง (Grid Colors)</div>

	<div class="colorRow">
		<label class="edLabel" for="gridLineColorInput">สีเส้นตาราง (Line Color)</label>
		<div class="bgRow">
			<input id="gridLineColorInput" class="bgInput" type="color" bind:value={gridLineColor} />
			<span class="bgLabel">{gridLineColor}</span>
		</div>
	</div>

	<div class="colorRow">
		<label class="edLabel" for="timeBgColorInput">สีพื้นหลังเวลา (Time Slots Color)</label>
		<div class="bgRow">
			<input id="timeBgColorInput" class="bgInput" type="color" bind:value={timeBgColor} />
			<span class="bgLabel">{timeBgColor}</span>
		</div>
	</div>

	<div class="colorRow">
		<label class="edLabel" for="bgColorInput">สีพื้นหลังวอลเปเปอร์ (Wallpaper Background)</label>
		<div class="bgRow">
			<input id="bgColorInput" class="bgInput" type="color" bind:value={bgColor} />
			<span class="bgLabel">{bgColor}</span>
		</div>
	</div>
</aside>

<style>
	.rightDrawer {
		width: 320px;
		background: #18181b;
		color: #e4e4e7;
		padding: 24px;
		box-sizing: border-box;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 12px;
		border-left: 1px solid #27272a;
		box-shadow: none;
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

	.colorRow {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.bgRow {
		display: flex;
		align-items: center;
		gap: 10px;
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
