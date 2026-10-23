import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Sparkles } from '@react-three/drei';

function TrophyModel() {
    const groupRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.5; // continuous slow spin
        }
    });

    return (
        <group ref={groupRef}>
            {/* The base */}
            <mesh position={[0, -1.5, 0]}>
                <cylinderGeometry args={[1, 1.2, 0.5, 32]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, -1.2, 0]}>
                <cylinderGeometry args={[0.8, 1, 0.2, 32]} />
                <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.1} />
            </mesh>
            
            {/* The stem */}
            <mesh position={[0, -0.5, 0]}>
                <cylinderGeometry args={[0.2, 0.5, 1.5, 32]} />
                <meshStandardMaterial color="#eab308" metalness={1} roughness={0.1} />
            </mesh>

            {/* The cup body */}
            <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[1.2, 0.2, 1.5, 32]} />
                <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.1} />
            </mesh>
            
            {/* The magic energy ball inside */}
            <mesh position={[0, 1.6, 0]}>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial color="#60a5fa" metalness={0.1} roughness={0.1} transparent opacity={0.8} />
            </mesh>
        </group>
    );
}

export default function Trophy3D({ size = "h-64 w-full" }) {
    return (
        <div className={size}>
            <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
                <directionalLight position={[-10, 10, -5]} intensity={0.5} color="#eab308" />
                
                <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
                    <TrophyModel />
                </Float>
                
                {/* Magic dust */}
                <Sparkles count={50} scale={4} size={4} speed={0.4} opacity={0.5} color="#60a5fa" />
                
                <Environment preset="city" />
                <OrbitControls enableZoom={false} autoRotate={false} />
            </Canvas>
        </div>
    );
}
