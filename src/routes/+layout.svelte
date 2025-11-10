<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { galleryItems } from '$lib/gallery-config';

	let { children } = $props();

	// Mobile menu state
	let isMobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	// Close mobile menu when route changes
	$effect(() => {
		$page.url;
		isMobileMenuOpen = false;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Three.js Gallery</title>
</svelte:head>

<div class="flex h-screen bg-gray-100">
	<!-- Mobile menu button -->
	<button
		onclick={toggleMobileMenu}
		class="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white lg:hidden hover:bg-gray-700 transition-colors"
		aria-label="Toggle menu"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			{#if isMobileMenuOpen}
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			{:else}
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			{/if}
		</svg>
	</button>

	<!-- Sidebar -->
	<nav class={`
		fixed lg:sticky top-0 left-0 h-full w-64 bg-gray-800 text-white z-40
		transform transition-transform duration-300 ease-in-out overflow-y-auto
		${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
	`}>
		<div class="p-6">
			<h1 class="text-2xl font-bold mb-8 text-cyan-400">Three.js Gallery</h1>

			<!-- Home link -->
			<div class="mb-6">
				<a
					href="/"
					class={`block px-4 py-2 rounded-lg transition-colors ${
						$page.url.pathname === '/'
							? 'bg-cyan-600 text-white'
							: 'hover:bg-gray-700'
					}`}
				>
					🏠 Home
				</a>
			</div>

			<!-- Gallery sections -->
			<div class="space-y-2">
				<h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Examples</h2>

				{#each galleryItems as item}
					<a
						href="/gallery/{item.id}"
						class={`block px-4 py-3 rounded-lg transition-colors ${
							$page.url.pathname === `/gallery/${item.id}`
								? 'bg-cyan-600 text-white'
								: 'hover:bg-gray-700'
						}`}
					>
						<div class="font-medium">{item.title}</div>
						<div class="text-xs text-gray-400 mt-1">
							{item.description}
						</div>
					</a>
				{/each}
			</div>

			<!-- Footer links -->
			<div class="mt-12 pt-6 border-t border-gray-700 space-y-2">
				<a href="https://threejs.org" target="_blank" class="block px-4 py-2 text-sm hover:bg-gray-700 rounded-lg transition-colors">
					📚 Three.js Docs
				</a>
				<a href="https://github.com" target="_blank" class="block px-4 py-2 text-sm hover:bg-gray-700 rounded-lg transition-colors">
					💻 GitHub
				</a>
			</div>
		</div>
	</nav>

	<!-- Main content -->
	<main class="flex-1 overflow-hidden">
		{@render children()}
	</main>
</div>

<!-- Mobile menu overlay -->
{#if isMobileMenuOpen}
	<button
		onclick={toggleMobileMenu}
		class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
		aria-label="Close menu"
	></button>
{/if}
