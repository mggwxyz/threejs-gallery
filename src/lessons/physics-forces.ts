import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createFloor } from '../helpers/floor';
import * as CANNON from 'cannon-es';
import { createSphereObject } from '../helpers/objects';

export default function init(canvas: HTMLCanvasElement) {
	// Scene setup
	const scene = new THREE.Scene();
	scene.background = new THREE.Color('white');

	const sphereRadius = 2; // Define sphere radius once for consistency

	// Create a floor
	const floorSize = 40;
	const floor = createFloor(floorSize, new THREE.Color('lightgreen'));
	scene.add(floor);

	// Create a physics world
	const world = new CANNON.World();

	world.gravity.set(0, -9.81, 0);

	const defaultMaterial = new CANNON.Material('default');
	const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
		friction: 0.1,
		restitution: 0.9
	});
	world.addContactMaterial(defaultContactMaterial);
	world.defaultContactMaterial = defaultContactMaterial;

	const { sphere, sphereBody } = createSphereObject({
		mass: 1,
		size: sphereRadius,
		color: new THREE.Color('red'),
		position: { x: 0, y: sphereRadius, z: 0 }
	});
	scene.add(sphere);
	world.addBody(sphereBody);

	// Create a physics body for the floor (flat plane)
	const floorShape = new CANNON.Plane();
	const floorBody = new CANNON.Body({
		shape: floorShape,
		mass: 0,
		material: defaultMaterial,
		position: new CANNON.Vec3(0, 0, 0)
	});
	floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

	world.addBody(floorBody);

	// Add lighting
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
	directionalLight.position.set(5, 10, 5);
	directionalLight.castShadow = true;

	// Configure shadow camera to cover the entire scene
	directionalLight.shadow.camera.top = 25;
	directionalLight.shadow.camera.right = 25;
	directionalLight.shadow.camera.bottom = -25;
	directionalLight.shadow.camera.left = -25;
	directionalLight.shadow.camera.near = 0.5;
	directionalLight.shadow.camera.far = 50;

	// Shadow map resolution (1024 is a good balance between quality and performance)
	directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;

	scene.add(directionalLight);

	// Add grid - match the floor size
	const gridHelper = new THREE.GridHelper(floorSize, floorSize);
	scene.add(gridHelper);

	// Camera setup
	const camera = new THREE.PerspectiveCamera(
		75,
		canvas.clientWidth / canvas.clientHeight,
		0.1,
		1000
	);
	camera.position.set(0, 15, 30);
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

	const handleClick = () => {
		sphereBody.applyLocalForce(new CANNON.Vec3(0, 500, 0), new CANNON.Vec3(0, 0, 0));
		console.log('clicked');
	};

	canvas.addEventListener('click', handleClick);

	window.addEventListener('resize', handleResize);

	// Animation
	let animationId: number;
	const clock = new THREE.Clock();
	const fixedTimeStep = 1 / 60; // 60 FPS
	let accumulatedTime = 0;

	function animate() {
		animationId = requestAnimationFrame(animate);
		const deltaTime = clock.getDelta();
		accumulatedTime += deltaTime;

		// Update physics world with fixed timestep
		// Step physics in fixed increments for consistent simulation
		while (accumulatedTime >= fixedTimeStep) {
			world.step(fixedTimeStep);
			accumulatedTime -= fixedTimeStep;
		}

		// Sync visual representation with physics
		sphere.position.copy(sphereBody.position);
		sphere.quaternion.copy(sphereBody.quaternion);

		controls.update();
		renderer.render(scene, camera);
	}

	animate();

	// Cleanup function
	return () => {
		window.removeEventListener('resize', handleResize);
		canvas.removeEventListener('click', handleClick);
		cancelAnimationFrame(animationId);
		controls.dispose();
		renderer.dispose();
	};
}
