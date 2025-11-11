import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createFloor } from '../helpers/floor';
import { createSphere } from '../helpers/shapes';
import * as CANNON from 'cannon-es';
import { randomNumber } from '../helpers/randomNum';

export default function init(canvas: HTMLCanvasElement) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');

  const sphereYPosition = 10;
  const sphereRadius = 1; // Define sphere radius once for consistency

  const spheres: THREE.Mesh[] = [];
  const prettyColors = [new THREE.Color('red'), new THREE.Color('orange'), new THREE.Color('yellow'), new THREE.Color('green'), new THREE.Color('blue'), new THREE.Color('purple'), new THREE.Color('pink'), new THREE.Color('brown'), new THREE.Color('gray'), new THREE.Color('white')];

//   const sphereGroup = new THREE.Group();
  for (let i = 0; i < 10; i++) {
    const sphere = createSphere({ size: sphereRadius, color: prettyColors[i], position: { x: randomNumber(-5, 5), y: sphereYPosition, z: randomNumber(-5, 5) } });
    scene.add(sphere);
    spheres.push(sphere);
  }

    // // Create a sphere
    // const sphere = createSphere({ size: sphereRadius, color: new THREE.Color('red'), position: { y: sphereYPosition } });
    // scene.add(sphere);

  // Create a floor
  const floor = createFloor(40, new THREE.Color('lightgreen'));
  scene.add(floor);

  // Create a physics world
  const world = new CANNON.World();
  world.gravity.set(0, -9.81, 0);

    // Physics materials
    // const concreteMaterial = new CANNON.Material('concrete');
    // const rubberMaterial = new CANNON.Material('rubber');

    // const contactMaterial = new CANNON.ContactMaterial(concreteMaterial, rubberMaterial, {
    //     friction: 0.1,
    //     restitution: 0.6
    // });
    // world.addContactMaterial(contactMaterial);

    const defaultMaterial = new CANNON.Material('default');
    const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
        friction: 0.1,
        restitution: 0.6
    });
    world.addContactMaterial(defaultContactMaterial);
    world.defaultContactMaterial = defaultContactMaterial;

//   // Create a physics body for the sphere - use same radius as visual sphere
//   const sphereShape = new CANNON.Sphere(sphereRadius);
//   const sphereBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(0, sphereYPosition, 0),
//     shape: sphereShape,
//     // material: rubberMaterial,
//   });
//   world.addBody(sphereBody);
  const sphereBodies: CANNON.Body[] = [];

    for (const sphere of spheres) {
        const sphereShape = new CANNON.Sphere(sphereRadius);
        const sphereBody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(sphere.position.x, sphere.position.y, sphere.position.z),
            shape: sphereShape,
        });
        world.addBody(sphereBody);
        sphereBodies.push(sphereBody);
    }

  // Create a physics body for the floor
  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body({
    shape: floorShape,
    mass: 0,
    // material: concreteMaterial,
  });
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(floorBody);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Add grid
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(10, 10, 10);
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
  const clock = new THREE.Clock();
  let prevElapsedTime = 0;

  function animate() {
    animationId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - prevElapsedTime;
    prevElapsedTime = elapsedTime;

    // Update physics world
    world.step(1 / 60, deltaTime, 3);
    // console.log(sphereBody.position.y);
    for (let i = 0; i < spheres.length; i++) {
        const sphere = spheres[i];
        const sphereBody = sphereBodies[i];
        sphere.position.copy(sphereBody.position);
    }


    controls.update();
    renderer.render(scene, camera);

    // requestAnimationFrame(animate);
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