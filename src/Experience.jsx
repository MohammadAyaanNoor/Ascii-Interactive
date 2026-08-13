import { Image } from "@react-three/drei";
import React from "react";
import { useThree } from "@react-three/fiber";

export default function Experience() {
  // Extract both viewport (3D units) and size (pixels)
  const { viewport, size } = useThree();
  
  // Check if the screen is mobile (e.g., less than 500px wide)
  const isMobile = size.width < 500;
  
  // 1. Define different multipliers based on device
  // Desktop: 80% width, 90% height
  // Mobile: 60% width, 50% height (Adjust these numbers to your liking!)
  const widthMultiplier = isMobile ? 1.1 : 0.7;
  const heightMultiplier = isMobile ? 1.0 : 0.8;

  const planeWidth = viewport.width * widthMultiplier;
  const planeHeight = viewport.height * heightMultiplier;

  // 2. Position math automatically adapts to the new sizes
  const positionX = (-viewport.width / 2) + (planeWidth / 2) + 0.5;
  const positionY = (-viewport.height / 2) + (planeHeight / 2);

  return (
    <>
      <directionalLight position={[1, 2, 3]} intensity={1.5} />
      <ambientLight intensity={0.5} />

      <Image
        url="/images/girl.png"
        position={[positionX, positionY, 0]}
        scale={[planeWidth, planeHeight]}
        toneMapped={false}
        fit="cover" 
      />
    </>
  );
}