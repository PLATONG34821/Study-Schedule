<script lang="ts">
	import type { PhonePreset } from '$lib/types';
	import * as m from '$lib/paraglide/messages';

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

	let isResizing = $state(false);

	const handlePointerDown = (e: PointerEvent) => {
		isResizing = true;
		const handle = e.currentTarget as HTMLElement;
		handle.setPointerCapture(e.pointerId);
		const startX = e.clientX;
		const startWidth = width;

		const handlePointerMove = (moveEvent: PointerEvent) => {
			if (!isResizing) return;
			const deltaX = startX - moveEvent.clientX;
			width = Math.min(Math.max(startWidth + deltaX, 220), 550);
		};

		const handlePointerUp = () => {
			isResizing = false;
			handle.removeEventListener('pointermove', handlePointerMove as EventListener);
			handle.removeEventListener('pointerup', handlePointerUp as EventListener);
		};

		handle.addEventListener('pointermove', handlePointerMove as EventListener);
		handle.addEventListener('pointerup', handlePointerUp as EventListener);
	};
</script>

<aside
	class="fixed inset-y-0 right-0 z-40 box-border flex h-full shrink-0 flex-col gap-3 overflow-y-auto border-l border-[#27272a] bg-[#18181b] p-6 text-[#e4e4e7] shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-10 lg:shadow-none {isOpen
		? 'translate-x-0'
		: 'translate-x-full lg:translate-x-0'}"
	style="width: {width}px;"
>
	<div
		class="absolute top-0 left-0 z-20 hidden h-full w-2 cursor-col-resize transition-colors hover:bg-[#6366f1]/50 active:bg-[#6366f1] lg:block"
		onpointerdown={handlePointerDown}
		role="separator"
		aria-label="Resize right drawer"
	></div>
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
					customPresetWidth = val;
					if (selectedPresetId !== 'custom') {
						customPresetHeight = currentPreset.height || 2622;
						selectedPresetId = 'custom';
					}
				}}
				class="w-full rounded-md border border-[#3f3f46] bg-[#18181b] px-2.5 py-1.5 font-[JetBrains_Mono,monospace] text-[13px] text-white"
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
					customPresetHeight = val;
					if (selectedPresetId !== 'custom') {
						customPresetWidth = currentPreset.width || 1206;
						selectedPresetId = 'custom';
					}
				}}
				class="w-full rounded-md border border-[#3f3f46] bg-[#18181b] px-2.5 py-1.5 font-[JetBrains_Mono,monospace] text-[13px] text-white"
			/>
		</div>
	</div>

	{#if isWallpaperMode}
		<div class="flex flex-col gap-2.5 rounded-lg border border-[#3f3f46] bg-[#27272a] p-3">
			<div class="mb-2.5 font-[JetBrains_Mono,monospace] text-[11px] text-[#a1a1aa]">
				{currentPreset.width} × {currentPreset.height} px
			</div>

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

			<div class="mt-2.5">
				<label class="mb-1 block text-xs font-medium text-[#a1a1aa]" for="clockSpaceRange">
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

			<div class="mt-2.5">
				<label class="mb-1 block text-xs font-medium text-[#a1a1aa]" for="gridScaleRange">
					{m.grid_scale({ percent: Math.round(gridScaleModifier * 100) })}
				</label>
				<input
					id="gridScaleRange"
					type="range"
					min="0.70"
					max="1.15"
					step="0.01"
					bind:value={gridScaleModifier}
					class="w-full cursor-pointer"
				/>
			</div>

			<div class="mt-2.5">
				<label class="mb-1 block text-xs font-medium text-[#a1a1aa]" for="slotRowHeightRange">
					{m.row_height({ height: slotRowHeight })}
				</label>
				<input
					id="slotRowHeightRange"
					type="range"
					min="50"
					max="1000"
					step="5"
					bind:value={slotRowHeight}
					class="w-full cursor-pointer"
				/>
			</div>

			<div class="mt-2.5">
				<label class="mb-1 block text-xs font-medium text-[#a1a1aa]" for="dayColWidthRange">
					{m.column_width({ width: dayColumnWidth })}
				</label>
				<input
					id="dayColWidthRange"
					type="range"
					min="50"
					max="1000"
					step="5"
					bind:value={dayColumnWidth}
					class="w-full cursor-pointer"
				/>
			</div>
		</div>
	{/if}

	<div class="mt-3.5 text-[11px] font-bold tracking-[0.8px] text-[#a1a1aa] uppercase">
		{m.font_sizes()}
	</div>

	<div class="flex flex-col gap-3 rounded-lg border border-[#3f3f46] bg-[#27272a] p-3">
		<div>
			<label class="mb-1 block text-xs font-medium text-[#a1a1aa]" for="fontSizeTitleRange">
				{m.font_size_title({ size: fontSizeTitle })}
			</label>
			<input
				id="fontSizeTitleRange"
				type="range"
				min="12"
				max="36"
				step="1"
				bind:value={fontSizeTitle}
				class="w-full cursor-pointer"
			/>
		</div>

		<div>
			<label class="mb-1 block text-xs font-medium text-[#a1a1aa]" for="fontSizeDayRange">
				{m.font_size_day({ size: fontSizeDay })}
			</label>
			<input
				id="fontSizeDayRange"
				type="range"
				min="12"
				max="36"
				step="1"
				bind:value={fontSizeDay}
				class="w-full cursor-pointer"
			/>
		</div>

		<div>
			<label class="mb-1 block text-xs font-medium text-[#a1a1aa]" for="fontSizeTimeRange">
				{m.font_size_time({ size: fontSizeTime })}
			</label>
			<input
				id="fontSizeTimeRange"
				type="range"
				min="10"
				max="28"
				step="1"
				bind:value={fontSizeTime}
				class="w-full cursor-pointer"
			/>
		</div>

		<div>
			<label class="mb-1 block text-xs font-medium text-[#a1a1aa]" for="fontSizeBadgeRange">
				{m.font_size_badge({ size: fontSizeBadge })}
			</label>
			<input
				id="fontSizeBadgeRange"
				type="range"
				min="8"
				max="20"
				step="1"
				bind:value={fontSizeBadge}
				class="w-full cursor-pointer"
			/>
		</div>
	</div>

	<div class="mt-3.5 text-[11px] font-bold tracking-[0.8px] text-[#a1a1aa] uppercase">
		{m.grid_colors()}
	</div>

	<div class="flex flex-col gap-1">
		<label class="block text-xs text-[#a1a1aa]" for="gridLineColorInput">{m.line_color()}</label>
		<div class="flex items-center gap-2.5">
			<input
				id="gridLineColorInput"
				class="h-8 w-10 cursor-pointer rounded-md border-none bg-none p-0"
				type="color"
				bind:value={gridLineColor}
			/>
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{gridLineColor}</span>
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<label class="block text-xs text-[#a1a1aa]" for="dayHeaderBgColorInput"
			>{m.day_header_color()}</label
		>
		<div class="flex items-center gap-2.5">
			<input
				id="dayHeaderBgColorInput"
				class="h-8 w-10 cursor-pointer rounded-md border-none bg-none p-0"
				type="color"
				bind:value={dayHeaderBgColor}
			/>
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{dayHeaderBgColor}</span>
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<label class="block text-xs text-[#a1a1aa]" for="timeBgColorInput">{m.time_slot_color()}</label>
		<div class="flex items-center gap-2.5">
			<input
				id="timeBgColorInput"
				class="h-8 w-10 cursor-pointer rounded-md border-none bg-none p-0"
				type="color"
				bind:value={timeBgColor}
			/>
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{timeBgColor}</span>
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<label class="block text-xs text-[#a1a1aa]" for="cellBgColorInput"
			>{m.subject_cell_color()}</label
		>
		<div class="flex items-center gap-2.5">
			<input
				id="cellBgColorInput"
				class="h-8 w-10 cursor-pointer rounded-md border-none bg-none p-0"
				type="color"
				bind:value={cellBgColor}
			/>
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{cellBgColor}</span>
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<label class="block text-xs text-[#a1a1aa]" for="bgColorInput">{m.wallpaper_bg_color()}</label>
		<div class="flex items-center gap-2.5">
			<input
				id="bgColorInput"
				class="h-8 w-10 cursor-pointer rounded-md border-none bg-none p-0"
				type="color"
				bind:value={bgColor}
			/>
			<span class="font-[JetBrains_Mono,monospace] text-xs opacity-70">{bgColor}</span>
		</div>
	</div>
</aside>
