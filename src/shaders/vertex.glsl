precision mediump float;

uniform float uTime;       // Global time
uniform vec2 uMouse;       // Smoothed mouse position (in NDC)
uniform float uRelaxation; // Lerp strength back to original

attribute vec3 aOriginal;  // Original (base) position
attribute float aOffset;   // Per-particle phase offset
attribute float aInfluence;
attribute vec3 aColor;
varying vec3 vColor;

// 'position' is built-in

void main() {
  vec3 pos = position;

  // === [ Organic Wave Motion ] ===
  float speed = 0.3;

  // Vertical wave (sway)
  pos.y += sin(pos.x * 4.0 + uTime * speed + aOffset) * 0.04;

  // Depth wave (adds turbulence)
  pos.z += cos(pos.y * 4.0 + uTime * speed + aOffset) * 0.03;// Add this below pos.z manipulation if desired
  pos.z += sin(pos.x * 2.0 + uTime * 0.3 + aOffset) * 0.01;


  // === [ Cursor Interaction - Soft Gaussian Push ] ===

  // Convert particle to screen space
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vec4 clipPosition = projectionMatrix * mvPosition;
  vec2 screenPosition = clipPosition.xy / clipPosition.w;
  vColor = aColor;

  // Compute distance from cursor
  float screenDist = distance(screenPosition, uMouse);

  // Gaussian falloff for smooth displacement (like water pressure)
  float force = exp(-pow(screenDist * 1.5, 2.0)) * 0.1;

  // Push direction (screen space)
  vec2 screenDir = normalize(screenPosition - uMouse);

 // Apply push in screen space (scaled by per-particle influence)
  pos.x += screenDir.x * force * aInfluence;
  pos.y += screenDir.y * force * aInfluence;


  // === [ Fade Back Toward Original Position ] ===
  pos = mix(pos, aOriginal, uRelaxation); // lerp back to original

  // === [ Final Position & Size ] ===
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  // control the size of the particles! 
  gl_PointSize = 2.2;
}
