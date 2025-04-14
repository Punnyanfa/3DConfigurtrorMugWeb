import { Decal, Environment, OrbitControls, useTexture } from "@react-three/drei";
import { texture } from "three/tsl";
import { Mug } from "./Mug";

export const Experience = () => {
  const texture = useTexture("/texture/Umeko.jpg");
  return (
    <>
      <OrbitControls />
      <Mug/>
      <Environment preset="city"/>
      {/* <mesh>
        <boxGeometry />
        <meshNormalMaterial />
   
      <Decal
      debug
      position={[0, 0, -0.5]}
      rotation={[0, 0, 0]}
      scale={[0.5,0.5, 0.5]}
        
      >
        <meshBasicMaterial 
        map={texture}
        polygonOffset
        polygonOffsetFactor={-1}  
        
        />
      </Decal>
      </mesh> */}
    </>
  );
};
