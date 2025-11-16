import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class BaseScene {
	canvas: HTMLCanvasElement;
	scene: THREE.Scene;
	renderer: THREE.WebGLRenderer;
	camera: THREE.PerspectiveCamera;
	controls: OrbitControls;
	world: CANNON.World;
	clock: THREE.Clock;
	loadingManager: THREE.LoadingManager;
	animationId: number | null = null;
	private _resizeHandler?: () => void;

	// Physics bodies tracking
	physicsBodies: Map<THREE.Object3D, CANNON.Body> = new Map();

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.scene = new THREE.Scene();
		this.renderer = this.setupRenderer();
		this.camera = this.setupCamera();
		this.controls = this.setupControls();
		this.world = this.setupPhysicsWorld();
		this.clock = new THREE.Clock();
		this.loadingManager = new THREE.LoadingManager();

		// Setup default lighting
		this.setupDefaultLighting();

		// Setup resize handler
		this.setupResizeHandler();
	}

	setupCamera() {
		const camera = new THREE.PerspectiveCamera(
			75,
			this.canvas.clientWidth / this.canvas.clientHeight,
			0.1,
			1000
		);
		camera.position.set(0, 7.5, 15);
		camera.lookAt(0, 0, 0);
		return camera;
	}

	setupControls() {
		const controls = new OrbitControls(this.camera, this.canvas);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.maxPolarAngle = Math.PI / 2 - 0.1;
		return controls;
	}

	setupRenderer() {
		const renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
		renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		return renderer;
	}

	setupPhysicsWorld() {
		const world = new CANNON.World();
		world.gravity.set(0, -9.81, 0);

		// Setup default physics materials
		const defaultMaterial = new CANNON.Material('default');
		const defaultContactMaterial = new CANNON.ContactMaterial(
			defaultMaterial,
			defaultMaterial,
			{
				friction: 0.5,
				restitution: 0.2
			}
		);
		world.addContactMaterial(defaultContactMaterial);
		world.defaultContactMaterial = defaultContactMaterial;

		return world;
	}

	setupDefaultLighting() {
		// Ambient light
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
		this.scene.add(ambientLight);

		// Directional light with shadows
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
		directionalLight.position.set(5, 10, 5);
		directionalLight.castShadow = true;

		// Configure shadow camera
		directionalLight.shadow.camera.top = 25;
		directionalLight.shadow.camera.right = 25;
		directionalLight.shadow.camera.bottom = -25;
		directionalLight.shadow.camera.left = -25;
		directionalLight.shadow.camera.near = 0.5;
		directionalLight.shadow.camera.far = 50;

		// Shadow map resolution
		directionalLight.shadow.mapSize.width = 2048;
		directionalLight.shadow.mapSize.height = 2048;

		this.scene.add(directionalLight);
	}

	// Add a physics-enabled object to the scene
	addPhysicsObject(mesh: THREE.Mesh, body: CANNON.Body) {
		this.scene.add(mesh);
		this.world.addBody(body);
		this.physicsBodies.set(mesh, body);
	}

	// Create a physics floor
	createPhysicsFloor(size: number, color: THREE.Color = new THREE.Color('lightgreen')) {
		// Create visual floor
		const geometry = new THREE.BoxGeometry(size, 0.1, size);
		const material = new THREE.MeshStandardMaterial({ color });
		const floor = new THREE.Mesh(geometry, material);
		floor.receiveShadow = true;
		this.scene.add(floor);

		// Create physics floor
		const halfSize = size / 2;
		const floorShape = new CANNON.Box(new CANNON.Vec3(halfSize, 0.05, halfSize));
		const floorBody = new CANNON.Body({
			shape: floorShape,
			mass: 0, // Static body
			position: new CANNON.Vec3(0, -0.05, 0)
		});
		this.world.addBody(floorBody);

		return { mesh: floor, body: floorBody };
	}

	// Update physics bodies positions
	updatePhysics(deltaTime: number) {
		// Step the physics world
		this.world.step(1 / 60, deltaTime, 3);

		// Update mesh positions from physics bodies
		this.physicsBodies.forEach((body, mesh) => {
			mesh.position.set(body.position.x, body.position.y, body.position.z);
			mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
		});
	}

	setupResizeHandler() {
		const handleResize = () => {
			const width = this.canvas.clientWidth;
			const height = this.canvas.clientHeight;
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(width, height);
			this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		};

		window.addEventListener('resize', handleResize);

		// Store the handler for cleanup
		this._resizeHandler = handleResize;
	}

	// Start the animation loop
	start(customAnimate?: (deltaTime: number, elapsedTime: number) => void) {
		let prevElapsedTime = 0;

		const animate = () => {
			this.animationId = requestAnimationFrame(animate);

			const elapsedTime = this.clock.getElapsedTime();
			const deltaTime = elapsedTime - prevElapsedTime;
			prevElapsedTime = elapsedTime;

			// Update physics
			this.updatePhysics(deltaTime);

			// Call custom animation if provided
			if (customAnimate) {
				customAnimate(deltaTime, elapsedTime);
			}

			// Update controls
			this.controls.update();

			// Render the scene
			this.renderer.render(this.scene, this.camera);
		};

		animate();
	}

	// Cleanup
	dispose() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
		}

		// Remove resize handler
		if (this._resizeHandler) {
			window.removeEventListener('resize', this._resizeHandler);
		}

		this.controls.dispose();
		this.renderer.dispose();

		// Clear physics bodies
		this.physicsBodies.clear();
	}
}
