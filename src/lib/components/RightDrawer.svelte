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
		dayHeaderBgColor: string;
		cellBgColor: string;
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
		dayHeaderBgColor = $bindable(),
		cellBgColor = $bindable(),
		currentPreset,
		isWallpaperMode
	}: Props = $props();
</script>

<aside
	class="w-80 bg-[#18181b] text-[#e4e4e7] p-6 box-border overflow-y-auto flex flex-col gap-3 border-l border-[#27272a] shadow-none z-10 shrink-0"
>
	<div>
		<h2 class="text-xl font-bold m-0 -tracking-[0.5px] text-white">ตั้งค่าการแสดงผล</h2>
		<p class="text-xs text-[#a1a1aa] mt-1">วอลเปเปอร์ มุมหมุน และสีตาราง</p>
	</div>

	<div class="text-[11px] font-bold tracking-[0.8px] uppercase text-[#a1a1aa] mt-2">
		ขนาด / วอลเปเปอร์ (Preset)
	</div>
	<select
		class="w-full px-3 py-2.5 rounded-lg border border-[#3f3f46] bg-[#27272a] text-white text-[13px] font-[inherit] cursor-pointer"
		bind:value={selectedPresetId}
	>
		{#each phonePresets as preset (preset.id)}
			<option value={preset.id}>{preset.name}</option>
		{/each}
	</select>

	{#if isWallpaperMode}
		<div class="bg-[#27272a] p-3 rounded-lg border border-[#3f3f46] flex flex-col gap-2.5">
			<div class="font-[JetBrains_Mono,monospace] text-[11px] text-[#a1a1aa] mb-2.5">
				{currentPreset.width} × {currentPreset.height} px
			</div>

			<label class="text-xs text-[#a1a1aa] block" for="gridRotationSelect"
				>หมุนตาราง (Rotate Grid)</label
			>
			<select
				id="gridRotationSelect"
				class="w-full px-2.5 py-2 rounded-md border border-[#3f3f46] bg-[#18181b] text-white text-[13px] box-border font-[inherit]"
				bind:value={gridRotationAngle}
			>
				<option value={90}>หมุน 90° (แนวตั้ง / Rotated 90°)</option>
				<option value={180}>หมุน 180° (กลับหัว / Upside Down 180°)</option>
				<option value={270}>หมุน 270° (Rotated 270°)</option>
				<option value={0}>ไม่หมุน 0° (แนวขนาน / Original 0°)</option>
			</select>

			<label class="text-xs text-[#a1a1aa] block" for="scaleModeSelect"
				>ขยายขนาดตาราง (Scale Mode)</label
			>
			<select
				id="scaleModeSelect"
				class="w-full px-2.5 py-2 rounded-md border border-[#3f3f46] bg-[#18181b] text-white text-[13px] box-border font-[inherit]"
				bind:value={scaleMode}
			>
				<option value="fillWidth">ยืดเต็มขอบด้านข้าง (Full Width Edge-to-Edge)</option>
				<option value="fitBoth">พอดีทั้งกว้างและสูง (Fit Inside Screen)</option>
			</select>

			<div class="mt-2.5">
				<label class="text-xs text-[#a1a1aa] block" for="clockSpaceRange">
					เว้นพื้นที่นาฬิกา: {customTopGapPercent}%
				</label>
				<input
					id="clockSpaceRange"
					type="range"
					min="15"
					max="45"
					bind:value={customTopGapPercent}
					class="w-full accent-[#6366f1] cursor-pointer"
				/>
			</div>

			<div class="mt-2.5">
				<label class="text-xs text-[#a1a1aa] block" for="gridScaleRange">
					ปรับขนาดย่อ/ขยายตาราง: {Math.round(gridScaleModifier * 100)}%
				</label>
				<input
					id="gridScaleRange"
					type="range"
					min="0.70"
					max="1.15"
					step="0.01"
					bind:value={gridScaleModifier}
					class="w-full accent-[#6366f1] cursor-pointer"
				/>
			</div>

			<div class="mt-2.5">
				<label class="text-xs text-[#a1a1aa] block" for="slotRowHeightRange">
					ความสูงแถวตาราง: {slotRowHeight} px
				</label>
				<input
					id="slotRowHeightRange"
					type="range"
					min="140"
					max="300"
					step="5"
					bind:value={slotRowHeight}
					class="w-full accent-[#6366f1] cursor-pointer"
				/>
			</div>

			<div class="mt-2.5">
				<label class="text-xs text-[#a1a1aa] block" for="dayColWidthRange">
					ปรับความยาวตารางแนวตั้ง (Column Width): {dayColumnWidth} px
				</label>
				<input
					id="dayColWidthRange"
					type="range"
					min="150"
					max="350"
					step="5"
					bind:value={dayColumnWidth}
					class="w-full accent-[#6366f1] cursor-pointer"
				/>
			</div>
		</div>
	{/if}

	<div class="text-[11px] font-bold tracking-[0.8px] uppercase text-[#a1a1aa] mt-3.5">
		สีส่วนประกอบตาราง (Grid Colors)
	</div>

	<div class="flex flex-col gap-1">
		<label class="text-xs text-[#a1a1aa] block" for="gridLineColorInput"
			>สีเส้นตาราง (Line Color)</label
		>
		<div class="flex items-center gap-2.5">
			<input
				id="gridLineColorInput"
				class="w-10 h-8 border-none rounded-md bg-none cursor-pointer p-0"
				type="color"
				bind:value={gridLineColor}
			/>
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{gridLineColor}</span>
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<label class="text-xs text-[#a1a1aa] block" for="dayHeaderBgColorInput"
			>สีพื้นหลังวัน (Days Header Color)</label
		>
		<div class="flex items-center gap-2.5">
			<input
				id="dayHeaderBgColorInput"
				class="w-10 h-8 border-none rounded-md bg-none cursor-pointer p-0"
				type="color"
				bind:value={dayHeaderBgColor}
			/>
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{dayHeaderBgColor}</span>
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<label class="text-xs text-[#a1a1aa] block" for="timeBgColorInput"
			>สีพื้นหลังเวลา (Time Slots Color)</label
		>
		<div class="flex items-center gap-2.5">
			<input
				id="timeBgColorInput"
				class="w-10 h-8 border-none rounded-md bg-none cursor-pointer p-0"
				type="color"
				bind:value={timeBgColor}
			/>
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{timeBgColor}</span>
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<label class="text-xs text-[#a1a1aa] block" for="cellBgColorInput"
			>สีพื้นหลังวิชา / ช่องตาราง (Subject Cells Color)</label
		>
		<div class="flex items-center gap-2.5">
			<input
				id="cellBgColorInput"
				class="w-10 h-8 border-none rounded-md bg-none cursor-pointer p-0"
				type="color"
				bind:value={cellBgColor}
			/>
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{cellBgColor}</span>
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<label class="text-xs text-[#a1a1aa] block" for="bgColorInput"
			>สีพื้นหลังวอลเปเปอร์ (Wallpaper Background)</label
		>
		<div class="flex items-center gap-2.5">
			<input
				id="bgColorInput"
				class="w-10 h-8 border-none rounded-md bg-none cursor-pointer p-0"
				type="color"
				bind:value={bgColor}
			/>
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{bgColor}</span>
		</div>
	</div>
</aside>
