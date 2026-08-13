<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { toPng } from 'html-to-image';
	import type { Day, Slot, PaletteColor, ClassBlock, PhonePreset } from '$lib/types';
	import { generateUid, compressConfigCode, decompressConfigCode } from '$lib/utils';
	import * as m from '$lib/paraglide/messages';
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import RightDrawer from '$lib/components/RightDrawer.svelte';
	import ScheduleGrid from '$lib/components/ScheduleGrid.svelte';
	import BlockEditorModal from '$lib/components/BlockEditorModal.svelte';
	import ConfigCodeModal from '$lib/components/ConfigCodeModal.svelte';

	const phonePresets: PhonePreset[] = [
		{ id: 'desktop', name: 'Desktop (1,920 × 1,080)', width: 1920, height: 1080, topGapRatio: 0, bottomGapPx: 0 },
		{ id: 'iphone', name: 'iPhone (1,206 × 2,622)', width: 1206, height: 2622, topGapRatio: 0.32, bottomGapPx: 80 },
		{ id: 'custom', name: 'Custom Size', width: 1920, height: 1080, topGapRatio: 0, bottomGapPx: 0 }
	];

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
				gridRotationAngle = 90;
				customTopGapPercent = 24;
			}
		}
	});
	let slotRowHeight = $state<number>(210);
	let dayColumnWidth = $state<number>(230);
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
		const preset = phonePresets.find((p) => p.id === selectedPresetId) || phonePresets[1];
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

	let blocks = $state<ClassBlock[]>([
		{
			id: generateUid(),
			dayId: 'day1',
			timeSlotId: 'slot1',
			title: 'Fundamentals of Digital Logic and Microcontrollers',
			time: '08:00–09:50',
			room: 'S7 A 402',
			section: '1',
			type: 'Lecture',
			colorId: 'c1',
			pattern: false
		},
		{
			id: generateUid(),
			dayId: 'day1',
			timeSlotId: 'slot2',
			title: 'Fundamentals of Digital Logic and Microcontrollers',
			time: '10:00–11:50',
			room: 'S7 A 202',
			section: '1',
			type: 'Lab',
			colorId: 'c1',
			pattern: true
		},
		{
			id: generateUid(),
			dayId: 'day1',
			timeSlotId: 'slot3',
			title: 'Introduction to Data Science',
			time: '13:00–14:50',
			room: 'C1 313',
			section: '1',
			type: 'Lecture',
			colorId: 'c6',
			pattern: false
		},
		{
			id: generateUid(),
			dayId: 'day1',
			timeSlotId: 'slot4',
			title: 'Introduction to Data Science',
			time: '15:00–16:50',
			room: 'S1 305',
			section: '1',
			type: 'Lab',
			colorId: 'c6',
			pattern: true
		},
		{
			id: generateUid(),
			dayId: 'day2',
			timeSlotId: 'slot1',
			title: 'Database Systems',
			time: '08:00–09:50',
			room: 'C1 313',
			section: '1',
			type: 'Lecture',
			colorId: 'c2',
			pattern: false
		},
		{
			id: generateUid(),
			dayId: 'day2',
			timeSlotId: 'slot2',
			title: 'Database Systems',
			time: '10:00–11:50',
			room: 'S1 206',
			section: '1',
			type: 'Lab',
			colorId: 'c2',
			pattern: true
		},
		{
			id: generateUid(),
			dayId: 'day2',
			timeSlotId: 'slot4',
			title: 'Data Communications and Networks',
			time: '15:00–16:50',
			room: 'S7 A 402',
			section: '2',
			type: 'Lecture',
			colorId: 'c3',
			pattern: false
		},
		{
			id: generateUid(),
			dayId: 'day3',
			timeSlotId: 'slot2',
			title: 'Data Communications and Networks',
			time: '10:00–11:50',
			room: 'S7 A 201',
			section: '2',
			type: 'Lab',
			colorId: 'c3',
			pattern: true
		},
		{
			id: generateUid(),
			dayId: 'day3',
			timeSlotId: 'slot4',
			title: 'Introduction to Digital Technology and Data Science',
			time: '15:00–16:50',
			room: 'S1 101',
			section: '6',
			type: 'Lab',
			colorId: 'c7',
			pattern: true
		},
		{
			id: generateUid(),
			dayId: 'day4',
			timeSlotId: 'slot1',
			title: 'Mathematics for Engineering 2',
			time: '08:00–09:50',
			room: 'C1 314',
			section: '1',
			type: 'Lecture',
			colorId: 'c4',
			pattern: false
		},
		{
			id: generateUid(),
			dayId: 'day4',
			timeSlotId: 'slot2',
			title: 'Mathematics for Engineering 2',
			time: '10:00–11:50',
			room: 'S1 206',
			section: '1',
			type: 'Lab',
			colorId: 'c4',
			pattern: true
		},
		{
			id: generateUid(),
			dayId: 'day5',
			timeSlotId: 'slot2',
			title: 'Engineering Programming',
			time: '10:00–11:50',
			room: 'C1 314',
			section: '2',
			type: 'Lecture',
			colorId: 'c5',
			pattern: false
		},
		{
			id: generateUid(),
			dayId: 'day5',
			timeSlotId: 'slot3',
			title: 'Engineering Programming',
			time: '13:00–14:50',
			room: 'S1 206',
			section: '2',
			type: 'Lab',
			colorId: 'c5',
			pattern: true
		}
	]);

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
		selectedId = null;
		isExporting = true;
		await tick();
		await document.fonts.ready;
		await new Promise((resolve) => setTimeout(resolve, 150));
		try {
			const dataUrl = await toPng(captureWrapEl, {
				backgroundColor: bgColor,
				pixelRatio: isWallpaperMode ? 1 : 2
			});
			const downloadLink = document.createElement('a');
			downloadLink.download = isWallpaperMode
				? `schedule-wallpaper-${currentPreset.id}.png`
				: 'schedule.png';
			downloadLink.href = dataUrl;
			downloadLink.click();
		} catch (error) {
			alert('Export failed: ' + (error as Error).message);
		} finally {
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
			const data = (await decompressConfigCode(codeString)) as any;
			if (!data) return false;

			if (Array.isArray(data.days)) days = data.days;
			if (Array.isArray(data.slots)) slots = data.slots;
			if (Array.isArray(data.palette)) palette = data.palette;
			if (Array.isArray(data.blocks)) blocks = data.blocks;

			const st = data.settings;
			if (st) {
				if (st.selectedPresetId) {
					selectedPresetId = st.selectedPresetId.startsWith('ip') ? 'iphone' : st.selectedPresetId;
				}
				if (typeof st.customPresetWidth === 'number') customPresetWidth = st.customPresetWidth;
				if (typeof st.customPresetHeight === 'number') customPresetHeight = st.customPresetHeight;
				if (typeof st.gridRotationAngle === 'number') gridRotationAngle = st.gridRotationAngle;
				if (typeof st.customTopGapPercent === 'number') customTopGapPercent = st.customTopGapPercent;
				if (st.scaleMode) scaleMode = st.scaleMode;
				if (typeof st.gridScaleModifier === 'number') gridScaleModifier = st.gridScaleModifier;
				if (typeof st.slotRowHeight === 'number') slotRowHeight = st.slotRowHeight;
				if (typeof st.dayColumnWidth === 'number') dayColumnWidth = st.dayColumnWidth;
				if (st.bgColor) bgColor = st.bgColor;
				if (st.gridLineColor) gridLineColor = st.gridLineColor;
				if (st.timeBgColor) timeBgColor = st.timeBgColor;
				if (st.dayHeaderBgColor) dayHeaderBgColor = st.dayHeaderBgColor;
				if (st.cellBgColor) cellBgColor = st.cellBgColor;
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
		class="flex-1 relative overflow-hidden flex flex-col bg-[#121214] select-none"
		onwheel={handleCanvasWheel}
		onpointerdown={handleCanvasPointerDown}
	>
		<div
			class="w-full h-full flex items-center justify-center p-10 box-border"
			style="cursor: {isCanvasPanning ? 'grabbing' : 'grab'}; transform: translate({previewPanX}px, {previewPanY}px);"
		>
			{#if isWallpaperMode}
				<div
					class="shrink-0 relative transition-transform duration-75 ease-out"
					style="width: {currentPreset.width * 0.35 * previewZoom}px; height: {currentPreset.height * 0.35 * previewZoom}px;"
				>
					<div
						class="p-0 flex flex-col overflow-hidden rounded-[48px] shadow-none origin-top-left transition-transform duration-75 ease-out"
						bind:this={captureWrapEl}
						style="width: {currentPreset.width}px; height: {currentPreset.height}px; background: {bgColor}; transform: scale({0.35 * previewZoom});"
					>
						<div
							class="flex items-center justify-center box-border relative"
							style="height: {currentPreset.height * (customTopGapPercent / 100)}px;"
						>
							{#if !isExporting && customTopGapPercent > 0}
								<div
									class="border-2 border-dashed border-black/15 rounded-[20px] px-10 py-4 text-center text-black/35 font-[Space_Grotesk,sans-serif]"
								>
									<div class="text-[64px] font-bold leading-none">12:08</div>
									<div class="text-sm mt-1.5 font-[JetBrains_Mono,monospace]">
										{m.clock_space_guide()}
									</div>
								</div>
							{/if}
						</div>

						<div class="flex-1 flex flex-col items-center justify-start pt-2.5 overflow-hidden">
							<div
								class="relative"
								style="width: {is90or270 ? gridUnrotatedHeight * finalScale : gridUnrotatedWidth * finalScale}px; height: {is90or270 ? gridUnrotatedWidth * finalScale : gridUnrotatedHeight * finalScale}px;"
							>
								<div
									class="absolute top-1/2 left-1/2 origin-center box-border"
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
										onSelectBlock={(id) => (selectedId = id)}
										onAddBlock={addBlock}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div
					class="p-10 inline-block box-border origin-center transition-transform duration-75 ease-out"
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
						onSelectBlock={(id) => (selectedId = id)}
						onAddBlock={addBlock}
					/>
				</div>
			{/if}
		</div>

		<!-- Floating View & Zoom Toolbar -->
		<div
			class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#18181b]/90 backdrop-blur-md border border-[#3f3f46] text-[#e4e4e7] px-3.5 py-2 rounded-full shadow-2xl flex items-center gap-2 z-30"
		>
			<button
				type="button"
				class="bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-full w-7 h-7 flex items-center justify-center border border-[#3f3f46] cursor-pointer text-sm font-bold transition-colors"
				onclick={zoomOut}
				title="Zoom Out"
			>
				–
			</button>

			<button
				type="button"
				class="bg-transparent hover:bg-[#27272a] text-white px-2 py-1 rounded text-xs font-mono font-semibold cursor-pointer border-none transition-colors"
				onclick={resetPreviewView}
				title="Reset Zoom & Position"
			>
				{Math.round(previewZoom * 100)}%
			</button>

			<button
				type="button"
				class="bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-full w-7 h-7 flex items-center justify-center border border-[#3f3f46] cursor-pointer text-sm font-bold transition-colors"
				onclick={zoomIn}
				title="Zoom In"
			>
				+
			</button>

			<div class="w-px h-4 bg-[#3f3f46] mx-1"></div>

			<button
				type="button"
				class="bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border border-[#3f3f46] transition-colors"
				onclick={centerPreviewPosition}
				title="Center Canvas Position"
			>
				Center
			</button>

			<button
				type="button"
				class="bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border border-[#3f3f46] transition-colors"
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
