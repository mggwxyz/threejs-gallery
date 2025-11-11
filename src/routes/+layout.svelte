<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { galleryItems } from '../gallery-config';

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

	const resources = [
		{
			label: 'Three.js',
			href: 'https://threejs.org'
		},
		{
			label: 'Three.js Journey',
			href: 'https://threejs-journey.com/',
		},
		{
			label: 'GitHub',
			href: 'https://github.com/mrdoob/three.js/',
		}
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Three.js Gallery</title>
</svelte:head>

<div class="layout-container">
	<!-- Mobile menu button -->
	<button
		onclick={toggleMobileMenu}
		class="mobile-menu-button"
		aria-label="Toggle menu"
	>
		<svg class="icon" viewBox="0 0 24 24">
			{#if isMobileMenuOpen}
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			{:else}
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			{/if}
		</svg>
	</button>

	<!-- Sidebar -->
	<nav class="sidebar pico" class:open={isMobileMenuOpen}>
		<div class="sidebar-content">
			<h1>Three.js Gallery</h1>

			<!-- Gallery sections -->
			<div class="nav-section">
				<h2>Examples</h2>
				{#each galleryItems as item}
					<a
						href="/gallery/{item.id}"
						class="nav-link"
						class:active={$page.url.pathname === `/gallery/${item.id}`}
					>
						<div>{item.title}</div>
					</a>
				{/each}
			</div>

			<hr/>

			<!-- Footer links -->
			<div class="resources-section">
				<h2>Resources</h2>
				{#each resources as resource}
					<a href={resource.href} target="_blank" class="resource-link">
						{resource.label}
					</a>
				{/each}
			</div>
		</div>
	</nav>

	<!-- Main content -->
	<main class="main-content">
		{@render children()}
	</main>
</div>

<!-- Mobile menu overlay -->
{#if isMobileMenuOpen}
	<button
		onclick={toggleMobileMenu}
		class="mobile-overlay"
		aria-label="Close menu"
	></button>
{/if}

<style>
	.layout-container {
		display: flex;
		height: 100vh;
	}

	.mobile-menu-button {
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 50;
		padding: 0.5rem;
		border-radius: 0.5rem;
		background-color: var(--pico-primary);
		color: white;
		border: none;
		cursor: pointer;
		display: none;

		@media (max-width: 992px) {
			display: block;
		}

		&:hover {
			background-color: var(--pico-primary-hover);
		}

		& .icon {
			width: 1.5rem;
			height: 1.5rem;
			fill: none;
			stroke: currentColor;
		}
	}

	.sidebar {
		position: sticky;
		top: 0;
		left: 0;
		height: 100vh;
		width: 16rem;
		z-index: 40;
		overflow-y: auto;
		border-right: 1px solid var(--pico-muted-border-color);
		transition: transform 0.3s ease-in-out;

		@media (max-width: 992px) {
			position: fixed;
			transform: translateX(-100%);

			&.open {
				transform: translateX(0);
			}
		}

		& a {
			display: block;
		}

		& h1 {
			font-size: 1.5rem;
			font-weight: bold;
			margin-bottom: 2rem;
		}

		& h2 {
			font-size: 0.875rem;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			margin-bottom: 1rem;
			color: var(--pico-muted-color);
		}
	}

	.sidebar-content {
		padding: 1.5rem;
	}



	.main-content {
		flex: 1;
		overflow: hidden;
	}

	.mobile-overlay {
		display: none;

		@media (max-width: 992px) {
			display: block;
			position: fixed;
			inset: 0;
			background-color: rgba(0, 0, 0, 0.5);
			z-index: 30;
		}
	}
</style>