/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef, useEffect, useState } from 'react'
import axios from 'axios'
import {
  Camera,
  UserCheck,
  CheckCircle,
  XCircle,
  Loader2,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

type Mode = 'register' | 'checkin' | 'checkout'

export default function FaceAttendance() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mode, setMode] = useState<Mode>('checkin')
  const [userId, setUserId] = useState('')
  const [status, setStatus] = useState<React.ReactNode>('Starting camera...')
  const [isProcessing, setIsProcessing] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((d) => d.kind === 'videoinput')

        const phoneCam = videoDevices.find((d) =>
          /droidcam|iriun|android|phone/i.test(d.label)
        )

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: phoneCam ? { exact: phoneCam.deviceId } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play() // Ensure it starts playing
        }

        setStatus('Camera ready! Look straight at the phone camera')
      } catch (err: any) {
        console.error('Failed to access camera:', err)
        setStatus(
          'Camera not found. Connect phone via DroidCam or Iriun Webcam'
        )
      }
    }

    startCamera()

    // Cleanup: This WILL run when component unmounts
    return () => {
      if (stream) {
        // Stop all tracks — this turns off the camera light immediately
        stream.getTracks().forEach((track) => {
          track.stop()
          console.log('Track stopped:', track.kind)
        })
        stream = null
      }

      // Extra safety: clear video srcObject
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, []) // Empty array: only mount + unmount
  const captureAndSend = async () => {
    if (!videoRef.current || isProcessing) return

    setIsProcessing(true)
    setStatus(<Loader2 className="mx-auto h-12 w-12 animate-spin" />)

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.95)

    try {
      let res

      if (mode === 'register') {
        if (!userId.trim()) {
          setStatus('Please enter your User ID')
          setIsProcessing(false)
          return
        }

        res = await axios.post('/api/attendance/face/register/', {
          user_id: parseInt(userId),
          image: imageBase64,
        })

        setStatus(
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <div className="text-2xl font-bold text-green-600">
              Registered Successfully!
            </div>
            <div className="mt-2 text-lg">{res.data.user || 'User'}</div>
          </div>
        )
      } else {
        res = await axios.post('/api/attendance/checkin_checkout/', {
          action: mode, // 'checkin' or 'checkout'
          image: imageBase64,
          method: 'face',
        })

        const isCheckIn = res.data.message.includes('In')
        const confidence = res.data.confidence
          ? `${(parseFloat(res.data.confidence) * 100).toFixed(1)}%`
          : 'High'

        setStatus(
          <div className="text-center">
            {isCheckIn ? (
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            ) : (
              <UserCheck className="mx-auto mb-4 h-16 w-16 text-blue-500" />
            )}
            <div className="text-2xl font-bold">{res.data.message}</div>
            <div className="mt-2 text-xl">{res.data.user}</div>
            {res.data.duration && (
              <div className="text-foreground mt-1 text-lg">
                Duration: {res.data.duration}
              </div>
            )}
            <div className="text-foreground mt-2 text-sm">
              Confidence: {confidence}
            </div>
          </div>
        )
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Operation failed. Try again.'
      setStatus(
        <div className="text-center">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <div className="text-xl font-bold text-red-600">{msg}</div>
        </div>
      )
    }

    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-foreground mb-3 text-5xl font-bold">
            Facial Attendance
          </h1>
          <p className="text-foreground text-lg">
            Use your phone as camera • High accuracy • Instant results
          </p>
        </div>

        {/* Mode Selector */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <Button
            onClick={() => setMode('register')}
            className="rounded-full px-5!"
            variant={mode === 'register' ? 'default' : 'secondary'}
          >
            <UserPlus className="h-6 w-6" /> Register Face
          </Button>
          <Button
            onClick={() => setMode('checkin')}
            className="rounded-full px-5!"
            variant={mode === 'checkin' ? 'default' : 'secondary'}
          >
            <CheckCircle className="h-6 w-6" /> Check In
          </Button>
          <Button
            onClick={() => setMode('checkout')}
            className="rounded-full px-5!"
            variant={mode === 'checkout' ? 'default' : 'secondary'}
          >
            <UserCheck className="h-6 w-6" /> Check Out
          </Button>
        </div>

        {/* User ID for Registration */}
        {mode === 'register' && (
          <div className="mx-auto mb-8 max-w-md">
            <input
              type="text"
              placeholder="Enter Your User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-full border-2 border-purple-300 px-6 py-4 text-center text-xl transition-all focus:border-purple-600 focus:outline-none"
            />
          </div>
        )}

        {/* Camera */}
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl bg-black shadow-2xl">
          <video ref={videoRef} autoPlay playsInline muted className="w-full" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-96 w-72 rounded-3xl border-4 border-dashed opacity-60" />
          </div>
          <div className="bg-opacity-70 absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-black px-6 py-3 text-lg font-medium text-white">
            Align face in oval
          </div>
        </div>

        {/* Status */}
        <div className="mt-10 min-h-32 text-center">
          <div className="bg-popover inline-block rounded-2xl p-6 shadow-lg">
            {typeof status === 'string' ? (
              <p className="text-foreground text-xl">{status}</p>
            ) : (
              status
            )}
          </div>
        </div>

        {/* Capture Button */}
        <div className="mt-10 text-center">
          <button
            onClick={captureAndSend}
            disabled={isProcessing || (mode === 'register' && !userId.trim())}
            className={`mx-auto flex transform items-center gap-4 rounded-full px-16 py-8 text-3xl font-bold text-white shadow-2xl transition-all hover:scale-105 ${
              isProcessing || (mode === 'register' && !userId.trim())
                ? 'cursor-not-allowed bg-gray-400'
                : mode === 'register'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : mode === 'checkin'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'hover:'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Camera className="h-12 w-12" />
                {mode === 'register'
                  ? 'Register My Face'
                  : mode === 'checkin'
                    ? 'Check In Now'
                    : 'Check Out Now'}
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-foreground mt-16 text-center">
          <p className="text-lg">
            Tip: Use phone rear camera via USB for best accuracy
          </p>
        </div>
      </div>
    </div>
  )
}
