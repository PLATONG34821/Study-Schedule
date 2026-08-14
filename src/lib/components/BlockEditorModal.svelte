<script lang="ts">
	import type { ClassBlock, PaletteColor } from '$lib/types';
	import { textColorFor } from '$lib/utils';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		block: ClassBlock | null;
		palette: PaletteColor[];
		onClose: () => void;
		onSave: (updatedBlock: ClassBlock) => void;
		onDelete: (id: string) => void;
	}

	let { block, palette, onClose, onSave, onDelete }: Props = $props();

	let draft = $state<ClassBlock | null>(null);

	$effect(() => {
		if (block) {
			draft = { ...block };
		} else {
			draft = null;
		}
	});

	let modalEl = $state<HTMLDivElement | null>(null);

	const handleSave = () => {
		if (draft) {
			onSave(draft);
		}
	};

	const handleBackdropClick = (e: MouseEvent) => {
		if ((e.target as HTMLElement).classList.contains('modalBackdrop')) {
			onClose();
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (!block) return;
		if (e.key === 'Escape') {
			onClose();
		} else if (e.key === 'Tab' && modalEl) {
			const focusables = modalEl.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if (focusables.length === 0) return;
			const first = focusables[0];
			const last = focusables[focusables.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	};

	let previewColorObj = $derived(palette.find((c) => c.id === draft?.colorId));
	let previewColorVal = $derived(previewColorObj ? previewColorObj.color : '#dddddd');
	let previewTextVal = $derived(textColorFor(previewColorVal));
	let previewIsDarkBg = $derived(previewTextVal === '#ffffff');
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if draft}
	<div
		class="modalBackdrop fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[4px]"
		onclick={handleBackdropClick}
		role="presentation"
	>
		<div
			bind:this={modalEl}
			role="dialog"
			aria-modal="true"
			aria-label={m.edit_subject()}
			class="flex max-h-[90vh] w-full max-w-[460px] animate-popIn flex-col overflow-y-auto rounded-2xl border border-[#3f3f46] bg-[#18181b] text-[#e4e4e7] shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-[#27272a] px-5 py-4">
				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded-full bg-[#2563eb]"></div>
					<h2 class="m-0 text-base font-bold text-white">{m.edit_subject()}</h2>
				</div>
				<button
					type="button"
					class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent text-lg text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white"
					onclick={onClose}
					aria-label="Close dialog"
					title="Close dialog">✕</button
				>
			</div>

			<div class="flex flex-col gap-4 p-5">
				<!-- Live Card Preview -->
				<div class="flex flex-col gap-1.5">
					<span class="text-[11px] font-semibold tracking-wider text-[#a1a1aa] uppercase"
						>Preview</span
					>
					<div
						class="relative flex min-h-[90px] w-full flex-col justify-between overflow-hidden rounded-xl border-2 border-[#111111] p-3 text-left transition-colors"
						style="background: {previewColorVal}; color: {previewTextVal};"
					>
						{#if draft.pattern}
							<div
								class="pointer-events-none absolute inset-0"
								style="background: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px);"
							></div>
						{/if}
						<div class="relative z-[1] flex flex-col gap-1">
							<div class="text-sm leading-snug font-extrabold break-words">
								{draft.title || m.subject_title()}
							</div>
							<div class="flex flex-wrap items-center gap-1 text-[10px]">
								{#if draft.time}
									<span
										class="rounded-md border border-[#111111] px-1.5 py-0.5 font-[JetBrains_Mono,monospace] font-semibold {previewIsDarkBg
											? 'bg-white/95 text-[#111111]'
											: 'bg-[#111111]/90 text-white'}"
										>{draft.time}</span
									>
								{/if}
								{#if draft.room}
									<span
										class="rounded-md border border-[#111111] px-1.5 py-0.5 font-[JetBrains_Mono,monospace] font-semibold {previewIsDarkBg
											? 'bg-white/95 text-[#111111]'
											: 'bg-[#111111]/90 text-white'}"
										>{draft.room}</span
									>
								{/if}
								{#if draft.section}
									<span
										class="rounded border border-[#111111] px-1.5 py-0.5 font-[JetBrains_Mono,monospace] font-bold {previewIsDarkBg
											? 'bg-white text-[#111111]'
											: 'bg-[#111111] text-white'}"
										>Sec {draft.section}</span
									>
								{/if}
								{#if draft.type}
									<span
										class="rounded border border-[#111111] px-1.5 py-0.5 font-[JetBrains_Mono,monospace] font-bold uppercase {previewIsDarkBg
											? 'bg-[#111111] text-white'
											: 'bg-white text-[#111111]'}"
										>{draft.type}</span
									>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<!-- Title -->
				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-[#a1a1aa]" for="blockTitleInput"
						>{m.subject_title()}</label
					>
					<input
						id="blockTitleInput"
						class="box-border w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2 font-[inherit] text-sm text-white transition-colors focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none"
						type="text"
						bind:value={draft.title}
					/>
				</div>

				<!-- Time & Room -->
				<div class="grid grid-cols-2 gap-3">
					<div class="flex flex-col gap-1">
						<label class="text-xs font-medium text-[#a1a1aa]" for="blockTimeInput">{m.time()}</label
						>
						<input
							id="blockTimeInput"
							class="box-border w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2 font-[inherit] text-sm text-white transition-colors focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none"
							type="text"
							bind:value={draft.time}
							placeholder="08:00–09:50"
						/>
					</div>

					<div class="flex flex-col gap-1">
						<label class="text-xs font-medium text-[#a1a1aa]" for="blockRoomInput">{m.room()}</label
						>
						<input
							id="blockRoomInput"
							class="box-border w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2 font-[inherit] text-sm text-white transition-colors focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none"
							type="text"
							bind:value={draft.room}
							placeholder="S1 206"
						/>
					</div>
				</div>

				<!-- Section & Type -->
				<div class="grid grid-cols-2 gap-3">
					<div class="flex flex-col gap-1">
						<label class="text-xs font-medium text-[#a1a1aa]" for="blockSectionInput"
							>{m.section()}</label
						>
						<input
							id="blockSectionInput"
							class="box-border w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2 font-[inherit] text-sm text-white transition-colors focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none"
							type="text"
							bind:value={draft.section}
							placeholder="1"
						/>
					</div>

					<div class="flex flex-col gap-1">
						<label class="text-xs font-medium text-[#a1a1aa]" for="blockTypeInput"
							>{m.type_badge()}</label
						>
						<input
							id="blockTypeInput"
							class="box-border w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2 font-[inherit] text-sm text-white transition-colors focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none"
							type="text"
							bind:value={draft.type}
							placeholder="Lecture / Lab"
						/>
					</div>
				</div>

				<!-- Color Palette -->
				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-medium text-[#a1a1aa]">{m.color()}</span>
					<div class="flex flex-wrap gap-2">
						{#each palette as colorOption (colorOption.id)}
							<button
								type="button"
								class="h-8 w-8 cursor-pointer rounded-lg border-2 border-transparent transition-transform hover:scale-105 {draft.colorId ===
								colorOption.id
									? 'scale-105 ring-2 ring-[#2563eb] ring-offset-2 ring-offset-[#18181b]'
									: ''}"
								style="background: {colorOption.color};"
								onclick={() => {
									if (draft) draft.colorId = colorOption.id;
								}}
								aria-label="Select color"
							></button>
						{/each}
					</div>
				</div>

				<!-- Pattern Toggle -->
				<button
					type="button"
					class="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#3f3f46] bg-[#27272a] px-3.5 py-2.5 transition-all hover:border-[#52525b]"
					onclick={() => draft && (draft.pattern = !draft.pattern)}
				>
					<div class="flex items-center gap-2.5">
						<div
							class="h-5 w-7 shrink-0 rounded border border-white/20 transition-all"
							style="background: {draft.pattern
								? 'repeating-linear-gradient(-45deg, #2563eb, #2563eb 4px, #60a5fa 4px, #60a5fa 8px)'
								: '#3f3f46'};"
						></div>
						<span class="text-xs font-medium text-[#e4e4e7]">{m.stripe_pattern()}</span>
					</div>
					<div
						class="relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-200 ease-in-out {draft.pattern
							? 'bg-[#2563eb]'
							: 'bg-[#3f3f46]'}"
					>
						<div
							class="h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out {draft.pattern
								? 'translate-x-5'
								: 'translate-x-0'}"
						></div>
					</div>
				</button>
			</div>

			<!-- Footer -->
			<div
				class="flex items-center justify-between border-t border-[#27272a] bg-[#18181b] px-5 py-4"
			>
				<button
					type="button"
					class="cursor-pointer rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 px-3.5 py-2 text-xs font-semibold text-[#ef4444] transition-colors hover:bg-[#ef4444] hover:text-white"
					onclick={() => draft && onDelete(draft.id)}>{m.delete_subject()}</button
				>
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="cursor-pointer rounded-lg border border-[#3f3f46] bg-[#27272a] px-4 py-2 text-xs font-semibold text-[#a1a1aa] transition-colors hover:text-white"
						onclick={onClose}>Cancel</button
					>
					<button
						type="button"
						class="cursor-pointer rounded-lg border-none bg-[#2563eb] px-5 py-2 font-[inherit] text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
						onclick={handleSave}>{m.save_close()}</button
					>
				</div>
			</div>
		</div>
	</div>
{/if}
