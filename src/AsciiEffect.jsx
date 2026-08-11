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

export function AsciiEffect() {
  const passRef = useRef();
  const { size } = useThree();
  
  const waveRef = useRef({ radius: 3.0 });
  const isColoredState = useRef(false);

  // Load both your depth map and your character atlas sprite sheet
  const depthTexture = useTexture('/images/girl2.png');
  const atlasTexture = useTexture('/images/atlas.png');

  // Configure texture sampling to keep pixel art ultra-crisp
  atlasTexture.minFilter = THREE.NearestFilter;
  atlasTexture.magFilter = THREE.NearestFilter;
  atlasTexture.generateMipmaps = false;

  // Inject both textures into the shader uniforms
  const shader = useMemo(() => {
    const customShader = { ...AsciiShader };
    customShader.uniforms.depthMap.value = depthTexture;
    // customShader.uniforms.uTexture.value = atlasTexture;
    return customShader;
  }, [depthTexture]);

  useEffect(() => {
    if (passRef.current) {
      passRef.current.uniforms.iResolution.value.set(size.width, size.height);
    }
  }, [size]);

  useEffect(() => {
    const handlePointerDown = () => {
      if (!passRef.current) return;

      const currentMouse = passRef.current.uniforms.mouse.value;
      passRef.current.uniforms.clickPos.value.copy(currentMouse);
      
      isColoredState.current = !isColoredState.current;
      passRef.current.uniforms.isColored.value = isColoredState.current ? 1.0 : 0.0;
      waveRef.current.radius = 0.01; 
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useFrame((state, delta) => {
    if (!passRef.current) return;
    
    // passRef.current.uniforms.iTime.value = state.clock.elapsedTime;
    
    const mx = (state.pointer.x + 1) / 2;
    const my = (state.pointer.y + 1) / 2;
    passRef.current.uniforms.mouse.value.set(mx, my);

    if (waveRef.current.radius < 3.0) {
      waveRef.current.radius += delta * 1.0; 
      passRef.current.uniforms.waveRadius.value = waveRef.current.radius;
    }
  });

  return (
    <Effects disableGamma>
      <shaderPass ref={passRef} args={[shader, 'inputBuffer']} />
    </Effects>
  );
}