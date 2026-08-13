<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	interface Props {
		isOpen: boolean;
		mode: 'export' | 'import';
		code: string;
		onClose: () => void;
		onImport: (codeString: string) => Promise<boolean> | boolean;
	}

	let { isOpen, mode, code, onClose, onImport }: Props = $props();

	let inputCode = $state('');
	let copied = $state(false);
	let errorMsg = $state('');

	$effect(() => {
		if (isOpen) {
			inputCode = mode === 'export' ? code : '';
			copied = false;
			errorMsg = '';
		}
	});

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// fallback
		}
	};

	const handleApply = async () => {
		if (!inputCode.trim()) return;
		const success = await onImport(inputCode);
		if (success) {
			onClose();
		} else {
			errorMsg = m.invalid_code();
		}
	};

	const handleBackdropClick = (e: MouseEvent) => {
		if ((e.target as HTMLElement).classList.contains('modalBackdrop')) {
			onClose();
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (isOpen && e.key === 'Escape') {
			onClose();
		}
	};
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="modalBackdrop fixed inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center z-[999] p-4"
		onclick={handleBackdropClick}
	>
		<div
			class="bg-[#18181b] text-[#e4e4e7] border border-[#3f3f46] rounded-2xl w-full max-w-[500px] shadow-none flex flex-col overflow-hidden animate-popIn"
		>
			<div class="flex items-center justify-between px-5 py-[18px] border-b border-[#27272a]">
				<h2 class="m-0 text-lg font-bold text-white">
					{mode === 'export' ? m.export_code() : m.import_code()}
				</h2>
				<button
					type="button"
					class="bg-transparent border-none text-[#a1a1aa] text-lg cursor-pointer p-1 hover:text-white"
					onclick={onClose}>✕</button
				>
			</div>

			<div class="p-5 flex flex-col gap-3">
				{#if mode === 'export'}
					<p class="text-xs text-[#a1a1aa] m-0">
						{getLocale() === 'th'
							? 'คัดลอกโค้ดการตั้งค่าด้านล่างเพื่อนำไปใช้บนเครื่องหรือเบราว์เซอร์อื่น'
							: 'Copy the configuration code below to transfer your schedule settings.'}
					</p>
					<textarea
						class="w-full h-28 p-3 rounded-lg border border-[#3f3f46] bg-[#27272a] text-white text-xs font-[JetBrains_Mono,monospace] resize-none focus:outline-none focus:border-[#6366f1] box-border break-all"
						readonly
						value={code}
						onclick={(e) => (e.target as HTMLTextAreaElement).select()}
					></textarea>
				{:else}
					<p class="text-xs text-[#a1a1aa] m-0">
						{getLocale() === 'th'
							? 'วางโค้ดการตั้งค่า (S3 / S2 / JSON) ที่ส่งออกไว้ด้านล่างแล้วกดนำเข้า'
							: 'Paste exported configuration code below and click apply.'}
					</p>
					<textarea
						class="w-full h-28 p-3 rounded-lg border border-[#3f3f46] bg-[#27272a] text-white text-xs font-[JetBrains_Mono,monospace] resize-none focus:outline-none focus:border-[#6366f1] box-border break-all"
						placeholder={m.paste_code_here()}
						bind:value={inputCode}
					></textarea>
					{#if errorMsg}
						<p class="text-xs text-[#ef4444] font-semibold m-0">{errorMsg}</p>
					{/if}
				{/if}
			</div>

			<div class="flex gap-2.5 px-5 py-4 border-t border-[#27272a] bg-[#18181b] justify-end">
				{#if mode === 'export'}
					<button
						type="button"
						class="py-2.5 px-5 rounded-lg border-none bg-[#6366f1] text-white text-sm font-semibold cursor-pointer font-[inherit] hover:bg-[#4f46e5] flex items-center gap-2"
						onclick={handleCopy}
					>
						{#if copied}
							✓ {m.copied()}
						{:else}
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
							</svg>
							{m.copy_code()}
						{/if}
					</button>
				{:else}
					<button
						type="button"
						class="py-2.5 px-4 rounded-lg border border-[#3f3f46] bg-[#27272a] text-[#a1a1aa] text-sm font-semibold cursor-pointer font-[inherit] hover:text-white"
						onclick={onClose}>{m.save_close()}</button
					>
					<button
						type="button"
						class="py-2.5 px-5 rounded-lg border-none bg-[#6366f1] text-white text-sm font-semibold cursor-pointer font-[inherit] hover:bg-[#4f46e5]"
						onclick={handleApply}>{m.apply_code()}</button
					>
				{/if}
			</div>
		</div>
	</div>
{/if}
