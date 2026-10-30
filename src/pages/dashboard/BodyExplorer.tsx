import { useState, useRef, Suspense, Component, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ZoomIn, ZoomOut, Maximize2, RotateCcw, 
  Heart, Brain, Wind, Activity, 
  Bone, Dumbbell, Utensils, TestTube, Eye, Ear,
  X, ShieldAlert, Sparkles as SparklesIcon, Stethoscope, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, useProgress, Html, ContactShadows, Environment, Float, Preload, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- DATA & MAPPINGS ---
const ORGAN_SHORTCUTS = [
  { name: 'Skeleton', icon: Bone, category: 'Skeleton' },
  { name: 'Muscular', icon: Dumbbell, category: 'Muscular' },
  { name: 'Brain', icon: Brain, category: 'Organ', file: '/models/organs/brain.glb', image: null },
  { name: 'Heart', icon: Heart, category: 'Organ', file: '/models/organs/heart.glb', image: null },
  { name: 'Lungs', icon: Wind, category: 'Organ', file: '/models/organs/lungs.glb', image: null },
  { name: 'Liver', icon: Activity, category: 'Organ', file: '/models/organs/liver.glb', image: null },
  { name: 'Stomach', icon: Utensils, category: 'Organ', file: '/models/organs/stomach.glb', image: null },
  { name: 'Eyes', icon: Eye, category: 'Organ', file: '/models/organs/eyes.glb', image: null },
  { name: 'Ear', icon: Ear, category: 'Organ', file: '/models/organs/ear.glb', image: null },
];

const HOTSPOTS: Record<string, { id: string, name: string, position: [number, number, number], image: string | null, description?: string, diseases?: string[], medicalAdvice?: string[], naturalSuggestions?: string[] }[]> = {
  Brain: [
    {
      id: 'leftBrain',
      name: 'Left Brain',
      position: [-0.22, 0.02, 0.08],
      image: null,
      diseases: ['Stroke', 'Migraine', 'Speech Disorders', 'Memory Impairment'],
      medicalAdvice: [
        'Consult a neurologist for sudden weakness, speech difficulty, or severe headaches.'
      ],
      naturalSuggestions: [
        'Meditation',
        'Proper sleep',
        'Hydration',
        'Mental exercises'
      ]
    },
    {
      id: 'rightBrain',
      name: 'Right Brain',
      position: [0.22, 0.02, 0.08],
      image: null,
      diseases: ['Brain Tumor', 'Seizure Disorders', 'Coordination Problems', 'Visual-Spatial Disorders'],
      medicalAdvice: [
        'Seek immediate medical attention for seizures, confusion, or persistent neurological symptoms.'
      ],
      naturalSuggestions: [
        'Stress reduction',
        'Regular physical activity',
        'Healthy balanced diet'
      ]
    }
  ],
  Skeleton: [
    { id: 'skull', name: 'Skull', position: [0, 1.8, 0.2], image: '/images/bones/skull.jpg', description: 'Protects the brain and forms the shape of the face.' },
    { id: 'spine', name: 'Spine', position: [0, 0.6, 0.4], image: '/images/bones/spine.jpg', description: 'Provides structural support and protects the spinal cord.' },
    { id: 'ribcage', name: 'Rib Cage', position: [0, 1.0, -0.2], image: '/images/bones/ribcage.jpg', description: 'Encloses and protects the heart and lungs.' },
    { id: 'pelvis', name: 'Pelvis', position: [0, -0.1, 0.1], image: '/images/bones/pelvis.jpg', description: 'Connects the spine to the lower limbs.' },
    { id: 'right_arm', name: 'Right Arm', position: [-0.7, 0.5, 0], image: '/images/bones/humerus.jpg', description: 'Upper arm bone forming part of the shoulder.' },
    { id: 'left_arm', name: 'Left Arm', position: [0.7, 0.5, 0], image: '/images/bones/humerus.jpg', description: 'Upper arm bone forming part of the shoulder.' },
    { id: 'right_knee', name: 'Right Knee', position: [-0.3, -1.0, 0.1], image: '/images/bones/kneejoint.jpg', description: 'A complex hinge joint.' },
    { id: 'left_knee', name: 'Left Knee', position: [0.3, -1.0, 0.1], image: '/images/bones/kneejoint.jpg', description: 'A complex hinge joint.' },
    { id: 'feet', name: 'Feet', position: [0, -1.8, 0.2], image: '/images/bones/foot.jpg', description: 'Provides support and enables locomotion.' }
  ],
  Muscular: [
    { id: 'neck', name: 'Neck', position: [0, 1.55, 0], image: '/images/muscles/neckmuscle.jpg', description: 'Supports the head and enables a wide range of motion.' },
    { id: 'chest', name: 'Chest', position: [0, 1.22, 0.12], image: '/images/muscles/Chest (Pectoralis).jpg', description: 'Pectoral muscles responsible for movement of the shoulder joint.' },
    { id: 'abdominal', name: 'Abdominals', position: [0, 0.92, 0.14], image: '/images/muscles/Abdominal Muscles.jpg', description: 'Core muscles that support the trunk.' },
    { id: 'biceps', name: 'Biceps', position: [0.38, 1.08, 0.08], image: '/images/muscles/biceps.jpg', description: 'Front muscle of the upper arm used for flexion.' },
    { id: 'forearm', name: 'Forearm', position: [0.58, 0.88, 0.06], image: '/images/muscles/Forearm Muscles.jpg', description: 'Controls movement of the wrist and fingers.' },
    { id: 'pelvisHip', name: 'Pelvis / Hip', position: [0, 0.54, 0.12], image: null, description: 'Hip flexors and lower core stabilizing the pelvis.' },
    { id: 'quadriceps', name: 'Quadriceps', position: [0.18, 0.22, 0.1], image: '/images/muscles/Quadriceps.jpg', description: 'Group of four muscles on the front of the thigh.' },
    { id: 'calves', name: 'Calves', position: [0.18, -0.36, 0.08], image: '/images/muscles/Calf Muscles.jpg', description: 'Muscles at the back of the lower leg.' }
  ]
};

// --- PRELOADING ---
useGLTF.preload('/models/skeleton/skeleton.glb');
useGLTF.preload('/models/muscular/muscular.glb');
ORGAN_SHORTCUTS.filter(o => o.file).forEach(o => useGLTF.preload(o.file!));

// --- 3D COMPONENTS ---
function HotspotMarker({ position, name, onClick, selected }: { position: [number, number, number], name: string, onClick: () => void, selected: boolean }) {
  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`cursor-pointer group relative flex items-center justify-center`}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        {/* Pulse effect */}
        <div className={`absolute w-8 h-8 rounded-full bg-cyan-400 opacity-40 animate-ping ${selected ? 'hidden' : ''}`} />
        {/* Main dot */}
        <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${selected ? 'bg-white border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,1)] scale-150' : 'bg-cyan-500 border-cyan-200 group-hover:scale-125 group-hover:bg-cyan-400'}`} />
        {/* Label */}
        <div className={`absolute top-6 whitespace-nowrap px-3 py-1 bg-[#060b14]/90 backdrop-blur-md border rounded-lg text-xs font-bold transition-all ${selected ? 'border-cyan-400 text-cyan-200 opacity-100 translate-y-0' : 'border-cyan-900/50 text-cyan-500 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}>
          {name}
        </div>
      </motion.div>
    </Html>
  );
}

// AnatomyModel removed in favor of unified ModelLoader

// Controls Camera animations smoothly with damping
function CameraAnimator({ targetPosition, active, controlsRef }: { targetPosition: THREE.Vector3 | null, active: boolean, controlsRef: any }) {
  useFrame(() => {
    if (active && targetPosition) {
      // Smoothly damp the camera position slightly offset from the target using lerp
      controlsRef.current?.object.position.lerp(new THREE.Vector3(targetPosition.x, targetPosition.y + 0.2, targetPosition.z + 1.2), 0.05);
      
      // Smoothly damp the OrbitControls target to look exactly at the hotspot
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetPosition, 0.05);
      }
    }
  });
  return null;
}


function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center opacity-60">
        <div className="relative w-56 h-56 mb-8">
          <div className="absolute inset-0 rounded-full border-[1px] border-cyan-900/40" />
          <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-cyan-400 border-r-cyan-500/50 animate-[spin_3s_linear_infinite] shadow-[0_0_80px_rgba(6,182,212,0.2)]" />
          <div className="absolute inset-4 rounded-full border-[1px] border-cyan-900/20 border-b-blue-400 animate-[spin_4s_linear_infinite_reverse]" />
          <div className="absolute inset-10 rounded-full border border-cyan-900/10 border-t-indigo-500/40 animate-[spin_5s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center text-cyan-400 font-bold text-xl">{progress.toFixed(0)}%</div>
        </div>
        <h2 className="text-cyan-400 font-poppins font-light tracking-[0.5em] uppercase text-2xl drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] text-center whitespace-nowrap">Loading Telemetry</h2>
      </div>
    </Html>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function ModelLoader({ 
  url, 
  hotspots = [], 
  selectedHotspot, 
  onHotspotClick,
  controlsRef,
  isFloating = false,
  visible = true
}: { 
  url: string, 
  hotspots?: any[], 
  selectedHotspot?: any, 
  onHotspotClick?: (spot: any) => void,
  controlsRef: React.MutableRefObject<any>,
  isFloating?: boolean,
  visible: boolean
}) {
  const { scene } = useGLTF(url);
  const clonedScene = scene.clone();
  const { camera } = useThree();

  useEffect(() => {
    // 1. Calculate original Bounding Box
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    
    // 2. Normalize Scale (Target Size = 4 units)
    const maxDim = Math.max(size.x, size.y, size.z);
    const TARGET_SIZE = 4;
    const scale = maxDim > 0 ? (TARGET_SIZE / maxDim) : 1;
    clonedScene.scale.set(scale, scale, scale);
    
    // 3. Recalculate box after scaling to find new center
    const scaledBox = new THREE.Box3().setFromObject(clonedScene);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    
    // 4. Recenter model mathematically
    clonedScene.position.sub(scaledCenter);

    // 5. Compute optimal Camera Distance based on bounding sphere
    const finalBox = new THREE.Box3().setFromObject(clonedScene);
    const radius = finalBox.getBoundingSphere(new THREE.Sphere()).radius;
    
    // 6. Dynamically update OrbitControls limits ONLY when this model is visible
    if (visible && controlsRef.current) {
      controlsRef.current.minDistance = radius * 1.5;
      controlsRef.current.maxDistance = radius * 5;
      // We don't forcefully reset the camera position every frame, only when becoming visible
      controlsRef.current.update();
    }

    // 7. Setup shadows
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // No `.dispose()` here! We want to keep the geometry and materials in GPU memory
    // so that toggling `visible` is instant and doesn't cause black textures due to destroyed caches.
  }, [clonedScene, camera, controlsRef, visible]);

  const content = (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <hemisphereLight intensity={0.6} groundColor="#001122" color="#e0f7fa" />
      {/* Holographic Rim Lights */}
      <directionalLight position={[0, 5, -10]} intensity={3} color="#06b6d4" />
      <directionalLight position={[-10, -5, 5]} intensity={1.5} color="#3b82f6" />
      <spotLight position={[5, 10, 5]} intensity={2.5} color="#06b6d4" penumbra={1} angle={0.8} />
      
      {/* Volumetric Holographic Particles */}
      <Sparkles count={150} scale={5} size={2} speed={0.4} opacity={0.6} color="#06b6d4" />
      
      <primitive object={clonedScene} />
      
      {visible && hotspots.map((spot) => (
        <HotspotMarker 
          key={spot.id} 
          {...spot} 
          selected={selectedHotspot?.id === spot.id} 
          onClick={() => onHotspotClick?.(spot)} 
        />
      ))}
    </Float>
  );

  return isFloating ? (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2} visible={visible}>
      <group position={[0, 0, 0]}>{content}</group>
    </Float>
  ) : (
    <group position={[0, 0, 0]} visible={visible}>
      {content}
    </group>
  );
}

// --- MAIN APP ---
export default function BodyExplorer() {
  const navigate = useNavigate();
  
  // Selection State
  const [selectedSystem, setSelectedSystem] = useState<string>('Skeleton'); // Skeleton, Muscular, Organ
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null); // Details for the right panel
  const [imageError, setImageError] = useState(false);

  const controlsRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  let dynamicInfo = { issues: '', doctor: '', remedies: 'Hydration, balanced diet, turmeric, ginger, tulsi, ashwagandha, gentle exercise, stretching, breathing exercises, meditation, proper sleep, and stress reduction.' };
  switch (selectedSystem) {
      case 'Heart': dynamicInfo.issues = 'Arrhythmia, Coronary Artery Disease, Heart Failure'; dynamicInfo.doctor = 'Cardiologist'; break;
      case 'Brain': dynamicInfo.issues = 'Migraine, Cognitive Decline, Neuropathy'; dynamicInfo.doctor = 'Neurologist'; break;
      case 'Stomach': dynamicInfo.issues = 'Gastritis, Acid Reflux, Peptic Ulcer'; dynamicInfo.doctor = 'Gastroenterologist'; break;
      case 'Liver': dynamicInfo.issues = 'Fatty Liver, Hepatitis, Cirrhosis'; dynamicInfo.doctor = 'Gastroenterologist'; break;
      case 'Eyes': dynamicInfo.issues = 'Cataracts, Glaucoma, Macular Degeneration'; dynamicInfo.doctor = 'Ophthalmologist'; break;
      case 'Ear': dynamicInfo.issues = 'Tinnitus, Hearing Loss, Ear Infection'; dynamicInfo.doctor = 'ENT Specialist'; break;
      case 'Skeleton': dynamicInfo.issues = 'Osteoporosis, Arthritis, Fractures'; dynamicInfo.doctor = 'Orthopedic Doctor'; break;
      case 'Muscular': dynamicInfo.issues = 'Muscle Strains, Tendonitis, Muscle Spasms'; dynamicInfo.doctor = 'Physiotherapist or Orthopedic Specialist'; break;
      default: dynamicInfo.issues = 'General Inflammation, Tissue Damage'; dynamicInfo.doctor = 'General Physician'; break;
  }

  // Derived active organ if an organ is selected
  const activeOrganObj = ORGAN_SHORTCUTS.find(o => o.category === 'Organ' && o.name === selectedSystem);

  const handleSystemClick = (sys: any) => {
    setSelectedSystem(sys.name);
    setSelectedHotspot(null); // Reset detail panel
    setImageError(false);
    setAutoRotate(true); // resume rotation when picking a new overall system
    if (controlsRef.current) {
      controlsRef.current.reset(); // Reset camera zoom/pan
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.object.position.set(0, 0, 4.5);
      controlsRef.current.update();
    }
    
    // If it's an organ, auto-select it as the hotspot so the panel opens
    if (sys.category === 'Organ') {
       setSelectedHotspot({
           name: sys.name,
           description: `Detailed view of the ${sys.name.toLowerCase()}.`,
           image: null // organs don't have separate downloaded thumbnails in this project
       });
       setAutoRotate(false);
    }
  };

  const handleHotspotClick = (spot: any) => {
    setSelectedHotspot(spot);
    setImageError(false);
    setAutoRotate(false); // Stop rotating so user can focus
  };

  const handleResetCamera = () => {
    setSelectedHotspot(null);
    setAutoRotate(true);
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.object.position.set(0, 0, 4.5);
      controlsRef.current.update();
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Zoom logic mimicking standard OrbitControls
  const handleZoom = (delta: number) => {
    if (controlsRef.current) {
        const cam = controlsRef.current.object;
        cam.position.z += delta;
        controlsRef.current.update();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#02050a] font-inter text-slate-200 overflow-hidden selection:bg-cyan-500/30">
      
      {/* BACKGROUND EFFECTS */}
      <motion.div 
        animate={{ 
          background: [
            'radial-gradient(ellipse at 50% 50%, #0d1a30 0%, #040812 60%, #010204 100%)',
            'radial-gradient(ellipse at 50% 40%, #0f203b 0%, #040812 60%, #010204 100%)',
            'radial-gradient(ellipse at 50% 50%, #0d1a30 0%, #040812 60%, #010204 100%)'
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[90vh] h-[90vh] bg-cyan-600/20 rounded-full blur-[160px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[10%] w-[100vh] h-[100vh] bg-blue-700/20 rounded-full blur-[180px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(6, 182, 212, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 1) 1px, transparent 1px)', 
            backgroundSize: '40px 40px'
          }} 
        />
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[1px] bg-cyan-400 shadow-[0_0_40px_8px_rgba(6,182,212,0.4)] z-10 opacity-40"
        />
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: ['0vh', '-100vh'], opacity: [0, 0.8, 0], x: [0, (i % 2 === 0 ? 30 : -30), 0] }}
            transition={{ duration: Math.random() * 20 + 15, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
            className="absolute w-[2px] h-[2px] bg-cyan-300 rounded-full blur-[1px] shadow-[0_0_15px_rgba(6,182,212,1)]"
            style={{ left: `${Math.random() * 100}%`, top: '100%' }}
          />
        ))}
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)] z-10" />
      </div>

      {/* 3D VIEWER */}
      <div className="absolute inset-0 z-10 cursor-move">
        <ErrorBoundary fallback={
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center bg-rose-950/40 p-8 rounded-3xl border border-rose-900/50 backdrop-blur-md">
              <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
              <h2 className="text-rose-400 font-poppins font-light tracking-[0.2em] uppercase text-xl text-center">Telemetry Failure</h2>
              <p className="text-rose-300/80 text-sm mt-2 text-center">Unable to load 3D model resources.</p>
            </div>
          </div>
        }>
          <Canvas shadows camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
            <Suspense fallback={<Loader />}>
              <color attach="background" args={['#000000']} />
              <fog attach="fog" args={['#000000', 5, 15]} />
              
              {/* Models are persistently mounted to preserve materials, toggled via visibility */}
              <ModelLoader 
                url="/models/skeleton/skeleton.glb" 
                hotspots={HOTSPOTS.Skeleton} 
                selectedHotspot={selectedHotspot} 
                onHotspotClick={handleHotspotClick}
                controlsRef={controlsRef}
                visible={selectedSystem === 'Skeleton'}
                isFloating={true}
              />
              <ModelLoader 
                url="/models/muscular/muscular.glb" 
                hotspots={HOTSPOTS.Muscular} 
                selectedHotspot={selectedHotspot} 
                onHotspotClick={handleHotspotClick}
                controlsRef={controlsRef}
                visible={selectedSystem === 'Muscular'}
                isFloating={true}
              />
              {activeOrganObj && activeOrganObj.file && (
                <ModelLoader 
                  url={activeOrganObj.file} 
                  hotspots={HOTSPOTS[activeOrganObj.name] || []}
                  selectedHotspot={selectedHotspot}
                  onHotspotClick={handleHotspotClick}
                  controlsRef={controlsRef}
                  isFloating={true}
                  visible={selectedSystem === activeOrganObj.name}
                />
              )}
              
              <Environment preset="city" background={false} />


              <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2.5} far={4} color="#06b6d4" />
              
              {/* Post Processing */}
              <EffectComposer multisampling={4}>
                <ToneMapping />
                <Bloom luminanceThreshold={0.5} mipmapBlur intensity={0.8} />
              </EffectComposer>

              {/* Limit maxDistance will be overwritten by ModelLoader but we keep OrbitControls simple */}
              <OrbitControls 
                ref={controlsRef}
                makeDefault 
                enableDamping 
                dampingFactor={0.05} 
                enablePan={true}
                enableZoom={true}
                autoRotate={autoRotate}
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 1.5}
              />
              
              <CameraAnimator 
                 targetPosition={selectedHotspot && selectedHotspot.position ? new THREE.Vector3(...selectedHotspot.position as [number, number, number]) : null} 
                 active={!!selectedHotspot} 
                 controlsRef={controlsRef}
              />
              <Preload all />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* FLOATING UI LAYER */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col p-4 md:p-6">
        
        {/* TOP LAYOUT */}
        <div className="flex justify-between items-start w-full gap-4 md:gap-6">
          
          <div className="flex-1 flex flex-wrap items-start gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 md:w-12 md:h-12 flex shrink-0 items-center justify-center bg-[#060b14]/70 backdrop-blur-3xl border border-cyan-900/40 rounded-2xl text-slate-400 hover:text-white hover:bg-cyan-900/40 hover:border-cyan-400/60 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.6)] pointer-events-auto group"
              title="Return to Dashboard"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform text-cyan-500" />
            </button>
            
            <div className="relative w-full max-w-[280px] md:max-w-xs pointer-events-auto">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anatomy..." 
                className="w-full bg-[#060b14]/70 backdrop-blur-3xl border border-cyan-900/40 rounded-2xl py-2.5 md:py-3.5 pl-12 pr-4 text-sm text-cyan-50 placeholder:text-cyan-800/80 focus:outline-none focus:border-cyan-400/60 focus:bg-[#060b14]/90 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.6)] font-medium tracking-wide"
              />
            </div>

            <div className="flex gap-1 p-1 bg-[#060b14]/70 backdrop-blur-3xl border border-cyan-900/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] pointer-events-auto">
              <button onClick={handleResetCamera} className="p-2 md:p-3 rounded-xl text-cyan-700 hover:text-cyan-300 hover:bg-cyan-900/40 hover:shadow-[inset_0_0_15px_rgba(6,182,212,0.3)] transition-all" title="Reset Camera">
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="w-[1px] bg-cyan-900/40 my-2 mx-1" />
              <button onClick={() => handleZoom(1)} className="p-2 md:p-3 rounded-xl text-cyan-700 hover:text-cyan-300 hover:bg-cyan-900/40 hover:shadow-[inset_0_0_15px_rgba(6,182,212,0.3)] transition-all" title="Zoom Out">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button onClick={() => handleZoom(-1)} className="p-2 md:p-3 rounded-xl text-cyan-700 hover:text-cyan-300 hover:bg-cyan-900/40 hover:shadow-[inset_0_0_15px_rgba(6,182,212,0.3)] transition-all" title="Zoom In">
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-[1px] bg-cyan-900/40 my-2 mx-1" />
              <button onClick={handleFullscreen} className={`p-2 md:p-3 rounded-xl hover:bg-cyan-900/40 hover:shadow-[inset_0_0_15px_rgba(6,182,212,0.3)] transition-all ${isFullscreen ? 'text-cyan-300' : 'text-cyan-700 hover:text-cyan-300'}`} title="Fullscreen">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT AI INFORMATION PANEL */}
          <AnimatePresence>
            {selectedHotspot && (
              <motion.div 
                initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="hidden lg:flex w-[380px] h-[calc(100vh-3rem)] pointer-events-auto flex-col shrink-0 bg-[#060b14]/80 backdrop-blur-3xl border border-cyan-900/40 rounded-[32px] overflow-hidden shadow-[-30px_0_60px_rgba(0,0,0,0.6)]"
              >
                {/* Header */}
                <div className="shrink-0 p-8 border-b border-cyan-900/30 bg-gradient-to-b from-cyan-900/30 to-[#060b14]/80 relative z-10 flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl" />
                  
                  <button 
                    onClick={() => { setSelectedHotspot(null); setAutoRotate(true); }}
                    className="absolute top-6 right-6 px-3 py-1.5 flex items-center gap-1.5 rounded-xl text-cyan-500 border border-cyan-900/50 hover:bg-cyan-900/40 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.4),inset_0_0_15px_rgba(6,182,212,0.2)] transition-all z-20 group"
                  >
                    <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">Close</span>
                  </button>

                  <h2 className="text-2xl md:text-3xl font-poppins font-light text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] relative z-10 leading-tight pr-16">
                    {selectedHotspot.name}
                  </h2>
                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em] mt-2 flex items-center relative z-10 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 mr-2 animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_10px_rgba(6,182,212,1)]" />
                    Target Locked
                  </p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 p-8 overflow-y-auto hide-scrollbar space-y-8 min-h-0 relative">
                  
                  {/* Image Thumbnail (if available) */}
                  {selectedHotspot.image && !imageError && (
                    <div className="w-full h-40 rounded-2xl overflow-hidden border border-cyan-900/50 shadow-lg relative">
                       <img 
                         src={selectedHotspot.image} 
                         alt={selectedHotspot.name} 
                         className="w-full h-full object-cover opacity-80 mix-blend-screen"
                         onError={() => setImageError(true)}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#060b14] to-transparent" />
                    </div>
                  )}

                  {/* Anatomy Overview */}
                  <div>
                    <h4 className="flex items-center text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                      <FileText className="w-3.5 h-3.5 mr-2" /> Overview
                    </h4>
                    <p className="text-sm text-cyan-100/70 leading-relaxed">
                      {selectedHotspot.description} This vital anatomical structure is currently functioning within optimal biological parameters.
                    </p>
                  </div>

                  {/* Symptoms & Diseases */}
                  {selectedHotspot.diseases ? (
                    <div>
                      <h4 className="flex items-center text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] mb-3 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                        <ShieldAlert className="w-3.5 h-3.5 mr-2" /> Detected Anomalies
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {selectedHotspot.diseases.map((d: string) => (
                          <span key={d} className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/40 text-xs font-medium text-rose-200 shadow-[0_0_10px_rgba(225,29,72,0.2)]">{d}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="flex items-center text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] mb-3 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                        <ShieldAlert className="w-3.5 h-3.5 mr-2" /> Detected Anomalies
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/40 text-xs font-medium text-rose-200 shadow-[0_0_10px_rgba(225,29,72,0.2)]">Inflammation (0%)</span>
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/40 text-xs font-medium text-emerald-200">Healthy Tissue</span>
                      </div>
                    </div>
                  )}

                  {/* AI Insights / Medical Advice */}
                  {selectedHotspot.medicalAdvice ? (
                    <div>
                      <h4 className="flex items-center text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">
                        <SparklesIcon className="w-3.5 h-3.5 mr-2" /> Medical Advice
                      </h4>
                      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-sm text-indigo-100/80 leading-relaxed shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]">
                         <ul className="list-disc pl-4 space-y-2">
                           {selectedHotspot.medicalAdvice.map((a: string, i: number) => <li key={i}>{a}</li>)}
                         </ul>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="flex items-center text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">
                        <SparklesIcon className="w-3.5 h-3.5 mr-2" /> AI Diagnosis
                      </h4>
                      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-sm text-indigo-100/80 leading-relaxed shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]">
                         Deep scan reveals no structural abnormalities. Cellular density and nutrient delivery networks are nominal. Continuous monitoring recommended for peak performance.
                      </div>
                    </div>
                  )}

                  {/* Possible Issues */}
                  <div>
                    <h4 className="flex items-center text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em] mb-3 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                      <ShieldAlert className="w-3.5 h-3.5 mr-2" /> Possible Issues
                    </h4>
                    <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-900/40 text-sm text-amber-100/80 leading-relaxed shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]">
                       {dynamicInfo.issues}
                    </div>
                  </div>

                  {/* Recommended Doctor */}
                  <div>
                    <h4 className="flex items-center text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-3 drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]">
                      <Stethoscope className="w-3.5 h-3.5 mr-2" /> Recommended Doctor
                    </h4>
                    <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-900/40 text-sm text-blue-100/80 leading-relaxed shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] flex flex-col gap-3">
                       <span className="font-semibold text-blue-200">{dynamicInfo.doctor}</span>
                       <button 
                         onClick={() => {
                           const specialtyMap: Record<string, string> = {
                             'Neurologist': 'neurologist',
                             'Cardiologist': 'cardiologist',
                             'Gastroenterologist': 'gastroenterologist',
                             'Ophthalmologist': 'ophthalmologist',
                             'ENT Specialist': 'ent',
                             'Orthopedic Doctor': 'orthopedic',
                             'Physiotherapist or Orthopedic Specialist': 'physiotherapist'
                           };
                           const key = specialtyMap[dynamicInfo.doctor] || 'general';
                           navigate(`/dashboard/doctors?specialty=${key}`);
                         }}
                         className="w-full py-2 bg-blue-600/20 hover:bg-blue-500/40 border border-blue-400/50 rounded-xl text-blue-300 text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center justify-center"
                       >
                         Start Booking
                       </button>
                    </div>
                  </div>

                  {/* MediHerb & Natural Remedies */}
                  <div>
                    <h4 className="flex items-center text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-3 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                      <TestTube className="w-3.5 h-3.5 mr-2" /> MediHerb & Natural Remedies
                    </h4>
                    <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-900/40 w-full flex items-center text-sm text-emerald-100/80 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                       {dynamicInfo.remedies}
                    </div>
                  </div>

                  <div className="h-4 w-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM DOCK (Organ Shortcuts) */}
        <div className="absolute bottom-6 left-4 right-4 lg:left-6 lg:right-[420px] pointer-events-none flex justify-center items-end overflow-hidden px-2 pb-2">
          <div className="flex flex-wrap items-center justify-center gap-3 p-3 bg-[#060b14]/80 backdrop-blur-3xl border border-cyan-900/40 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] pointer-events-auto max-w-full">
            {ORGAN_SHORTCUTS.map((org) => {
              const isSelected = selectedSystem === org.name;
              return (
                <button 
                  key={org.name}
                  onClick={() => handleSystemClick(org)}
                  className={`group relative flex items-center justify-center h-14 rounded-[1.25rem] transition-all duration-300 ease-out shrink-0 border ${isSelected ? 'px-6 bg-cyan-900/60 text-cyan-300 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.7)]' : 'w-14 bg-transparent text-cyan-800 hover:bg-cyan-900/30 hover:text-cyan-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] border-transparent hover:border-cyan-500/30'}`}
                >
                  <org.icon className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ease-out shrink-0 ${isSelected ? 'scale-110 drop-shadow-[0_0_10px_rgba(6,182,212,1)]' : 'group-hover:scale-110 group-hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]'}`} />
                  
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span 
                        initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                        animate={{ width: 'auto', opacity: 1, marginLeft: '0.75rem' }}
                        exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="whitespace-nowrap text-xs md:text-sm font-bold tracking-wide overflow-hidden drop-shadow-[0_0_8px_rgba(6,182,212,1)]"
                      >
                        {org.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!isSelected && (
                    <div className="absolute -top-14 pointer-events-none z-50 flex flex-col items-center w-max max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="px-4 py-2 bg-[#0a1222]/95 backdrop-blur-2xl border border-cyan-400/60 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.7)] flex flex-col items-center relative">
                        <span className="text-[10px] md:text-xs font-bold text-cyan-50 whitespace-nowrap tracking-wider">{org.name}</span>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0a1222]/95 border-b border-r border-cyan-400/60 rotate-45 transform" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
