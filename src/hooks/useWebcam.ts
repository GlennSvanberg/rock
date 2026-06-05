import { useCallback, useEffect, useRef, useState } from 'react'

export type WebcamStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<WebcamStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const start = useCallback(async () => {
    stop()
    setStatus('loading')
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })

      streamRef.current = stream

      const video = videoRef.current
      if (!video) {
        setStatus('error')
        setError('Video element is not ready.')
        return
      }

      video.srcObject = stream
      await video.play()
      setStatus('ready')
    } catch (err) {
      setStatus('error')
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Allow camera access and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.')
        } else {
          setError(err.message || 'Could not access the camera.')
        }
      } else {
        setError('Could not access the camera.')
      }
    }
  }, [stop])

  useEffect(() => {
    void start()
    return stop
  }, [start, stop])

  return { videoRef, status, error, retry: start }
}
