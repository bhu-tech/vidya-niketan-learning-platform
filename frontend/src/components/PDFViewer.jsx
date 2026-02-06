import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/PDFViewer.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PDFViewer = ({ materialId, fileName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  console.log('PDFViewer mounted with:', { materialId, fileName });

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        console.log('Fetching PDF for material ID:', materialId);
        console.log('API URL:', `${API_BASE_URL}/materials/view/${materialId}`);

        // Fetch the PDF with proper authentication
        const response = await axios.get(`${API_BASE_URL}/materials/view/${materialId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob' // Important: get the response as a blob
        });

        console.log('Response received:', {
          status: response.status,
          contentType: response.headers['content-type'],
          size: response.data.size,
          type: response.data.type
        });

        // Create a blob URL from the response
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        console.log('Blob URL created:', url);
        setPdfUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        });
        
        let errorMessage = 'Failed to load PDF';
        if (err.response) {
          // Server responded with error
          errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
        } else if (err.request) {
          // Request made but no response
          errorMessage = 'No response from server. Check if backend is running.';
        } else {
          // Error in request setup
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchPDF();

    // Cleanup function to revoke the blob URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [materialId, pdfUrl]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
