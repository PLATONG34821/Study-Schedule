<script lang="ts">
	import { dndState } from '@thisux/sveltednd';
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
	let isDarkBg = $derived(textVal === '#ffffff');

	const handleSelect = () => {
		if (!dndState.isDragging) {
			onSelect();
		}
	};
</script>

<div
	role="button"
	tabindex="0"
	class="relative box-border flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[14px] border-[2.5px] border-[#111111] px-3.5 py-3 text-left shadow-none transition-transform duration-100 ease-in-out hover:-translate-x-px hover:-translate-y-px {isSelected
		? 'outline-3 outline-offset-2 outline-[#2563eb]'
		: ''}"
	style="background: {colorVal}; color: {textVal};"
	onclick={handleSelect}
	onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect()}
>
	{#if block.pattern}
		<div
			class="pointer-events-none absolute inset-0"
			style="background: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px);"
		></div>
	{/if}
	<div class="relative z-[1] flex h-full w-full flex-col justify-start gap-1.5">
		<div class="leading-snug font-extrabold break-words" style="font-size: {fontSizeTitle}px;">
			{block.title}
		</div>
		<div class="flex flex-col gap-1.5">
			{#if block.time || block.room}
				<div class="flex flex-wrap items-center gap-1">
					{#if block.time}<span
							class="shrink-0 rounded-xl border-[1.5px] border-[#111111] px-2 py-0.5 font-[JetBrains_Mono,monospace] font-semibold {isDarkBg
								? 'bg-white/95 text-[#111111]'
								: 'bg-[#111111]/90 text-white'}"
							style="font-size: {fontSizeBadge}px;">{block.time}</span
						>{/if}
					{#if block.room}<span
							class="shrink-0 rounded-xl border-[1.5px] border-[#111111] px-2 py-0.5 font-[JetBrains_Mono,monospace] font-semibold {isDarkBg
								? 'bg-white/95 text-[#111111]'
								: 'bg-[#111111]/90 text-white'}"
							style="font-size: {fontSizeBadge}px;">{block.room}</span
						>{/if}
				</div>
			{/if}
			{#if block.section || block.type}
				<div class="flex flex-wrap items-center gap-1">
					{#if block.section}<span
							class="shrink-0 rounded border-[1.5px] border-[#111111] px-1.5 py-0.5 font-[JetBrains_Mono,monospace] font-bold {isDarkBg
								? 'bg-white text-[#111111]'
								: 'bg-[#111111] text-white'}"
							style="font-size: {fontSizeBadge}px;">Sec {block.section}</span
						>{/if}
					{#if block.type}<span
							class="shrink-0 rounded border-[1.5px] border-[#111111] px-1.5 py-0.5 font-[JetBrains_Mono,monospace] font-bold uppercase {isDarkBg
								? 'bg-[#111111] text-white'
								: 'bg-white text-[#111111]'}"
							style="font-size: {fontSizeBadge}px;">{block.type}</span
						>{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
