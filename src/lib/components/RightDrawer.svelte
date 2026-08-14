<script lang="ts">
	import type { PhonePreset } from '$lib/types';
	import * as m from '$lib/paraglide/messages';
	import ColorWheelPicker from './ColorWheelPicker.svelte';

	interface Props {
		phonePresets: PhonePreset[];
		selectedPresetId: string;
		customPresetWidth?: number;
		customPresetHeight?: number;
		gridRotationAngle: number;
		customTopGapPercent: number;
		scaleMode: 'fillWidth' | 'fitBoth';
		gridScaleModifier: number;
		slotRowHeight: number;
		dayColumnWidth: number;
		gridBorderRadius: number;
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
		width?: number;
		isOpen?: boolean;
		onClose?: () => void;
	}

	let {
		phonePresets,
		selectedPresetId = $bindable(),
		customPresetWidth = $bindable(1920),
		customPresetHeight = $bindable(1080),
		gridRotationAngle = $bindable(),
		customTopGapPercent = $bindable(),
		scaleMode = $bindable(),
		gridScaleModifier = $bindable(),
		slotRowHeight = $bindable(),
		dayColumnWidth = $bindable(),
		gridBorderRadius = $bindable(16),
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
		isWallpaperMode,
		width = $bindable(320),
		isOpen = true,
		onClose
	}: Props = $props();

</script>

<aside
	class="box-border flex h-full w-full flex-col gap-3 overflow-y-auto border-l border-[#27272a] bg-[#18181b] p-6 text-[#e4e4e7] max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-40 max-lg:w-[320px] max-lg:max-w-[calc(100vw-3rem)] max-lg:shadow-2xl max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out {isOpen
		? 'max-lg:translate-x-0'
		: 'max-lg:translate-x-full'}"
>
	<div class="flex items-start justify-between">
		<div>
			<h2 class="m-0 text-xl font-bold -tracking-[0.5px] text-white">{m.display_settings()}</h2>
			<p class="mt-1 text-xs text-[#a1a1aa]">{m.display_subtitle()}</p>
		</div>
		{#if onClose}
			<button
				type="button"
				class="flex h-7 w-7 items-center justify-center rounded-lg border border-[#3f3f46] bg-[#27272a] text-sm text-[#a1a1aa] hover:text-white lg:hidden"
				onclick={onClose}
				aria-label="Close drawer"
				title="Close drawer"
			>
				✕
			</button>
		{/if}
	</div>

	<div class="mt-2 text-[11px] font-bold tracking-[0.8px] text-[#a1a1aa] uppercase">
		{m.preset_label()}
	</div>
	<select
		class="w-full cursor-pointer rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 font-[inherit] text-[13px] text-white"
		bind:value={selectedPresetId}
	>
		{#each phonePresets as preset (preset.id)}
			<option value={preset.id}>{preset.name}</option>
		{/each}
	</select>

	<div class="grid grid-cols-2 gap-2 rounded-lg border border-[#3f3f46] bg-[#27272a] p-3">
		<div>
			<label class="mb-1 block text-xs text-[#a1a1aa]" for="customWidthInput">Width (px)</label>
			<input
				id="customWidthInput"
				type="number"
				min="100"
				max="5000"
				step="10"
				value={selectedPresetId === 'custom' ? customPresetWidth : currentPreset.width || 1206}
				oninput={(e) => {
					const val = parseInt((e.target as HTMLInputElement).value) || 100;
					if (selectedPresetId !== 'custom') {
						customPresetWidth = currentPreset.width || 1206;
						customPresetHeight = currentPreset.height || 2622;
						selectedPresetId = 'custom';
					}
					customPresetWidth = val;
				}}
				class="w-full rounded-lg border border-[#3f3f46] bg-[#18181b] px-2.5 py-1.5 font-[JetBrains_Mono,monospace] text-[13px] text-white"
			/>
		</div>
		<div>
			<label class="mb-1 block text-xs text-[#a1a1aa]" for="customHeightInput">Height (px)</label>
			<input
				id="customHeightInput"
				type="number"
				min="100"
				max="5000"
				step="10"
				value={selectedPresetId === 'custom' ? customPresetHeight : currentPreset.height || 2622}
				oninput={(e) => {
					const val = parseInt((e.target as HTMLInputElement).value) || 100;
					if (selectedPresetId !== 'custom') {
						customPresetWidth = currentPreset.width || 1206;
						customPresetHeight = currentPreset.height || 2622;
						selectedPresetId = 'custom';
					}
					customPresetHeight = val;
				}}
				class="w-full rounded-lg border border-[#3f3f46] bg-[#18181b] px-2.5 py-1.5 font-[JetBrains_Mono,monospace] text-[13px] text-white"
			/>
		</div>
	</div>

	{#if isWallpaperMode}
		<div class="flex flex-col gap-2.5 rounded-lg border border-[#3f3f46] bg-[#27272a] p-3">
			<label class="block text-xs text-[#a1a1aa]" for="gridRotationSelect">{m.rotate_grid()}</label>
			<select
				id="gridRotationSelect"
				class="box-border w-full rounded-md border border-[#3f3f46] bg-[#18181b] px-2.5 py-2 font-[inherit] text-[13px] text-white"
				bind:value={gridRotationAngle}
			>
				<option value={90}>{m.rotate_90()}</option>
				<option value={180}>{m.rotate_180()}</option>
				<option value={270}>{m.rotate_270()}</option>
				<option value={0}>{m.rotate_0()}</option>
			</select>

			<label class="block text-xs text-[#a1a1aa]" for="scaleModeSelect">{m.scale_mode()}</label>
			<select
				id="scaleModeSelect"
				class="box-border w-full rounded-md border border-[#3f3f46] bg-[#18181b] px-2.5 py-2 font-[inherit] text-[13px] text-white"
				bind:value={scaleMode}
			>
				<option value="fillWidth">{m.scale_fill_width()}</option>
				<option value="fitBoth">{m.scale_fit_both()}</option>
			</select>

			<div class="mt-2.5 flex flex-col gap-1">
				<label class="block text-xs font-medium text-[#a1a1aa]" for="clockSpaceRange">
					{m.clock_space({ percent: customTopGapPercent })}
				</label>
				<input
					id="clockSpaceRange"
					type="range"
					min="0"
					max="60"
					bind:value={customTopGapPercent}
					class="w-full cursor-pointer"
				/>
			</div>

			<div class="mt-2.5 flex flex-col gap-1">
				<label class="block text-xs font-medium text-[#a1a1aa]" for="gridScaleRange">
					{m.grid_scale({ percent: Math.round(gridScaleModifier * 100) })}
				</label>
				<input
					id="gridScaleRange"
					type="range"
					min="0.70"
					max="1.15"
					step="0.01"
					bind:value={gridScaleModifier}
					class="w-full cursor-pointer accent-[#2563eb]"
				/>
			</div>

			<div class="mt-2.5 flex flex-col gap-1.5">
				<div class="flex items-center justify-between">
					<label class="block text-xs font-medium text-[#a1a1aa]" for="slotRowHeightRange">
						{m.row_height()}
					</label>
					<div class="flex items-center gap-1">
						<input
							type="number"
							min="50"
							max="1000"
							step="5"
							bind:value={slotRowHeight}
							class="w-16 rounded border border-[#3f3f46] bg-[#18181b] px-2 py-0.5 font-[JetBrains_Mono,monospace] text-xs text-white text-right"
						/>
						<span class="text-xs text-[#71717a]">px</span>
					</div>
				</div>
				<input
					id="slotRowHeightRange"
					type="range"
					min="50"
					max="1000"
					step="5"
					bind:value={slotRowHeight}
					class="w-full cursor-pointer accent-[#2563eb]"
				/>
			</div>

			<div class="mt-2.5 flex flex-col gap-1.5">
				<div class="flex items-center justify-between">
					<label class="block text-xs font-medium text-[#a1a1aa]" for="dayColWidthRange">
						{m.column_width()}
					</label>
					<div class="flex items-center gap-1">
						<input
							type="number"
							min="50"
							max="1000"
							step="5"
							bind:value={dayColumnWidth}
							class="w-16 rounded border border-[#3f3f46] bg-[#18181b] px-2 py-0.5 font-[JetBrains_Mono,monospace] text-xs text-white text-right"
						/>
						<span class="text-xs text-[#71717a]">px</span>
					</div>
				</div>
				<input
					id="dayColWidthRange"
					type="range"
					min="50"
					max="1000"
					step="5"
					bind:value={dayColumnWidth}
					class="w-full cursor-pointer accent-[#2563eb]"
				/>
			</div>

			<div class="mt-2.5 flex flex-col gap-1.5">
				<div class="flex items-center justify-between">
					<label class="block text-xs font-medium text-[#a1a1aa]" for="gridBorderRadiusRange">
						{m.grid_border_radius()}
					</label>
					<div class="flex items-center gap-1">
						<input
							type="number"
							min="0"
							max="60"
							step="1"
							bind:value={gridBorderRadius}
							class="w-16 rounded border border-[#3f3f46] bg-[#18181b] px-2 py-0.5 font-[JetBrains_Mono,monospace] text-xs text-white text-right"
						/>
						<span class="text-xs text-[#71717a]">px</span>
					</div>
				</div>
				<input
					id="gridBorderRadiusRange"
					type="range"
					min="0"
					max="60"
					step="1"
					bind:value={gridBorderRadius}
					class="w-full cursor-pointer accent-[#2563eb]"
				/>
			</div>
		</div>
	{/if}

	<div class="mt-3.5 text-[11px] font-bold tracking-[0.8px] text-[#a1a1aa] uppercase">
		{m.font_sizes()}
	</div>

	<div class="flex flex-col gap-3 rounded-lg border border-[#3f3f46] bg-[#27272a] p-3">
		<div class="flex flex-col gap-1.5">
			<div class="flex items-center justify-between">
				<label class="block text-xs font-medium text-[#a1a1aa]" for="fontSizeTitleRange">
					{m.font_size_title()}
				</label>
				<div class="flex items-center gap-1">
					<input
						type="number"
						min="12"
						max="36"
						step="1"
						bind:value={fontSizeTitle}
						class="w-16 rounded border border-[#3f3f46] bg-[#18181b] px-2 py-0.5 font-[JetBrains_Mono,monospace] text-xs text-white text-right"
					/>
					<span class="text-xs text-[#71717a]">px</span>
				</div>
			</div>
			<input
				id="fontSizeTitleRange"
				type="range"
				min="12"
				max="36"
				step="1"
				bind:value={fontSizeTitle}
				class="w-full cursor-pointer accent-[#2563eb]"
			/>
		</div>

		<div class="flex flex-col gap-1.5">
			<div class="flex items-center justify-between">
				<label class="block text-xs font-medium text-[#a1a1aa]" for="fontSizeDayRange">
					{m.font_size_day()}
				</label>
				<div class="flex items-center gap-1">
					<input
						type="number"
						min="12"
						max="36"
						step="1"
						bind:value={fontSizeDay}
						class="w-16 rounded border border-[#3f3f46] bg-[#18181b] px-2 py-0.5 font-[JetBrains_Mono,monospace] text-xs text-white text-right"
					/>
					<span class="text-xs text-[#71717a]">px</span>
				</div>
			</div>
			<input
				id="fontSizeDayRange"
				type="range"
				min="12"
				max="36"
				step="1"
				bind:value={fontSizeDay}
				class="w-full cursor-pointer accent-[#2563eb]"
			/>
		</div>

		<div class="flex flex-col gap-1.5">
			<div class="flex items-center justify-between">
				<label class="block text-xs font-medium text-[#a1a1aa]" for="fontSizeTimeRange">
					{m.font_size_time()}
				</label>
				<div class="flex items-center gap-1">
					<input
						type="number"
						min="10"
						max="28"
						step="1"
						bind:value={fontSizeTime}
						class="w-16 rounded border border-[#3f3f46] bg-[#18181b] px-2 py-0.5 font-[JetBrains_Mono,monospace] text-xs text-white text-right"
					/>
					<span class="text-xs text-[#71717a]">px</span>
				</div>
			</div>
			<input
				id="fontSizeTimeRange"
				type="range"
				min="10"
				max="28"
				step="1"
				bind:value={fontSizeTime}
				class="w-full cursor-pointer accent-[#2563eb]"
			/>
		</div>

		<div class="flex flex-col gap-1.5">
			<div class="flex items-center justify-between">
				<label class="block text-xs font-medium text-[#a1a1aa]" for="fontSizeBadgeRange">
					{m.font_size_badge()}
				</label>
				<div class="flex items-center gap-1">
					<input
						type="number"
						min="8"
						max="20"
						step="1"
						bind:value={fontSizeBadge}
						class="w-16 rounded border border-[#3f3f46] bg-[#18181b] px-2 py-0.5 font-[JetBrains_Mono,monospace] text-xs text-white text-right"
					/>
					<span class="text-xs text-[#71717a]">px</span>
				</div>
			</div>
			<input
				id="fontSizeBadgeRange"
				type="range"
				min="8"
				max="20"
				step="1"
				bind:value={fontSizeBadge}
				class="w-full cursor-pointer accent-[#2563eb]"
			/>
		</div>
	</div>

	<div class="mt-3.5 text-[11px] font-bold tracking-[0.8px] text-[#a1a1aa] uppercase">
		{m.grid_colors()}
	</div>

	<div class="flex flex-col gap-1">
		<label class="block text-xs text-[#a1a1aa]" for="gridLineColorInput">{m.line_color()}</label>
		<div class="flex items-center gap-2.5">
			<ColorWheelPicker color={gridLineColor} onChange={(c) => (gridLineColor = c)} label={m.line_color()} />
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{gridLineColor}</span>
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<label class="block text-xs text-[#a1a1aa]" for="dayHeaderBgColorInput"
			>{m.day_header_color()}</label
		>
		<div class="flex items-center gap-2.5">
			<ColorWheelPicker color={dayHeaderBgColor} onChange={(c) => (dayHeaderBgColor = c)} label={m.day_header_color()} />
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{dayHeaderBgColor}</span>
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<label class="block text-xs text-[#a1a1aa]" for="timeBgColorInput">{m.time_slot_color()}</label>
		<div class="flex items-center gap-2.5">
			<ColorWheelPicker color={timeBgColor} onChange={(c) => (timeBgColor = c)} label={m.time_slot_color()} />
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{timeBgColor}</span>
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<label class="block text-xs text-[#a1a1aa]" for="cellBgColorInput"
			>{m.subject_cell_color()}</label
		>
		<div class="flex items-center gap-2.5">
			<ColorWheelPicker color={cellBgColor} onChange={(c) => (cellBgColor = c)} label={m.subject_cell_color()} />
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{cellBgColor}</span>
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<label class="block text-xs text-[#a1a1aa]" for="bgColorInput">{m.wallpaper_bg_color()}</label>
		<div class="flex items-center gap-2.5">
			<ColorWheelPicker color={bgColor} onChange={(c) => (bgColor = c)} label={m.wallpaper_bg_color()} />
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{bgColor}</span>
		</div>
	</div>
</aside>
