import * as THREE from 'three';
import BaseScene from '../helpers/scene';
import { type Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { create3DTextMesh } from '../helpers/text';
import * as CANNON from 'cannon-es';

// Example usage of BaseScene for raining letters
export default function init(canvas: HTMLCanvasElement) {
	// Create the base scene with physics
	const scene = new BaseScene(canvas);

	// Set background color to white
	scene.scene.background = new THREE.Color('white');
	scene.createPhysicsFloor(20);

	// Load matcap texture
	const textureLoader = new THREE.TextureLoader();
	const matCapTexture = textureLoader.load('/textures/matcaps/3.png');
	matCapTexture.colorSpace = THREE.SRGBColorSpace;

	let sceneFont: Font | null = null;

	// Function to add text to the scene with physics
	function addText(text: string) {
		if (!sceneFont) return;

		const textMesh = create3DTextMesh({
			text,
			textGeometryOptions: {
				font: sceneFont as Font,
				size: 2,
				depth: 0.5
			},
			textMaterial: new THREE.MeshMatcapMaterial({ matcap: matCapTexture })
		});
		textMesh.castShadow = true;
		textMesh.position.set(0, 10, 0);

		textMesh.geometry.computeBoundingBox();
		const boundingBox = textMesh.geometry.boundingBox;
		if (!boundingBox) return;

		const halfExtents = new CANNON.Vec3(
			(boundingBox.max.x - boundingBox.min.x) / 2,
			(boundingBox.max.y - boundingBox.min.y) / 2,
			(boundingBox.max.z - boundingBox.min.z) / 2
		);
		const box = new CANNON.Box(halfExtents);
		scene.addPhysicsObject(
			textMesh,
			new CANNON.Body({
				mass: 1,
				position: new CANNON.Vec3(textMesh.position.x, textMesh.position.y, textMesh.position.z),
				shape: box
			})
		);
	}

	function onTypeHandler(e: KeyboardEvent) {
		console.log('onTypeHandler', e.key);
		addText(e.key);
	}

	const fontLoader = new FontLoader();
	fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
		sceneFont = font;
		if (sceneFont) {
			// Add initial text on startup
			addText('Type to make it rain');
			window.addEventListener('keydown', onTypeHandler);
		}
		scene.start();
	});

	// Return cleanup function
	return () => {
		scene.dispose();
		window.removeEventListener('keydown', onTypeHandler);
	};
}
