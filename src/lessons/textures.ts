import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createFloor } from '../helpers/floor';
import { createCube, createSphere } from '../helpers/shapes';

export default function init(canvas: HTMLCanvasElement) {
  const loadingManager = new THREE.LoadingManager();
  /**
   * Textures
   */
  const textureLoader = new THREE.TextureLoader(loadingManager);
  const colorTexture = textureLoader.load('/textures/door/color.jpg')
    colorTexture.colorSpace = THREE.SRGBColorSpace
  const repeatingColorTexture = textureLoader.load('/textures/door/color.jpg')
  repeatingColorTexture.wrapS = THREE.RepeatWrapping
  repeatingColorTexture.wrapT = THREE.RepeatWrapping
  repeatingColorTexture.repeat.set(4, 4)
    const textures: THREE.Texture[] = [ colorTexture, repeatingColorTexture ];
    for (const textureName of ['alpha', 'height', 'normal', 'ambientOcclusion', 'metalness', 'roughness']) {
    const texture = textureLoader.load(`/textures/door/${textureName}.jpg`);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    }


  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');

  const cubeGroup = new THREE.Group();
  const sphereGroup = new THREE.Group();

  for (let i = 0; i < textures.length; i++) {
    const texture = textures[i];
    const cube = createCube({ size: 2, map: texture, position: { x: i * 3, y: 0, z: 0 } });
    cubeGroup.add(cube);
    const sphere = createSphere({ size: 1, map: texture, position: { x: i * 3, y: 1, z: 0 } });
    sphereGroup.add(sphere);
  }

  cubeGroup.position.set(-10, 0, 0);
  sphereGroup.position.set(-10, 0, -4);

  scene.add(cubeGroup);
  scene.add(sphereGroup);

  // Create a floor
  const floor = createFloor(50, new THREE.Color('lightgreen'));
  scene.add(floor);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;

  // Configure shadow camera to cover the entire floor (50x50 units)
  const floorHalfSize = 25;
  directionalLight.shadow.camera.top = floorHalfSize;
  directionalLight.shadow.camera.right = floorHalfSize;
  directionalLight.shadow.camera.bottom = -floorHalfSize;
  directionalLight.shadow.camera.left = -floorHalfSize;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;

  // Shadow map resolution for better quality
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;

  scene.add(directionalLight);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 8, 12);
  camera.lookAt(cubeGroup.position);

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