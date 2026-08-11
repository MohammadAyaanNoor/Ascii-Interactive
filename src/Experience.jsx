import { OrbitControls, OrthographicCamera, Text, useFBO, useTexture } from "@react-three/drei";
import React, { useRef, useState } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AsciiEffect } from "./AsciiEffect";

function Experience() {
  const texture = useTexture('/images/girl.png'); 
  
  // Get the size of the camera's viewport
  const { viewport } = useThree();
  const planeWidth = viewport.width * 0.8;
  const planeHeight = viewport.height * 0.9;

  // 2. Calculate the X position to snap it to the left edge
  // The left edge of the screen is at (-viewport.width / 2)
  // We add (planeWidth / 2) so the center of the plane sits perfectly on the edge
  const positionX = (-viewport.width / 2) + (planeWidth / 2) + 0.5; // Added 0.5 padding
  const positionY= (-viewport.height / 2) + (planeHeight / 2) // Added 0.5 padding
  return (
    <>
      {/* <OrbitControls makeDefault /> */}
      <directionalLight position={[1, 2, 3]} intensity={1.5} />
      <ambientLight intensity={0.5} />

      <mesh position={[positionX, positionY, 0]}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>

        {/* The Post Processing Pass */}
        {/* <AsciiEffect /> */}
    </>
  );
}

export default Experience;