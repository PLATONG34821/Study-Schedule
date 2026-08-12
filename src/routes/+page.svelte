<script lang="ts">
	import { tick } from 'svelte';
	import { toPng } from 'html-to-image';
	import type { Day, Slot, PaletteColor, ClassBlock, PhonePreset } from '$lib/types';
	import { generateUid } from '$lib/utils';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ScheduleGrid from '$lib/components/ScheduleGrid.svelte';

	const phonePresets: PhonePreset[] = [
		{ id: 'none', name: 'Original Grid (พอดีตาราง)', width: 0, height: 0, topGapRatio: 0, bottomGapPx: 0 },
		{ id: 'ip7', name: 'iPhone 7 / 8 / SE (4.7")', width: 750, height: 1334, topGapRatio: 0.28, bottomGapPx: 60 },
		{ id: 'ip7p', name: 'iPhone 7+ / 8+ (5.5")', width: 1242, height: 2208, topGapRatio: 0.28, bottomGapPx: 60 },
		{ id: 'ipX', name: 'iPhone X / XS / 11 Pro / 12 mini (5.8"/5.4")', width: 1125, height: 2436, topGapRatio: 0.30, bottomGapPx: 80 },
		{ id: 'ipXR', name: 'iPhone 11 / XR (6.1")', width: 828, height: 1792, topGapRatio: 0.30, bottomGapPx: 80 },
		{ id: 'ipXSMax', name: 'iPhone 11 Pro Max / XS Max (6.5")', width: 1242, height: 2688, topGapRatio: 0.30, bottomGapPx: 80 },
		{ id: 'ip12', name: 'iPhone 12 / 13 / 14 (6.1")', width: 1170, height: 2532, topGapRatio: 0.30, bottomGapPx: 80 },
		{ id: 'ip12PM', name: 'iPhone 12 Pro Max / 13 Pro Max / 14 Plus (6.7")', width: 1284, height: 2778, topGapRatio: 0.30, bottomGapPx: 80 },
		{ id: 'ip14Pro', name: 'iPhone 14 Pro / 15 / 16 / 16 Pro (6.1"-6.3")', width: 1179, height: 2556, topGapRatio: 0.32, bottomGapPx: 80 },
		{ id: 'ip14PM', name: 'iPhone 14 Pro Max / 15 Pro Max / 16 Pro Max (6.7"-6.9")', width: 1290, height: 2796, topGapRatio: 0.32, bottomGapPx: 80 }
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
	let isExporting = $state(false);
	let captureWrapEl = $state<HTMLDivElement | null>(null);

	let selectedPresetId = $state<string>('ip14Pro');
	let gridRotationAngle = $state<number>(90);
	let is90or270 = $derived(gridRotationAngle === 90 || gridRotationAngle === 270);
	let customTopGapPercent = $state<number>(24);
	let scaleMode = $state<'fillWidth' | 'fitBoth'>('fitBoth');
	let gridScaleModifier = $state<number>(1.0);
	let slotRowHeight = $state<number>(210);
	let dayColumnWidth = $state<number>(230);

	let currentPreset = $derived(phonePresets.find((p) => p.id === selectedPresetId) || phonePresets[0]);
	let isWallpaperMode = $derived(selectedPresetId !== 'none');

	let gridUnrotatedWidth = $derived(110 + days.length * dayColumnWidth);
	let gridUnrotatedHeight = $derived(70 + slots.length * slotRowHeight);

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
		days.push({ id: generateUid(), name: 'New Day' });
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
		const newBlock: ClassBlock = {
			id: generateUid(),
			dayId,
			timeSlotId,
			title: 'New Subject',
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
</script>

<div class="layoutContainer">
	<Sidebar
		{phonePresets}
		bind:selectedPresetId
		bind:gridRotationAngle
		bind:customTopGapPercent
		bind:scaleMode
		bind:gridScaleModifier
		bind:slotRowHeight
		bind:dayColumnWidth
		bind:bgColor
		bind:days
		bind:slots
		bind:palette
		{selectedBlock}
		{currentPreset}
		{isWallpaperMode}
		onExport={exportPng}
		onAddDay={addDay}
		onRemoveDay={removeDay}
		onAddSlot={addSlot}
		onRemoveSlot={removeSlot}
		onAddColor={addColor}
		onRemoveColor={removeColor}
		onRemoveBlock={removeBlock}
		onCloseEditor={() => (selectedId = null)}
	/>

	<div class="canvasArea">
		{#if isWallpaperMode}
			<div class="wallpaperOuterWrap">
				<div
					class="captureWrap phoneMode"
					bind:this={captureWrapEl}
					style="width: {currentPreset.width}px; height: {currentPreset.height}px; background: {bgColor};"
				>
					<div
						class="lockscreenTopGap"
						style="height: {currentPreset.height * (customTopGapPercent / 100)}px;"
					>
						{#if !isExporting}
							<div class="clockGuideOverlay">
								<div class="clockGuideTime">12:08</div>
								<div class="clockGuideSub">พื้นที่เว้นให้ Lock Screen Clock</div>
							</div>
						{/if}
					</div>

					<div class="lockscreenCenterSpace">
						<div
							class="gridTransformWrap"
							style="width: {is90or270 ? gridUnrotatedHeight * finalScale : gridUnrotatedWidth * finalScale}px; height: {is90or270 ? gridUnrotatedWidth * finalScale : gridUnrotatedHeight * finalScale}px;"
						>
							<div
								class="scheduleGridInner"
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
									onSelectBlock={(id) => (selectedId = id)}
									onAddBlock={addBlock}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="captureWrap" bind:this={captureWrapEl} style="background: {bgColor};">
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
					onSelectBlock={(id) => (selectedId = id)}
					onAddBlock={addBlock}
				/>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: #f4f4f5;
		font-family: 'Space Grotesk', sans-serif;
		color: #111111;
		height: 100vh;
		overflow: hidden;
	}

	.layoutContainer {
		display: flex;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}

	.canvasArea {
		flex: 1;
		overflow: auto;
		padding: 40px;
		display: flex;
		justify-content: center;
		align-items: flex-start;
	}

	.wallpaperOuterWrap {
		width: fit-content;
		height: fit-content;
		transform-origin: top center;
		transform: scale(0.35);
		margin-bottom: -1500px;
	}

	.captureWrap {
		padding: 40px;
		display: inline-block;
		box-sizing: border-box;
	}

	.captureWrap.phoneMode {
		padding: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: 48px;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
	}

	.lockscreenTopGap {
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		position: relative;
	}

	.clockGuideOverlay {
		border: 2px dashed rgba(0, 0, 0, 0.15);
		border-radius: 20px;
		padding: 16px 40px;
		text-align: center;
		color: rgba(0, 0, 0, 0.35);
		font-family: 'Space Grotesk', sans-serif;
	}

	.clockGuideTime {
		font-size: 64px;
		font-weight: 700;
		line-height: 1;
	}

	.clockGuideSub {
		font-size: 14px;
		margin-top: 6px;
		font-family: 'JetBrains Mono', monospace;
	}

	.lockscreenCenterSpace {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding-top: 10px;
		overflow: hidden;
	}

	.gridTransformWrap {
		position: relative;
	}

	.scheduleGridInner {
		position: absolute;
		top: 50%;
		left: 50%;
		transform-origin: center center;
		box-sizing: border-box;
	}
</style>
