import { useEffect, useRef, useState } from 'react'
import { classifyGesture } from '@/lib/game/classifyGesture'
import { createGestureSmoother } from '@/lib/game/smoothGesture'
import type { Gesture, Landmark } from '@/lib/game/types'

const WASM_CDN =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
const GESTURE_UPDATE_MS = 50

type HandLandmarkerInstance = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestamp: number,
  ) => {
    landmarks: Landmark[][]
  }
  close: () => void
}

export function useHandLandmarker(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  const landmarkerRef = useRef<HandLandmarkerInstance | null>(null)
  const landmarksRef = useRef<Landmark[] | null>(null)
  const smootherRef = useRef(createGestureSmoother())
  const rafRef = useRef<number>(0)
  const lastVideoTimeRef = useRef(-1)
  const frameTimestampRef = useRef(0)
  const lastGestureEmitRef = useRef(0)
  const lastEmittedGestureRef = useRef<Gesture>('none')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gesture, setGesture] = useState<Gesture>('none')

  useEffect(() => {
    if (!enabled) {
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function init() {
      try {
        const { HandLandmarker, FilesetResolver } = await import(
          '@mediapipe/tasks-vision'
        )
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN)
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        if (cancelled) {
          landmarker.close()
          return
        }

        landmarkerRef.current = landmarker
        setReady(true)
        setLoading(false)
      } catch {
        try {
          const { HandLandmarker, FilesetResolver } = await import(
            '@mediapipe/tasks-vision'
          )
          const vision = await FilesetResolver.forVisionTasks(WASM_CDN)
          const landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL },
            runningMode: 'VIDEO',
            numHands: 1,
          })

          if (cancelled) {
            landmarker.close()
            return
          }

          landmarkerRef.current = landmarker
          setReady(true)
          setLoading(false)
        } catch {
          if (!cancelled) {
            setError('Failed to load hand tracking model.')
            setLoading(false)
          }
        }
      }
    }

    void init()

    return () => {
      cancelled = true
      landmarkerRef.current?.close()
      landmarkerRef.current = null
      landmarksRef.current = null
      smootherRef.current.reset()
      setReady(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || !ready) {
      return
    }

    const emitGesture = (next: Gesture, now: number) => {
      const changed = next !== lastEmittedGestureRef.current
      const due = now - lastGestureEmitRef.current >= GESTURE_UPDATE_MS

      if (changed) {
        lastEmittedGestureRef.current = next
        lastGestureEmitRef.current = now
        setGesture(next)
      } else if (due) {
        lastGestureEmitRef.current = now
        setGesture(next)
      }
    }

    const detect = () => {
      const video = videoRef.current
      const landmarker = landmarkerRef.current
      const now = performance.now()

      if (video && landmarker && video.readyState >= 2) {
        if (video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime
          frameTimestampRef.current += 33
          const result = landmarker.detectForVideo(
            video,
            frameTimestampRef.current,
          )

          if (result.landmarks.length > 0) {
            const handLandmarks = result.landmarks[0]
            landmarksRef.current = handLandmarks
            const raw = classifyGesture(handLandmarks)
            const smoothed = smootherRef.current.update(raw)
            emitGesture(smoothed, now)
          } else {
            landmarksRef.current = null
            const smoothed = smootherRef.current.update('none')
            emitGesture(smoothed, now)
          }
        }
      }

      rafRef.current = requestAnimationFrame(detect)
    }

    rafRef.current = requestAnimationFrame(detect)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, ready, videoRef])

  return { ready, loading, error, gesture, landmarksRef }
}
