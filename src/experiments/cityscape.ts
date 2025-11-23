import * as THREE from 'three';
import BaseScene from '../helpers/scene';
import { randomNumberInExponentialDistribution } from '../helpers/randomNum';

// Example usage of BaseScene for raining letters
export default function init(canvas: HTMLCanvasElement) {
	// Create the base scene with physics
	const scene = new BaseScene(canvas);
	scene.scene.background = new THREE.Color('white');

	const buildings = new THREE.Group();
	const matcapTexture = new THREE.TextureLoader().load('/textures/matcaps/9.png');
	matcapTexture.colorSpace = THREE.SRGBColorSpace;

	const buildingGap = 1;
	const streetGap = 20;
	const buildingSize = 10;
	const xBlockSize = 5;
	const zBlockSize = 5;

	for (let i = 0; i < 50; i++) {
		for (let j = 0; j < 50; j++) {
			const randomHeight = randomNumberInExponentialDistribution(10, 100, 8);
			const building = new THREE.Mesh(
				new THREE.BoxGeometry(10, randomHeight, 10),
				new THREE.MeshStandardMaterial({
					color: new THREE.Color('lightgray'),
					metalness: 0.1,
					roughness: 0.1
				})
			);
			building.castShadow = true;
			building.receiveShadow = true;
			const xPosition = i * (buildingSize + buildingGap) + Math.floor(i / xBlockSize) * streetGap;
			const zPosition = j * (buildingSize + buildingGap) + Math.floor(j / zBlockSize) * streetGap;

			building.position.set(xPosition, randomHeight / 2, zPosition);
			buildings.add(building);
		}
	}

	const buildingsContainer = new THREE.Box3().setFromObject(buildings);
	const buildingsSize = buildingsContainer.getSize(new THREE.Vector3());

	buildings.translateZ(-buildingsSize.z / 2);
	buildings.translateX(-buildingsSize.x / 2);

	scene.addGroup(buildings);

	scene.createPhysicsFloor(buildingsSize.x + 100, new THREE.Color('gray'));

	// Calculate optimal camera position based on cityscape size
	// Position camera at an angle to view the cityscape nicely
	const maxDimension = Math.max(buildingsSize.x, buildingsSize.z);

	// Setup lighting for cityscape shadows
	// Remove default lighting and add custom lighting optimized for cityscape
	const existingLights = scene.scene.children.filter((child) => child instanceof THREE.Light);
	existingLights.forEach((light) => scene.scene.remove(light));

	// Ambient light for overall illumination
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
	scene.scene.add(ambientLight);

	// Directional light for shadows - positioned high and angled
	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
	directionalLight.position.set(maxDimension * 0.5, maxDimension * 0.5, maxDimension * 0.25);
	directionalLight.castShadow = true;

	// Configure shadow camera to cover the entire cityscape
	const shadowHalfSize = maxDimension * 0.6; // Cover slightly more than cityscape
	directionalLight.shadow.camera.top = shadowHalfSize;
	directionalLight.shadow.camera.right = shadowHalfSize;
	directionalLight.shadow.camera.bottom = -shadowHalfSize;
	directionalLight.shadow.camera.left = -shadowHalfSize;
	directionalLight.shadow.camera.near = 0.5;
	directionalLight.shadow.camera.far = maxDimension * 2; // Far enough to cover all buildings

	// High resolution shadow map for better quality
	directionalLight.shadow.mapSize.width = 4096;
	directionalLight.shadow.mapSize.height = 4096;

	// Soft shadows for better appearance
	directionalLight.shadow.radius = 8;
	directionalLight.shadow.bias = -0.0001;

	scene.scene.add(directionalLight);
	const cameraDistance = maxDimension * 1.5; // Distance based on cityscape size

	// Increase camera far plane to accommodate large cityscape
	// Calculate needed far plane: max dimension + camera distance + some buffer
	const requiredFarPlane = maxDimension + cameraDistance + 1000;
	scene.camera.far = Math.max(requiredFarPlane, 5000); // Minimum 5000, or more if needed
	scene.camera.updateProjectionMatrix(); // Important: update projection matrix after changing far plane

	scene.camera.position.set(0, cameraDistance * 0.5, cameraDistance * 0.7);

	scene.camera.lookAt(0, 0, 0);

	// Update controls to apply the target change
	scene.controls.update();

	scene.start();

	return () => {
		scene.dispose();
	};
}
