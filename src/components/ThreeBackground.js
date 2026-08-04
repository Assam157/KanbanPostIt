 import React, { useEffect, useRef } from 'react';

const ThreeBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const THREE = window.THREE;
    if (!THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 100;
      posArray[i + 1] = (Math.random() - 0.5) * 60;
      posArray[i + 2] = (Math.random() - 0.5) * 40;
      const color = new THREE.Color(`hsl(${Math.random() * 60 + 30}, 70%, 75%)`);
      colorArray[i] = color.r;
      colorArray[i + 1] = color.g;
      colorArray[i + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseX = 0, mouseY = 0;
    const onMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.x += 0.0002;
      particles.rotation.y += 0.0003;
      particles.rotation.x += mouseY * 0.0005;
      particles.rotation.y += mouseX * 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

export default ThreeBackground;