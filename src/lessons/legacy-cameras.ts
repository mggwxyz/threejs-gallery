import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

export default function init(canvas: HTMLCanvasElement) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');

  // Create a more complex scene with multiple objects
  const objects: THREE.Mesh[] = [];

  // Create floor
  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x37474f,
    roughness: 0.8
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  scene.add(floor);

  // Create various shapes
  const shapes = [
    { geometry: new THREE.BoxGeometry(1, 1, 1), color: 0xff6b6b, position: { x: -3, y: 0, z: 0 } },
    { geometry: new THREE.SphereGeometry(0.7, 32, 32), color: 0x4ecdc4, position: { x: 0, y: 0, z: 0 } },
    { geometry: new THREE.ConeGeometry(0.7, 1.5, 32), color: 0xffe66d, position: { x: 3, y: 0, z: 0 } },
    { geometry: new THREE.TorusGeometry(0.6, 0.3, 16, 100), color: 0xa8e6cf, position: { x: -3, y: 0, z: -3 } },
    { geometry: new THREE.TetrahedronGeometry(1), color: 0xffd3b6, position: { x: 0, y: 0, z: -3 } },
    { geometry: new THREE.OctahedronGeometry(1), color: 0xffaaa5, position: { x: 3, y: 0, z: -3 } }
  ];

  shapes.forEach(shape => {
    const material = new THREE.MeshStandardMaterial({ color: shape.color });
    const mesh = new THREE.Mesh(shape.geometry, material);
    mesh.position.set(shape.position.x, shape.position.y, shape.position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    objects.push(mesh);
    scene.add(mesh);
  });

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 20;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  scene.add(directionalLight);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Camera settings
  const cameraSettings = {
    type: 'perspective',
    fov: 75,
    near: 0.1,
    far: 100,
    zoom: 1,
    orthographicSize: 5
  };

  // Create different cameras
  let currentCamera: THREE.Camera;

  // Perspective Camera
  const perspectiveCamera = new THREE.PerspectiveCamera(
    cameraSettings.fov,
    canvas.clientWidth / canvas.clientHeight,
    cameraSettings.near,
    cameraSettings.far
  );
  perspectiveCamera.position.set(2, 4, 4);

  // Orthographic Camera
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const orthographicCamera = new THREE.OrthographicCamera(
    -cameraSettings.orthographicSize * aspect,
    cameraSettings.orthographicSize * aspect,
    cameraSettings.orthographicSize,
    -cameraSettings.orthographicSize,
    cameraSettings.near,
    cameraSettings.far
  );
  orthographicCamera.position.set(5, 5, 8);
  orthographicCamera.zoom = cameraSettings.zoom;

  // Set initial camera
  currentCamera = perspectiveCamera;

  // Camera controls
  let controls = new OrbitControls(currentCamera, canvas);
  controls.enableDamping = true;

  // GUI setup
  const gui = new GUI();

  // Mount GUI to container if it exists
  const guiContainer = document.getElementById('gui-container');
  if (guiContainer) {
    guiContainer.appendChild(gui.domElement);
  }

  // Camera type selector
  const cameraFolder = gui.addFolder('Camera Settings');
  cameraFolder.add(cameraSettings, 'type', ['perspective', 'orthographic']).onChange((value: string) => {
    if (value === 'perspective') {
      currentCamera = perspectiveCamera;
      perspectiveFolder.show();
      orthographicFolder.hide();
    } else {
      currentCamera = orthographicCamera;
      orthographicCamera.updateProjectionMatrix();
      perspectiveFolder.hide();
      orthographicFolder.show();
    }

    // Update controls
    controls.dispose();
    controls = new OrbitControls(currentCamera, canvas);
    controls.enableDamping = true;
  });

  // Perspective camera controls
  const perspectiveFolder = cameraFolder.addFolder('Perspective Settings');
  perspectiveFolder.add(cameraSettings, 'fov', 10, 120, 1).onChange((value: number) => {
    perspectiveCamera.fov = value;
    perspectiveCamera.updateProjectionMatrix();
  });
  perspectiveFolder.add(cameraSettings, 'near', 0.01, 10, 0.01).onChange((value: number) => {
    perspectiveCamera.near = value;
    perspectiveCamera.updateProjectionMatrix();
  });
  perspectiveFolder.add(cameraSettings, 'far', 10, 1000, 10).onChange((value: number) => {
    perspectiveCamera.far = value;
    perspectiveCamera.updateProjectionMatrix();
  });

  // Orthographic camera controls
  const orthographicFolder = cameraFolder.addFolder('Orthographic Settings');
  orthographicFolder.add(cameraSettings, 'orthographicSize', 1, 20, 0.1).onChange((value: number) => {
    const aspect = canvas.clientWidth / canvas.clientHeight;
    orthographicCamera.left = -value * aspect;
    orthographicCamera.right = value * aspect;
    orthographicCamera.top = value;
    orthographicCamera.bottom = -value;
    orthographicCamera.updateProjectionMatrix();
  });
  orthographicFolder.add(cameraSettings, 'zoom', 0.1, 5, 0.1).onChange((value: number) => {
    orthographicCamera.zoom = value;
    orthographicCamera.updateProjectionMatrix();
  });
  orthographicFolder.hide();

  // Camera position controls
  const positionFolder = gui.addFolder('Camera Position');
  const cameraPositionHelper = {
    x: 5,
    y: 5,
    z: 8,
    lookAtCenter: true,
    autoRotate: false,
    rotateSpeed: 1
  };

  positionFolder.add(cameraPositionHelper, 'x', -20, 20, 0.1).onChange((value: number) => {
    currentCamera.position.x = value;
  });
  positionFolder.add(cameraPositionHelper, 'y', -20, 20, 0.1).onChange((value: number) => {
    currentCamera.position.y = value;
  });
  positionFolder.add(cameraPositionHelper, 'z', -20, 20, 0.1).onChange((value: number) => {
    currentCamera.position.z = value;
  });
  positionFolder.add(cameraPositionHelper, 'lookAtCenter').onChange((value: boolean) => {
    if (value) {
      currentCamera.lookAt(0, 0, 0);
    }
  });
  positionFolder.add(cameraPositionHelper, 'autoRotate').onChange((value: boolean) => {
    controls.autoRotate = value;
  });
  positionFolder.add(cameraPositionHelper, 'rotateSpeed', 0, 10, 0.1).onChange((value: number) => {
    controls.autoRotateSpeed = value;
  });

  // Preset views
  const presetFolder = gui.addFolder('Preset Views');
  const presets = {
    front: () => {
      currentCamera.position.set(0, 0, 10);
      currentCamera.lookAt(0, 0, 0);
    },
    back: () => {
      currentCamera.position.set(0, 0, -10);
      currentCamera.lookAt(0, 0, 0);
    },
    left: () => {
      currentCamera.position.set(-10, 0, 0);
      currentCamera.lookAt(0, 0, 0);
    },
    right: () => {
      currentCamera.position.set(10, 0, 0);
      currentCamera.lookAt(0, 0, 0);
    },
    top: () => {
      currentCamera.position.set(0, 10, 0.1);
      currentCamera.lookAt(0, 0, 0);
    },
    isometric: () => {
      currentCamera.position.set(10, 10, 10);
      currentCamera.lookAt(0, 0, 0);
    }
  };

  Object.keys(presets).forEach(key => {
    presetFolder.add(presets, key as keyof typeof presets);
  });

  // Open folders
  cameraFolder.close();
  positionFolder.close();
  presetFolder.close();

  // Handle window resize
  const handleResize = () => {
    const aspect = canvas.clientWidth / canvas.clientHeight;

    // Update perspective camera
    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();

    // Update orthographic camera
    orthographicCamera.left = -cameraSettings.orthographicSize * aspect;
    orthographicCamera.right = cameraSettings.orthographicSize * aspect;
    orthographicCamera.updateProjectionMatrix();

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  window.addEventListener('resize', handleResize);

  // Animation loop
  const clock = new THREE.Clock();
  let animationId: number;

  function animate() {
    animationId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Animate objects
    objects.forEach((object, index) => {
      object.rotation.y = elapsedTime * 0.5 + index * 0.5;
      object.position.y = Math.sin(elapsedTime + index) * 0.3;
    });

    // Update controls
    controls.update();

    // Update camera position in GUI
    cameraPositionHelper.x = currentCamera.position.x;
    cameraPositionHelper.y = currentCamera.position.y;
    cameraPositionHelper.z = currentCamera.position.z;

    renderer.render(scene, currentCamera);
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