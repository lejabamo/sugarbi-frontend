import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

interface CubeFaceProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  dimension: string;
  data: any;
  onClick: () => void;
  isHovered: boolean;
}

const CubeFace: React.FC<CubeFaceProps> = ({ 
  position, 
  rotation, 
  color, 
  dimension, 
  data, 
  onClick, 
  isHovered 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hover || isHovered ? 1.1 : 1);
    }
  });

  const totalValue = data?.reduce((sum: number, item: any) => sum + (item.value || 0), 0) || 0;
  const valueCount = data?.length || 0;

  return (
    <group position={position} rotation={rotation}>
      <Box
        ref={meshRef}
        args={[2, 2, 0.1]}
        onClick={onClick}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={hover || isHovered ? 0.9 : 0.8}
        />
      </Box>
      
      {/* Texto en la cara del cubo */}
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {dimension.toUpperCase()}
      </Text>
      
      <Text
        position={[0, -0.2, 0.06]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {valueCount} valores
      </Text>
      
      <Text
        position={[0, -0.35, 0.06]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {totalValue.toLocaleString()}
      </Text>
    </group>
  );
};

interface OLAPCube3DProps {
  selectedDimensions: string[];
  selectedMetrics: string[];
  dimensionData: Record<string, any[]>;
  onFaceClick: (dimension: string) => void;
  hoveredFace: string | null;
  onFaceHover: (dimension: string | null) => void;
}

const OLAPCube3D: React.FC<OLAPCube3DProps> = ({
  selectedDimensions,
  selectedMetrics,
  dimensionData,
  onFaceClick,
  hoveredFace,
  onFaceHover
}) => {
  const colors = [
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Amarillo
    '#EF4444', // Rojo
    '#8B5CF6', // Púrpura
    '#06B6D4'  // Cian
  ];

  const facePositions = useMemo(() => {
    const positions: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
    }> = [
      { position: [0, 0, 1], rotation: [0, 0, 0] },      // Frente
      { position: [0, 0, -1], rotation: [0, Math.PI, 0] }, // Atrás
      { position: [1, 0, 0], rotation: [0, -Math.PI/2, 0] }, // Derecha
      { position: [-1, 0, 0], rotation: [0, Math.PI/2, 0] }, // Izquierda
      { position: [0, 1, 0], rotation: [-Math.PI/2, 0, 0] }, // Arriba
      { position: [0, -1, 0], rotation: [Math.PI/2, 0, 0] }  // Abajo
    ];
    return positions;
  }, []);

  return (
    <div className="w-full h-96">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Cubo central invisible para referencia */}
        <Box args={[2, 2, 2]} visible={false} />
        
        {/* Caras del cubo basadas en dimensiones seleccionadas */}
        {selectedDimensions.map((dimension, index) => {
          const faceConfig = facePositions[index % facePositions.length];
          const data = dimensionData[dimension] || [];
          
          return (
            <CubeFace
              key={dimension}
              position={faceConfig.position}
              rotation={faceConfig.rotation}
              color={colors[index % colors.length]}
              dimension={dimension}
              data={data}
              onClick={() => onFaceClick(dimension)}
              isHovered={hoveredFace === dimension}
            />
          );
        })}
        
        {/* Cara adicional para métricas si hay espacio */}
        {selectedMetrics.length > 0 && selectedDimensions.length < 6 && (
          <CubeFace
            position={[0, 0, -1]}
            rotation={[0, Math.PI, 0]}
            color="#8B5CF6"
            dimension="Métricas"
            data={[]}
            onClick={() => onFaceClick('metrics')}
            isHovered={hoveredFace === 'metrics'}
          />
        )}
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>
    </div>
  );
};

export default OLAPCube3D;
