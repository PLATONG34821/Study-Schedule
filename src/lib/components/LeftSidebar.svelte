<script lang="ts">
	import type { Day, Slot, PaletteColor } from '$lib/types';
	import * as m from '$lib/paraglide/messages';
	import { setLocale, getLocale } from '$lib/paraglide/runtime';

	interface Props {
		days: Day[];
		slots: Slot[];
		palette: PaletteColor[];
		width?: number;
		isOpen?: boolean;
		onClose?: () => void;
		onOpenExportModal: () => void;
		onOpenImportCode: () => void;
		onAddDay: () => void;
		onRemoveDay: (id: string) => void;
		onAddSlot: () => void;
		onRemoveSlot: (id: string) => void;
		onAddColor: () => void;
		onRemoveColor: (id: string) => void;
		onFieldChange?: () => void;
	}

	let {
		days = $bindable(),
		slots = $bindable(),
		palette = $bindable(),
		width = $bindable(320),
		isOpen = true,
		onClose,
		onOpenExportModal,
		onOpenImportCode,
		onAddDay,
		onRemoveDay,
		onAddSlot,
		onRemoveSlot,
		onAddColor,
		onRemoveColor,
		onFieldChange
	}: Props = $props();

	let activeColorId = $state<string | null>(null);
</script>

<aside
	class="fixed inset-y-0 left-0 z-40 box-border flex h-full w-full shrink-0 flex-col gap-3 overflow-y-auto border-r border-[#27272a] bg-[#18181b] p-6 text-[#e4e4e7] shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-10 lg:shadow-none {isOpen
		? 'translate-x-0'
		: '-translate-x-full lg:translate-x-0'}"
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
			<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
				<polyline points="13 8 9 12 13 16" />
				<line x1="20" y1="12" x2="9" y2="12" />
			</svg>
		</button>
	</div>

	<a
		href="/presets"
		class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#2563eb]/50 bg-[#2563eb]/20 px-3 py-2 font-[inherit] text-xs font-semibold text-[#60a5fa] transition-colors hover:bg-[#2563eb]/30 hover:text-white"
	>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
			<line x1="3" y1="6" x2="21" y2="6"/>
			<path d="M16 10a4 4 0 0 1-8 0"/>
		</svg>
		{m.preset_marketplace()}
	</a>

	<div class="mt-2 text-[11px] font-bold tracking-[0.8px] text-[#a1a1aa] uppercase">
		{m.days_section()}
	</div>
	{#each days as day (day.id)}
		<div class="mb-1.5 flex items-center gap-1.5">
			<input
				type="text"
				bind:value={day.name}
				onchange={onFieldChange}
				class="flex-1 rounded-md border border-[#3f3f46] bg-[#27272a] px-2 py-1.5 font-[inherit] text-[13px] text-white"
			/>
			<button
				class="h-7 w-7 cursor-pointer rounded-md border-none bg-[#3f3f46] font-bold text-[#ef4444] hover:bg-[#ef4444] hover:text-white"
				onclick={() => onRemoveDay(day.id)}
				aria-label={m.removeDay({ name: day.name })}
				title={m.removeDay({ name: day.name })}>✕</button
			>
		</div>
	{/each}
	<button
		class="mb-3 cursor-pointer rounded-md border border-dashed border-[#2563eb] bg-transparent px-3 py-1.5 font-[inherit] text-xs font-semibold text-[#60a5fa] hover:bg-[#2563eb]/10"
		onclick={onAddDay}>{m.add_day()}</button
	>

	<div class="mt-3.5 text-[11px] font-bold tracking-[0.8px] text-[#a1a1aa] uppercase">
		{m.rows_section()}
	</div>
	{#each slots as slot (slot.id)}
		<div class="mb-1.5 flex items-center gap-1.5">
			<input
				type="text"
				bind:value={slot.label}
				onchange={onFieldChange}
				class="flex-1 rounded-md border border-[#3f3f46] bg-[#27272a] px-2 py-1.5 font-[JetBrains_Mono,monospace] text-[13px] text-white"
			/>
			<button
				class="h-7 w-7 cursor-pointer rounded-md border-none bg-[#3f3f46] font-bold text-[#ef4444] hover:bg-[#ef4444] hover:text-white"
				onclick={() => onRemoveSlot(slot.id)}
				aria-label={m.removeSlot({ label: slot.label })}
				title={m.removeSlot({ label: slot.label })}>✕</button
			>
		</div>
	{/each}
	<button
		class="mb-3 cursor-pointer rounded-md border border-dashed border-[#2563eb] bg-transparent px-3 py-1.5 font-[inherit] text-xs font-semibold text-[#60a5fa] hover:bg-[#2563eb]/10"
		onclick={onAddSlot}>{m.add_row()}</button
	>

	<div class="mt-3.5 text-[11px] font-bold tracking-[0.8px] text-[#a1a1aa] uppercase">
		{m.subject_colors()}
	</div>
	<div class="mb-2 flex flex-wrap gap-2">
		{#each palette as item (item.id)}
			{@const isActive = activeColorId === item.id}
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
		{/each}
	</div>
	<button
		class="mb-3 cursor-pointer rounded-md border border-dashed border-[#2563eb] bg-transparent px-3 py-1.5 font-[inherit] text-xs font-semibold text-[#60a5fa] hover:bg-[#2563eb]/10"
		onclick={onAddColor}>{m.add_color()}</button
	>
</aside>
