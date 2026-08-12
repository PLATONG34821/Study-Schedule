<script lang="ts">
	import { tick } from 'svelte';
	import { toPng } from 'html-to-image';

	interface Day {
		id: string;
		name: string;
	}

	interface Slot {
		id: string;
		label: string;
	}

	interface PaletteColor {
		id: string;
		color: string;
	}

	interface ClassBlock {
		id: string;
		dayId: string;
		timeSlotId: string;
		title: string;
		time: string;
		room: string;
		section: string;
		type: string;
		colorId: string | null;
		pattern: boolean;
	}

	interface PhonePreset {
		id: string;
		name: string;
		width: number;
		height: number;
		topGapRatio: number;
		bottomGapPx: number;
	}

	const generateUid = (): string => Math.random().toString(36).slice(2, 10);

	const defaultPalette: PaletteColor[] = [
		{ id: 'c1', color: '#3DDC97' },
		{ id: 'c2', color: '#FF8A3D' },
		{ id: 'c3', color: '#3DA5FF' },
		{ id: 'c4', color: '#B85CFF' },
		{ id: 'c5', color: '#FFD93D' },
		{ id: 'c6', color: '#FF4D8D' },
		{ id: 'c7', color: '#26D0CE' }
	];

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

	let palette = $state<PaletteColor[]>(defaultPalette.map((c) => ({ ...c })));
	let bgColor = $state('#ffffff');
	let selectedId = $state<string | null>(null);
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

	const hexToRgb = (hex: string) => {
		const cleanHex = hex.replace('#', '');
		const fullHex =
			cleanHex.length === 3
				? cleanHex
						.split('')
						.map((c) => c + c)
						.join('')
				: cleanHex;
		const bigInt = parseInt(fullHex, 16);
		return { r: (bigInt >> 16) & 255, g: (bigInt >> 8) & 255, b: bigInt & 255 };
	};

	const luminance = (hex: string) => {
		const { r, g, b } = hexToRgb(hex);
		const rgbArray = [r, g, b].map((val) => {
			val /= 255;
			return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * rgbArray[0] + 0.7152 * rgbArray[1] + 0.0722 * rgbArray[2];
	};

	const textColorFor = (hex: string) => (luminance(hex) > 0.55 ? '#111111' : '#ffffff');

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

<div class="appWrap">
	<div class="sidebarPanel">
		<div class="sbTitle">Schedule Editor</div>
		<div class="sbSub">แก้ไขได้ทุกอย่าง — คลิกกล่องวิชาเพื่อแก้ไข</div>

		<button class="exportBtn" onclick={exportPng} disabled={isExporting}>
			⬇ Export as PNG
		</button>

		<div class="sectionLabel">ขนาด / วอลเปเปอร์ (Preset)</div>
		<select class="edInput" bind:value={selectedPresetId}>
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
				<button class="miniBtn" onclick={() => removeDay(day.id)}>✕</button>
			</div>
		{/each}
		<button class="addBtn" onclick={addDay}>+ เพิ่มวัน</button>

		<div class="sectionLabel slotLabelMargin">แถว / เวลา (Rows)</div>
		{#each slots as slot (slot.id)}
			<div class="rowEdit">
				<input class="monoInput" type="text" bind:value={slot.label} />
				<button class="miniBtn" onclick={() => removeSlot(slot.id)}>✕</button>
			</div>
		{/each}
		<button class="addBtn" onclick={addSlot}>+ เพิ่มแถว</button>

		<div class="sectionLabel palLabelMargin">สีวิชา (Subject Colors)</div>
		<div class="paletteGrid">
			{#each palette as item (item.id)}
				<div class="swatchWrap">
					<input type="color" bind:value={item.color} />
					<button class="swatchDel" onclick={() => removeColor(item.id)}>✕</button>
				</div>
			{/each}
		</div>
		<button class="addBtn" onclick={addColor}>+ เพิ่มสี</button>

		{#if selectedBlock}
			<div class="editorPanel">
				<div class="sectionLabel">แก้ไขวิชาที่เลือก</div>

				<label class="edLabel" for="blockTitleInput">ชื่อวิชา (Title)</label>
				<input id="blockTitleInput" class="edInput" type="text" bind:value={selectedBlock.title} />

				<label class="edLabel" for="blockTimeInput">เวลา (Time)</label>
				<input
					id="blockTimeInput"
					class="edInput"
					type="text"
					bind:value={selectedBlock.time}
					placeholder="08:00–09:50"
				/>

				<label class="edLabel" for="blockRoomInput">ห้อง (Room)</label>
				<input
					id="blockRoomInput"
					class="edInput"
					type="text"
					bind:value={selectedBlock.room}
					placeholder="S1 206"
				/>

				<label class="edLabel" for="blockSectionInput">Section</label>
				<input
					id="blockSectionInput"
					class="edInput"
					type="text"
					bind:value={selectedBlock.section}
					placeholder="1"
				/>

				<label class="edLabel" for="blockTypeInput">ประเภท (Type badge)</label>
				<input
					id="blockTypeInput"
					class="edInput"
					type="text"
					bind:value={selectedBlock.type}
					placeholder="Lecture / Lab"
				/>

				<span class="edLabel">สี (Color)</span>
				<div class="colorPickGrid">
					{#each palette as colorOption (colorOption.id)}
						<button
							type="button"
							class="colorPick {selectedBlock.colorId === colorOption.id ? 'active' : ''}"
							style="background: {colorOption.color};"
							onclick={() => {
								if (selectedBlock) selectedBlock.colorId = colorOption.id;
							}}
							aria-label="Color option"
						></button>
					{/each}
				</div>

				<label class="checkboxRow">
					<input type="checkbox" bind:checked={selectedBlock.pattern} />
					<span>มีลาย (Diagonal stripe pattern)</span>
				</label>

				<div class="edBtnRow">
					<button class="edBtnDelete" onclick={() => removeBlock(selectedBlock!.id)}
						>ลบวิชานี้</button
					>
					<button class="edBtnClose" onclick={() => (selectedId = null)}>ปิด</button>
				</div>
			</div>
		{/if}
	</div>

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
								<div
									class="scheduleGrid"
									style="grid-template-columns: 110px repeat({days.length}, {dayColumnWidth}px); grid-template-rows: 70px repeat({slots.length}, 210px);"
								>
									<div class="cornerCell"></div>

									{#each days as day (day.id)}
										<div class="dayHeader">{day.name}</div>
									{/each}

									{#each slots as slot (slot.id)}
										<div class="timeCell">{slot.label}</div>
										{#each days as day (day.id)}
											{@const cellBlocks = blocks.filter(
												(b) => b.dayId === day.id && b.timeSlotId === slot.id
											)}
											<div class="dayCell">
												{#each cellBlocks as block (block.id)}
													{@const colorObj = palette.find((c) => c.id === block.colorId)}
													{@const colorVal = colorObj ? colorObj.color : '#dddddd'}
													{@const textVal = textColorFor(colorVal)}
													<button
														type="button"
														class="classBlock {selectedId === block.id ? 'selected' : ''}"
														style="background: {colorVal}; color: {textVal};"
														onclick={() => (selectedId = block.id)}
													>
														{#if block.pattern}
															<div class="cbStripe"></div>
														{/if}
														<div class="cbContent">
															<div class="cbTitle">{block.title}</div>
															<div class="cbTags">
																{#if block.time}<span class="cbPill">{block.time}</span>{/if}
																{#if block.room}<span class="cbPill">{block.room}</span>{/if}
															</div>
															<div class="cbTags">
																{#if block.section}<span class="cbRectWhite"
																		>Sec {block.section}</span
																	>{/if}
																{#if block.type}<span class="cbRectBlack">{block.type}</span>{/if}
															</div>
														</div>
													</button>
												{/each}

												{#if !isExporting}
													<button
														type="button"
														class="addBlockBtn"
														onclick={() => addBlock(day.id, slot.id)}>+ เพิ่มวิชา</button
													>
												{/if}
											</div>
										{/each}
									{/each}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="captureWrap" bind:this={captureWrapEl} style="background: {bgColor};">
				<div
					class="scheduleGrid"
					style="grid-template-columns: 110px repeat({days.length}, {dayColumnWidth}px); grid-template-rows: 70px repeat({slots.length}, minmax(150px, auto));"
				>
					<div class="cornerCell"></div>

					{#each days as day (day.id)}
						<div class="dayHeader">{day.name}</div>
					{/each}

					{#each slots as slot (slot.id)}
						<div class="timeCell">{slot.label}</div>
						{#each days as day (day.id)}
							{@const cellBlocks = blocks.filter(
								(b) => b.dayId === day.id && b.timeSlotId === slot.id
							)}
							<div class="dayCell">
								{#each cellBlocks as block (block.id)}
									{@const colorObj = palette.find((c) => c.id === block.colorId)}
									{@const colorVal = colorObj ? colorObj.color : '#dddddd'}
									{@const textVal = textColorFor(colorVal)}
									<button
										type="button"
										class="classBlock {selectedId === block.id ? 'selected' : ''}"
										style="background: {colorVal}; color: {textVal};"
										onclick={() => (selectedId = block.id)}
									>
										{#if block.pattern}
											<div class="cbStripe"></div>
										{/if}
										<div class="cbContent">
											<div class="cbTitle">{block.title}</div>
											<div class="cbTags">
												{#if block.time}<span class="cbPill">{block.time}</span>{/if}
												{#if block.room}<span class="cbPill">{block.room}</span>{/if}
											</div>
											<div class="cbTags">
												{#if block.section}<span class="cbRectWhite">Sec {block.section}</span
													>{/if}
												{#if block.type}<span class="cbRectBlack">{block.type}</span>{/if}
											</div>
										</div>
									</button>
								{/each}

								{#if !isExporting}
									<button
										type="button"
										class="addBlockBtn"
										onclick={() => addBlock(day.id, slot.id)}>+ เพิ่มวิชา</button
									>
								{/if}
							</div>
						{/each}
					{/each}
				</div>
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
		min-height: 100vh;
	}

	:global(*::-webkit-scrollbar) {
		width: 10px;
		height: 10px;
	}

	:global(*::-webkit-scrollbar-thumb) {
		background: #ccc;
		border-radius: 6px;
	}

	:global(*::-webkit-scrollbar-track) {
		background: transparent;
	}

	.appWrap {
		display: flex;
		min-height: 100vh;
	}

	.sidebarPanel {
		width: 340px;
		flex-shrink: 0;
		background: #18181b;
		color: #f4f4f5;
		padding: 24px 20px;
		overflow-y: auto;
		height: 100vh;
		position: sticky;
		top: 0;
	}

	.sbTitle {
		font-size: 20px;
		font-weight: 700;
		margin-bottom: 4px;
	}

	.sbSub {
		font-size: 12px;
		opacity: 0.55;
		margin-bottom: 24px;
		font-family: 'JetBrains Mono', monospace;
	}

	.sectionLabel {
		font-size: 11px;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		opacity: 0.5;
		font-family: 'JetBrains Mono', monospace;
		margin-bottom: 10px;
	}

	.slotLabelMargin {
		margin-top: 24px;
	}

	.palLabelMargin {
		margin-top: 24px;
	}

	.exportBtn {
		width: 100%;
		padding: 12px 0;
		background: #ffffff;
		color: #111111;
		border: none;
		border-radius: 8px;
		font-weight: 700;
		font-size: 14px;
		margin-bottom: 24px;
		cursor: pointer;
	}

	.exportBtn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.wallpaperOptions {
		background: #27272a;
		border: 1px solid #3f3f46;
		border-radius: 8px;
		padding: 12px;
		margin-bottom: 16px;
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
		width: 26px;
		height: 26px;
		border-radius: 6px;
		border: 1px solid #3f3f46;
		background: #27272a;
		color: #f87171;
		font-size: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		cursor: pointer;
	}

	.addBtn {
		width: 100%;
		padding: 8px 0;
		border-radius: 6px;
		border: 1px dashed #52525b;
		background: transparent;
		color: #d4d4d8;
		font-size: 13px;
		margin-top: 4px;
		cursor: pointer;
		font-family: inherit;
	}

	.swatchWrap {
		position: relative;
		display: inline-block;
	}

	.swatchWrap input[type='color'] {
		width: 34px;
		height: 34px;
		border: 2px solid #3f3f46;
		border-radius: 8px;
		background: none;
		padding: 0;
		cursor: pointer;
	}

	.swatchDel {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #ef4444;
		color: #fff;
		border: none;
		font-size: 10px;
		line-height: 16px;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.paletteGrid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 10px;
	}

	.editorPanel {
		margin-top: 28px;
		padding-top: 20px;
		border-top: 1px solid #3f3f46;
	}

	.edLabel {
		font-size: 11px;
		opacity: 0.6;
		margin-bottom: 4px;
		display: block;
	}

	.edInput {
		width: 100%;
		padding: 8px 10px;
		border-radius: 6px;
		border: 1px solid #3f3f46;
		background: #27272a;
		color: #fff;
		font-size: 13px;
		margin-bottom: 10px;
		box-sizing: border-box;
		font-family: inherit;
	}

	.colorPickGrid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 10px;
	}

	.colorPick {
		width: 28px;
		height: 28px;
		border-radius: 6px;
		cursor: pointer;
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0;
	}

	.colorPick.active {
		border: 3px solid #fff;
		box-shadow: 0 0 0 2px #6366f1;
	}

	.checkboxRow {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		opacity: 0.85;
		margin-bottom: 14px;
		cursor: pointer;
	}

	.edBtnRow {
		display: flex;
		gap: 8px;
		margin-top: 14px;
	}

	.edBtnDelete {
		flex: 1;
		padding: 9px 0;
		border-radius: 6px;
		border: none;
		background: #ef4444;
		color: #fff;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}

	.edBtnClose {
		flex: 1;
		padding: 9px 0;
		border-radius: 6px;
		border: 1px solid #3f3f46;
		background: transparent;
		color: #d4d4d8;
		font-size: 13px;
		cursor: pointer;
		font-family: inherit;
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
		width: 100%;
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
		display: block;
		box-sizing: border-box;
		flex-shrink: 0;
	}

	.scheduleGridInner {
		position: absolute;
		top: 50%;
		left: 50%;
		transform-origin: center center;
		box-sizing: border-box;
	}



	.scheduleGrid {
		display: grid;
		border: 3px solid #111111;
		border-radius: 4px;
		overflow: hidden;
		box-sizing: border-box;
	}

	.cornerCell {
		background: #111111;
		border-right: 3px solid #111111;
		border-bottom: 3px solid #111111;
		box-sizing: border-box;
	}

	.dayHeader {
		display: flex;
		align-items: center;
		justify-content: center;
		border-right: 3px solid #111111;
		border-bottom: 3px solid #111111;
		font-weight: 700;
		font-size: 20px;
		letter-spacing: 1px;
		text-transform: uppercase;
		background: #ffffff;
		box-sizing: border-box;
	}

	.timeCell {
		background: #111111;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'JetBrains Mono', monospace;
		font-size: 16px;
		border-right: 3px solid #111111;
		border-bottom: 3px solid #111111;
		box-sizing: border-box;
	}

	.dayCell {
		border-right: 3px solid #111111;
		border-bottom: 3px solid #111111;
		padding: 10px;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 8px;
		background: #ffffff;
		box-sizing: border-box;
	}

	.addBlockBtn {
		border: 2px dashed #cbd5e1;
		border-radius: 8px;
		background: transparent;
		color: #94a3b8;
		font-size: 12px;
		padding: 6px 0;
		cursor: pointer;
		font-family: inherit;
		width: 100%;
		box-sizing: border-box;
	}

	.classBlock {
		border-radius: 14px;
		padding: 12px 14px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		border: 3px solid #111111;
		text-align: left;
		font-family: inherit;
		width: 100%;
		display: block;
		box-sizing: border-box;
	}

	.classBlock.selected {
		border-color: #6366f1;
		box-shadow: 0 0 0 2px #6366f1;
	}

	.cbStripe {
		position: absolute;
		inset: 0;
		z-index: 1;
		background-image: repeating-linear-gradient(
			135deg,
			rgba(255, 255, 255, 0) 0px,
			rgba(255, 255, 255, 0) 8px,
			rgba(255, 255, 255, 0.45) 8px,
			rgba(255, 255, 255, 0.45) 11px
		);
	}

	.cbContent {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: 6px;
		box-sizing: border-box;
	}

	.cbTitle {
		font-weight: 700;
		font-size: 15px;
		line-height: 1.25;
		word-break: break-word;
		overflow-wrap: break-word;
	}

	.cbTags {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		align-items: center;
		box-sizing: border-box;
	}

	.cbPill {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		background: #ffffff;
		color: #111111;
		border: 2px solid #111111;
		border-radius: 30px;
		padding: 2px 9px;
		display: inline-block;
		vertical-align: middle;
		line-height: 1.2;
		white-space: nowrap;
		box-sizing: border-box;
	}

	.cbRectWhite {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		background: #ffffff;
		color: #111111;
		border: 2px solid #111111;
		border-radius: 4px;
		padding: 2px 9px;
		display: inline-block;
		vertical-align: middle;
		line-height: 1.2;
		white-space: nowrap;
		box-sizing: border-box;
	}

	.cbRectBlack {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		background: #111111;
		color: #ffffff;
		border: 2px solid #111111;
		border-radius: 4px;
		padding: 2px 9px;
		display: inline-block;
		vertical-align: middle;
		line-height: 1.2;
		white-space: nowrap;
		box-sizing: border-box;
	}
</style>
