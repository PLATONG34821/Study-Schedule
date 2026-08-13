<script lang="ts">
	import type { ClassBlock, PaletteColor } from '$lib/types';
	import { textColorFor } from '$lib/utils';

	interface Props {
		block: ClassBlock;
		palette: PaletteColor[];
		isSelected: boolean;
		fontSizeTitle?: number;
		fontSizeBadge?: number;
		onSelect: () => void;
	}

	let {
		block,
		palette,
		isSelected,
		fontSizeTitle = 20,
		fontSizeBadge = 11,
		onSelect
	}: Props = $props();

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
	<div class="relative z-[1] flex flex-col justify-start h-full w-full gap-1.5">
		<div
			class="font-extrabold leading-snug break-words"
			style="font-size: {fontSizeTitle}px;"
		>{block.title}</div>
		<div class="flex flex-col gap-1.5">
			{#if block.time || block.room}
				<div class="flex flex-wrap gap-1 items-center">
					{#if block.time}<span
							class="bg-white/90 text-[#111111] font-[JetBrains_Mono,monospace] font-semibold px-2 py-0.5 rounded-xl border-[1.5px] border-[#111111] shrink-0"
							style="font-size: {fontSizeBadge}px;"
						>{block.time}</span
					>{/if}
					{#if block.room}<span
							class="bg-white/90 text-[#111111] font-[JetBrains_Mono,monospace] font-semibold px-2 py-0.5 rounded-xl border-[1.5px] border-[#111111] shrink-0"
							style="font-size: {fontSizeBadge}px;"
						>{block.room}</span
					>{/if}
				</div>
			{/if}
			{#if block.section || block.type}
				<div class="flex flex-wrap gap-1 items-center">
					{#if block.section}<span
							class="bg-white text-[#111111] font-[JetBrains_Mono,monospace] font-bold px-1.5 py-0.5 rounded border-[1.5px] border-[#111111] shrink-0"
							style="font-size: {fontSizeBadge}px;"
						>Sec {block.section}</span
					>{/if}
					{#if block.type}<span
							class="bg-[#111111] text-white font-[JetBrains_Mono,monospace] font-bold px-1.5 py-0.5 rounded border-[1.5px] border-[#111111] uppercase shrink-0"
							style="font-size: {fontSizeBadge}px;"
						>{block.type}</span
					>{/if}
				</div>
			{/if}
		</div>
	</div>
</button>
