<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import type { Day, Slot, PaletteColor, ClassBlock } from '$lib/types';
	import { textColorFor, compressConfigCode } from '$lib/utils';
	import { setLocale, getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	interface CustomSchedulePreset {
		id: string;
		title: string;
		category: string;
		description: string;
		themeName: string;
		bgColor: string;
		gridLineColor: string;
		timeBgColor: string;
		dayHeaderBgColor: string;
		cellBgColor: string;
		days: Day[];
		slots: Slot[];
		palette: PaletteColor[];
		blocks: ClassBlock[];
	}

	let searchQuery = $state('');
	let selectedCategory = $state('All');
	let previewPreset = $state<CustomSchedulePreset | null>(null);

	const presetsList: CustomSchedulePreset[] = [
		{
			id: 'mon-fri-standard',
			title: 'Standard University (Mon–Fri)',
			category: 'Light Tone',
			description: 'Classic 5-day academic timetable with clean light canvas and vibrant subject cards.',
			themeName: 'Clean Light',
			bgColor: '#ffffff',
			gridLineColor: '#111111',
			timeBgColor: '#111111',
			dayHeaderBgColor: '#ffffff',
			cellBgColor: '#ffffff',
			days: [
				{ id: 'day1', name: 'Monday' },
				{ id: 'day2', name: 'Tuesday' },
				{ id: 'day3', name: 'Wednesday' },
				{ id: 'day4', name: 'Thursday' },
				{ id: 'day5', name: 'Friday' }
			],
			slots: [
				{ id: 'slot1', label: '08:00' },
				{ id: 'slot2', label: '10:00' },
				{ id: 'slot3', label: '13:00' },
				{ id: 'slot4', label: '15:00' }
			],
			palette: [
				{ id: 'c1', color: '#55E6A5' },
				{ id: 'c2', color: '#FF764A' },
				{ id: 'c3', color: '#38BDF8' },
				{ id: 'c4', color: '#A855F7' },
				{ id: 'c5', color: '#FACC15' },
				{ id: 'c6', color: '#EC4899' },
				{ id: 'c7', color: '#26D0CE' }
			],
			blocks: [
				{
					id: 'std1',
					dayId: 'day1',
					timeSlotId: 'slot1',
					title: 'Digital Logic & Microcontrollers',
					time: '08:00–09:50',
					room: 'S7 A 402',
					section: '1',
					type: 'Lecture',
					colorId: 'c1',
					pattern: false
				},
				{
					id: 'std2',
					dayId: 'day1',
					timeSlotId: 'slot2',
					title: 'Microcontroller Lab',
					time: '10:00–11:50',
					room: 'S7 A 202',
					section: '1',
					type: 'Lab',
					colorId: 'c1',
					pattern: true
				},
				{
					id: 'std3',
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
					id: 'std4',
					dayId: 'day3',
					timeSlotId: 'slot2',
					title: 'Data Communications',
					time: '10:00–11:50',
					room: 'S7 A 201',
					section: '2',
					type: 'Lecture',
					colorId: 'c3',
					pattern: false
				},
				{
					id: 'std5',
					dayId: 'day4',
					timeSlotId: 'slot1',
					title: 'Engineering Mathematics 2',
					time: '08:00–09:50',
					room: 'C1 314',
					section: '1',
					type: 'Lecture',
					colorId: 'c4',
					pattern: false
				},
				{
					id: 'std6',
					dayId: 'day5',
					timeSlotId: 'slot3',
					title: 'Software Engineering Workshop',
					time: '13:00–14:50',
					room: 'S1 206',
					section: '2',
					type: 'Lab',
					colorId: 'c5',
					pattern: true
				}
			]
		},
		{
			id: 'mon-wed-fri-3day',
			title: '3-Day Intensive (Mon, Wed, Fri)',
			category: 'Dark Tone',
			description: 'Midnight Slate theme with neon accents. Leaves Tue & Thu completely free for self-study or work.',
			themeName: 'Midnight Dark',
			bgColor: '#0f172a',
			gridLineColor: '#334155',
			timeBgColor: '#1e293b',
			dayHeaderBgColor: '#1e293b',
			cellBgColor: '#0f172a',
			days: [
				{ id: 'day1', name: 'Monday' },
				{ id: 'day3', name: 'Wednesday' },
				{ id: 'day5', name: 'Friday' }
			],
			slots: [
				{ id: 'slot1', label: '08:00' },
				{ id: 'slot2', label: '10:00' },
				{ id: 'slot3', label: '13:00' },
				{ id: 'slot4', label: '15:00' },
				{ id: 'slot5', label: '17:00' }
			],
			palette: [
				{ id: 'c1', color: '#10B981' },
				{ id: 'c2', color: '#3B82F6' },
				{ id: 'c3', color: '#8B5CF6' },
				{ id: 'c4', color: '#F97316' },
				{ id: 'c5', color: '#F59E0B' },
				{ id: 'c6', color: '#EC4899' }
			],
			blocks: [
				{
					id: 'mwf1',
					dayId: 'day1',
					timeSlotId: 'slot1',
					title: 'Data Structures & Algorithms',
					time: '08:00–09:50',
					room: 'C1 201',
					section: '1',
					type: 'Lecture',
					colorId: 'c2',
					pattern: false
				},
				{
					id: 'mwf2',
					dayId: 'day1',
					timeSlotId: 'slot3',
					title: 'Web Systems Architecture',
					time: '13:00–14:50',
					room: 'S1 305',
					section: '1',
					type: 'Lecture',
					colorId: 'c6',
					pattern: false
				},
				{
					id: 'mwf3',
					dayId: 'day3',
					timeSlotId: 'slot2',
					title: 'Algorithms Laboratory',
					time: '10:00–11:50',
					room: 'Lab 2',
					section: '1',
					type: 'Lab',
					colorId: 'c2',
					pattern: true
				},
				{
					id: 'mwf4',
					dayId: 'day3',
					timeSlotId: 'slot4',
					title: 'Artificial Intelligence Basics',
					time: '15:00–16:50',
					room: 'C1 405',
					section: '1',
					type: 'Lecture',
					colorId: 'c5',
					pattern: false
				},
				{
					id: 'mwf5',
					dayId: 'day5',
					timeSlotId: 'slot1',
					title: 'Operating Systems & Kernels',
					time: '08:00–09:50',
					room: 'S1 206',
					section: '1',
					type: 'Lecture',
					colorId: 'c1',
					pattern: false
				},
				{
					id: 'mwf6',
					dayId: 'day5',
					timeSlotId: 'slot5',
					title: 'Software Project Capstone',
					time: '17:00–18:50',
					room: 'Studio 1',
					section: '1',
					type: 'Studio',
					colorId: 'c3',
					pattern: true
				}
			]
		},
		{
			id: 'weekend-evening',
			title: 'Weekend & Evening Program (Fri–Sun)',
			category: 'Dark Tone',
			description: 'Dark Zinc aesthetic with warm gold and amber colors tailored for part-time professionals.',
			themeName: 'Dark Zinc',
			bgColor: '#18181b',
			gridLineColor: '#3f3f46',
			timeBgColor: '#27272a',
			dayHeaderBgColor: '#27272a',
			cellBgColor: '#18181b',
			days: [
				{ id: 'day5', name: 'Friday' },
				{ id: 'day6', name: 'Saturday' },
				{ id: 'day7', name: 'Sunday' }
			],
			slots: [
				{ id: 'slot1', label: '13:00' },
				{ id: 'slot2', label: '15:00' },
				{ id: 'slot3', label: '17:00' },
				{ id: 'slot4', label: '19:00' }
			],
			palette: [
				{ id: 'c1', color: '#F59E0B' },
				{ id: 'c2', color: '#FB7185' },
				{ id: 'c3', color: '#34D399' },
				{ id: 'c4', color: '#A78BFA' }
			],
			blocks: [
				{
					id: 'eve1',
					dayId: 'day5',
					timeSlotId: 'slot3',
					title: 'Corporate Finance & Valuation',
					time: '17:00–18:50',
					room: 'B2 105',
					section: 'E1',
					type: 'Lecture',
					colorId: 'c1',
					pattern: false
				},
				{
					id: 'eve2',
					dayId: 'day6',
					timeSlotId: 'slot1',
					title: 'Strategic Marketing Analytics',
					time: '13:00–14:50',
					room: 'B2 201',
					section: 'E1',
					type: 'Lecture',
					colorId: 'c2',
					pattern: false
				},
				{
					id: 'eve3',
					dayId: 'day6',
					timeSlotId: 'slot2',
					title: 'Business Data Modeling',
					time: '15:00–16:50',
					room: 'C1 102',
					section: 'E1',
					type: 'Lab',
					colorId: 'c3',
					pattern: true
				},
				{
					id: 'eve4',
					dayId: 'day7',
					timeSlotId: 'slot1',
					title: 'Executive Leadership Seminar',
					time: '13:00–14:50',
					room: 'Auditorium',
					section: 'E1',
					type: 'Seminar',
					colorId: 'c4',
					pattern: false
				}
			]
		},
		{
			id: 'six-day-school',
			title: '6-Day High School / Academy (Mon–Sat)',
			category: 'Pastel Tone',
			description: 'Nordic Soft Pastel palette on clean snow background with 6 compact slots.',
			themeName: 'Nordic Pastel',
			bgColor: '#f8fafc',
			gridLineColor: '#cbd5e1',
			timeBgColor: '#334155',
			dayHeaderBgColor: '#f1f5f9',
			cellBgColor: '#ffffff',
			days: [
				{ id: 'day1', name: 'Monday' },
				{ id: 'day2', name: 'Tuesday' },
				{ id: 'day3', name: 'Wednesday' },
				{ id: 'day4', name: 'Thursday' },
				{ id: 'day5', name: 'Friday' },
				{ id: 'day6', name: 'Saturday' }
			],
			slots: [
				{ id: 'slot1', label: '08:00' },
				{ id: 'slot2', label: '09:30' },
				{ id: 'slot3', label: '11:00' },
				{ id: 'slot4', label: '13:30' },
				{ id: 'slot5', label: '15:00' },
				{ id: 'slot6', label: '16:30' }
			],
			palette: [
				{ id: 'c1', color: '#A7F3D0' },
				{ id: 'c2', color: '#BAE6FD' },
				{ id: 'c3', color: '#DDD6FE' },
				{ id: 'c4', color: '#FDE68A' },
				{ id: 'c5', color: '#FBCFE8' }
			],
			blocks: [
				{
					id: 'sch1',
					dayId: 'day1',
					timeSlotId: 'slot1',
					title: 'Physics & Mechanics',
					time: '08:00–09:20',
					room: 'Room 401',
					section: 'M6',
					type: 'Lecture',
					colorId: 'c2',
					pattern: false
				},
				{
					id: 'sch2',
					dayId: 'day2',
					timeSlotId: 'slot2',
					title: 'Advanced Calculus',
					time: '09:30–10:50',
					room: 'Room 302',
					section: 'M6',
					type: 'Lecture',
					colorId: 'c3',
					pattern: false
				},
				{
					id: 'sch3',
					dayId: 'day3',
					timeSlotId: 'slot4',
					title: 'Chemistry Lab',
					time: '13:30–14:50',
					room: 'Chem Lab 1',
					section: 'M6',
					type: 'Lab',
					colorId: 'c1',
					pattern: true
				},
				{
					id: 'sch4',
					dayId: 'day4',
					timeSlotId: 'slot1',
					title: 'English Literature',
					time: '08:00–09:20',
					room: 'Room 205',
					section: 'M6',
					type: 'Lecture',
					colorId: 'c5',
					pattern: false
				},
				{
					id: 'sch5',
					dayId: 'day5',
					timeSlotId: 'slot5',
					title: 'Biology & Genetics',
					time: '15:00–16:20',
					room: 'Bio Lab',
					section: 'M6',
					type: 'Lecture',
					colorId: 'c4',
					pattern: false
				},
				{
					id: 'sch6',
					dayId: 'day6',
					timeSlotId: 'slot2',
					title: 'CS Olympiad Prep',
					time: '09:30–11:50',
					room: 'Comp Lab',
					section: 'Club',
					type: 'Workshop',
					colorId: 'c2',
					pattern: true
				}
			]
		},
		{
			id: 'mon-thu-block',
			title: '4-Day Extended Block (Mon–Thu)',
			category: 'Vibrant Tone',
			description: 'Monochrome Dark Slate with neon orange & cobalt accents for studio block timetables.',
			themeName: 'Dark Gray Accent',
			bgColor: '#111827',
			gridLineColor: '#374151',
			timeBgColor: '#1f2937',
			dayHeaderBgColor: '#1f2937',
			cellBgColor: '#111827',
			days: [
				{ id: 'day1', name: 'Monday' },
				{ id: 'day2', name: 'Tuesday' },
				{ id: 'day3', name: 'Wednesday' },
				{ id: 'day4', name: 'Thursday' }
			],
			slots: [
				{ id: 'slot1', label: '09:00' },
				{ id: 'slot2', label: '12:30' },
				{ id: 'slot3', label: '15:30' }
			],
			palette: [
				{ id: 'c1', color: '#FF6B00' },
				{ id: 'c2', color: '#2563EB' },
				{ id: 'c3', color: '#84CC16' },
				{ id: 'c4', color: '#D946EF' }
			],
			blocks: [
				{
					id: 'blk1',
					dayId: 'day1',
					timeSlotId: 'slot1',
					title: 'Architectural Design Studio',
					time: '09:00–11:50',
					room: 'Studio A',
					section: '1',
					type: 'Studio',
					colorId: 'c4',
					pattern: false
				},
				{
					id: 'blk2',
					dayId: 'day2',
					timeSlotId: 'slot2',
					title: 'UI/UX Interactive Systems',
					time: '12:30–15:20',
					room: 'Mac Lab 1',
					section: '1',
					type: 'Workshop',
					colorId: 'c2',
					pattern: false
				},
				{
					id: 'blk3',
					dayId: 'day3',
					timeSlotId: 'slot1',
					title: '3D Animation & Rendering',
					time: '09:00–11:50',
					room: 'Studio C',
					section: '2',
					type: 'Lab',
					colorId: 'c3',
					pattern: true
				},
				{
					id: 'blk4',
					dayId: 'day4',
					timeSlotId: 'slot3',
					title: 'Portfolio Exhibition Prep',
					time: '15:30–18:20',
					room: 'Gallery',
					section: '1',
					type: 'Studio',
					colorId: 'c1',
					pattern: false
				}
			]
		}
	];

	const presetsQuery = createQuery(() => ({
		queryKey: ['schedulePresets'],
		queryFn: async () => presetsList
	}));

	let presets = $derived(presetsQuery.data ?? presetsList);

	let categories = $derived([
		'All',
		...Array.from(new Set(presets.map((p) => p.category)))
	]);

	let filteredPresets = $derived.by(() => {
		return presets.filter((p) => {
			const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
			const q = searchQuery.toLowerCase().trim();
			const matchesQuery =
				!q ||
				p.title.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q) ||
				p.category.toLowerCase().includes(q) ||
				p.themeName.toLowerCase().includes(q) ||
				p.days.some((d) => d.name.toLowerCase().includes(q)) ||
				p.blocks.some((b) => b.title.toLowerCase().includes(q));
			return matchesCategory && matchesQuery;
		});
	});

	const applyPresetAndNavigate = async (preset: CustomSchedulePreset) => {
		if (typeof window === 'undefined') return;
		const configObj = {
			days: preset.days,
			slots: preset.slots,
			palette: preset.palette,
			blocks: preset.blocks,
			settings: {
				selectedPresetId: 'desktop',
				customPresetWidth: 1920,
				customPresetHeight: 1080,
				gridRotationAngle: 0,
				customTopGapPercent: 0,
				scaleMode: 'fitBoth',
				gridScaleModifier: 1.0,
				slotRowHeight: 210,
				dayColumnWidth: 270,
				bgColor: preset.bgColor,
				gridLineColor: preset.gridLineColor,
				timeBgColor: preset.timeBgColor,
				dayHeaderBgColor: preset.dayHeaderBgColor,
				cellBgColor: preset.cellBgColor,
				fontSizeDay: 20,
				fontSizeTime: 16,
				fontSizeTitle: 20,
				fontSizeBadge: 11
			}
		};

		const code = await compressConfigCode(configObj);
		window.location.href = `/#s=${code}`;
	};
</script>

<svelte:head>
	<title>{m.preset_marketplace()} | Study Schedule</title>
</svelte:head>

<div class="h-screen w-full overflow-y-auto bg-[#121214] text-[#e4e4e7]">
	<!-- Navbar Header -->
	<header class="sticky top-0 z-30 border-b border-[#27272a] bg-[#18181b]/90 backdrop-blur-md">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
			<div class="flex items-center gap-4">
				<a
					href="/"
					class="flex cursor-pointer items-center gap-2 rounded-lg border border-[#3f3f46] bg-[#27272a] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f3f46]"
				>
					{m.back_to_editor()}
				</a>
				<div class="h-5 w-px bg-[#3f3f46]"></div>
				<div class="flex items-center gap-2">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb] text-white">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M4 5h16M4 12h16M4 19h16" />
						</svg>
					</div>
					<div>
						<h1 class="m-0 text-lg font-bold text-white leading-tight">{m.preset_marketplace()}</h1>
						<p class="m-0 text-xs text-[#a1a1aa]">{m.preset_marketplace_subtitle()}</p>
					</div>
				</div>
			</div>

			<!-- Language Switcher -->
			<div class="flex gap-1 rounded-lg border border-[#3f3f46] bg-[#27272a] p-1">
				<button
					type="button"
					class="rounded px-2.5 py-1 text-xs font-semibold transition-colors {getLocale() === 'th'
						? 'bg-[#2563eb] text-white'
						: 'text-[#a1a1aa] hover:text-white'}"
					onclick={() => setLocale('th')}
				>
					TH
				</button>
				<button
					type="button"
					class="rounded px-2.5 py-1 text-xs font-semibold transition-colors {getLocale() === 'en'
						? 'bg-[#2563eb] text-white'
						: 'text-[#a1a1aa] hover:text-white'}"
					onclick={() => setLocale('en')}
				>
					EN
				</button>
			</div>
		</div>
	</header>

	<!-- Main Content Area -->
	<main class="mx-auto max-w-7xl px-6 py-8">
		<!-- Search & Category Filters -->
		<div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<!-- Category Tabs -->
			<div class="flex flex-wrap gap-2">
				{#each categories as cat (cat)}
					<button
						type="button"
						class="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold transition-all {selectedCategory === cat
							? 'bg-[#2563eb] text-white shadow-lg'
							: 'border border-[#3f3f46] bg-[#18181b] text-[#a1a1aa] hover:border-[#52525b] hover:text-white'}"
						onclick={() => (selectedCategory = cat)}
					>
						{cat === 'All' ? m.all_categories() : cat}
					</button>
				{/each}
			</div>

			<!-- Search Bar -->
			<div class="relative w-full md:w-72">
				<svg
					class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#a1a1aa]"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder={m.search_presets()}
					class="w-full rounded-xl border border-[#3f3f46] bg-[#18181b] py-2.5 pr-4 pl-9 text-xs text-white placeholder-[#71717a] focus:border-[#2563eb] focus:outline-none"
				/>
			</div>
		</div>

		<!-- Presets Grid -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredPresets as preset (preset.id)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-[#27272a] bg-[#18181b] transition-all hover:border-[#2563eb]/60 hover:shadow-2xl"
					onclick={() => (previewPreset = preset)}
				>
					<!-- Custom Days & Slots Header Preview Box -->
					<div class="relative flex min-h-[230px] w-full flex-col overflow-hidden border-b border-[#27272a] p-3.5" style="background: {preset.bgColor};">
						<div class="mb-2 flex items-center justify-between z-10">
							<span class="rounded bg-[#2563eb]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#60a5fa] uppercase">
								{preset.category}
							</span>
							<span class="rounded-md border border-white/20 bg-black/40 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
								{preset.themeName}
							</span>
						</div>

						<!-- Custom Grid Timetable Preview -->
						<div class="flex flex-1 flex-col overflow-hidden rounded-lg border shadow-inner" style="border-color: {preset.gridLineColor}; background: {preset.gridLineColor};">
							<!-- Header Days row -->
							<div class="grid gap-px" style="grid-template-columns: 32px repeat({preset.days.length}, minmax(0, 1fr)); background: {preset.gridLineColor};">
								<div class="p-1 text-center font-mono text-[8px] font-bold" style="background: {preset.timeBgColor}; color: {textColorFor(preset.timeBgColor)};">Time</div>
								{#each preset.days as d (d.id)}
									<div class="min-w-0 overflow-hidden truncate p-1 text-center font-mono text-[8px] font-extrabold uppercase" style="background: {preset.dayHeaderBgColor}; color: {textColorFor(preset.dayHeaderBgColor)};">
										{d.name.slice(0, 3)}
									</div>
								{/each}
							</div>

							<!-- Slots rows grid -->
							<div class="grid flex-1 gap-px" style="grid-template-columns: 32px repeat({preset.days.length}, minmax(0, 1fr)); background: {preset.gridLineColor};">
								{#each preset.slots as slot (slot.id)}
									<div class="flex items-center justify-center p-0.5 font-mono text-[8px] font-bold" style="background: {preset.timeBgColor}; color: {textColorFor(preset.timeBgColor)};">
										{slot.label}
									</div>
									{#each preset.days as d (d.id)}
										{@const cellBlocks = preset.blocks.filter((b) => b.dayId === d.id && b.timeSlotId === slot.id)}
										<div class="relative flex min-w-0 flex-col gap-0.5 overflow-hidden p-0.5" style="background: {preset.cellBgColor};">
											{#if cellBlocks.length > 0}
												{#each cellBlocks as b (b.id)}
													{@const colObj = preset.palette.find((c) => c.id === b.colorId)}
													{@const bg = colObj ? colObj.color : '#55E6A5'}
													{@const textCol = textColorFor(bg)}
													<div
														class="flex min-w-0 flex-1 flex-col justify-center overflow-hidden rounded-[3px] p-1 text-[8px] font-extrabold leading-tight shadow-sm"
														style="background: {bg}; color: {textCol};"
													>
														<div class="min-w-0 truncate font-bold">{b.title}</div>
														{#if b.room}
															<div class="min-w-0 truncate font-mono text-[7px] opacity-80">{b.room}</div>
														{/if}
													</div>
												{/each}
											{/if}
										</div>
									{/each}
								{/each}
							</div>
						</div>
					</div>

					<!-- Details Body -->
					<div class="flex flex-1 items-center justify-between p-4">
						<!-- Palette Preview Dots -->
						<div class="flex items-center gap-1.5">
							{#each preset.palette as col (col.id)}
								<span class="h-3.5 w-3.5 rounded-full border border-black/30 shadow-sm" style="background: {col.color};"></span>
							{/each}
						</div>

						<button
							type="button"
							class="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#1d4ed8]"
							onclick={(e) => {
								e.stopPropagation();
								applyPresetAndNavigate(preset);
							}}
						>
							{m.apply_preset()}
						</button>
					</div>
				</div>
			{/each}
		</div>
	</main>
</div>

<!-- Fullscreen Schedule Preview Modal -->
{#if previewPreset}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="modalBackdrop fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
		onclick={(e) => (e.target as HTMLElement).classList.contains('modalBackdrop') && (previewPreset = null)}
	>
		<div
			class="flex max-h-[90vh] w-full max-w-4xl animate-popIn flex-col overflow-hidden rounded-2xl border border-[#3f3f46] bg-[#18181b] text-white shadow-2xl"
		>
			<div class="flex items-center justify-between border-b border-[#27272a] px-6 py-4">
				<div class="flex items-center gap-2">
					<h2 class="m-0 text-lg font-bold">{previewPreset.themeName}</h2>
					<span class="rounded bg-[#2563eb]/20 px-2 py-0.5 font-mono text-xs font-bold text-[#60a5fa]">
						{previewPreset.category}
					</span>
				</div>
				<button
					type="button"
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#3f3f46] bg-[#27272a] text-base text-[#a1a1aa] hover:text-white"
					onclick={() => (previewPreset = null)}
				>
					✕
				</button>
			</div>

			<div class="flex-1 overflow-auto p-6" style="background: {previewPreset.bgColor};">
				<!-- Full Custom Days x Slots Preset Grid -->
				<div class="flex flex-col overflow-hidden rounded-xl border shadow-2xl" style="border-color: {previewPreset.gridLineColor}; background: {previewPreset.gridLineColor};">
					<!-- Header Days row -->
					<div class="grid gap-px" style="grid-template-columns: 80px repeat({previewPreset.days.length}, minmax(0, 1fr)); background: {previewPreset.gridLineColor};">
						<div class="flex items-center justify-center p-3 font-mono text-xs font-bold" style="background: {previewPreset.timeBgColor}; color: {textColorFor(previewPreset.timeBgColor)};">
							Time
						</div>
						{#each previewPreset.days as d (d.id)}
							<div class="flex items-center justify-center min-w-0 truncate p-3 text-center text-xs font-extrabold uppercase" style="background: {previewPreset.dayHeaderBgColor}; color: {textColorFor(previewPreset.dayHeaderBgColor)};">
								{d.name}
							</div>
						{/each}
					</div>

					<!-- Slots rows grid -->
					<div class="grid flex-1 gap-px" style="grid-template-columns: 80px repeat({previewPreset.days.length}, minmax(0, 1fr)); background: {previewPreset.gridLineColor};">
						{#each previewPreset.slots as slot (slot.id)}
							<!-- Time Column Cell -->
							<div class="flex items-center justify-center p-3 font-mono text-xs font-bold" style="background: {previewPreset.timeBgColor}; color: {textColorFor(previewPreset.timeBgColor)};">
								{slot.label}
							</div>

							<!-- Day Cells -->
							{#each previewPreset.days as d (d.id)}
								{@const cellBlocks = previewPreset.blocks.filter((b) => b.dayId === d.id && b.timeSlotId === slot.id)}
								<div class="relative flex min-w-0 flex-col gap-1.5 p-1.5 min-h-[90px]" style="background: {previewPreset.cellBgColor};">
									{#if cellBlocks.length > 0}
										{#each cellBlocks as b (b.id)}
											{@const colObj = previewPreset.palette.find((c) => c.id === b.colorId)}
											{@const bg = colObj ? colObj.color : '#55E6A5'}
											{@const textCol = textColorFor(bg)}
											<div
												class="flex flex-1 flex-col justify-between rounded-lg p-2.5 text-xs font-extrabold shadow-sm min-w-0 overflow-hidden"
												style="background: {bg}; color: {textCol};"
											>
												<div class="min-w-0 truncate font-bold">{b.title}</div>
												{#if b.time || b.room}
													<div class="mt-1 flex flex-wrap gap-1 text-[10px] opacity-90 font-normal">
														{#if b.time}<span class="rounded bg-black/15 px-1.5 py-0.5 font-mono">{b.time}</span>{/if}
														{#if b.room}<span class="rounded bg-black/15 px-1.5 py-0.5 font-mono">{b.room}</span>{/if}
													</div>
												{/if}
											</div>
										{/each}
									{/if}
								</div>
							{/each}
						{/each}
					</div>
				</div>
			</div>

			<div class="flex items-center justify-end border-t border-[#27272a] px-6 py-4 bg-[#18181b]">
				<button
					type="button"
					class="flex cursor-pointer items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-[#1d4ed8]"
					onclick={() => applyPresetAndNavigate(previewPreset!)}
				>
					{m.apply_preset()}
				</button>
			</div>
		</div>
	</div>
{/if}
