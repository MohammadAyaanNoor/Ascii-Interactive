import React, { Suspense } from 'react'
import './App.css'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import { ACESFilmicToneMapping, CineonToneMapping, LinearSRGBColorSpace, NoToneMapping, SRGBColorSpace } from 'three'
import { AsciiEffect } from './AsciiEffect.jsx'
import { linearToneMapping } from 'three/tsl'


function App() {
  const handlePointerDown = (e) => {
    // Get normalized coordinates (0 to 1) based on screen click
    const x = e.clientX / window.innerWidth;
    const y = 1.0 - (e.clientY / window.innerHeight);
    
    // You would typically use a library like GSAP here to animate 
    // e0UImpactProgress from 0 to 1 over time to create the ripple.
    console.log("Clicked at UV:", x, y);
  };
  return (
   <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#000' }}>
     
      <div style={{ width: '50%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: 'white',fontSize:'5vw', fontFamily: 'helvetica',fontWeight:'400' }}>
          The digital landmark <br/> studio.
        </h1>
      </div>
       <div style={{ width: '50%', height: '100%', position: 'relative' }}>
        <Canvas
          dpr={[1, 2]}
          gl={{
            antialias: true,
            toneMapping: NoToneMapping,
            outputColorSpace: SRGBColorSpace
          }}
          camera={{ fov: 45, near: 0.1, far: 200, position: [0, 0, 5] }}
        >
          <Suspense fallback={null}>
            <Experience />
            <AsciiEffect />
          </Suspense>
        </Canvas>
      </div>

    </div>
  )
}

export default App