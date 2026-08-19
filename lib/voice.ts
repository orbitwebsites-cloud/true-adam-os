export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.wav')

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Transcription failed')
  }

  const data = await response.json()
  return data.text
}

export function startVoiceRecording(): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        resolve(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()

      return () => mediaRecorder.stop()
    } catch (error) {
      reject(error)
    }
  })
}
