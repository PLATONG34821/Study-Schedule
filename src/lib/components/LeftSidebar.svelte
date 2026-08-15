<script lang="ts">
	import type { Day, Slot, PaletteColor } from '$lib/types';
	import { smoothAnimate } from '$lib/utils';
	import * as m from '$lib/paraglide/messages';
	import { resolveRoute } from '$app/paths';
	import { setLocale, getLocale } from '$lib/paraglide/runtime';
	import { Shuffle } from 'lucide-svelte';
	import ColorWheelPicker from './ColorWheelPicker.svelte';
	import autoAnimate from '@formkit/auto-animate';

	interface Props {
		days: Day[];
		slots: Slot[];
		palette: PaletteColor[];
		isOpen?: boolean;
		onClose?: () => void;
		onOpenExportModal: () => void;
		onOpenImportCode: () => void;
		onAddDay: () => void;
		onRemoveDay: (id: string) => void;
		onAddSlot: () => void;
		onRemoveSlot: (id: string) => void;
		onAddColor: (colorHex?: string) => void;
		onAddRandomColor?: () => void;
		onRemoveColor: (id: string) => void;
		onFieldChange?: () => void;
	}

	let {
		days = $bindable(),
		slots = $bindable(),
		palette = $bindable(),
		isOpen = true,
		onClose,
		onOpenExportModal,
		onOpenImportCode,
		onAddDay,
		onRemoveDay,
		onAddSlot,
		onRemoveSlot,
		onAddColor,
		onAddRandomColor,
		onRemoveColor,
		onFieldChange
	}: Props = $props();

	let activeColorId = $state<string | null>(null);
</script>

<aside
	class="box-border flex h-full w-full flex-col gap-3 overflow-y-auto border-r border-[#27272a] bg-[#18181b] p-6 text-[#e4e4e7] max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-40 max-lg:w-[320px] max-lg:max-w-[calc(100vw-3rem)] max-lg:shadow-2xl max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out {isOpen
		? 'max-lg:translate-x-0'
		: 'max-lg:-translate-x-full'}"
>
	<div class="flex items-start justify-between">
		<div>
			<h1 class="m-0 text-[22px] font-bold -tracking-[0.5px] text-white">{m.app_title()}</h1>
			<p class="mt-1 text-xs text-[#a1a1aa]">{m.app_subtitle()}</p>
		</div>
		<div class="flex items-center gap-2">
			<div class="flex gap-1 rounded-lg border border-[#3f3f46] bg-[#27272a] p-1">
				<button
					type="button"
					class="rounded px-2 py-0.5 text-xs font-semibold transition-colors {getLocale() === 'th'
						? 'bg-[#2563eb] text-white'
						: 'text-[#a1a1aa] hover:text-white'}"
					onclick={() => setLocale('th')}
				>
					TH
				</button>
				<button
					type="button"
					class="rounded px-2 py-0.5 text-xs font-semibold transition-colors {getLocale() === 'en'
						? 'bg-[#2563eb] text-white'
						: 'text-[#a1a1aa] hover:text-white'}"
					onclick={() => setLocale('en')}
				>
					EN
				</button>
			</div>
			{#if onClose}
				<button
					type="button"
					class="flex h-7 w-7 items-center justify-center rounded-lg border border-[#3f3f46] bg-[#27272a] text-sm text-[#a1a1aa] hover:text-white lg:hidden"
					onclick={onClose}
					aria-label="Close sidebar"
					title="Close sidebar"
				>
					✕
				</button>
			{/if}
		</div>
	</div>

	<div class="mt-2 flex gap-2">
		<button
			type="button"
			class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-[#2563eb] px-3 py-2.5 font-[inherit] text-xs font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-[#1d4ed8]"
			onclick={onOpenExportModal}
		>
			<svg
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<polyline points="7 10 12 15 17 10" />
				<line x1="12" y1="15" x2="12" y2="3" />
			</svg>
			Export & Share
		</button>
		<button
			type="button"
			class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#3f3f46] bg-[#27272a] text-white transition-colors hover:bg-[#3f3f46]"
			onclick={onOpenImportCode}
			aria-label={m.import_code()}
			title={m.import_code()}
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
				<polyline points="13 8 9 12 13 16" />
				<line x1="20" y1="12" x2="9" y2="12" />
			</svg>
		</button>
	</div>

	<a
		href={resolveRoute('/presets' as const)}
		class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#2563eb]/50 bg-[#2563eb]/20 px-3 py-2 font-[inherit] text-xs font-semibold text-[#60a5fa] transition-colors hover:bg-[#2563eb]/30 hover:text-white"
	>
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
			<line x1="3" y1="6" x2="21" y2="6" />
			<path d="M16 10a4 4 0 0 1-8 0" />
		</svg>
		{m.preset_marketplace()}
	</a>

	<div class="mt-2 text-[11px] font-bold tracking-[0.8px] text-[#a1a1aa] uppercase">
		{m.days_section()}
	</div>
	<div use:autoAnimate={smoothAnimate}>
		{#each days as day (day.id)}
			<div class="mb-1.5 flex items-center gap-1.5">
				<input
					type="text"
					bind:value={day.name}
					onchange={onFieldChange}
					class="flex-1 rounded-md border border-[#3f3f46] bg-[#27272a] px-2.5 py-1.5 font-[inherit] text-[13px] text-white"
				/>
				<button
					class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-[#3f3f46] font-bold text-[#ef4444] transition-colors hover:bg-[#ef4444] hover:text-white"
					onclick={() => onRemoveDay(day.id)}
					aria-label={m.removeDay({ name: day.name })}
					title={m.removeDay({ name: day.name })}>✕</button
				>
			</div>
		{/each}
	</div>
	<button
		class="mb-3 cursor-pointer rounded-md border border-dashed border-[#2563eb] bg-transparent px-3 py-1.5 font-[inherit] text-xs font-semibold text-[#60a5fa] hover:bg-[#2563eb]/10"
		onclick={onAddDay}>{m.add_day()}</button
	>

	<div class="mt-3.5 text-[11px] font-bold tracking-[0.8px] text-[#a1a1aa] uppercase">
		{m.rows_section()}
	</div>
	<div use:autoAnimate={smoothAnimate}>
		{#each slots as slot (slot.id)}
			<div class="mb-1.5 flex items-center gap-1.5">
				<input
					type="text"
					bind:value={slot.label}
					onchange={onFieldChange}
					class="flex-1 rounded-md border border-[#3f3f46] bg-[#27272a] px-2.5 py-1.5 font-[JetBrains_Mono,monospace] text-[13px] text-white"
				/>
				<button
					class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-[#3f3f46] font-bold text-[#ef4444] transition-colors hover:bg-[#ef4444] hover:text-white"
					onclick={() => onRemoveSlot(slot.id)}
					aria-label={m.removeSlot({ label: slot.label })}
					title={m.removeSlot({ label: slot.label })}>✕</button
				>
			</div>
		{/each}
	</div>
	<button
		class="mb-3 cursor-pointer rounded-md border border-dashed border-[#2563eb] bg-transparent px-3 py-1.5 font-[inherit] text-xs font-semibold text-[#60a5fa] hover:bg-[#2563eb]/10"
		onclick={onAddSlot}>{m.add_row()}</button
	>

	<div class="mt-3.5 text-[11px] font-bold tracking-[0.8px] text-[#a1a1aa] uppercase">
		{m.subject_colors()}
	</div>
	<div class="mb-2 flex flex-wrap gap-2" use:autoAnimate={smoothAnimate}>
		{#each palette as item (item.id)}
			{@const isActive = activeColorId === item.id}
			<div class="relative flex h-9 w-9 items-center justify-center">
				<button
					type="button"
					class="relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 transition-all hover:scale-105 {isActive
						? 'border-[#ef4444] ring-2 ring-[#ef4444]/50'
						: 'border-[#3f3f46] hover:border-white/50'}"
					style="background: {item.color};"
					onclick={() => {
						if (isActive) {
							onRemoveColor(item.id);
							activeColorId = null;
						} else {
							activeColorId = item.id;
						}
					}}
					aria-label={isActive ? 'Click again to delete color' : 'Click to select color'}
					title={isActive ? 'Click again to delete' : 'Click to select'}
				>
					{#if isActive}
						<div
							class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60 text-white"
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
							>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</div>
					{/if}
				</button>
			</div>
		{/each}
	</div>

	<div class="mb-3 flex items-center gap-2">
		<div class="flex-1">
			<ColorWheelPicker
				color="#2563eb"
				onChange={(hex) => onAddColor(hex)}
				buttonText={m.add_color()}
			/>
		</div>

		<button
			type="button"
			class="flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-[#3f3f46] bg-[#27272a] text-[#a1a1aa] transition-colors hover:bg-[#3f3f46] hover:text-white"
			onclick={onAddRandomColor}
			aria-label="Add random color"
			title="Add random color"
		>
			<Shuffle class="h-4 w-4" />
		</button>
	</div>
</aside>
