import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

export default function init(canvas: HTMLCanvasElement) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Create a red cube with standard material for better lighting
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Add axes helper
  const axesHelper = new THREE.AxesHelper(3);
  scene.add(axesHelper);

  // Add grid helper
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  // GUI setup
  const gui = new GUI();

  // Mount GUI to container if it exists
  const guiContainer = document.getElementById('gui-container');
  if (guiContainer) {
    guiContainer.appendChild(gui.domElement);
  }

  // Transform controls
  const cubeFolder = gui.addFolder('Cube Transforms');

  // Position controls
  const positionFolder = cubeFolder.addFolder('Position');
  positionFolder.add(cube.position, 'x', -5, 5, 0.01).name('X');
  positionFolder.add(cube.position, 'y', -5, 5, 0.01).name('Y');
  positionFolder.add(cube.position, 'z', -5, 5, 0.01).name('Z');
  positionFolder.open();

  // Rotation controls
  const rotationFolder = cubeFolder.addFolder('Rotation');
  rotationFolder.add(cube.rotation, 'x', 0, Math.PI * 2, 0.01).name('X');
  rotationFolder.add(cube.rotation, 'y', 0, Math.PI * 2, 0.01).name('Y');
  rotationFolder.add(cube.rotation, 'z', 0, Math.PI * 2, 0.01).name('Z');
  rotationFolder.open();

  // Scale controls
  const scaleFolder = cubeFolder.addFolder('Scale');
  scaleFolder.add(cube.scale, 'x', 0.1, 3, 0.01).name('X');
  scaleFolder.add(cube.scale, 'y', 0.1, 3, 0.01).name('Y');
  scaleFolder.add(cube.scale, 'z', 0.1, 3, 0.01).name('Z');
  scaleFolder.open();

  cubeFolder.open();

  // Material controls
  const materialFolder = gui.addFolder('Material');
  materialFolder.addColor(material, 'color').name('Color');
  materialFolder.add(material, 'wireframe').name('Wireframe');
  materialFolder.add(material, 'opacity', 0, 1, 0.01).name('Opacity').onChange(() => {
    material.transparent = material.opacity < 1;
  });
  materialFolder.add(material, 'metalness', 0, 1, 0.01).name('Metalness');
  materialFolder.add(material, 'roughness', 0, 1, 0.01).name('Roughness');
  materialFolder.open();

  // Visibility controls
  const visibilityFolder = gui.addFolder('Helpers');
  visibilityFolder.add(axesHelper, 'visible').name('Axes Helper');
  visibilityFolder.add(gridHelper, 'visible').name('Grid Helper');
  visibilityFolder.open();

  // Animation controls
  const animationSettings = {
    animate: false,
    speed: 1
  };

  const animationFolder = gui.addFolder('Animation');
  animationFolder.add(animationSettings, 'animate').name('Auto Rotate');
  animationFolder.add(animationSettings, 'speed', 0, 5, 0.1).name('Speed');
  animationFolder.open();

  // Handle window resize
  const handleResize = () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  window.addEventListener('resize', handleResize);

  // Animation loop
  let animationId: number;

  function animate() {
    animationId = requestAnimationFrame(animate);

    // Auto-rotate if enabled
    if (animationSettings.animate) {
      cube.rotation.y += 0.01 * animationSettings.speed;
      cube.rotation.x += 0.005 * animationSettings.speed;
    }

    // Update controls
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
    gui.destroy();
  };
}