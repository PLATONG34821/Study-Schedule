<script lang="ts">
	import { Download, Copy, Check, Loader2 } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	interface Props {
		isOpen: boolean;
		initialTab?: 'image' | 'share' | 'code';
		isExporting?: boolean;
		exportPixelRatio: 1 | 2 | 4;
		code: string;
		shareUrl: string;
		linkCopied?: boolean;
		onClose: () => void;
		onExportImage: () => void;
		onShareLink: () => void;
	}

	let {
		isOpen,
		initialTab = 'image',
		isExporting = false,
		exportPixelRatio = $bindable(2),
		code,
		shareUrl,
		linkCopied = false,
		onClose,
		onExportImage,
		onShareLink
	}: Props = $props();

	let activeTab = $state<'image' | 'share' | 'code'>('image');
	let codeCopied = $state(false);

	let dialogEl = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (isOpen) {
			activeTab = initialTab === 'code' || initialTab === 'share' ? initialTab : 'image';
			codeCopied = false;
			if (dialogEl && !dialogEl.open) {
				dialogEl.showModal();
			}
		} else if (dialogEl && dialogEl.open) {
			dialogEl.close();
		}
	});

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(code);
			codeCopied = true;
			setTimeout(() => {
				codeCopied = false;
			}, 2000);
		} catch {
			// fallback
		}
	};

	const handleCancel = (e: Event) => {
		e.preventDefault();
		onClose();
	};

	const handleBackdropClick = (e: MouseEvent) => {
		if (!dialogEl) return;
		const rect = dialogEl.getBoundingClientRect();
		const isClickInside =
			rect.top <= e.clientY &&
			e.clientY <= rect.bottom &&
			rect.left <= e.clientX &&
			e.clientX <= rect.right;
		if (!isClickInside) {
			onClose();
		}
	};
</script>

{#if isOpen}
	<dialog
		bind:this={dialogEl}
		oncancel={handleCancel}
		onclick={handleBackdropClick}
		class="fixed inset-0 z-[999] m-auto flex max-h-[90vh] w-full max-w-[480px] animate-popIn flex-col overflow-y-auto rounded-2xl border border-[#3f3f46] bg-[#18181b] p-0 text-[#e4e4e7] shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-[4px]"
	>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-[#27272a] px-5 py-4">
				<div class="flex items-center gap-2">
					<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb]/20 text-[#60a5fa]">
						<Download class="h-4 w-4" />
					</div>
					<h2 class="m-0 text-base font-bold text-white">Export & Share</h2>
				</div>
				<button
					type="button"
					class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent text-sm text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
					onclick={onClose}
					aria-label="Close dialog"
					title="Close dialog">✕</button
				>
			</div>

			<!-- Navigation Tabs -->
			<div class="flex border-b border-[#27272a] bg-[#121214] p-1.5 gap-1">
				<button
					type="button"
					class="flex-1 rounded-lg py-2 text-xs font-semibold transition-colors {activeTab === 'image'
						? 'bg-[#2563eb] text-white shadow-sm'
						: 'text-[#a1a1aa] hover:text-white'}"
					onclick={() => (activeTab = 'image')}
				>
					{m.export_png()}
				</button>
				<button
					type="button"
					class="flex-1 rounded-lg py-2 text-xs font-semibold transition-colors {activeTab === 'share'
						? 'bg-[#2563eb] text-white shadow-sm'
						: 'text-[#a1a1aa] hover:text-white'}"
					onclick={() => (activeTab = 'share')}
				>
					{m.share_link()}
				</button>
				<button
					type="button"
					class="flex-1 rounded-lg py-2 text-xs font-semibold transition-colors {activeTab === 'code'
						? 'bg-[#2563eb] text-white shadow-sm'
						: 'text-[#a1a1aa] hover:text-white'}"
					onclick={() => (activeTab = 'code')}
				>
					{m.export_code()}
				</button>
			</div>

			<!-- Body Content -->
			<div class="flex flex-col gap-4 p-5">
				{#if activeTab === 'image'}
					<div class="flex flex-col gap-3">
						<div class="flex items-center justify-between rounded-xl border border-[#3f3f46] bg-[#27272a] p-3.5">
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-semibold text-white">Image Resolution</span>
								<span class="text-[11px] text-[#a1a1aa]">Select PNG render quality</span>
							</div>
							<div class="flex gap-1 rounded-lg border border-[#3f3f46] bg-[#18181b] p-1">
								{#each [1, 2, 4] as ratio (ratio)}
									<button
										type="button"
										class="rounded px-2.5 py-1 text-xs font-bold transition-colors {exportPixelRatio ===
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
							type="button"
							class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-[#2563eb] py-3.5 font-[inherit] text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
							onclick={onExportImage}
							disabled={isExporting}
						>
							{#if isExporting}
								<Loader2 class="h-4.5 w-4.5 animate-spin" />
								{m.exporting()}
							{:else}
								<Download class="h-4.5 w-4.5" />
								Download PNG ({exportPixelRatio}x)
							{/if}
						</button>
					</div>
				{:else if activeTab === 'share'}
					<div class="flex flex-col gap-3">
						<p class="m-0 text-xs text-[#a1a1aa]">
							{getLocale() === 'th'
								? 'คัดลอกลิงก์เพื่อแชร์ตารางเรียนให้เพื่อนดู'
								: 'Share your schedule with anyone using this direct link.'}
						</p>
						<div class="flex gap-2">
							<input
								type="text"
								readonly
								value={shareUrl}
								class="flex-1 rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2 font-[JetBrains_Mono,monospace] text-xs text-white focus:outline-none"
								onclick={(e) => (e.target as HTMLInputElement).select()}
							/>
							<button
								type="button"
								class="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
								onclick={onShareLink}
							>
								{#if linkCopied}
									<Check class="h-3.5 w-3.5" /> {m.link_copied()}
								{:else}
									{m.share_link()}
								{/if}
							</button>
						</div>
					</div>
				{:else if activeTab === 'code'}
					<div class="flex flex-col gap-3">
						<p class="m-0 text-xs text-[#a1a1aa]">
							{getLocale() === 'th'
								? 'คัดลอกโค้ดการตั้งค่าด้านล่างเพื่อสำรองข้อมูลหรือนำไปเปิดบนเครื่องอื่น'
								: 'Copy the compressed configuration code below for backup or transfer.'}
						</p>
						<textarea
							class="box-border h-28 w-full resize-none rounded-lg border border-[#3f3f46] bg-[#27272a] p-3 font-[JetBrains_Mono,monospace] text-xs break-all text-white focus:border-[#2563eb] focus:outline-none"
							readonly
							value={code}
							onclick={(e) => (e.target as HTMLTextAreaElement).select()}></textarea>
						<button
							type="button"
							class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-[#2563eb] py-2.5 font-[inherit] text-xs font-semibold text-white hover:bg-[#1d4ed8]"
							onclick={handleCopyCode}
						>
							{#if codeCopied}
								<Check class="h-3.5 w-3.5" /> {m.copied()}
							{:else}
								<Copy class="h-3.5 w-3.5" />
								{m.copy_code()}
							{/if}
						</button>
					</div>
				{/if}
			</div>
</dialog>
{/if}
