import { useState, useEffect } from 'react'
import posthog from './posthog.js'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [stars, setStars] = useState(null)
  const [error, setError] = useState(null)
  const [downloadPhase, setDownloadPhase] = useState('')

  useEffect(() => {
    fetch('https://api.github.com/repos/katcinskiy/zoom-downloader')
      .then(res => res.json())
      .then(data => setStars(data.stargazers_count))
      .catch(() => setStars(null))
  }, [])

  const handleDownload = async () => {
    if (!url) return
    
    posthog.capture('download_clicked')
    setLoading(true)
    setDownloadPhase('processing')
    setError(null)
    
    try {
      const processResponse = await fetch('https://video-pull-backend-384830585075.us-central1.run.app/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!processResponse.ok) {
        posthog.capture('download_error', { status_code: processResponse.status })
        throw new Error('Video processing failed')
      }

      const { download_url, file_size } = await processResponse.json()
      setDownloadPhase('downloading')
      
      const a = document.createElement('a')
      a.href = download_url
      a.download = 'zoom_recording.mp4'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      setDownloadPhase('complete')
      posthog.capture('download_successful', { file_size, method: 'cloud_storage' })
      
    } catch (error) {
      setError('Download failed: ' + error.message)
      posthog.capture('download_error', { error_type: 'client_error' })
    } finally {
      setLoading(false)
      setTimeout(() => setDownloadPhase(''), 2000)
    }
  }

  return (
    <div className="min-h-screen w-full">
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4L18 8H15V15H9V8H6L12 4Z"/>
                  <rect x="6" y="17" width="12" height="1.5" rx="0.75"/>
                  <rect x="7.5" y="19" width="9" height="1" rx="0.5" opacity="0.7"/>
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">VideoPull</div>
                <div className="text-xs text-orange-600 font-medium text-left">Open Source</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <a href="https://github.com/katcinskiy/zoom-downloader" target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-medium rounded-md transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="hidden sm:inline">Star on GitHub</span>
                <span className="sm:hidden">GitHub</span>
                {stars && <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded font-medium">{stars}</span>}
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-6">
            Download Zoom Recordings
            <br />
            <span className="text-orange-500">When Download is Disabled</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2">
            Free tool to download Zoom meeting recordings and videos even when sharing is disabled. Works with regular recordings, event pages, and webinars. No signup required.
          </p>
          
          <div className="max-w-lg mx-auto px-2 sm:px-0">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-8 mb-6 sm:mb-8">
              <div className="space-y-6">
                <div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste your Zoom recording URL here..."
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handleDownload}
                  disabled={!url || loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-base sm:text-lg transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {downloadPhase === 'processing' && 'Processing video...'}
                      {downloadPhase === 'downloading' && 'Starting download...'}
                      {downloadPhase === 'complete' && 'Download started!'}
                      {!downloadPhase && 'Processing...'}
                    </div>
                  ) : (
                    '→ Download Video'
                  )}
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 mb-2 px-2">
                No signup required • Works instantly • Download starts immediately
              </p>
              <p className="text-xs text-gray-400 px-2">
                ⏱️ Processing usually takes 1-2 minutes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-8 sm:py-16">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 px-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">How it works</h2>
            <p className="text-base sm:text-lg text-gray-600">Three simple steps to get your video</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-0">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paste URL</h3>
              <p className="text-gray-600">Copy and paste your Zoom recording URL from the browser or email</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Process</h3>
              <p className="text-gray-600">Our system processes the video and makes it available for download</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Download</h3>
              <p className="text-gray-600">Download starts automatically to your device in MP4 format</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  )
}

export default App