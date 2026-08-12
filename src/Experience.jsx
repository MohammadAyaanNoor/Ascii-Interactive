import { OrbitControls, OrthographicCamera, Text, Image } from "@react-three/drei";
import React from "react";
import { useThree } from "@react-three/fiber";

function Experience() {
  const { viewport } = useThree();
  
  // 1. Define the bounding box area you want the image to occupy
  const planeWidth = viewport.width * 0.8;
  const planeHeight = viewport.height * 0.9;

  // 2. Position math remains exactly the same!
  const positionX = (-viewport.width / 2) + (planeWidth / 2) + 0.5;
  const positionY = (-viewport.height / 2) + (planeHeight / 2);

  return (
    <>
      <directionalLight position={[1, 2, 3]} intensity={1.5} />
      <ambientLight intensity={0.5} />

      {/* 
        Replace your <mesh> with <Image>.
        It automatically prevents aspect ratio distortion!
      */}
      <Image
        url="/images/girl.png" // Pass the URL directly
        position={[positionX, positionY, 0]}
        scale={[planeWidth, planeHeight]} // The size of the "frame"
        toneMapped={false}
        fit="cover" // (Default) Crops the image to fill the scale without stretching
        // fit="contain" // Uncomment this if you want to see the whole image without cropping
      />
    </>
  );
}

export default Experience;