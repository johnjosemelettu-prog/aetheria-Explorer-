'use client'

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

interface VRViewerProps {
  textureUrl: string
}

const VRViewer: React.FC<VRViewerProps> = ({ textureUrl }) => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const currentMount = mountRef.current

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 0.01

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    currentMount.appendChild(renderer.domElement)

    // Sphere
    const geometry = new THREE.SphereGeometry(500, 60, 40)
    geometry.scale(-1, 1, 1) // Invert the geometry on the x-axis so that we see it from the inside

    // Texture
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(textureUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      const material = new THREE.MeshBasicMaterial({ map: texture })
      const sphere = new THREE.Mesh(geometry, material)
      scene.add(sphere)
    }, undefined, (error) => {
        console.error('An error happened while loading the texture.', error)
    })

    // Controls
    let isUserInteracting = false
    let onPointerDownMouseX = 0
    let onPointerDownMouseY = 0
    let lon = 0
    let onPointerDownLon = 0
    let lat = 0
    let onPointerDownLat = 0
    let phi = 0
    let theta = 0

    const onPointerDown = (event: PointerEvent | TouchEvent) => {
      isUserInteracting = true
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      onPointerDownMouseX = clientX
      onPointerDownMouseY = clientY

      onPointerDownLon = lon
      onPointerDownLat = lat
    }

    const onPointerMove = (event: PointerEvent | TouchEvent) => {
      if (isUserInteracting === true) {
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        lon = (onPointerDownMouseX - clientX) * 0.1 + onPointerDownLon
        lat = (clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat
      }
    }

    const onPointerUp = () => {
      isUserInteracting = false
    }

    currentMount.addEventListener('pointerdown', onPointerDown)
    currentMount.addEventListener('pointermove', onPointerMove)
    currentMount.addEventListener('pointerup', onPointerUp)
    currentMount.addEventListener('pointerleave', onPointerUp);


    // Animation
    const animate = () => {
      requestAnimationFrame(animate)
      lat = Math.max(-85, Math.min(85, lat))
      phi = THREE.MathUtils.degToRad(90 - lat)
      theta = THREE.MathUtils.degToRad(lon)

      const x = 500 * Math.sin(phi) * Math.cos(theta)
      const y = 500 * Math.cos(phi)
      const z = 500 * Math.sin(phi) * Math.sin(theta)

      camera.lookAt(x, y, z)
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if(currentMount) {
        currentMount.removeEventListener('pointerdown', onPointerDown)
        currentMount.removeEventListener('pointermove', onPointerMove)
        currentMount.removeEventListener('pointerup', onPointerUp)
        currentMount.removeEventListener('pointerleave', onPointerUp);
        currentMount.removeChild(renderer.domElement)
      }
      geometry.dispose()
      // Note: material and texture are disposed automatically when they are no longer used
    }
  }, [textureUrl])

  return <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
}

export default VRViewer
