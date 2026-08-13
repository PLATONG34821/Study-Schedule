<script lang="ts">
	import type { PhonePreset } from '$lib/types';
	import * as m from '$lib/paraglide/messages';
	import { setLocale, getLocale } from '$lib/paraglide/runtime';

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
		fontSizeDay: number;
		fontSizeTime: number;
		fontSizeTitle: number;
		fontSizeBadge: number;
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
		fontSizeDay = $bindable(),
		fontSizeTime = $bindable(),
		fontSizeTitle = $bindable(),
		fontSizeBadge = $bindable(),
		currentPreset,
		isWallpaperMode
	}: Props = $props();
</script>

<aside
	class="w-80 bg-[#18181b] text-[#e4e4e7] p-6 box-border overflow-y-auto flex flex-col gap-3 border-l border-[#27272a] shadow-none z-10 shrink-0"
>
	<div class="flex items-start justify-between">
		<div>
			<h2 class="text-xl font-bold m-0 -tracking-[0.5px] text-white">{m.display_settings()}</h2>
			<p class="text-xs text-[#a1a1aa] mt-1">{m.display_subtitle()}</p>
		</div>
		<div class="flex gap-1 bg-[#27272a] p-1 rounded-lg border border-[#3f3f46]">
			<button
				type="button"
				class="px-2 py-0.5 text-xs rounded font-semibold transition-colors {getLocale() === 'th'
					? 'bg-[#6366f1] text-white'
					: 'text-[#a1a1aa] hover:text-white'}"
				onclick={() => setLocale('th')}
			>
				TH
			</button>
			<button
				type="button"
				class="px-2 py-0.5 text-xs rounded font-semibold transition-colors {getLocale() === 'en'
					? 'bg-[#6366f1] text-white'
					: 'text-[#a1a1aa] hover:text-white'}"
				onclick={() => setLocale('en')}
			>
				EN
			</button>
		</div>
	</div>

	<div class="text-[11px] font-bold tracking-[0.8px] uppercase text-[#a1a1aa] mt-2">
		{m.preset_label()}
	</div>
	<select
		class="w-full px-3 py-2.5 rounded-lg border border-[#3f3f46] bg-[#27272a] text-white text-[13px] font-[inherit] cursor-pointer"
		bind:value={selectedPresetId}
	>
		{#each phonePresets as preset (preset.id)}
			<option value={preset.id}>{preset.id === 'none' ? m.preset_original() : preset.name}</option>
		{/each}
	</select>

	{#if isWallpaperMode}
		<div class="bg-[#27272a] p-3 rounded-lg border border-[#3f3f46] flex flex-col gap-2.5">
			<div class="font-[JetBrains_Mono,monospace] text-[11px] text-[#a1a1aa] mb-2.5">
				{currentPreset.width} × {currentPreset.height} px
			</div>

			<label class="text-xs text-[#a1a1aa] block" for="gridRotationSelect"
				>{m.rotate_grid()}</label
			>
			<select
				id="gridRotationSelect"
				class="w-full px-2.5 py-2 rounded-md border border-[#3f3f46] bg-[#18181b] text-white text-[13px] box-border font-[inherit]"
				bind:value={gridRotationAngle}
			>
				<option value={90}>{m.rotate_90()}</option>
				<option value={180}>{m.rotate_180()}</option>
				<option value={270}>{m.rotate_270()}</option>
				<option value={0}>{m.rotate_0()}</option>
			</select>

			<label class="text-xs text-[#a1a1aa] block" for="scaleModeSelect"
				>{m.scale_mode()}</label
			>
			<select
				id="scaleModeSelect"
				class="w-full px-2.5 py-2 rounded-md border border-[#3f3f46] bg-[#18181b] text-white text-[13px] box-border font-[inherit]"
				bind:value={scaleMode}
			>
				<option value="fillWidth">{m.scale_fill_width()}</option>
				<option value="fitBoth">{m.scale_fit_both()}</option>
			</select>

			<div class="mt-2.5">
				<label class="text-xs text-[#a1a1aa] block" for="clockSpaceRange">
					{m.clock_space({ percent: customTopGapPercent })}
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
					{m.grid_scale({ percent: Math.round(gridScaleModifier * 100) })}
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
					{m.row_height({ height: slotRowHeight })}
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
					{m.column_width({ width: dayColumnWidth })}
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
		{m.font_sizes()}
	</div>

	<div class="bg-[#27272a] p-3 rounded-lg border border-[#3f3f46] flex flex-col gap-2.5">
		<div>
			<label class="text-xs text-[#a1a1aa] block" for="fontSizeTitleRange">
				{m.font_size_title({ size: fontSizeTitle })}
			</label>
			<input
				id="fontSizeTitleRange"
				type="range"
				min="12"
				max="36"
				step="1"
				bind:value={fontSizeTitle}
				class="w-full accent-[#6366f1] cursor-pointer"
			/>
		</div>

		<div>
			<label class="text-xs text-[#a1a1aa] block" for="fontSizeDayRange">
				{m.font_size_day({ size: fontSizeDay })}
			</label>
			<input
				id="fontSizeDayRange"
				type="range"
				min="12"
				max="36"
				step="1"
				bind:value={fontSizeDay}
				class="w-full accent-[#6366f1] cursor-pointer"
			/>
		</div>

		<div>
			<label class="text-xs text-[#a1a1aa] block" for="fontSizeTimeRange">
				{m.font_size_time({ size: fontSizeTime })}
			</label>
			<input
				id="fontSizeTimeRange"
				type="range"
				min="10"
				max="28"
				step="1"
				bind:value={fontSizeTime}
				class="w-full accent-[#6366f1] cursor-pointer"
			/>
		</div>

		<div>
			<label class="text-xs text-[#a1a1aa] block" for="fontSizeBadgeRange">
				{m.font_size_badge({ size: fontSizeBadge })}
			</label>
			<input
				id="fontSizeBadgeRange"
				type="range"
				min="8"
				max="20"
				step="1"
				bind:value={fontSizeBadge}
				class="w-full accent-[#6366f1] cursor-pointer"
			/>
		</div>
	</div>

	<div class="text-[11px] font-bold tracking-[0.8px] uppercase text-[#a1a1aa] mt-3.5">
		{m.grid_colors()}
	</div>

	<div class="flex flex-col gap-1">
		<label class="text-xs text-[#a1a1aa] block" for="gridLineColorInput"
			>{m.line_color()}</label
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
			>{m.day_header_color()}</label
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
			>{m.time_slot_color()}</label
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
			>{m.subject_cell_color()}</label
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
			>{m.wallpaper_bg_color()}</label
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
