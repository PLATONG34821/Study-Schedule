<script lang="ts">
	import type { ClassBlock, PaletteColor } from '$lib/types';

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
		class="modalBackdrop fixed inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center z-[999] p-4"
		onclick={handleBackdropClick}
	>
		<div
			class="bg-[#18181b] text-[#e4e4e7] border border-[#3f3f46] rounded-2xl w-full max-w-[440px] shadow-none flex flex-col overflow-hidden animate-popIn"
		>
			<div class="flex items-center justify-between px-5 py-[18px] border-b border-[#27272a]">
				<h2 class="m-0 text-lg font-bold text-white">แก้ไขวิชา (Edit Subject)</h2>
				<button
					type="button"
					class="bg-transparent border-none text-[#a1a1aa] text-lg cursor-pointer p-1 hover:text-white"
					onclick={onClose}>✕</button
				>
			</div>

			<div class="p-5 flex flex-col gap-3.5">
				<label class="text-xs text-[#a1a1aa] mb-1 block" for="blockTitleInput"
					>ชื่อวิชา (Title)</label
				>
				<input
					id="blockTitleInput"
					class="w-full px-3 py-2.5 rounded-lg border border-[#3f3f46] bg-[#27272a] text-white text-sm box-border font-[inherit]"
					type="text"
					bind:value={block.title}
				/>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="text-xs text-[#a1a1aa] mb-1 block" for="blockTimeInput"
							>เวลา (Time)</label
						>
						<input
							id="blockTimeInput"
							class="w-full px-3 py-2.5 rounded-lg border border-[#3f3f46] bg-[#27272a] text-white text-sm box-border font-[inherit]"
							type="text"
							bind:value={block.time}
							placeholder="08:00–09:50"
						/>
					</div>

					<div>
						<label class="text-xs text-[#a1a1aa] mb-1 block" for="blockRoomInput"
							>ห้อง (Room)</label
						>
						<input
							id="blockRoomInput"
							class="w-full px-3 py-2.5 rounded-lg border border-[#3f3f46] bg-[#27272a] text-white text-sm box-border font-[inherit]"
							type="text"
							bind:value={block.room}
							placeholder="S1 206"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="text-xs text-[#a1a1aa] mb-1 block" for="blockSectionInput"
							>Section</label
						>
						<input
							id="blockSectionInput"
							class="w-full px-3 py-2.5 rounded-lg border border-[#3f3f46] bg-[#27272a] text-white text-sm box-border font-[inherit]"
							type="text"
							bind:value={block.section}
							placeholder="1"
						/>
					</div>

					<div>
						<label class="text-xs text-[#a1a1aa] mb-1 block" for="blockTypeInput"
							>ประเภท (Badge)</label
						>
						<input
							id="blockTypeInput"
							class="w-full px-3 py-2.5 rounded-lg border border-[#3f3f46] bg-[#27272a] text-white text-sm box-border font-[inherit]"
							type="text"
							bind:value={block.type}
							placeholder="Lecture / Lab"
						/>
					</div>
				</div>

				<span class="text-xs text-[#a1a1aa] mb-1 block">สี (Color)</span>
				<div class="flex gap-2 flex-wrap">
					{#each palette as colorOption (colorOption.id)}
						<button
							type="button"
							class="w-8 h-8 rounded-lg border-2 cursor-pointer {block.colorId === colorOption.id ? 'border-white shadow-[0_0_0_2px_#6366f1]' : 'border-transparent'}"
							style="background: {colorOption.color};"
							onclick={() => {
								if (block) block.colorId = colorOption.id;
							}}
							aria-label="Color option"
						></button>
					{/each}
				</div>

				<label class="flex items-center gap-2 text-[13px] opacity-90 cursor-pointer mt-1">
					<input type="checkbox" bind:checked={block.pattern} />
					<span>มีลาย (Diagonal stripe pattern)</span>
				</label>
			</div>

			<div class="flex gap-2.5 px-5 py-4 border-t border-[#27272a] bg-[#18181b]">
				<button
					type="button"
					class="flex-1 py-2.5 rounded-lg border-none bg-[#ef4444] text-white text-sm font-semibold cursor-pointer font-[inherit]"
					onclick={() => onDelete(block.id)}>ลบวิชานี้</button
				>
				<button
					type="button"
					class="flex-1 py-2.5 rounded-lg border-none bg-[#6366f1] text-white text-sm font-semibold cursor-pointer font-[inherit] hover:bg-[#4f46e5]"
					onclick={onClose}>ตกลง / ปิด</button
				>
			</div>
		</div>
	</div>
{/if}
