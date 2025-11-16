import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { randomNumber } from '../helpers/randomNum';

export default function init(canvas: HTMLCanvasElement) {
	// Scene setup
	const scene = new THREE.Scene();
	scene.background = new THREE.Color('white');

	// Textures
	const textureLoader = new THREE.TextureLoader();
	const matCapTexture = textureLoader.load('/textures/matcaps/3.png');
	matCapTexture.colorSpace = THREE.SRGBColorSpace;

	// Store text bounding box for collision detection
	let textBoundingBox: THREE.Box3 | null = null;
	// Store placed donut positions to prevent intersections
	const placedDonutPositions: THREE.Vector3[] = [];

	// Function to check if a position would collide with the text
	function isPositionSafeFromText(x: number, y: number, z: number, radius: number): boolean {
		if (!textBoundingBox) return true; // If text isn't loaded yet, allow placement

		// Create a bounding sphere for the donut at the proposed position
		const donutSphere = new THREE.Sphere(new THREE.Vector3(x, y, z), radius * 1.5); // 1.5x for safety margin

		// Check if the sphere intersects with the text bounding box
		return !textBoundingBox.intersectsSphere(donutSphere);
	}

	// Function to check if a position would collide with other donuts
	function isPositionSafeFromDonuts(x: number, y: number, z: number, radius: number): boolean {
		const minDistance = radius * 2.5; // Minimum distance between donut centers (2.5x radius for safety)
		const proposedPosition = new THREE.Vector3(x, y, z);

		for (const placedPosition of placedDonutPositions) {
			const distance = proposedPosition.distanceTo(placedPosition);
			if (distance < minDistance) {
				return false;
			}
		}
		return true;
	}

	// Function to generate safe random position for donuts
	function getRandomSafePosition(radius: number): THREE.Vector3 | null {
		let attempts = 0;
		const maxAttempts = 500; // Increased attempts for better placement

		while (attempts < maxAttempts) {
			const x = randomNumber(-3, 3); // Expanded range for more space
			const y = randomNumber(-3, 3);
			const z = randomNumber(-3, 3);

			if (isPositionSafeFromText(x, y, z, radius) && isPositionSafeFromDonuts(x, y, z, radius)) {
				const position = new THREE.Vector3(x, y, z);
				placedDonutPositions.push(position);
				return position;
			}
			attempts++;
		}

		return null; // No safe position found
	}

	// Font
	const fontLoader = new FontLoader();
	fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
		const textGeometry = new TextGeometry('WOAH', {
			font: font,
			size: 0.5,
			depth: 0.2,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 0.03,
			bevelSize: 0.02,
			bevelOffset: 0,
			bevelSegments: 5
		});
		textGeometry.center();

		// Calculate bounding box for the text
		textGeometry.computeBoundingBox();
		textBoundingBox = textGeometry.boundingBox!.clone();
		// Add some padding to the bounding box
		textBoundingBox.expandByScalar(0.1);

		const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matCapTexture });
		const textMesh = new THREE.Mesh(textGeometry, textMaterial);

		scene.add(textMesh);

		// Share material for donuts (don't create a new material for each donut)
		const donutMaterial = new THREE.MeshMatcapMaterial({ matcap: matCapTexture });
		const donutRadius = 0.05; // Much smaller radius
		const donutInnerRadius = 0.03; // Much smaller inner radius

		// Create random donuts
		let donutCount = 0;
		const maxDonuts = 200; // Can create more since they're smaller
		let failedAttempts = 0;
		const maxFailedAttempts = 50; // Stop after too many consecutive failures

		while (donutCount < maxDonuts && failedAttempts < maxFailedAttempts) {
			const donutGeometry = new THREE.TorusGeometry(donutRadius, donutInnerRadius, 8, 16);
			const donut = new THREE.Mesh(donutGeometry, donutMaterial);

			const position = getRandomSafePosition(donutRadius);

			if (position) {
				donut.position.set(position.x, position.y, position.z);

				// Random rotation
				donut.rotation.x = Math.random() * Math.PI;
				donut.rotation.y = Math.random() * Math.PI;

				// Random scale (smaller range since donuts are already small)
				const scale = randomNumber(0.8, 1.2);
				donut.scale.set(scale, scale, scale);

				scene.add(donut);
				donutCount++;
				failedAttempts = 0; // Reset failed attempts counter
			} else {
				failedAttempts++;
			}
		}
	});

	// Add lighting
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
	directionalLight.position.set(5, 10, 5);
	directionalLight.castShadow = true;
	scene.add(directionalLight);

	// Camera setup
	const camera = new THREE.PerspectiveCamera(
		75,
		canvas.clientWidth / canvas.clientHeight,
		0.1,
		1000
	);
	camera.position.set(1, 1, 1.5);
	camera.lookAt(0, 0, 0);

	// Configure Orbit Controls
	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.maxPolarAngle = Math.PI / 2 - 0.1;

	// Renderer setup
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.setSize(canvas.clientWidth, canvas.clientHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	// Handle window resize
	const handleResize = () => {
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	};

	window.addEventListener('resize', handleResize);

	// Animation
	let animationId: number;

	function animate() {
		animationId = requestAnimationFrame(animate);

		controls.update();
		renderer.render(scene, camera);
	}

	animate();

	// Cleanup function
	return () => {
		window.removeEventListener('resize', handleResize);
		cancelAnimationFrame(animationId);
		controls.dispose();
		renderer.dispose();
	};
}
