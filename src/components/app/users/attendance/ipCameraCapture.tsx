/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef, useState } from 'react'
import axios from 'axios'
import {
  Camera,
  UserCheck,
  CheckCircle,
  XCircle,
  Loader2,
  UserPlus,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type Mode = 'register' | 'checkin' | 'checkout'

export default function FaceAttendanceIPCam() {
  const imgRef = useRef<HTMLImageElement>(null)
  const [mode, setMode] = useState<Mode>('checkin')
  const [userId, setUserId] = useState('')
  const [ipAddress, setIpAddress] = useState('192.168.100.8') // Change to your phone's IP
  const [status, setStatus] = useState<React.ReactNode>(
    'Enter phone IP and connect...'
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [streamUrl, setStreamUrl] = useState('')

  // Update stream when IP changes
  const updateStream = () => {
    const url = `http://${ipAddress.trim()}:4747/mjpegfeed?1280x720`
    setStreamUrl(url)
    setStatus('Connecting to phone camera... Please wait.')
  }

  const captureAndSend = async () => {
    if (!imgRef.current || isProcessing || !imgRef.current.complete) {
      setStatus('Camera not ready or loading. Please wait.')
      return
    }

    setIsProcessing(true)
    setStatus(<Loader2 className="mx-auto h-12 w-12 animate-spin" />)

    const canvas = document.createElement('canvas')
    canvas.width = imgRef.current.naturalWidth || 1280
    canvas.height = imgRef.current.naturalHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setStatus('Failed to capture image')
      setIsProcessing(false)
      return
    }
    ctx.drawImage(imgRef.current, 0, 0)
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.95)

    try {
      let res

      if (mode === 'register') {
        if (!userId.trim()) {
          setStatus('Please enter your User ID')
          setIsProcessing(false)
          return
        }

        res = await axios.post(`/backend/api/attendance/face/register/`, {
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
        res = await axios.post(`/backend/api/attendance/checkin_checkout/`, {
          action: mode,
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
      const msg =
        err.response?.data?.error || 'Failed. Check connection or try again.'
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
        {/* IP Input + Connect */}
        <div className="mx-auto mb-8 flex max-w-md flex-col gap-4 sm:flex-row">
          <Input
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="192.168.1.100"
            className="rounded-full border-blue-300 text-center text-xl focus:border-blue-600"
          />
          <Button onClick={updateStream} size="lg" className="rounded-full">
            <RefreshCw className="mr-2 h-5 w-5" /> Connect
          </Button>
        </div>

        {/* Mode Selector */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <Button
            onClick={() => setMode('register')}
            variant={mode === 'register' ? 'default' : 'outline'}
            size="lg"
            className="rounded-full"
          >
            <UserPlus className="mr-2 h-6 w-6" /> Register
          </Button>
          <Button
            onClick={() => setMode('checkin')}
            variant={mode === 'checkin' ? 'default' : 'outline'}
            size="lg"
            className="rounded-full"
          >
            <CheckCircle className="mr-2 h-6 w-6" /> Check In
          </Button>
          <Button
            onClick={() => setMode('checkout')}
            variant={mode === 'checkout' ? 'default' : 'outline'}
            size="lg"
            className="rounded-full"
          >
            <UserCheck className="mr-2 h-6 w-6" /> Check Out
          </Button>
        </div>

        <div className="flex flex-col items-center">
          {/* User ID for Registration */}
          {mode === 'register' && (
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Your User ID"
              className="mx-auto mb-8 max-w-md rounded-full border-purple-300 text-center text-xl focus:border-purple-600"
            />
          )}

          {/* IP Camera Stream */}
          {streamUrl && (
            <Card className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl bg-black">
              <img
                ref={imgRef}
                src={streamUrl}
                alt="Phone Camera Stream"
                className="w-full"
                crossOrigin="anonymous"
                onLoad={() => setStatus('Camera connected! Ready to use')}
                onError={() =>
                  setStatus(
                    'Cannot connect. Check IP address and DroidCam Wi-Fi mode'
                  )
                }
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-96 w-72 rounded-3xl border-4 border-dashed border-white opacity-60" />
              </div>
              <div className="bg-opacity-70 absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-black px-6 py-3 text-lg font-medium text-white">
                Align face in oval
              </div>
            </Card>
          )}

          {/* Status */}
          <div className="mx-auto mt-4 inline-block rounded-2xl p-4 shadow-lg">
            <>
              {typeof status === 'string' ? (
                <p className="text-foreground text-xl">{status}</p>
              ) : (
                status
              )}
            </>
          </div>
        </div>
        {/* Capture Button */}
        <div className="mt-10 text-center">
          <Button
            onClick={captureAndSend}
            disabled={
              isProcessing ||
              (mode === 'register' && !userId.trim()) ||
              !streamUrl
            }
            size="lg"
            className={`mx-auto flex items-center gap-4 rounded-full px-12 py-6 font-bold shadow-2xl transition-all hover:scale-105 ${
              isProcessing ||
              (mode === 'register' && !userId.trim()) ||
              !streamUrl
                ? 'cursor-not-allowed bg-gray-400'
                : mode === 'register'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : mode === 'checkin'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Camera />
                {mode === 'register'
                  ? 'Register Face'
                  : mode === 'checkin'
                    ? 'Check In Now'
                    : 'Check Out Now'}
              </>
            )}
          </Button>
        </div>

        <Card className="mt-16 bg-gray-50 text-center">
          <CardContent>
            <p className="text-foreground text-lg">
              Open DroidCam → Wi-Fi Mode → Use IP shown on phone
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
