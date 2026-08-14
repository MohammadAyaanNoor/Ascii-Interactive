// import React, { Suspense, useRef, useEffect } from 'react';
// import './App.css';
// import { Canvas } from '@react-three/fiber';
// import Experience from './Experience.jsx';
// import { NoToneMapping, SRGBColorSpace } from 'three';
// import { AsciiEffect } from './AsciiEffect.jsx';
// import { animate, stagger } from 'framer-motion';

// function App() {
//   const yellowRef1 = useRef(null);
//   const whiteRef1 = useRef(null);
//   const yellowRef2 = useRef(null);
//   const whiteRef2 = useRef(null);

// // ... other imports

// useEffect(() => {
//   const sequence = animate([
//     // 0. INITIAL STATE: Reset both to 0 width, anchored left
//     [[yellowRef1.current, yellowRef2.current], { scaleX: 0, transformOrigin: "left" }, { duration: 0 }],
//     [[whiteRef1.current, whiteRef2.current], { scaleX: 0, transformOrigin: "left" }, { duration: 0 }],

//     // 1. YELLOW IN: Expands left → right
//     [[yellowRef1.current, yellowRef2.current], { scaleX: 1 }, { duration: 0.8, ease: "easeInOut", delay: stagger(0.2) }],

//     // 2. WHITE IN: Expands left → right, starting slightly after yellow begins
//     // 'at: "-0.6"' means this animation starts 0.6 seconds BEFORE the previous one ends
//     [[whiteRef1.current, whiteRef2.current], { scaleX: 1 }, { duration: 0.8, ease: "easeInOut", delay: stagger(0.2), at: "-0.6" }],

//     // 3. FLIP ANCHORS: Instantly flip the origin to the right for both divs
//     // We add a tiny "+0.2" delay so the full solid block sits on screen for a split second before shrinking
//     [[yellowRef1.current, yellowRef2.current], { transformOrigin: "right" }, { duration: 0, at: "+0.2" }],
//     [[whiteRef1.current, whiteRef2.current], { transformOrigin: "right" }, { duration: 0 }],

//     // 4. YELLOW OUT: Shrinks back to 0 (since origin is right, it collapses toward the right)
//     [[yellowRef1.current, yellowRef2.current], { scaleX: 0 }, { duration: 0.8, ease: "easeInOut", delay: stagger(0.2) }],

//     // 5. WHITE OUT: Shrinks back to 0, sweeping off to the right slightly after yellow
//     [[whiteRef1.current, whiteRef2.current], { scaleX: 0 }, { duration: 0.8, ease: "easeInOut", delay: stagger(0.2), at: "-0.6" }],
//   ]);

//   return () => sequence.stop();
// }, []);

//   const handlePointerDown = (e) => {
//     const x = e.clientX / window.innerWidth;
//     const y = 1.0 - (e.clientY / window.innerHeight);
//     console.log("Clicked at UV:", x, y);
//   };

//   return (
//    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#000' }}>
     
//       <div className='text' >
//         {/* Make sure your CSS for .white and .yellow includes:
//             position: absolute, left: 0, top: 0, height: 100% 
//             relative to their container to mask properly! */}
//         <div></div>
//           <div ref={whiteRef1} className="white"></div>
//           <div ref={yellowRef1} className="yellow"></div>
//           <h1 className='firsth1'>The digital landmark</h1>
        
        
        

        
//           <div ref={whiteRef2} className="white"></div>
//           <div ref={yellowRef2} className="yellow"></div>
//           <h1 className='secondh1'>studio</h1>
        
//       </div>

//        <div style={{ width: '50%', height: '100%', position: 'relative' }}>
//         <Canvas
//           dpr={[1, 2]}
//           gl={{
//             antialias: true,
//             toneMapping: NoToneMapping,
//             outputColorSpace: SRGBColorSpace,
//             preserveDrawingBuffer: true
//           }}
//           camera={{ fov: 45, near: 0.1, far: 200, position: [0, 0, 5] }}
//         >
//           <Suspense fallback={null}>
//             <Experience />
//             <AsciiEffect />
//           </Suspense>
//         </Canvas>
//       </div>

//     </div>
//   )
// }

// export default App;



import React, { Suspense, useEffect } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience.jsx';
import { NoToneMapping, SRGBColorSpace } from 'three';
import { AsciiEffect } from './AsciiEffect.jsx';
import { motion, useAnimate, stagger, cubicBezier, easeIn, easeInOut, easeOut } from 'framer-motion';
import AsciiEffectComponent from './AsciiEffectComponent.jsx';

function App() {
  const [scope, animate] = useAnimate();



  useEffect(() => {
    // Both masks will take exactly 0.4 seconds to complete a movement
    const ANIMATION_SPEED = 0.2;
    const STAGGER_GAP = 0.2; // The delay between the first and second line of text
    const easing = cubicBezier(.35,.17,.3,.86)
    // const easing = easeOut
    // 1. YELLOW TIMELINE
    const runYellow = async () => {
      // Yellow Expands
      await animate(
        ".mask-yellow", 
        { scaleX: 1 }, 
        { duration: ANIMATION_SPEED, ease: easing, delay: stagger(STAGGER_GAP) }
      );
      
      // Instantly flip anchor
      animate(".mask-yellow", { transformOrigin: "right" }, { duration: 0 });

      animate("h1", { opacity: 1 }, { duration: 0 });
      
      // Yellow Shrinks (Starts immediately after expanding)
       animate(
        ".mask-yellow", 
        { scaleX: 0 }, 
        { duration: ANIMATION_SPEED, ease: easing, delay: stagger(0.1) }
      );
    };

    // 2. WHITE TIMELINE
    const runWhite = async () => {
      // White Expands (Starts exactly 0.1s AFTER yellow starts expanding)
      await animate(
        ".mask-white", 
        { scaleX: 1 }, 
        { duration: ANIMATION_SPEED, ease: easing, delay: stagger(STAGGER_GAP, { startDelay: 0.1 }) }
      );
      
      // Instantly flip anchor
      animate(".mask-white", { transformOrigin: "right" }, { duration: 0 });
      
      // White Shrinks (Because it finished expanding 0.1s after yellow, 
      // this naturally starts shrinking EXACTLY 0.1s after yellow starts shrinking!)
      await animate(
        ".mask-white", 
        { scaleX: 0 }, 
        { duration: ANIMATION_SPEED, ease: easing, delay: stagger(STAGGER_GAP) }
      );
    };

    // Fire both at the exact same time
    runYellow();
    runWhite();
  }, [animate]);
//  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 500);

// const [isLowEndDevice] = useState(() => {
//   const lowCores = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;
//   const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
  
//   return lowCores || lowMemory;
// });

// useEffect(() => {
//   const handleResize = () => {
//     setIsMobile(window.innerWidth < 500);
//   };

//   window.addEventListener('resize', handleResize);
//   return () => window.removeEventListener('resize', handleResize);
// }, []);

  // return (

    
    
  //  <div className='main-layout' style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#000' }}>
     
  //     <div ref={scope} className='text' >
        
  //       {/* First Line */}
  //       <div style={{ position: 'relative', display: 'inline-block' }}>
          
  //         {/* ADDED initial PROP HERE: Guarantees they start invisible and anchored left instantly */}
  //      <motion.div 
  //           className="white mask-white" 
  //           initial={{ scaleX: 0, transformOrigin: "left" }}
  //         />
  //         <motion.div 
  //           className="yellow mask-yellow" 
  //           initial={{ scaleX: 0, transformOrigin: "left" }}
  //         />
          
  //         <motion.h1 className='firsth1' initial={{ opacity: 0 }}>The digital landmark</motion.h1>
  //     </div>
      
        
  //       <br />

  //       {/* Second Line */}
  //       <div style={{ position: 'relative', display: 'inline-block' }}>
          
  //         {/* ADDED initial PROP HERE */}
  //         <motion.div 
  //           className="white mask-white" 
  //           initial={{ scaleX: 0, transformOrigin: "left" }}
  //         />
  //         <motion.div 
  //           className="yellow mask-yellow" 
  //           initial={{ scaleX: 0, transformOrigin: "left" }}
  //         />
          
  //         <motion.h1 className='secondh1' initial={{ opacity: 0 }}>studio</motion.h1>
  //       </div>

  //     </div>
    
  //      <div className='canvas-container'>
  //       <Canvas
        
  //         dpr={[1, 2]}
  //         gl={{
  //           antialias: true,
  //           toneMapping: NoToneMapping,
  //           outputColorSpace: SRGBColorSpace,
  //           preserveDrawingBuffer: true,
          
  //         }}
          
  //         camera={{ fov: 45, near: 0.1, far: 200, position: [0, 0, 5] }}
  //       >
  //         <Suspense fallback={null}>
  //           {/* <Experience />
  //           <AsciiEffect /> */}
  //           <AsciiEffectComponent/>
  //         </Suspense>
  //       </Canvas>
  //     </div>
  //   </div>
  // )
  return (
   <div className='main-layout' style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#000' }}>
     
      <div ref={scope} className='text' >
        {/* First Line */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <motion.div className="white mask-white" initial={{ scaleX: 0, transformOrigin: "left" }} />
          <motion.div className="yellow mask-yellow" initial={{ scaleX: 0, transformOrigin: "left" }} />
          <motion.h1 className='firsth1' initial={{ opacity: 0 }}>The digital landmark</motion.h1>
        </div>
      
        <br />

        {/* Second Line */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <motion.div className="white mask-white" initial={{ scaleX: 0, transformOrigin: "left" }} />
          <motion.div className="yellow mask-yellow" initial={{ scaleX: 0, transformOrigin: "left" }} />
          <motion.h1 className='secondh1' initial={{ opacity: 0 }}>studio</motion.h1>
        </div>
      </div>
    
       <div className='canvas-container'>
          {/* ✅ Just render the component directly. It already has a Canvas inside it! */}
          <AsciiEffectComponent 
          textureImage="/images/girl.png" 
          depthMapImage="/images/girl2.png"
          />
      </div>
    </div>
  )
}

export default App;