<script lang="ts">
	import { Popover } from 'bits-ui';
	import { Check, Plus, Loader2 } from 'lucide-svelte';

	interface Props {
		color: string;
		onChange: (newHex: string) => void;
		buttonText?: string;
		label?: string;
	}

	let { color, onChange, buttonText, label }: Props = $props();

	let containerEl = $state<HTMLDivElement | null>(null);
	let currentColor = $state('');
	let isOpen = $state(false);
	let isLoaded = $state(false);

	$effect(() => {
		if (color) {
			currentColor = color;
		}
	});

	$effect(() => {
		if (isOpen) {
			isLoaded = false;
			if (containerEl && typeof window !== 'undefined') {
				const targetEl = containerEl;
				targetEl.innerHTML = '';
				import('@jaames/iro').then((iroModule) => {
					const iro: any = iroModule.default || iroModule;
					const picker = new iro.ColorPicker(targetEl, {
						width: 170,
						color: currentColor,
						borderWidth: 2,
						borderColor: '#3f3f46',
						layout: [
							{ component: iro.ui.Wheel },
							{ component: iro.ui.Slider, options: { sliderType: 'value' } }
						]
					});

					picker.on('color:change', (c: any) => {
						currentColor = c.hexString;
					});

					isLoaded = true;
				});
			}
		}
	});

	const handleConfirm = () => {
		onChange(currentColor);
		isOpen = false;
	};
</script>

<Popover.Root bind:open={isOpen}>
	{#if buttonText}
		<Popover.Trigger
			class="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-[#2563eb] bg-transparent px-3 py-2 text-xs font-semibold text-[#60a5fa] transition-colors hover:bg-[#2563eb]/10"
			aria-label={buttonText}
		>
			<Plus class="h-4 w-4 shrink-0" />
			<span>{buttonText}</span>
		</Popover.Trigger>
	{:else}
		<Popover.Trigger
			class="relative flex h-8 w-12 cursor-pointer items-center justify-center rounded-lg border border-[#3f3f46] p-0.5 transition-transform hover:scale-105"
			aria-label={label || 'Open Color Wheel'}
			title={label || 'Open Color Wheel'}
		>
			<div class="h-full w-full rounded-md border border-black/20" style="background: {color};"></div>
		</Popover.Trigger>
	{/if}

	<Popover.Portal>
		<Popover.Content
			class="z-[999] flex flex-col items-center gap-3 rounded-2xl border border-[#3f3f46] bg-[#18181b] p-4 text-white shadow-2xl backdrop-blur-md"
			sideOffset={8}
		>
			<div class="relative flex h-[220px] w-[170px] items-center justify-center overflow-hidden">
				{#if !isLoaded}
					<div class="absolute inset-0 flex items-center justify-center">
						<Loader2 class="h-6 w-6 animate-spin text-[#60a5fa]" />
					</div>
				{/if}
				<div
					bind:this={containerEl}
					class="flex items-center justify-center transition-opacity duration-150 {isLoaded
						? 'opacity-100'
						: 'opacity-0'}"
				></div>
			</div>

			<div class="flex w-full items-center justify-between gap-2 border-t border-[#27272a] pt-3">
				<span class="font-[JetBrains_Mono,monospace] text-xs font-bold text-[#a1a1aa] uppercase"
					>{currentColor}</span
				>
				<button
					type="button"
					class="flex cursor-pointer items-center gap-1 rounded-lg border-none bg-[#2563eb] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
					onclick={handleConfirm}
				>
					<Check class="h-3.5 w-3.5" />
					Confirm
				</button>
			</div>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
