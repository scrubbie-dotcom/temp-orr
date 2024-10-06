import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import * as THREE from 'three';
import spline from './spline';

extend({ EffectComposer, RenderPass, UnrealBloomPass });

function StarryBackground() {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/stars.jpg', (texture) => {
      scene.background = texture;
    });
  }, [scene]);

  return null;
}

function Wormhole({ asteroidRefs }) {
  const { scene, camera, gl } = useThree();
  const tubeRef = useRef();
  const composerRef = useRef();
  const controlsRef = useRef();

  useEffect(() => {
    const composer = new EffectComposer(gl);
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 100);
    bloomPass.threshold = 0.002;
    bloomPass.strength = 3.5;
    bloomPass.radius = 0;

    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    const onResize = () => {
      const { innerWidth, innerHeight } = window;
      composer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      gl.setSize(innerWidth, innerHeight);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [scene, camera, gl]);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const tubeGeo = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);
    const edges = new THREE.EdgesGeometry(tubeGeo, 0.2);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const tubeLines = new THREE.LineSegments(edges, lineMat);
    scene.add(tubeLines);

    const tunnelMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 1.0,
      transparent: true,
    });
    const tunnelMesh = new THREE.Mesh(tubeGeo, tunnelMaterial);
    scene.add(tunnelMesh);

    const numAsteroids = 55;
    loader.load('/asteroid.jpg', (texture) => {
      const asteroidGeo = new THREE.IcosahedronGeometry(0.075, 0);
      const asteroidMat = new THREE.MeshBasicMaterial({ map: texture });
      for (let i = 0; i < numAsteroids; i += 1) {
        const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
        const p = (i / numAsteroids + Math.random() * 0.1) % 1;
        const pos = tubeGeo.parameters.path.getPointAt(p);
        pos.x += Math.random() - 0.4;
        pos.z += Math.random() - 0.4;
        asteroid.position.copy(pos);
        const rote = new THREE.Vector3(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        asteroid.rotation.set(rote.x, rote.y, rote.z);
        asteroid.userData = { id: i, points: Math.floor(Math.random() * 10 + 1) };
        scene.add(asteroid);
        asteroidRefs.current.push(asteroid);
      }
    });
    tubeRef.current = tubeGeo;
  }, [scene, asteroidRefs]);

  useFrame(({ clock }) => {
    const tubeGeo = tubeRef.current;
    if (!tubeGeo) return;

    const time = clock.getElapsedTime() * 0.1;
    const looptime = 10;
    const p = (time % looptime) / looptime;
    const pos = tubeGeo.parameters.path.getPointAt(p);
    const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);

    if (pos && lookAt) {
      camera.position.copy(pos);
      camera.lookAt(lookAt);
    }

    composerRef.current?.render();
  });

  return <OrbitControls ref={controlsRef} />;
}


const WormholeScene = ({ onWormholeEnd }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [shotsLeft, setShotsLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [showFact, setShowFact] = useState(false);
  const [factImages] = useState(['/fact1.jpg', '/fact2.jpg', '/fact3.jpg']); // Add more facts here
  const [currentFact, setCurrentFact] = useState('');
  const asteroidRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setShowFact(true);
      setCurrentFact(factImages[Math.floor(Math.random() * factImages.length)]); // Random fact image
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [factImages]);

  const handleClick = (event) => {
    // Handle asteroid clicks and score updating
  };

  return (
    <>
      <div className="overlay">
        <div className="timer">Time Left: {timeLeft} seconds</div>
        <div className="score">Score: {score}</div>
        <div className="shots-left">Shots Left: {shotsLeft}</div>
      </div>
      {showFact ? (
        <div className="fact-image">
          <img src={currentFact} alt="Random Fact" style={{ width: '100%', height: 'auto' }} />
        </div>
      ) : (
        <Canvas
          camera={{ fov: 75, position: [0, 0, 5], near: 0.1, far: 1000 }}
          style={{ height: '100vh', width: '100vw' }}
          onClick={handleClick}
        >
          <StarryBackground />
          <Wormhole asteroidRefs={asteroidRefs} />
        </Canvas>
      )}
      {timeLeft <= 0 && (
        <div className="popup">
          <div className="popup-content">
            <h2>Your Score: {score}</h2>
            <button onClick={onWormholeEnd}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default WormholeScene;