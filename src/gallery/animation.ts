import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

export default function init(canvas: HTMLCanvasElement) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');

  // Create multiple cubes for animation
  const cubeGroup = new THREE.Group();

  const colors = [new THREE.Color('red'), new THREE.Color('orange'), new THREE.Color('yellow'), new THREE.Color('green'), new THREE.Color('blue')];
  const cubes: THREE.Mesh[] = [];

  for (let i = 0; i < 5; i++) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: colors[i],
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = (i - 2) * 1;
    cubes.push(cube);
    cubeGroup.add(cube);
  }

  scene.add(cubeGroup);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 100);
  pointLight.position.set(5, 5, 5);
  pointLight.castShadow = true;
  scene.add(pointLight);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 3, 4);
  camera.lookAt(0, 0, 0);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  // GSAP Animations
  // Timeline for sequenced animations
  const tl = gsap.timeline({ repeat: -1 });

  // Initial animation - staggered bounce
  tl.to(cubes.map(cube => cube.position), {
    y: 2,
    duration: 0.5,
    stagger: 0.1,
    ease: "power2.out"
  })
  .to(cubes.map(cube => cube.position), {
    y: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: "bounce.out"
  });

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
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // Cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animationId);

    // Kill all GSAP animations
    tl.kill();

    controls.dispose();
    renderer.dispose();
  };
}