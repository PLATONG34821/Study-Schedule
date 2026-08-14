<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { FileCode } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onImport: (codeString: string) => Promise<boolean> | boolean;
	}

	let { isOpen, onClose, onImport }: Props = $props();

	let inputCode = $state('');
	let errorMsg = $state('');

	$effect(() => {
		if (isOpen) {
			inputCode = '';
			errorMsg = '';
		}
	});

	const handleApplyImport = async () => {
		if (!inputCode.trim()) return;
		const success = await onImport(inputCode);
		if (success) {
			onClose();
		} else {
			errorMsg = m.invalid_code();
		}
	};
</script>

<Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs" />
		<Dialog.Content class="fixed left-1/2 top-1/2 z-[999] flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-2xl border border-[#3f3f46] bg-[#18181b] p-0 text-[#e4e4e7] shadow-2xl">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-[#27272a] px-5 py-4">
				<div class="flex items-center gap-2">
					<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb]/20 text-[#60a5fa]">
						<FileCode class="h-4 w-4" />
					</div>
					<Dialog.Title class="m-0 text-base font-bold text-white">{m.import_code()}</Dialog.Title>
				</div>
				<Dialog.Close
					class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent text-sm text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
					aria-label="Close dialog"
					title="Close dialog">✕</Dialog.Close>
			</div>

			<!-- Body -->
			<div class="flex flex-col gap-3 p-5">
				<p class="m-0 text-xs text-[#a1a1aa]">
					{getLocale() === 'th'
						? 'วางโค้ดการตั้งค่าที่ส่งออกไว้ด้านล่างแล้วกดนำเข้า'
						: 'Paste exported configuration code below and click apply.'}
				</p>
				<textarea
					class="box-border h-32 w-full resize-none rounded-lg border border-[#3f3f46] bg-[#27272a] p-3 font-[JetBrains_Mono,monospace] text-xs break-all text-white focus:border-[#2563eb] focus:outline-none"
					placeholder={m.paste_code_here()}
					bind:value={inputCode}></textarea>
				{#if errorMsg}
					<p class="m-0 text-xs font-semibold text-[#ef4444]">{errorMsg}</p>
				{/if}
			</div>

			<!-- Footer -->
			<div class="flex justify-end gap-2.5 border-t border-[#27272a] bg-[#18181b] px-5 py-4">
				<Dialog.Close
					class="cursor-pointer rounded-lg border border-[#3f3f46] bg-[#27272a] px-4 py-2 text-xs font-semibold text-[#a1a1aa] hover:text-white"
					>Cancel</Dialog.Close>
				<button
					type="button"
					class="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#2563eb] px-5 py-2 font-[inherit] text-xs font-semibold text-white hover:bg-[#1d4ed8]"
					onclick={handleApplyImport}
				>
					{m.apply_code()}
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
