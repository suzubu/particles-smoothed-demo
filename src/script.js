import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl?raw";
import fragmentShader from "./shaders/fragment.glsl?raw";
import { createImageParticleSystem } from "./lib/ImageParticleSystem.js";

let scene, camera, renderer, material;
let mouse = new THREE.Vector2();
let smoothedMouse = new THREE.Vector2();

const mask = "/image9_small.png";

init();
animate();

function init() {
  // === [ Scene Setup ] ===
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // === [ Camera Setup ] ===
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 3.1;

  // === [ Renderer Setup ] ===
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // === [ Resize Handling ] ===
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // === [ Mouse Tracking ] ===
  window.addEventListener("pointermove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  // === [ Shader Material Setup ] ===
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2() },
      uRelaxation: { value: 0.05 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    glslVersion: THREE.GLSL1,
  });

  // === [ Create Particle System from Image ] ===

  createImageParticleSystem({
    url: mask,
    threshold: 0.001,
    // lower threshold = more particles included
    maxPoints: 50000,
    material,
  }).then((points) => {
    // Center geometry using bounding box
    const geometry = points.geometry;
    geometry.computeBoundingBox();

    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);

    // Add to scene
    scene.add(points);
  });
}

function animate(time) {
  requestAnimationFrame(animate);

  // Convert time from ms to seconds
  const elapsedTime = time * 0.001;

  // Smooth the mouse movement
  // This creates a trailing motion (brush stroke effect)
  smoothedMouse.lerp(mouse, 0.07); // Lower = longer trailing

  // Update shader uniforms
  if (material?.uniforms?.uTime) {
    material.uniforms.uTime.value = elapsedTime;
  }

  if (material?.uniforms?.uMouse) {
    material.uniforms.uMouse.value.copy(smoothedMouse);
  }

  // Semi-transparent overlay to create fading trail
  renderer.setClearColor(0x000000, 0.08); // alpha < 1 = trail
  renderer.clearColor(); // clears *with* fade

  // Render scene
  renderer.render(scene, camera);
}
