import { useState, useEffect, useRef } from 'react';
import '../styles/PDFViewer.css';

const PDFViewer = ({ materialId, fileName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Create a blob URL from the PDF endpoint with token
      const url = `http://localhost:5000/api/materials/view/${materialId}?token=${encodeURIComponent(token)}`;
      setPdfUrl(url);
      setLoading(false);
    } else {
      setError('Authentication token not found');
      setLoading(false);
    }
  }, [materialId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="pdf-viewer-modal">
      <div className="pdf-viewer-container" ref={containerRef}>
        <div className="pdf-viewer-header">
          <h2>{fileName}</h2>
          <div className="pdf-viewer-controls">
            <button className="fullscreen-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
              {isFullscreen ? '⛶' : '⛶'}
            </button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="pdf-viewer-content">
          {loading && <div className="pdf-loading">Loading PDF...</div>}
          {error && <div className="pdf-error">Error: {error}</div>}
          
          {!loading && !error && pdfUrl && (
            <iframe
              src={pdfUrl}
              title="PDF Viewer"
              className="pdf-iframe"
              onLoad={() => setLoading(false)}
              onError={() => setError('Failed to load PDF')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
