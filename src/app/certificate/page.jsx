'use client'
import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

export default function CertificatePage({ searchParams }) {
  const certRef = useRef()
  const name = searchParams?.name || 'प्रियंका पाटील' // Example: can also be from searchParams or props
  const [isGenerating, setIsGenerating] = useState(false)

  const downloadImage = async () => {
    setIsGenerating(true)
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2, // Higher quality export
        useCORS: true // For loading images from other domains
      })
      canvas.toBlob(blob => {
        saveAs(blob, `Solar_Certificate_${name.replace(/\s+/g, '_')}.png`)
        setIsGenerating(false)
      })
    } catch (error) {
      console.error('Error generating certificate:', error)
      setIsGenerating(false)
    }
  }

  const downloadPDF = async () => {
    setIsGenerating(true)
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true
      })
      const imgData = canvas.toDataURL('image/png')
      
      // Create PDF using canvas as image
      const pdfWidth = certRef.current.offsetWidth
      const pdfHeight = certRef.current.offsetHeight
      
      // Create a link for download
      const link = document.createElement('a')
      link.href = imgData
      link.download = `Solar_Certificate_${name.replace(/\s+/g, '_')}.pdf`
      link.click()
      
      setIsGenerating(false)
    } catch (error) {
      console.error('Error generating PDF:', error)
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <div
        ref={certRef}
        className="relative w-[1194px] h-[768px] shadow-xl"
        style={{
          backgroundImage: "url('/Final_Certificate_Temp.png')",
          backgroundSize: 'cover',
        }}
      >
        <div
          className="absolute text-black text-4xl font-bold text-center"
          style={{ 
            top: '390px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            fontFamily: 'Noto Sans, sans-serif',
            maxWidth: '90%',
            wordBreak: 'break-word'
          }}
        >
          {name}
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={downloadImage}
          disabled={isGenerating}
          className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Download as Image'}
        </button>
        
        <button
          onClick={downloadPDF}
          disabled={isGenerating}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Download as PDF'}
        </button>
      </div>
    </div>
  )
}
