import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

export default function init(canvas: HTMLCanvasElement) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  // Create multiple cubes for animation
  const cubeGroup = new THREE.Group();

  const colors = [0xff006e, 0xfb5607, 0xffbe0b, 0x8338ec, 0x3a86ff];
  const cubes: THREE.Mesh[] = [];

  for (let i = 0; i < 5; i++) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: colors[i],
      emissive: colors[i],
      emissiveIntensity: 0.2
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = (i - 2) * 2;
    cubes.push(cube);
    cubeGroup.add(cube);
  }

  scene.add(cubeGroup);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 3, 8);
  camera.lookAt(0, 0, 0);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

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

  // Rotation animation
  tl.to(cubes.map(cube => cube.rotation), {
    y: Math.PI * 2,
    x: Math.PI,
    duration: 2,
    stagger: 0.1,
    ease: "power2.inOut"
  }, "-=0.5");

  // Scale animation
  tl.to(cubes.map(cube => cube.scale), {
    x: 1.5,
    y: 1.5,
    z: 1.5,
    duration: 0.5,
    stagger: 0.05,
    ease: "elastic.out(1, 0.3)"
  })
  .to(cubes.map(cube => cube.scale), {
    x: 1,
    y: 1,
    z: 1,
    duration: 0.5,
    stagger: 0.05,
    ease: "elastic.out(1, 0.3)"
  });

  // Color wave animation
  tl.to(cubes.map(cube => cube.position), {
    x: (index: number) => Math.sin(index) * 3,
    z: (index: number) => Math.cos(index) * 2,
    duration: 2,
    stagger: 0.1,
    ease: "sine.inOut"
  })
  .to(cubes.map(cube => cube.position), {
    x: (index: number) => (index - 2) * 2,
    z: 0,
    duration: 2,
    stagger: 0.1,
    ease: "sine.inOut"
  });

  // Individual continuous rotation for each cube
  const rotationTweens: gsap.core.Tween[] = [];
  cubes.forEach((cube, i) => {
    const tween = gsap.to(cube.rotation, {
      z: Math.PI * 2,
      duration: 3 + i * 0.5,
      repeat: -1,
      ease: "none"
    });
    rotationTweens.push(tween);
  });

  // Animate the entire group
  const groupRotation = gsap.to(cubeGroup.rotation, {
    y: Math.PI * 2,
    duration: 20,
    repeat: -1,
    ease: "none"
  });

  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;

  const handleMouseMove = (event: MouseEvent) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  window.addEventListener('mousemove', handleMouseMove);

  // Animate camera based on mouse position
  const cameraAnimation = () => {
    gsap.to(camera.position, {
      x: mouseX * 2,
      y: 3 + mouseY * 2,
      duration: 1,
      ease: "power2.out"
    });
  };

  gsap.ticker.add(cameraAnimation);

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
    window.removeEventListener('mousemove', handleMouseMove);
    cancelAnimationFrame(animationId);

    // Kill all GSAP animations
    tl.kill();
    rotationTweens.forEach(tween => tween.kill());
    groupRotation.kill();
    gsap.ticker.remove(cameraAnimation);

    controls.dispose();
    renderer.dispose();
  };
}