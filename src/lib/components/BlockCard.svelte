<script lang="ts">
	import type { ClassBlock, PaletteColor } from '$lib/types';
	import { textColorFor } from '$lib/utils';

	interface Props {
		block: ClassBlock;
		palette: PaletteColor[];
		isSelected: boolean;
		onSelect: () => void;
	}

	let { block, palette, isSelected, onSelect }: Props = $props();

	let colorObj = $derived(palette.find((c) => c.id === block.colorId));
	let colorVal = $derived(colorObj ? colorObj.color : '#dddddd');
	let textVal = $derived(textColorFor(colorVal));
</script>

<button
	type="button"
	class="rounded-[14px] px-3.5 py-3 cursor-pointer relative overflow-hidden border-[2.5px] border-[#111111] shadow-none transition-transform duration-100 ease-in-out text-left w-full h-full flex flex-col justify-between box-border hover:-translate-x-px hover:-translate-y-px {isSelected ? 'outline-3 outline-[#6366f1] outline-offset-2' : ''}"
	style="background: {colorVal}; color: {textVal};"
	onclick={onSelect}
>
	{#if block.pattern}
		<div
			class="absolute inset-0 pointer-events-none"
			style="background: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px);"
		></div>
	{/if}
	<div class="relative z-[1] flex flex-col justify-between h-full w-full gap-2">
		<div class="font-bold text-[15px] leading-[1.25] break-words">{block.title}</div>
		<div class="flex flex-col gap-1.5 mt-auto">
			<div class="flex flex-wrap gap-1 items-center">
				{#if block.time}<span
						class="bg-white/90 text-[#111111] font-[JetBrains_Mono,monospace] text-[11px] font-semibold px-2 py-0.5 rounded-xl border-[1.5px] border-[#111111]"
					>{block.time}</span
				>{/if}
				{#if block.room}<span
						class="bg-white/90 text-[#111111] font-[JetBrains_Mono,monospace] text-[11px] font-semibold px-2 py-0.5 rounded-xl border-[1.5px] border-[#111111]"
					>{block.room}</span
				>{/if}
			</div>
			<div class="flex flex-wrap gap-1 items-center">
				{#if block.section}<span
						class="bg-white text-[#111111] font-[JetBrains_Mono,monospace] text-[11px] font-bold px-1.5 py-0.5 rounded border-[1.5px] border-[#111111]"
					>Sec {block.section}</span
				>{/if}
				{#if block.type}<span
						class="bg-[#111111] text-white font-[JetBrains_Mono,monospace] text-[11px] font-bold px-1.5 py-0.5 rounded border-[1.5px] border-[#111111] uppercase"
					>{block.type}</span
				>{/if}
			</div>
		</div>
	</div>
</button>
