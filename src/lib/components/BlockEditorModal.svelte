<script lang="ts">
	import type { ClassBlock, PaletteColor } from '$lib/types';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		block: ClassBlock | null;
		palette: PaletteColor[];
		onClose: () => void;
		onDelete: (id: string) => void;
	}

	let { block = $bindable(), palette, onClose, onDelete }: Props = $props();

	const handleBackdropClick = (e: MouseEvent) => {
		if ((e.target as HTMLElement).classList.contains('modalBackdrop')) {
			onClose();
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (block && e.key === 'Escape') {
			onClose();
		}
	};
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if block}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="modalBackdrop fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[4px]"
		onclick={handleBackdropClick}
	>
		<div
			class="flex max-h-[90vh] w-full max-w-[440px] animate-popIn flex-col overflow-y-auto rounded-2xl border border-[#3f3f46] bg-[#18181b] text-[#e4e4e7] shadow-none"
		>
			<div class="flex items-center justify-between border-b border-[#27272a] px-5 py-[18px]">
				<h2 class="m-0 text-lg font-bold text-white">{m.edit_subject()}</h2>
				<button
					type="button"
					class="cursor-pointer border-none bg-transparent p-1 text-lg text-[#a1a1aa] hover:text-white"
					onclick={onClose}>✕</button
				>
			</div>

			<div class="flex flex-col gap-3.5 p-5">
				<label class="mb-1 block text-xs text-[#a1a1aa]" for="blockTitleInput"
					>{m.subject_title()}</label
				>
				<input
					id="blockTitleInput"
					class="box-border w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 font-[inherit] text-sm text-white"
					type="text"
					bind:value={block.title}
				/>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="mb-1 block text-xs text-[#a1a1aa]" for="blockTimeInput">{m.time()}</label>
						<input
							id="blockTimeInput"
							class="box-border w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 font-[inherit] text-sm text-white"
							type="text"
							bind:value={block.time}
							placeholder="08:00–09:50"
						/>
					</div>

					<div>
						<label class="mb-1 block text-xs text-[#a1a1aa]" for="blockRoomInput">{m.room()}</label>
						<input
							id="blockRoomInput"
							class="box-border w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 font-[inherit] text-sm text-white"
							type="text"
							bind:value={block.room}
							placeholder="S1 206"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="mb-1 block text-xs text-[#a1a1aa]" for="blockSectionInput"
							>{m.section()}</label
						>
						<input
							id="blockSectionInput"
							class="box-border w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 font-[inherit] text-sm text-white"
							type="text"
							bind:value={block.section}
							placeholder="1"
						/>
					</div>

					<div>
						<label class="mb-1 block text-xs text-[#a1a1aa]" for="blockTypeInput"
							>{m.type_badge()}</label
						>
						<input
							id="blockTypeInput"
							class="box-border w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 font-[inherit] text-sm text-white"
							type="text"
							bind:value={block.type}
							placeholder="Lecture / Lab"
						/>
					</div>
				</div>

				<span class="mb-1 block text-xs text-[#a1a1aa]">{m.color()}</span>
				<div class="flex flex-wrap gap-2">
					{#each palette as colorOption (colorOption.id)}
						<button
							type="button"
							class="h-8 w-8 cursor-pointer rounded-lg border-2 {block.colorId === colorOption.id
								? 'border-white shadow-[0_0_0_2px_#6366f1]'
								: 'border-transparent'}"
							style="background: {colorOption.color};"
							onclick={() => {
								if (block) block.colorId = colorOption.id;
							}}
							aria-label="Color option"
						></button>
					{/each}
				</div>

				<label class="mt-1 flex cursor-pointer items-center gap-2 text-[13px] opacity-90">
					<input type="checkbox" bind:checked={block.pattern} />
					<span>{m.stripe_pattern()}</span>
				</label>
			</div>

			<div class="flex gap-2.5 border-t border-[#27272a] bg-[#18181b] px-5 py-4">
				<button
					type="button"
					class="flex-1 cursor-pointer rounded-lg border-none bg-[#ef4444] py-2.5 font-[inherit] text-sm font-semibold text-white"
					onclick={() => onDelete(block.id)}>{m.delete_subject()}</button
				>
				<button
					type="button"
					class="flex-1 cursor-pointer rounded-lg border-none bg-[#6366f1] py-2.5 font-[inherit] text-sm font-semibold text-white hover:bg-[#4f46e5]"
					onclick={onClose}>{m.save_close()}</button
				>
			</div>
		</div>
	</div>
{/if}
