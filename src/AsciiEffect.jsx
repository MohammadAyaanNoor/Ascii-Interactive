// import React, { useRef, useMemo, useEffect } from 'react';
// import { useFrame, extend, useThree } from '@react-three/fiber';
// import { Effects, useTexture } from '@react-three/drei';
// import { ShaderPass } from 'three-stdlib';
// import { AsciiShader } from './AsciiShader';
// import * as THREE from 'three';

// // Register ShaderPass with R3F so we can use <shaderPass /> as a component
// extend({ ShaderPass });

// export function AsciiEffect() {
//   const passRef = useRef();
//   const { size } = useThree();
  
//   // Load your ASCII character sprite sheet
//   const [charTexture,depthTexture] = useTexture(['/images/thick.png','/images/girl2.png']);
//   useEffect(() => {
//   if (charTexture) {
//     charTexture.minFilter = THREE.NearestFilter;
// charTexture.magFilter = THREE.NearestFilter;
// charTexture.generateMipmaps = false;
//     charTexture.wrapS = THREE.RepeatWrapping;
//     charTexture.wrapT = THREE.RepeatWrapping;
//     charTexture.needsUpdate = true;
//   }
// }, [charTexture]);

//   // Clone the shader object and inject the texture
//   const shader = useMemo(() => {
//     const customShader = { ...AsciiShader };
//     customShader.uniforms.e0UCharacters.value = charTexture;
//     customShader.uniforms.e0UDepthMap.value = depthTexture;
//     customShader.uniforms.e0UEnableDepthParallax.value = true;
    
//     // Optional: You can tweak these values to make the 3D effect stronger or weaker
//     customShader.uniforms.e0UParallaxIntensity = { value: 0.05 }; 
//     customShader.uniforms.e0UParallaxOffset = { value: new THREE.Vector2(0.1, 0.1) };
//     return customShader;
//   }, [charTexture, depthTexture]);

//   // Update resolution uniform when window resizes
//   useEffect(() => {
//     if (passRef.current) {
//       passRef.current.uniforms.resolution.value.set(size.width, size.height);
//     }
//   }, [size]);

//   // Update time and mouse uniforms per frame
//   useFrame((state) => {
//     if (!passRef.current) return;
//     const uniforms = passRef.current.uniforms;

//     // Update Time
//     uniforms.e0UTime.value = state.clock.elapsedTime;

//     // R3F pointer is mapped from -1 to 1. GLSL UV is 0 to 1.
//     const mx = (state.pointer.x + 1) / 2;
//     const my = (state.pointer.y + 1) / 2;
//     uniforms.e0UMouse.value.set(mx, my);
//   });

//   return (
//     // 'disableGamma' ensures colors don't get double-corrected by R3F and the shader
//     <Effects disableGamma>
//       {/* 
//         The second argument 'inputBuffer' tells ShaderPass to inject the 
//         scene render into the 'inputBuffer' uniform instead of 'tDiffuse'
//       */}
//       <shaderPass ref={passRef} args={[shader, 'inputBuffer']} />
//     </Effects>
//   );
// }


//old
import React, { useRef, useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Effects, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { AsciiShader } from './AsciiShader'; 

const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const easeOutCirc = (t) => {
  return Math.sqrt(1 - Math.pow(t - 1, 2));
};
const easeOutBounce = (t) => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } 
   else {
    const t2 = t - 2.625 / d1;
    return n1 * t2 * t2 + 0.984375;
  }
};
const easeInBounce = (t) => {
  return 1 - easeOutBounce(1 - t);
};
const easeInCubic = (t) => {
  return t * t * t;
};
export function AsciiEffect() {
  const passRef = useRef();
  // 1. Destructure 'gl' to get access to the actual WebGL canvas
  const { size, gl } = useThree();
  
  const waveProgress = useRef(1.0);
  const isColoredState = useRef(false);

  const depthTexture = useTexture('/images/girl2.png');
  // const atlasTexture = useTexture('/images/atlas.png');

  // atlasTexture.minFilter = THREE.NearestFilter;
  // atlasTexture.magFilter = THREE.NearestFilter;
  // atlasTexture.generateMipmaps = false;

  const shader = useMemo(() => {
    const customShader = { ...AsciiShader };
    customShader.uniforms.depthMap.value = depthTexture;
    return customShader;
  }, [depthTexture]);

  useEffect(() => {
    if (passRef.current) {
      passRef.current.uniforms.iResolution.value.set(size.width, size.height);
    }
  }, [size]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!passRef.current) return;

      const currentMouse = passRef.current.uniforms.mouse.value;
      passRef.current.uniforms.clickPos.value.copy(currentMouse);
      
      isColoredState.current = !isColoredState.current;
      passRef.current.uniforms.isColored.value = isColoredState.current ? 1.0 : 0.0;
      waveProgress.current = 0.0;
    };

    // 2. Attach the event specifically to the 3D canvas, NOT the global window
    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    
    // 3. Cleanup the event listener properly
    return () => canvas.removeEventListener('pointerdown', handlePointerDown);
  }, [gl]); // Add 'gl' to the dependency array

  useFrame((state, delta) => {
    if (!passRef.current) return;
    
    passRef.current.uniforms.iTime.value = state.clock.elapsedTime;
    
    // --- UPDATED: Smooth Mouse Lerping ---
    // 1. Calculate where the mouse actually is (Target)
    const targetX = (state.pointer.x + 1) / 2;
    const targetY = (state.pointer.y + 1) / 2;
    
    // 2. Get current position of the shader's cursor
    const currentMouse = passRef.current.uniforms.mouse.value;

    // 3. Smoothly interpolate (lerp) from current to target
    // The "10 * delta" controls the speed. 
    // Lower (e.g., 5 * delta) = slower/lazier follow. 
    // Higher (e.g., 20 * delta) = faster/tighter follow.
    currentMouse.x = THREE.MathUtils.lerp(currentMouse.x, targetX, 10 * delta);
    currentMouse.y = THREE.MathUtils.lerp(currentMouse.y, targetY, 10 * delta);

    if (waveProgress.current < 1.0) {
      // 0.8 controls the speed. Lower = slower, Higher = faster
      waveProgress.current += delta * 0.8; 
      
      // Clamp at 1.0 so it stops perfectly at the end
      if (waveProgress.current > 1.0) {
        waveProgress.current = 1.0;
      }
      
      // Pass the linear progress into the easing function
      const easedProgress = easeInCubic(waveProgress.current);
      
      // Multiply the eased value (0.0 to 1.0) by the MAX radius you want
      const MAX_RADIUS = 1.0; // Adjust this if your wave needs to go further
      passRef.current.uniforms.waveRadius.value = easedProgress * MAX_RADIUS;
    }
  });

  return (
    <Effects disableGamma>
      <shaderPass ref={passRef} args={[shader, 'inputBuffer']} />
    </Effects>
  );
}