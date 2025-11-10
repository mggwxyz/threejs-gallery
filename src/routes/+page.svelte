<script lang="ts">
	import { galleryItems } from '$lib/gallery-config';
</script>

<div class="h-full overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
	<div class="container mx-auto px-6 py-12 max-w-6xl">
		<!-- Hero Section -->
		<div class="text-center mb-16">
			<h1 class="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
				Three.js Gallery
			</h1>
			<p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
				Explore interactive 3D demos showcasing the power of Three.js with WebGL.
				Navigate through different examples using the sidebar menu.
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				<div class="px-4 py-2 bg-gray-800 rounded-lg text-gray-300">
					<span class="font-semibold text-cyan-400">{galleryItems.length}</span> Interactive Examples
				</div>
			</div>
		</div>

		<!-- Features Section -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-white mb-8 text-center">What's Inside</h2>
			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-cyan-500 transition-colors">
					<div class="text-3xl mb-4">🎮</div>
					<h3 class="text-xl font-semibold text-white mb-2">Interactive Controls</h3>
					<p class="text-gray-400">Orbit controls, GUI panels, and mouse interactions for hands-on exploration</p>
				</div>
				<div class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors">
					<div class="text-3xl mb-4">🎨</div>
					<h3 class="text-xl font-semibold text-white mb-2">Visual Effects</h3>
					<p class="text-gray-400">Materials, lighting, shadows, and post-processing effects</p>
				</div>
				<div class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-pink-500 transition-colors">
					<div class="text-3xl mb-4">✨</div>
					<h3 class="text-xl font-semibold text-white mb-2">Animations</h3>
					<p class="text-gray-400">GSAP timeline animations, transforms, and dynamic movements</p>
				</div>
			</div>
		</div>

		<!-- Gallery Preview -->
		<div class="mb-12">
			<h2 class="text-3xl font-bold text-white mb-8 text-center">Gallery Examples</h2>

			<div class="grid md:grid-cols-2 gap-4">
				{#each galleryItems as item}
					<a
						href="/gallery/{item.id}"
						class="group bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-500 transition-all hover:shadow-xl hover:shadow-cyan-500/20"
					>
						<h4 class="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors mb-2">
							{item.title}
						</h4>
						<p class="text-gray-400 text-sm">
							{item.description}
						</p>
					</a>
				{/each}
			</div>
		</div>

		<!-- Getting Started -->
		<div class="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
			<h2 class="text-2xl font-bold text-white mb-4">Ready to Explore?</h2>
			<p class="text-gray-300 mb-6">
				Select any example from the sidebar or click on the cards above to start exploring 3D graphics with Three.js
			</p>
			<a
				href="/gallery/basic-cube"
				class="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-colors"
			>
				Start with Basic Cube
			</a>
		</div>
	</div>
</div>