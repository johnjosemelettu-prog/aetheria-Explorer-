
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
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000)
    camera.position.z = 0.01

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    currentMount.appendChild(renderer.domElement)

    const geometry = new THREE.SphereGeometry(500, 60, 40)
    geometry.scale(-1, 1, 1)

    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(textureUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      const material = new THREE.MeshBasicMaterial({ map: texture })
      const sphere = new THREE.Mesh(geometry, material)
      scene.add(sphere)
    })

    let isUserInteracting = false
    let onPointerDownMouseX = 0, onPointerDownMouseY = 0, lon = 0, onPointerDownLon = 0, lat = 0, onPointerDownLat = 0

    const onPointerDown = (event: PointerEvent) => {
      isUserInteracting = true
      onPointerDownMouseX = event.clientX; onPointerDownMouseY = event.clientY
      onPointerDownLon = lon; onPointerDownLat = lat
    }

    const onPointerMove = (event: PointerEvent) => {
      if (isUserInteracting) {
        lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon
        lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat
      }
    }

    const onPointerUp = () => { isUserInteracting = false }

    currentMount.addEventListener('pointerdown', onPointerDown)
    currentMount.addEventListener('pointermove', onPointerMove)
    currentMount.addEventListener('pointerup', onPointerUp)

    const animate = () => {
      requestAnimationFrame(animate)
      lat = Math.max(-85, Math.min(85, lat))
      const phi = THREE.MathUtils.degToRad(90 - lat)
      const theta = THREE.MathUtils.degToRad(lon)
      const x = 500 * Math.sin(phi) * Math.cos(theta), y = 500 * Math.cos(phi), z = 500 * Math.sin(phi) * Math.sin(theta)
      camera.lookAt(x, y, z)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      if (currentMount) {
        currentMount.removeEventListener('pointerdown', onPointerDown)
        currentMount.removeEventListener('pointermove', onPointerMove)
        currentMount.removeEventListener('pointerup', onPointerUp)
        currentMount.removeChild(renderer.domElement)
      }
      geometry.dispose()
    }
  }, [textureUrl])

  return <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
}

export default VRViewer
