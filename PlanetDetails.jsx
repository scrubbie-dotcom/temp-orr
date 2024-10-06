import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getPlanetInfo } from '../api'; // Assuming the API call remains the same

const textures = {
  Mercury: {
    diffuse: './textures/mercury_diffuse.png',
    bump: './textures/mercury_bump.png',
  },
  Venus: {
    diffuse: './textures/venus_diffuse.png',
    bump: './textures/venus_bump.png',
  },
  Earth: {
    diffuse: './textures/earth_diffuse.png',
    bump: './textures/earth_bump.png',
  },
  Mars: {
    diffuse: './textures/mars_diffuse.png',
    bump: './textures/mars_bump.png',
  },
  Jupiter: {
    diffuse: './textures/jupiter_diffuse.png',
    bump: './textures/jupiter_bump.png',
  },
  Saturn: {
    diffuse: './textures/saturn_diffuse.png',
    bump: './textures/saturn_bump.png',
  },
  Uranus: {
    diffuse: './textures/uranus_diffuse.png',
    bump: './textures/uranus_bump.png',
  },
  Neptune: {
    diffuse: './textures/neptune_diffuse.png',
    bump: './textures/neptune_bump.png',
  },
};

const PlanetDetails = ({ planet, onExplore, onExit }) => {
  const mountRef = useRef(null);
  const [info, setInfo] = useState({});
  const [currentInfo, setCurrentInfo] = useState(0);

  useEffect(() => {
    // Fetch planet info from mock API
    const fetchPlanetInfo = async () => {
      const data = await getPlanetInfo(planet);
      setInfo(data);
    };

    fetchPlanetInfo();
  }, [planet]);

  useEffect(() => {
    if (Object.keys(info).length > 0) {
      const interval = setInterval(() => {
        setCurrentInfo((prev) => (prev + 1) % Object.keys(info).length);
      }, 10000); // Cycle through info every 10 seconds

      return () => clearInterval(interval);
    }
  }, [info]);

  useEffect(() => {
    const mount = mountRef.current;

    // Setup scene, camera, and renderer
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 3; // Adjust for proper view distance
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    // Create planet group
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const controls = new OrbitControls(camera, renderer.domElement);

    const loader = new THREE.TextureLoader();

    // Load texture with error handling
    const material = new THREE.MeshPhongMaterial({
      map: loader.load(
        textures[planet]?.diffuse,
        () => {
          console.log('Texture loaded successfully for', planet);
        },
        undefined,
        (error) => {
          console.error('Error loading texture for', planet, error);
        }
      ),
      bumpMap: loader.load(textures[planet]?.bump),
      bumpScale: 0.04,
    });

    const geo = new THREE.SphereGeometry(1, 32, 32);
    const planetMesh = new THREE.Mesh(geo, material);
    planetGroup.add(planetMesh);

    // Add ambient light to ensure visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add a basic directional light
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(-2, 0.5, 1.5);
    scene.add(sunLight);

    function animate() {
      requestAnimationFrame(animate);
      planetMesh.rotation.y += 0.002;
      renderer.render(scene, camera);
      controls.update();
    }
    animate();

    // Handle window resizing
    const handleWindowResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      mount.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [planet]);

  const infoKeys = Object.keys(info);

  return (
    <div className="planet-details">
      <h1>{planet}</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '65%' }}>
          <div style={{ width: '100%', height: '500px' }} ref={mountRef}></div>
        </div>
        <div style={{ width: '30%', padding: '20px' }}>
          {infoKeys.length > 0 && (
            <div>
              <h2>{infoKeys[currentInfo]}</h2>
              <p>{info[infoKeys[currentInfo]]}</p>
            </div>
          )}
        </div>
      </div>
      <button onClick={onExplore}>Explore {planet}</button>
      <button onClick={onExit}>Return to Menu</button>
    </div>
  );
};

export default PlanetDetails;
