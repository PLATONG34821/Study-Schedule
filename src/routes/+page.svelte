<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { toPng } from 'html-to-image';
	import type { Day, Slot, PaletteColor, ClassBlock } from '$lib/types';
	import { generateUid, compressConfigCode, decompressConfigCode, textColorFor } from '$lib/utils';
	import { phonePresets } from '$lib/constants';
	import * as m from '$lib/paraglide/messages';
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import RightDrawer from '$lib/components/RightDrawer.svelte';
	import ScheduleGrid from '$lib/components/ScheduleGrid.svelte';
	import BlockEditorModal from '$lib/components/BlockEditorModal.svelte';
	import ExportModal from '$lib/components/ExportModal.svelte';
	import ImportModal from '$lib/components/ImportModal.svelte';
	import ToastContainer, { type ToastItem } from '$lib/components/ToastContainer.svelte';

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
			const prevPreset = phonePresets.find((p) => p.id === lastPresetId);
			lastPresetId = selectedPresetId;

			if (selectedPresetId === 'custom' && prevPreset) {
				customPresetWidth = prevPreset.width;
				customPresetHeight = prevPreset.height;
			} else if (selectedPresetId === 'desktop') {
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
	let gridBorderRadius = $state<number>(16);
	let leftSidebarWidth = $state<number>(320);
	let rightDrawerWidth = $state<number>(320);
	let isLeftSidebarOpen = $state<boolean>(false);
	let isRightDrawerOpen = $state<boolean>(false);
	let exportPixelRatio = $state<1 | 2 | 4>(2);
	let toasts = $state<ToastItem[]>([]);

	const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
		const id = generateUid();
		toasts.push({ id, message, type });
		setTimeout(() => {
			dismissToast(id);
		}, 3500);
	};

	const dismissToast = (id: string) => {
		toasts = toasts.filter((t) => t.id !== id);
	};

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

		const container = e.currentTarget as HTMLElement;
		const initialX = e.clientX;
		const initialY = e.clientY;
		const initialPanX = previewPanX;
		const initialPanY = previewPanY;
		let hasCaptured = false;

		const handlePointerMove = (moveEvent: PointerEvent) => {
			const deltaX = moveEvent.clientX - initialX;
			const deltaY = moveEvent.clientY - initialY;
			const distance = Math.hypot(deltaX, deltaY);

			if (!hasCaptured && distance > 4) {
				hasCaptured = true;
				isCanvasPanning = true;
				try {
					container.setPointerCapture(e.pointerId);
				} catch {
					// pointer capture fallback
				}
			}

			if (isCanvasPanning) {
				previewPanX = initialPanX + deltaX;
				previewPanY = initialPanY + deltaY;
			}
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
	let safeScale = $derived(isWallpaperMode ? Math.max(finalScale, 0.05) : 1);
	let effectiveFontSizeDay = $derived(Math.round(fontSizeDay / safeScale));
	let effectiveFontSizeTime = $derived(Math.round(fontSizeTime / safeScale));
	let effectiveFontSizeTitle = $derived(Math.round(fontSizeTitle / safeScale));
	let effectiveFontSizeBadge = $derived(Math.round(fontSizeBadge / safeScale));

	let isDarkBg = $derived(textColorFor(bgColor) === '#ffffff');
	let clockGuideTextColor = $derived(isDarkBg ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.35)');
	let clockGuideBorderColor = $derived(isDarkBg ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)');

	let blocks = $state<ClassBlock[]>([]);

	let selectedBlock = $derived(blocks.find((b) => b.id === selectedId) || null);

	interface ScheduleSnapshot {
		days: Day[];
		slots: Slot[];
		palette: PaletteColor[];
		blocks: ClassBlock[];
	}

	let historyStack = $state<ScheduleSnapshot[]>([]);
	let historyIndex = $state<number>(-1);

	const createSnapshot = (): ScheduleSnapshot => ({
		days: JSON.parse(JSON.stringify(days)),
		slots: JSON.parse(JSON.stringify(slots)),
		palette: JSON.parse(JSON.stringify(palette)),
		blocks: JSON.parse(JSON.stringify(blocks))
	});

	const pushHistoryState = () => {
		const snapshot = createSnapshot();
		if (historyIndex >= 0 && historyIndex < historyStack.length) {
			if (JSON.stringify(historyStack[historyIndex]) === JSON.stringify(snapshot)) {
				return;
			}
		}
		const newStack = historyStack.slice(0, historyIndex + 1);
		newStack.push(snapshot);
		if (newStack.length > 50) {
			newStack.shift();
		}
		historyStack = newStack;
		historyIndex = newStack.length - 1;
	};

	let canUndo = $derived(historyIndex > 0);
	let canRedo = $derived(historyIndex >= 0 && historyIndex < historyStack.length - 1);

	const undoState = () => {
		if (!canUndo) return;
		historyIndex -= 1;
		const target = historyStack[historyIndex];
		days = JSON.parse(JSON.stringify(target.days));
		slots = JSON.parse(JSON.stringify(target.slots));
		palette = JSON.parse(JSON.stringify(target.palette));
		blocks = JSON.parse(JSON.stringify(target.blocks));
		addToast(m.undone(), 'info');
	};

	const redoState = () => {
		if (!canRedo) return;
		historyIndex += 1;
		const target = historyStack[historyIndex];
		days = JSON.parse(JSON.stringify(target.days));
		slots = JSON.parse(JSON.stringify(target.slots));
		palette = JSON.parse(JSON.stringify(target.palette));
		blocks = JSON.parse(JSON.stringify(target.blocks));
		addToast(m.redone(), 'info');
	};

	onMount(() => {
		pushHistoryState();
	});

	const handleKeyDown = (e: KeyboardEvent) => {
		const target = e.target as HTMLElement | null;
		if (
			target &&
			(target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.tagName === 'SELECT' ||
				target.isContentEditable)
		) {
			return;
		}

		const isCmdOrCtrl = e.metaKey || e.ctrlKey;
		if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
			if (e.shiftKey) {
				e.preventDefault();
				redoState();
			} else {
				e.preventDefault();
				undoState();
			}
		} else if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
			e.preventDefault();
			redoState();
		}
	};

	const addDay = () => {
		days.push({ id: generateUid(), name: m.new_day() });
		pushHistoryState();
	};

	const removeDay = (dayId: string) => {
		days = days.filter((d) => d.id !== dayId);
		blocks = blocks.filter((b) => b.dayId !== dayId);
		pushHistoryState();
	};

	const addSlot = () => {
		slots.push({ id: generateUid(), label: '17:00' });
		pushHistoryState();
	};

	const removeSlot = (slotId: string) => {
		slots = slots.filter((s) => s.id !== slotId);
		blocks = blocks.filter((b) => b.timeSlotId !== slotId);
		pushHistoryState();
	};

	const defaultPaletteColors = [
		'#55E6A5',
		'#FF764A',
		'#38BDF8',
		'#A855F7',
		'#FACC15',
		'#EC4899',
		'#26D0CE',
		'#F43F5E',
		'#10B981',
		'#8B5CF6'
	];

	const addColor = () => {
		const nextColor =
			defaultPaletteColors.find(
				(c) => !palette.some((p) => p.color.toLowerCase() === c.toLowerCase())
			) || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
		palette.push({ id: generateUid(), color: nextColor });
		pushHistoryState();
	};

	const removeColor = (colorId: string) => {
		palette = palette.filter((c) => c.id !== colorId);
		blocks.forEach((b) => {
			if (b.colorId === colorId) b.colorId = null;
		});
		pushHistoryState();
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
		pushHistoryState();
	};

	const removeBlock = (blockId: string) => {
		blocks = blocks.filter((b) => b.id !== blockId);
		if (selectedId === blockId) selectedId = null;
		pushHistoryState();
	};

	const updateBlock = (updatedBlock: ClassBlock) => {
		blocks = blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
		selectedId = null;
		pushHistoryState();
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
				pixelRatio: exportPixelRatio
			});
			const downloadLink = document.createElement('a');
			downloadLink.download = `schedule-wallpaper-${currentPreset.id}.png`;
			downloadLink.href = dataUrl;
			downloadLink.click();
			addToast(`Exported PNG at ${exportPixelRatio}x resolution!`, 'success');
		} catch (error) {
			addToast('Export failed: ' + (error as Error).message, 'error');
		} finally {
			previewZoom = previousZoom;
			previewPanX = previousPanX;
			previewPanY = previousPanY;
			isExporting = false;
			selectedId = previousSelected;
		}
	};

	let linkCopied = $state(false);
	let isExportModalOpen = $state(false);
	let isImportModalOpen = $state(false);
	let exportModalInitialTab = $state<'image' | 'share' | 'code'>('image');
	let currentShareUrl = $state('');
	let exportedCodeString = $state('');
	let isInitialLoaded = $state(false);

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
			gridBorderRadius,
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

	const applyConfigData = (data: Record<string, unknown>) => {
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
			if (typeof st.gridBorderRadius === 'number') gridBorderRadius = st.gridBorderRadius;
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
		pushHistoryState();
	};

	$effect(() => {
		// Watch state for continuous URL hash sync
		days; slots; palette; blocks; selectedPresetId; customPresetWidth; customPresetHeight;
		gridRotationAngle; customTopGapPercent; scaleMode; gridScaleModifier; slotRowHeight;
		dayColumnWidth; gridBorderRadius; bgColor; gridLineColor; timeBgColor; dayHeaderBgColor; cellBgColor;
		fontSizeDay; fontSizeTime; fontSizeTitle; fontSizeBadge;

		if (isInitialLoaded && typeof window !== 'undefined') {
			compressConfigCode(getFullConfigObj()).then((code) => {
				if (code) {
					history.replaceState(null, '', `${window.location.pathname}${window.location.search}#s=${code}`);
				}
			});
		}
	});

	const openExportModal = async (tab: 'image' | 'share' | 'code' = 'image') => {
		exportedCodeString = await compressConfigCode(getFullConfigObj());
		currentShareUrl = `${window.location.origin}${window.location.pathname}#s=${exportedCodeString}`;
		exportModalInitialTab = tab;
		isExportModalOpen = true;
	};

	const openImportCode = () => {
		isImportModalOpen = true;
	};

	const handleImportCode = async (codeString: string): Promise<boolean> => {
		try {
			const data = (await decompressConfigCode(codeString)) as Record<string, unknown> | null;
			if (!data) return false;

			applyConfigData(data);
			addToast('Schedule imported successfully!', 'success');
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
			addToast('Schedule share link copied to clipboard!', 'success');
			setTimeout(() => {
				linkCopied = false;
			}, 2500);
		} catch {
			prompt('Copy schedule link:', shareUrl);
		}
	};

	onMount(() => {
		const initData = async () => {
			if (typeof window !== 'undefined') {
				try {
					localStorage.removeItem('study_schedule_autosave');
				} catch {}
			}

			const hash = window.location.hash;
			if (hash && hash.includes('s=')) {
				const code = hash.split('s=')[1];
				if (code) {
					await handleImportCode(code);
				}
			}

			isInitialLoaded = true;
		};

		initData();
	});
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="relative flex h-screen w-screen flex-col overflow-hidden lg:flex-row">
	{#if isLeftSidebarOpen}
		<button
			type="button"
			class="fixed inset-0 z-30 cursor-default border-none bg-black/60 p-0 backdrop-blur-sm lg:hidden"
			onclick={() => (isLeftSidebarOpen = false)}
			aria-label="Close sidebar"
		></button>
	{/if}

	{#if isRightDrawerOpen}
		<button
			type="button"
			class="fixed inset-0 z-30 cursor-default border-none bg-black/60 p-0 backdrop-blur-sm lg:hidden"
			onclick={() => (isRightDrawerOpen = false)}
			aria-label="Close drawer"
		></button>
	{/if}

	<LeftSidebar
		isOpen={isLeftSidebarOpen}
		onClose={() => (isLeftSidebarOpen = false)}
		bind:width={leftSidebarWidth}
		bind:days
		bind:slots
		bind:palette
		onOpenExportModal={() => openExportModal('image')}
		onOpenImportCode={openImportCode}
		onAddDay={addDay}
		onRemoveDay={removeDay}
		onAddSlot={addSlot}
		onRemoveSlot={removeSlot}
		onAddColor={addColor}
		onRemoveColor={removeColor}
		onFieldChange={pushHistoryState}
	/>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="relative flex flex-1 flex-col overflow-hidden bg-[#121214] select-none"
		onwheel={handleCanvasWheel}
		onpointerdown={handleCanvasPointerDown}
	>
		<!-- Mobile Header Toolbar -->
		<div
			class="z-20 flex items-center justify-between border-b border-[#27272a] bg-[#18181b] px-4 py-2.5 text-white lg:hidden"
		>
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f3f46]"
					onclick={() => {
						isLeftSidebarOpen = !isLeftSidebarOpen;
						if (isLeftSidebarOpen) isRightDrawerOpen = false;
					}}
				>
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line
							x1="3"
							y1="18"
							x2="21"
							y2="18"
						/></svg
					>
					{m.app_title()}
				</button>
			</div>

			<button
				type="button"
				class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f3f46]"
				onclick={() => {
					isRightDrawerOpen = !isRightDrawerOpen;
					if (isRightDrawerOpen) isLeftSidebarOpen = false;
				}}
			>
				<svg
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					><circle cx="12" cy="12" r="3" /><path
						d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
					/></svg
				>
				{m.display_settings()}
			</button>
		</div>

		<!-- Top-Left Floating Undo/Redo Toolbar -->
		<div
			class="absolute top-16 left-4 z-30 flex items-center gap-1 rounded-full border border-[#3f3f46] bg-[#18181b]/90 p-1.5 shadow-2xl backdrop-blur-md lg:top-4"
		>
			<button
				type="button"
				class="flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-[#27272a] text-white transition-colors hover:bg-[#3f3f46] disabled:cursor-not-allowed disabled:opacity-40"
				onclick={undoState}
				disabled={!canUndo}
				aria-label={m.undo()}
				title="{m.undo()} (Ctrl+Z / ⌘Z)"
			>
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path d="M3 7v6h6" />
					<path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
				</svg>
			</button>
			<button
				type="button"
				class="flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-[#27272a] text-white transition-colors hover:bg-[#3f3f46] disabled:cursor-not-allowed disabled:opacity-40"
				onclick={redoState}
				disabled={!canRedo}
				aria-label={m.redo()}
				title="{m.redo()} (Ctrl+Y / ⌘⇧Z)"
			>
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path d="M21 7v6h-6" />
					<path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
				</svg>
			</button>
		</div>
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
									class="rounded-[20px] border-2 border-dashed px-10 py-4 text-center font-[Space_Grotesk,sans-serif]"
									style="color: {clockGuideTextColor}; border-color: {clockGuideBorderColor};"
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
										fontSizeDay={effectiveFontSizeDay}
										fontSizeTime={effectiveFontSizeTime}
										fontSizeTitle={effectiveFontSizeTitle}
										fontSizeBadge={effectiveFontSizeBadge}
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
						{gridBorderRadius}
						{gridLineColor}
						{timeBgColor}
						{dayHeaderBgColor}
						{cellBgColor}
						fontSizeDay={effectiveFontSizeDay}
						fontSizeTime={effectiveFontSizeTime}
						fontSizeTitle={effectiveFontSizeTitle}
						fontSizeBadge={effectiveFontSizeBadge}
						onSelectBlock={(id: string) => (selectedId = id)}
						onAddBlock={addBlock}
					/>
				</div>
			{/if}
		</div>

		<!-- Floating View & Zoom Toolbar -->
		<div
			class="absolute bottom-6 left-1/2 z-30 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 overflow-x-auto rounded-full border border-[#3f3f46] bg-[#18181b]/90 px-3.5 py-2 text-[#e4e4e7] shadow-2xl backdrop-blur-md"
		>
			<button
				type="button"
				class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#3f3f46] bg-[#27272a] text-white transition-colors hover:bg-[#3f3f46]"
				onclick={zoomOut}
				aria-label="Zoom Out"
				title="Zoom Out"
			>
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
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
				class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#3f3f46] bg-[#27272a] text-white transition-colors hover:bg-[#3f3f46]"
				onclick={zoomIn}
				aria-label="Zoom In"
				title="Zoom In"
			>
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
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
		isOpen={isRightDrawerOpen}
		onClose={() => (isRightDrawerOpen = false)}
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
		bind:gridBorderRadius
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
		onSave={updateBlock}
		onDelete={removeBlock}
	/>

	<ExportModal
		isOpen={isExportModalOpen}
		initialTab={exportModalInitialTab}
		{isExporting}
		bind:exportPixelRatio
		code={exportedCodeString}
		shareUrl={currentShareUrl}
		{linkCopied}
		onClose={() => (isExportModalOpen = false)}
		onExportImage={exportPng}
		onShareLink={shareLink}
	/>

	<ImportModal
		isOpen={isImportModalOpen}
		onClose={() => (isImportModalOpen = false)}
		onImport={handleImportCode}
	/>

	<ToastContainer {toasts} onDismiss={dismissToast} />
</div>
