import * as THREE from "three";

export async function createImageParticleSystem({
  url,
  threshold = 0.01,
  maxPoints = 50000,
  scale = 1.5,
  material,
}) {
  // === [1. Load Image] ===
  const img = await loadImage(url);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // === [2. Prepare Geometry Buffers] ===
  const positions = [];
  const originals = [];
  const offsets = [];
  const influences = [];
  const colors = [];

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      const brightness = (r + g + b) / (3 * 255);

      if (brightness > threshold) {
        // Map pixel to [-1, 1] space
        const nx = (x / canvas.width) * 2 - 1;
        const ny = 1 - (y / canvas.height) * 2;

        // Scale and push to arrays
        const z = (Math.random() - 0.5) * 0.1; // 👈 small Z range
        positions.push(nx * scale, ny * scale, z);
        originals.push(nx * scale, ny * scale, 0);
        offsets.push(Math.random() * Math.PI * 2); // random wave offset
        influences.push(0.2 + Math.random() * 0.8); // range: 0.2 → 1.0
        colors.push(r / 255, g / 255, b / 255);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    "aOriginal",
    new THREE.Float32BufferAttribute(originals, 3)
  );
  geometry.setAttribute(
    "aOffset",
    new THREE.Float32BufferAttribute(offsets, 1)
  );
  geometry.setAttribute(
    "aInfluence",
    new THREE.Float32BufferAttribute(influences, 1)
  );
  geometry.setAttribute("aColor", new THREE.Float32BufferAttribute(colors, 3));

  // === [3. Create Points] ===
  const points = new THREE.Points(geometry, material);
  return points;
}

// === Utility Loader ===
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// import * as THREE from "three";

// export async function createImageParticleSystem({
//   url,
//   threshold = 0.01, // Midtone threshold range
//   maxPoints = 50000, // Cap total particles
//   scale = 5.0, // Controls canvas size
//   material,
// }) {
//   // === [1. Load and Draw Image] ===
//   const img = await loadImage(url);
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");

//   canvas.width = img.width;
//   canvas.height = img.height;
//   ctx.drawImage(img, 0, 0);

//   console.log("✅ Image loaded:", img.width, img.height);

//   const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//   const data = imgData.data;
//   const width = canvas.width;
//   const height = canvas.height;

//   // === [2. Geometry Buffers] ===
//   const positions = [];
//   const offsets = [];
//   const influences = [];
//   const colors = [];
//   let count = 0;

//   for (let y = 0; y < height; y += 2) {
//     for (let x = 0; x < width; x += 2) {
//       const index = (y * width + x) * 4;
//       const r = data[index];
//       const g = data[index + 1];
//       const b = data[index + 2];

//       const brightness = (r + g + b) / 3;

//       // Filter for midtones only
//       if (brightness > 30 && brightness < 220) {
//         const nx = x / width - 0.5;
//         const ny = y / height - 0.5;
//         const z = (Math.random() - 0.5) * 0.1;

//         positions.push(nx * scale, ny * scale, z);

//         const color = new THREE.Color(r / 255, g / 255, b / 255);
//         colors.push(color.r, color.g, color.b);

//         offsets.push(Math.random() * Math.PI * 2); // wave phase
//         influences.push(Math.random()); // subtle per-particle variation
//         if (count < 10) console.log("Brightness:", brightness);

//         count++;
//         if (count >= maxPoints) break;
//       }
//     }
//   }

//   console.log("✅ Particle count:", count);

//   const geometry = new THREE.BufferGeometry();
//   geometry.setAttribute(
//     "position",
//     new THREE.Float32BufferAttribute(positions, 3)
//   );
//   geometry.setAttribute(
//     "aOffset",
//     new THREE.Float32BufferAttribute(offsets, 1)
//   );
//   geometry.setAttribute(
//     "aInfluence",
//     new THREE.Float32BufferAttribute(influences, 1)
//   );
//   geometry.setAttribute("aColor", new THREE.Float32BufferAttribute(colors, 3));

//   geometry.computeBoundingBox();
//   console.log("📦 Bounding box min:", geometry.boundingBox.min.toArray());
//   console.log("📦 Bounding box max:", geometry.boundingBox.max.toArray());

//   // === [3. Create Particle Mesh] ===
//   const points = new THREE.Points(geometry, material);
//   return points;
// }

// // === [Image Loader] ===
// function loadImage(src) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.onload = () => resolve(img);
//     img.onerror = () => reject(new Error("❌ Failed to load image: " + src));
//     img.src = src;
//   });
// }
