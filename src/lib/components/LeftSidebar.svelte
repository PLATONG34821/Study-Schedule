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
		isExporting?: boolean;
		linkCopied?: boolean;
		exportPixelRatio?: 1 | 2 | 4;
		onClose?: () => void;
		onExport: () => void;
		onOpenExportCode: () => void;
		onOpenImportCode: () => void;
		onShareLink: () => void;
		onAddDay: () => void;
		onRemoveDay: (id: string) => void;
		onAddSlot: () => void;
		onRemoveSlot: (id: string) => void;
		onAddColor: () => void;
		onRemoveColor: (id: string) => void;
		canUndo?: boolean;
		canRedo?: boolean;
		onUndo?: () => void;
		onRedo?: () => void;
		onFieldChange?: () => void;
	}

	let {
		days = $bindable(),
		slots = $bindable(),
		palette = $bindable(),
		width = $bindable(320),
		isOpen = true,
		isExporting = false,
		linkCopied = false,
		exportPixelRatio = $bindable(2),
		onClose,
		onExport,
		onOpenExportCode,
		onOpenImportCode,
		onShareLink,
		onAddDay,
		onRemoveDay,
		onAddSlot,
		onRemoveSlot,
		onAddColor,
		onRemoveColor,
		canUndo = false,
		canRedo = false,
		onUndo,
		onRedo,
		onFieldChange
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
			const deltaX = moveEvent.clientX - startX;
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
	class="fixed inset-y-0 left-0 z-40 box-border flex h-full shrink-0 flex-col gap-3 overflow-y-auto border-r border-[#27272a] bg-[#18181b] p-6 text-[#e4e4e7] shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-10 lg:shadow-none {isOpen
		? 'translate-x-0'
		: '-translate-x-full lg:translate-x-0'}"
	style="width: {width}px;"
>
	<div
		class="absolute top-0 right-0 z-20 hidden h-full w-2 cursor-col-resize transition-colors hover:bg-[#2563eb]/50 active:bg-[#2563eb] lg:block"
		onpointerdown={handlePointerDown}
		role="separator"
		aria-label="Resize left sidebar"
	></div>
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

	<div class="mt-2.5 flex items-center gap-2">
		<button
			type="button"
			class="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#3f3f46] bg-[#27272a] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f3f46] disabled:cursor-not-allowed disabled:opacity-40"
			onclick={onUndo}
			disabled={!canUndo}
			aria-label={m.undo()}
			title="{m.undo()} (Ctrl+Z / ⌘Z)"
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M3 7v6h6" />
				<path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
			</svg>
			{m.undo()}
		</button>
		<button
			type="button"
			class="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#3f3f46] bg-[#27272a] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f3f46] disabled:cursor-not-allowed disabled:opacity-40"
			onclick={onRedo}
			disabled={!canRedo}
			aria-label={m.redo()}
			title="{m.redo()} (Ctrl+Y / ⌘⇧Z)"
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 7v6h-6" />
				<path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
			</svg>
			{m.redo()}
		</button>
	</div>

	<div class="mt-2 flex flex-col gap-2">
		<div class="flex items-center justify-between px-0.5">
			<span class="text-[11px] font-semibold text-[#a1a1aa] uppercase">Quality</span>
			<div class="flex gap-1 rounded-lg border border-[#3f3f46] bg-[#27272a] p-1">
				{#each [1, 2, 4] as ratio (ratio)}
					<button
						type="button"
						class="rounded px-2 py-0.5 text-xs font-bold transition-colors {exportPixelRatio ===
						ratio
							? 'bg-[#2563eb] text-white shadow-sm'
							: 'text-[#a1a1aa] hover:text-white'}"
						onclick={() => (exportPixelRatio = ratio as 1 | 2 | 4)}
					>
						{ratio}x
					</button>
				{/each}
			</div>
		</div>

		<button
			class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-[#2563eb] px-4 py-3 font-[inherit] text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:not-disabled:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
			onclick={onExport}
			disabled={isExporting}
		>
			{#if isExporting}
				<svg
					class="animate-spin"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
					<path d="M12 2a10 10 0 0 1 10 10" />
				</svg>
				{m.exporting()}
			{:else}
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
				{m.export_png()}
			{/if}
		</button>
	</div>

	<div class="mb-0.5 flex gap-2">
		<button
			type="button"
			class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#3f3f46] bg-[#27272a] px-2 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3f3f46]"
			onclick={onOpenExportCode}
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<polyline points="16 18 22 12 16 6" />
				<polyline points="8 6 2 12 8 18" />
			</svg>
			{m.export_code()}
		</button>
		<button
			type="button"
			class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#3f3f46] bg-[#27272a] px-2 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3f3f46]"
			onclick={onOpenImportCode}
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M4 17l6-6-6-6" />
				<path d="M12 19h8" />
			</svg>
			{m.import_code()}
		</button>
	</div>

	<button
		type="button"
		class="mb-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#3f3f46] bg-[#27272a] px-4 py-2 font-[inherit] text-xs font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-[#3f3f46]"
		onclick={onShareLink}
	>
		{#if linkCopied}
			<span class="flex items-center gap-1.5 font-bold text-[#22c55e]">
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
				{m.link_copied()}
			</span>
		{:else}
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<circle cx="18" cy="5" r="3" />
				<circle cx="6" cy="12" r="3" />
				<circle cx="18" cy="19" r="3" />
				<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
				<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
			</svg>
			{m.share_link()}
		{/if}
	</button>

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
			<div class="relative flex items-center">
				<input
					type="color"
					bind:value={item.color}
					onchange={onFieldChange}
					class="h-9 w-9 cursor-pointer rounded-lg border-2 border-[#3f3f46] bg-none p-0"
				/>
				<button
					class="absolute -top-1 -right-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border-none bg-[#ef4444] text-[9px] text-white"
					onclick={() => onRemoveColor(item.id)}
					aria-label={m.removeColor()}
					title={m.removeColor()}>✕</button
				>
			</div>
		{/each}
	</div>
	<button
		class="mb-3 cursor-pointer rounded-md border border-dashed border-[#2563eb] bg-transparent px-3 py-1.5 font-[inherit] text-xs font-semibold text-[#60a5fa] hover:bg-[#2563eb]/10"
		onclick={onAddColor}>{m.add_color()}</button
	>
</aside>
