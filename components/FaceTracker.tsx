'use client'

import { useEffect, useRef, useCallback } from 'react'

const P_MIN = -15
const P_MAX = 15
const STEP = 3
const SIZE = 256

interface FaceTrackerProps {
  basePath?: string
  debug?: boolean
  className?: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function quantizeToGrid(val: number): number {
  const raw = P_MIN + (val + 1) * (P_MAX - P_MIN) / 2
  const snapped = Math.round(raw / STEP) * STEP
  return clamp(snapped, P_MIN, P_MAX)
}

function sanitize(val: number): string {
  const str = Number(val).toFixed(1)
  return str.replace('-', 'm').replace('.', 'p')
}

function gridToFilename(px: number, py: number): string {
  return `gaze_px${sanitize(px)}_py${sanitize(py)}_${SIZE}.webp`
}

// Generate all possible filenames for preloading
function getAllFilenames(basePath: string): string[] {
  const paths: string[] = []
  for (let px = P_MIN; px <= P_MAX; px += STEP) {
    for (let py = P_MIN; py <= P_MAX; py += STEP) {
      paths.push(`${basePath}${gridToFilename(px, py)}`)
    }
  }
  return paths
}

export default function FaceTracker({
  basePath = '/faces/',
  debug = false,
  className = ''
}: FaceTrackerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const lastPathRef = useRef<string>('')

  // Preload all face images on mount
  useEffect(() => {
    const paths = getAllFilenames(basePath)
    paths.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [basePath])

  const setFromClient = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !imgRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const nx = (clientX - centerX) / (rect.width / 2)
    const ny = (centerY - clientY) / (rect.height / 2)

    const clampedX = clamp(nx, -1, 1)
    const clampedY = clamp(ny, -1, 1)

    const px = quantizeToGrid(clampedX)
    const py = quantizeToGrid(clampedY)

    const imagePath = `${basePath}${gridToFilename(px, py)}`

    // Skip if same image — no DOM update needed
    if (imagePath === lastPathRef.current) return
    lastPathRef.current = imagePath

    // Direct DOM update — bypasses React re-render
    imgRef.current.src = imagePath
  }, [basePath])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setFromClient(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const t = e.touches[0]
        setFromClient(t.clientX, t.clientY)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    // Initialize at center
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setFromClient(rect.left + rect.width / 2, rect.top + rect.height / 2)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [setFromClient])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-transparent rounded-lg ${className}`}
    >
      <img
        ref={imgRef}
        alt="Face following gaze"
        className="relative w-full h-full object-contain rounded-full"
      />
      {debug && (
        <div className="absolute top-2.5 left-2.5 bg-transparent text-white py-2 px-3 rounded font-mono text-xs leading-relaxed">
          Path: {lastPathRef.current}
        </div>
      )}
    </div>
  )
}
