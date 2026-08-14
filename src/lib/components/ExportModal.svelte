<script lang="ts">
	import { Dialog } from 'bits-ui';
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

	$effect(() => {
		if (isOpen) {
			activeTab = initialTab === 'code' || initialTab === 'share' ? initialTab : 'image';
			codeCopied = false;
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
</script>

<Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs" />
		<Dialog.Content class="fixed left-1/2 top-1/2 z-[999] flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-2xl border border-[#3f3f46] bg-[#18181b] p-0 text-[#e4e4e7] shadow-2xl">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-[#27272a] px-5 py-4">
				<div class="flex items-center gap-2">
					<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb]/20 text-[#60a5fa]">
						<Download class="h-4 w-4" />
					</div>
					<Dialog.Title class="m-0 text-base font-bold text-white">Export & Share</Dialog.Title>
				</div>
				<Dialog.Close
					class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent text-sm text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
					aria-label="Close dialog"
					title="Close dialog">✕</Dialog.Close>
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

			<!-- Tab Content -->
			<div class="p-5">
				{#if activeTab === 'image'}
					<div class="flex flex-col gap-4">
						<p class="m-0 text-xs text-[#a1a1aa]">
							{getLocale() === 'th'
								? 'ดาวน์โหลดตารางเรียนของคุณเป็นไฟล์ภาพ PNG คุณภาพสูง'
								: 'Download your schedule grid as a high-quality PNG image file.'}
						</p>

						<div class="flex flex-col gap-2">
							<label class="text-xs font-medium text-[#a1a1aa]" for="pixelRatioSelect"
								>Resolution</label
							>
							<div class="grid grid-cols-3 gap-2">
								<button
									type="button"
									class="rounded-lg border px-3 py-2 text-xs font-semibold transition-colors {exportPixelRatio ===
									1
										? 'border-[#2563eb] bg-[#2563eb]/20 text-[#60a5fa]'
										: 'border-[#3f3f46] bg-[#27272a] text-[#a1a1aa] hover:text-white'}"
									onclick={() => (exportPixelRatio = 1)}
								>
									1x (Standard)
								</button>
								<button
									type="button"
									class="rounded-lg border px-3 py-2 text-xs font-semibold transition-colors {exportPixelRatio ===
									2
										? 'border-[#2563eb] bg-[#2563eb]/20 text-[#60a5fa]'
										: 'border-[#3f3f46] bg-[#27272a] text-[#a1a1aa] hover:text-white'}"
									onclick={() => (exportPixelRatio = 2)}
								>
									2x (HD Retinal)
								</button>
								<button
									type="button"
									class="rounded-lg border px-3 py-2 text-xs font-semibold transition-colors {exportPixelRatio ===
									4
										? 'border-[#2563eb] bg-[#2563eb]/20 text-[#60a5fa]'
										: 'border-[#3f3f46] bg-[#27272a] text-[#a1a1aa] hover:text-white'}"
									onclick={() => (exportPixelRatio = 4)}
								>
									4x (Ultra HD)
								</button>
							</div>
						</div>

						<button
							type="button"
							class="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-[#2563eb] py-3 text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-50"
							disabled={isExporting}
							onclick={onExportImage}
						>
							{#if isExporting}
								<Loader2 class="h-4 w-4 animate-spin" />
								{m.exporting()}
							{:else}
								<Download class="h-4 w-4" />
								Download PNG ({exportPixelRatio}x)
							{/if}
						</button>
					</div>
				{:else if activeTab === 'share'}
					<div class="flex flex-col gap-4">
						<p class="m-0 text-xs text-[#a1a1aa]">
							{getLocale() === 'th'
								? 'คัดลอกลิงก์เพื่อแชร์ตารางเรียนของคุณให้เพื่อนเปิดในเบราว์เซอร์ได้ทันที'
								: 'Copy this link to share your schedule with friends to view in their browser instantly.'}
						</p>

						<div class="flex gap-2">
							<input
								type="text"
								readonly
								class="box-border flex-1 rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2 font-[JetBrains_Mono,monospace] text-xs text-white focus:outline-none"
								value={shareUrl}
							/>
							<button
								type="button"
								class="flex cursor-pointer items-center gap-1.5 shrink-0 rounded-lg border-none bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
								onclick={onShareLink}
							>
								{#if linkCopied}
									<Check class="h-3.5 w-3.5" /> {m.copied()}
								{:else}
									<Copy class="h-3.5 w-3.5" />
									Copy Link
								{/if}
							</button>
						</div>
					</div>
				{:else if activeTab === 'code'}
					<div class="flex flex-col gap-4">
						<p class="m-0 text-xs text-[#a1a1aa]">
							{getLocale() === 'th'
								? 'คัดลอกโค้ดการตั้งค่าด้านล่างเพื่อนำไปสำรองข้อมูลหรือนำเข้าในอุปกรณ์อื่น'
								: 'Copy configuration code below to backup or import on another device.'}
						</p>

						<textarea
							readonly
							class="box-border h-28 w-full resize-none rounded-lg border border-[#3f3f46] bg-[#27272a] p-3 font-[JetBrains_Mono,monospace] text-xs break-all text-white focus:outline-none"
							value={code}
						></textarea>

						<button
							type="button"
							class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-[#2563eb] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
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
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
