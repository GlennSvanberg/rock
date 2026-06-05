import { useEffect, useRef } from 'react'
import { drawHandLandmarks } from '@/lib/game/landmarks'
import type { Landmark } from '@/lib/game/types'

type HandCameraProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>
  landmarksRef: React.RefObject<Landmark[] | null>
  connections: Array<{ start: number; end: number }>
  active: boolean
}

export function HandCamera({
  videoRef,
  landmarksRef,
  connections,
  active,
}: HandCameraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) {
      return
    }

    const resize = () => {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
    }

    video.addEventListener('loadedmetadata', resize)
    resize()

    return () => {
      video.removeEventListener('loadedmetadata', resize)
    }
  }, [videoRef])

  useEffect(() => {
    if (!active) {
      return
    }

    const draw = () => {
      const canvas = canvasRef.current
      const landmarks = landmarksRef.current

      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          if (!landmarks || landmarks.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          } else {
            drawHandLandmarks(
              ctx,
              landmarks,
              connections,
              canvas.width,
              canvas.height,
            )
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [active, landmarksRef, connections])

  return (
    <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] shadow-[0_0_20px_rgba(57,255,20,0.08)]">
      <video
        ref={videoRef}
        className="h-full w-full scale-x-[-1] object-cover"
        playsInline
        muted
        autoPlay
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full scale-x-[-1]"
      />
    </div>
  )
}
