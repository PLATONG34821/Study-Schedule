<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { toPng } from 'html-to-image';
	import type { Day, Slot, PaletteColor, ClassBlock } from '$lib/types';
	import { generateUid, compressConfigCode, decompressConfigCode } from '$lib/utils';
	import { phonePresets, defaultBlocks } from '$lib/constants';
	import * as m from '$lib/paraglide/messages';
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import RightDrawer from '$lib/components/RightDrawer.svelte';
	import ScheduleGrid from '$lib/components/ScheduleGrid.svelte';
	import BlockEditorModal from '$lib/components/BlockEditorModal.svelte';
	import ConfigCodeModal from '$lib/components/ConfigCodeModal.svelte';

	let days = $state<Day[]>([
		{ id: 'day1', name: 'Monday' },
		{ id: 'day2', name: 'Tuesday' },
		{ id: 'day3', name: 'Wednesday' },
		{ id: 'day4', name: 'Thursday' },
		{ id: 'day5', name: 'Friday' }
	]);

	let slots = $state<Slot[]>([
		{ id: 'slot1', label: '08:00' },
		{ id: 'slot2', label: '10:00' },
		{ id: 'slot3', label: '13:00' },
		{ id: 'slot4', label: '15:00' }
	]);

	let palette = $state<PaletteColor[]>([
		{ id: 'c1', color: '#55E6A5' },
		{ id: 'c2', color: '#FF764A' },
		{ id: 'c3', color: '#38BDF8' },
		{ id: 'c4', color: '#A855F7' },
		{ id: 'c5', color: '#FACC15' },
		{ id: 'c6', color: '#EC4899' },
		{ id: 'c7', color: '#26D0CE' }
	]);

	let selectedId = $state<string | null>(null);
	let bgColor = $state<string>('#ffffff');
	let gridLineColor = $state<string>('#111111');
	let timeBgColor = $state<string>('#111111');
	let dayHeaderBgColor = $state<string>('#ffffff');
	let cellBgColor = $state<string>('#ffffff');
	let fontSizeDay = $state<number>(20);
	let fontSizeTime = $state<number>(16);
	let fontSizeTitle = $state<number>(20);
	let fontSizeBadge = $state<number>(11);
	let isExporting = $state(false);
	let captureWrapEl = $state<HTMLDivElement | null>(null);

	let selectedPresetId = $state<string>('desktop');
	let customPresetWidth = $state<number>(1920);
	let customPresetHeight = $state<number>(1080);
	let gridRotationAngle = $state<number>(0);
	let is90or270 = $derived(gridRotationAngle === 90 || gridRotationAngle === 270);
	let customTopGapPercent = $state<number>(0);
	let scaleMode = $state<'fillWidth' | 'fitBoth'>('fitBoth');
	let gridScaleModifier = $state<number>(1.0);

	let lastPresetId = $state<string>('');
	$effect(() => {
		if (!lastPresetId) {
			lastPresetId = selectedPresetId;
			return;
		}
		if (selectedPresetId !== lastPresetId) {
			lastPresetId = selectedPresetId;
			if (selectedPresetId === 'desktop') {
				gridRotationAngle = 0;
				customTopGapPercent = 0;
			} else if (selectedPresetId === 'iphone') {
				gridRotationAngle = 270;
				customTopGapPercent = 24;
			}
		}
	});
	let slotRowHeight = $state<number>(210);
	let dayColumnWidth = $state<number>(270);
	let leftSidebarWidth = $state<number>(320);
	let rightDrawerWidth = $state<number>(320);

	let previewZoom = $state<number>(1);
	let previewPanX = $state<number>(0);
	let previewPanY = $state<number>(0);
	let isCanvasPanning = $state<boolean>(false);

	const zoomIn = () => {
		previewZoom = Math.min(Math.round((previewZoom + 0.15) * 100) / 100, 3);
	};

	const zoomOut = () => {
		previewZoom = Math.max(Math.round((previewZoom - 0.15) * 100) / 100, 0.2);
	};

	const resetPreviewView = () => {
		previewZoom = 1;
		previewPanX = 0;
		previewPanY = 0;
	};

	const centerPreviewPosition = () => {
		previewPanX = 0;
		previewPanY = 0;
	};

	const handleCanvasWheel = (e: WheelEvent) => {
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1;
			previewZoom = Math.min(Math.max(Math.round((previewZoom + zoomDelta) * 100) / 100, 0.2), 3);
		}
	};

	const handleCanvasPointerDown = (e: PointerEvent) => {
		const target = e.target as HTMLElement;
		if (
			target.closest('button') ||
			target.closest('input') ||
			target.closest('select') ||
			target.closest('a') ||
			target.closest('textarea')
		) {
			return;
		}

		isCanvasPanning = true;
		const container = e.currentTarget as HTMLElement;
		container.setPointerCapture(e.pointerId);
		const startX = e.clientX - previewPanX;
		const startY = e.clientY - previewPanY;

		const handlePointerMove = (moveEvent: PointerEvent) => {
			if (!isCanvasPanning) return;
			previewPanX = moveEvent.clientX - startX;
			previewPanY = moveEvent.clientY - startY;
		};

		const handlePointerUp = () => {
			isCanvasPanning = false;
			container.removeEventListener('pointermove', handlePointerMove as EventListener);
			container.removeEventListener('pointerup', handlePointerUp as EventListener);
		};

		container.addEventListener('pointermove', handlePointerMove as EventListener);
		container.addEventListener('pointerup', handlePointerUp as EventListener);
	};

	let currentPreset = $derived.by(() => {
		const preset = phonePresets.find((p) => p.id === selectedPresetId) || phonePresets[0];
		if (selectedPresetId === 'custom') {
			return {
				...preset,
				width: Math.max(customPresetWidth || 100, 100),
				height: Math.max(customPresetHeight || 100, 100)
			};
		}
		return preset;
	});
	let isWallpaperMode = $derived(selectedPresetId !== 'none');

	let gridUnrotatedWidth = $derived(110 + days.length * dayColumnWidth + 6);
	let gridUnrotatedHeight = $derived(70 + slots.length * slotRowHeight + 6);

	let availableWidth = $derived(isWallpaperMode ? currentPreset.width - 32 : gridUnrotatedWidth);
	let availableHeight = $derived(
		isWallpaperMode
			? currentPreset.height * (1 - customTopGapPercent / 100) - 32
			: gridUnrotatedHeight
	);

	let computedScale = $derived.by(() => {
		if (!isWallpaperMode) return 1;
		const targetW = is90or270 ? gridUnrotatedHeight : gridUnrotatedWidth;
		const targetH = is90or270 ? gridUnrotatedWidth : gridUnrotatedHeight;
		const scaleX = availableWidth / targetW;
		const scaleY = availableHeight / targetH;
		return scaleMode === 'fillWidth' ? scaleX : Math.min(scaleX, scaleY);
	});

	let finalScale = $derived(isWallpaperMode ? computedScale * gridScaleModifier : 1);

	let blocks = $state<ClassBlock[]>(defaultBlocks);

	let selectedBlock = $derived(blocks.find((b) => b.id === selectedId) || null);

	const addDay = () => {
		days.push({ id: generateUid(), name: m.new_day() });
	};

	const removeDay = (dayId: string) => {
		days = days.filter((d) => d.id !== dayId);
		blocks = blocks.filter((b) => b.dayId !== dayId);
	};

	const addSlot = () => {
		slots.push({ id: generateUid(), label: '17:00' });
	};

	const removeSlot = (slotId: string) => {
		slots = slots.filter((s) => s.id !== slotId);
		blocks = blocks.filter((b) => b.timeSlotId !== slotId);
	};

	const addColor = () => {
		palette.push({ id: generateUid(), color: '#999999' });
	};

	const removeColor = (colorId: string) => {
		palette = palette.filter((c) => c.id !== colorId);
		blocks.forEach((b) => {
			if (b.colorId === colorId) b.colorId = null;
		});
	};

	const addBlock = (dayId: string, timeSlotId: string) => {
		const existingBlock = blocks.find((b) => b.dayId === dayId && b.timeSlotId === timeSlotId);
		if (existingBlock) return;

		const newBlock: ClassBlock = {
			id: generateUid(),
			dayId,
			timeSlotId,
			title: m.new_subject(),
			time: '',
			room: '',
			section: '1',
			type: 'Lecture',
			colorId: palette[0] ? palette[0].id : null,
			pattern: false
		};
		blocks.push(newBlock);
		selectedId = newBlock.id;
	};

	const removeBlock = (blockId: string) => {
		blocks = blocks.filter((b) => b.id !== blockId);
		if (selectedId === blockId) selectedId = null;
	};

	const exportPng = async () => {
		if (!captureWrapEl) return;
		const previousSelected = selectedId;
		const previousZoom = previewZoom;
		const previousPanX = previewPanX;
		const previousPanY = previewPanY;

		selectedId = null;
		isExporting = true;
		previewZoom = 1 / 0.35;
		previewPanX = 0;
		previewPanY = 0;

		await tick();
		await document.fonts.ready;
		await new Promise((resolve) => setTimeout(resolve, 150));
		try {
			const dataUrl = await toPng(captureWrapEl, {
				backgroundColor: bgColor,
				width: currentPreset.width,
				height: currentPreset.height,
				pixelRatio: 1
			});
			const downloadLink = document.createElement('a');
			downloadLink.download = `schedule-wallpaper-${currentPreset.id}.png`;
			downloadLink.href = dataUrl;
			downloadLink.click();
		} catch (error) {
			alert('Export failed: ' + (error as Error).message);
		} finally {
			previewZoom = previousZoom;
			previewPanX = previousPanX;
			previewPanY = previousPanY;
			isExporting = false;
			selectedId = previousSelected;
		}
	};

	let linkCopied = $state(false);
	let isCodeModalOpen = $state(false);
	let codeModalMode = $state<'export' | 'import'>('export');
	let exportedCodeString = $state('');

	const getFullConfigObj = () => ({
		days,
		slots,
		palette,
		blocks,
		settings: {
			selectedPresetId,
			customPresetWidth,
			customPresetHeight,
			gridRotationAngle,
			customTopGapPercent,
			scaleMode,
			gridScaleModifier,
			slotRowHeight,
			dayColumnWidth,
			bgColor,
			gridLineColor,
			timeBgColor,
			dayHeaderBgColor,
			cellBgColor,
			fontSizeDay,
			fontSizeTime,
			fontSizeTitle,
			fontSizeBadge
		}
	});

	const openExportCode = async () => {
		exportedCodeString = await compressConfigCode(getFullConfigObj());
		codeModalMode = 'export';
		isCodeModalOpen = true;
	};

	const openImportCode = () => {
		codeModalMode = 'import';
		isCodeModalOpen = true;
	};

	const handleImportCode = async (codeString: string): Promise<boolean> => {
		try {
			const data = (await decompressConfigCode(codeString)) as Record<string, unknown> | null;
			if (!data) return false;

			if (Array.isArray(data.days)) days = data.days as Day[];
			if (Array.isArray(data.slots)) slots = data.slots as Slot[];
			if (Array.isArray(data.palette)) palette = data.palette as PaletteColor[];
			if (Array.isArray(data.blocks)) blocks = data.blocks as ClassBlock[];

			const st = data.settings as Record<string, unknown> | undefined;
			if (st) {
				if (typeof st.selectedPresetId === 'string') {
					selectedPresetId = st.selectedPresetId.startsWith('ip') ? 'iphone' : st.selectedPresetId;
				}
				if (typeof st.customPresetWidth === 'number') customPresetWidth = st.customPresetWidth;
				if (typeof st.customPresetHeight === 'number') customPresetHeight = st.customPresetHeight;
				if (typeof st.gridRotationAngle === 'number') gridRotationAngle = st.gridRotationAngle;
				if (typeof st.customTopGapPercent === 'number')
					customTopGapPercent = st.customTopGapPercent;
				if (
					typeof st.scaleMode === 'string' &&
					(st.scaleMode === 'fillWidth' || st.scaleMode === 'fitBoth')
				)
					scaleMode = st.scaleMode;
				if (typeof st.gridScaleModifier === 'number') gridScaleModifier = st.gridScaleModifier;
				if (typeof st.slotRowHeight === 'number') slotRowHeight = st.slotRowHeight;
				if (typeof st.dayColumnWidth === 'number') dayColumnWidth = st.dayColumnWidth;
				if (typeof st.bgColor === 'string') bgColor = st.bgColor;
				if (typeof st.gridLineColor === 'string') gridLineColor = st.gridLineColor;
				if (typeof st.timeBgColor === 'string') timeBgColor = st.timeBgColor;
				if (typeof st.dayHeaderBgColor === 'string') dayHeaderBgColor = st.dayHeaderBgColor;
				if (typeof st.cellBgColor === 'string') cellBgColor = st.cellBgColor;
				if (typeof st.fontSizeDay === 'number') fontSizeDay = st.fontSizeDay;
				if (typeof st.fontSizeTime === 'number') fontSizeTime = st.fontSizeTime;
				if (typeof st.fontSizeTitle === 'number') fontSizeTitle = st.fontSizeTitle;
				if (typeof st.fontSizeBadge === 'number') fontSizeBadge = st.fontSizeBadge;
			}

			selectedId = null;
			return true;
		} catch {
			return false;
		}
	};

	const shareLink = async () => {
		const code = await compressConfigCode(getFullConfigObj());
		const shareUrl = `${window.location.origin}${window.location.pathname}#s=${code}`;

		try {
			await navigator.clipboard.writeText(shareUrl);
			linkCopied = true;
			setTimeout(() => {
				linkCopied = false;
			}, 2500);
		} catch {
			prompt('Copy schedule link:', shareUrl);
		}
	};

	onMount(() => {
		const loadFromHash = async () => {
			const hash = window.location.hash;
			if (hash && hash.includes('s=')) {
				const code = hash.split('s=')[1];
				if (code) {
					await handleImportCode(code);
				}
			}
		};
		loadFromHash();
	});
</script>

<div class="flex h-screen w-screen overflow-hidden">
	<LeftSidebar
		{isExporting}
		{linkCopied}
		bind:width={leftSidebarWidth}
		bind:days
		bind:slots
		bind:palette
		onExport={exportPng}
		onOpenExportCode={openExportCode}
		onOpenImportCode={openImportCode}
		onShareLink={shareLink}
		onAddDay={addDay}
		onRemoveDay={removeDay}
		onAddSlot={addSlot}
		onRemoveSlot={removeSlot}
		onAddColor={addColor}
		onRemoveColor={removeColor}
	/>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="relative flex flex-1 flex-col overflow-hidden bg-[#121214] select-none"
		onwheel={handleCanvasWheel}
		onpointerdown={handleCanvasPointerDown}
	>
		<div
			class="box-border flex h-full w-full items-center justify-center p-10"
			style="cursor: {isCanvasPanning
				? 'grabbing'
				: 'grab'}; transform: translate({previewPanX}px, {previewPanY}px);"
		>
			{#if isWallpaperMode}
				<div
					class="relative shrink-0 origin-center transition-transform duration-75 ease-out"
					style="transform: scale({0.35 * previewZoom});"
				>
					<div
						class="flex flex-col overflow-hidden p-0 {selectedPresetId === 'iphone'
							? 'rounded-[48px]'
							: 'rounded-2xl'} shadow-none"
						bind:this={captureWrapEl}
						style="width: {currentPreset.width}px; height: {currentPreset.height}px; background: {bgColor};"
					>
						<div
							class="relative box-border flex items-center justify-center"
							style="height: {currentPreset.height * (customTopGapPercent / 100)}px;"
						>
							{#if !isExporting && customTopGapPercent > 0}
								<div
									class="rounded-[20px] border-2 border-dashed border-black/15 px-10 py-4 text-center font-[Space_Grotesk,sans-serif] text-black/35"
								>
									<div class="text-[64px] leading-none font-bold">12:08</div>
									<div class="mt-1.5 font-[JetBrains_Mono,monospace] text-sm">
										{m.clock_space_guide()}
									</div>
								</div>
							{/if}
						</div>

						<div class="flex flex-1 flex-col items-center justify-start overflow-hidden pt-2.5">
							<div
								class="relative"
								style="width: {is90or270
									? gridUnrotatedHeight * finalScale
									: gridUnrotatedWidth * finalScale}px; height: {is90or270
									? gridUnrotatedWidth * finalScale
									: gridUnrotatedHeight * finalScale}px;"
							>
								<div
									class="absolute top-1/2 left-1/2 box-border origin-center"
									style="width: {gridUnrotatedWidth}px; height: {gridUnrotatedHeight}px; transform: translate(-50%, -50%) rotate({-gridRotationAngle}deg) scale({finalScale});"
								>
									<ScheduleGrid
										{days}
										{slots}
										{blocks}
										{palette}
										{selectedId}
										{isExporting}
										{dayColumnWidth}
										{slotRowHeight}
										{isWallpaperMode}
										{gridLineColor}
										{timeBgColor}
										{dayHeaderBgColor}
										{cellBgColor}
										{fontSizeDay}
										{fontSizeTime}
										{fontSizeTitle}
										{fontSizeBadge}
										onSelectBlock={(id: string) => (selectedId = id)}
										onAddBlock={addBlock}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div
					class="box-border inline-block origin-center p-10 transition-transform duration-75 ease-out"
					bind:this={captureWrapEl}
					style="background: {bgColor}; transform: scale({previewZoom});"
				>
					<ScheduleGrid
						{days}
						{slots}
						{blocks}
						{palette}
						{selectedId}
						{isExporting}
						{dayColumnWidth}
						{slotRowHeight}
						{isWallpaperMode}
						{gridLineColor}
						{timeBgColor}
						{dayHeaderBgColor}
						{cellBgColor}
						{fontSizeDay}
						{fontSizeTime}
						{fontSizeTitle}
						{fontSizeBadge}
						onSelectBlock={(id: string) => (selectedId = id)}
						onAddBlock={addBlock}
					/>
				</div>
			{/if}
		</div>

		<!-- Floating View & Zoom Toolbar -->
		<div
			class="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#3f3f46] bg-[#18181b]/90 px-3.5 py-2 text-[#e4e4e7] shadow-2xl backdrop-blur-md"
		>
			<button
				type="button"
				class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#3f3f46] bg-[#27272a] text-sm font-bold text-white transition-colors hover:bg-[#3f3f46]"
				onclick={zoomOut}
				title="Zoom Out"
			>
				–
			</button>

			<button
				type="button"
				class="cursor-pointer rounded border-none bg-transparent px-2 py-1 font-mono text-xs font-semibold text-white transition-colors hover:bg-[#27272a]"
				onclick={resetPreviewView}
				title="Reset Zoom & Position"
			>
				{Math.round(previewZoom * 100)}%
			</button>

			<button
				type="button"
				class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#3f3f46] bg-[#27272a] text-sm font-bold text-white transition-colors hover:bg-[#3f3f46]"
				onclick={zoomIn}
				title="Zoom In"
			>
				+
			</button>

			<div class="mx-1 h-4 w-px bg-[#3f3f46]"></div>

			<button
				type="button"
				class="cursor-pointer rounded-full border border-[#3f3f46] bg-[#27272a] px-3 py-1 text-xs font-semibold text-[#a1a1aa] transition-colors hover:bg-[#3f3f46] hover:text-white"
				onclick={centerPreviewPosition}
				title="Center Canvas Position"
			>
				Center
			</button>

			<button
				type="button"
				class="cursor-pointer rounded-full border border-[#3f3f46] bg-[#27272a] px-3 py-1 text-xs font-semibold text-[#a1a1aa] transition-colors hover:bg-[#3f3f46] hover:text-white"
				onclick={resetPreviewView}
				title="Reset Pan & Zoom"
			>
				Reset
			</button>
		</div>
	</div>

	<RightDrawer
		{phonePresets}
		bind:width={rightDrawerWidth}
		bind:selectedPresetId
		bind:customPresetWidth
		bind:customPresetHeight
		bind:gridRotationAngle
		bind:customTopGapPercent
		bind:scaleMode
		bind:gridScaleModifier
		bind:slotRowHeight
		bind:dayColumnWidth
		bind:bgColor
		bind:gridLineColor
		bind:timeBgColor
		bind:dayHeaderBgColor
		bind:cellBgColor
		bind:fontSizeDay
		bind:fontSizeTime
		bind:fontSizeTitle
		bind:fontSizeBadge
		{currentPreset}
		{isWallpaperMode}
	/>

	<BlockEditorModal
		block={selectedBlock}
		{palette}
		onClose={() => (selectedId = null)}
		onDelete={removeBlock}
	/>

	<ConfigCodeModal
		isOpen={isCodeModalOpen}
		mode={codeModalMode}
		code={exportedCodeString}
		onClose={() => (isCodeModalOpen = false)}
		onImport={handleImportCode}
	/>
</div>
