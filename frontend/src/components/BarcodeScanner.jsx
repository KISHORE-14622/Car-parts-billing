import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, CameraOff, Loader2 } from 'lucide-react';

const BarcodeScanner = ({ onScan, onError, autoStart = true }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    
    // Get available video devices and start scanning automatically
    const initializeScanner = async () => {
      try {
        const videoDevices = await codeReader.current.listVideoInputDevices();
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
          // Auto-start scanning if enabled
          if (autoStart) {
            setTimeout(() => startScanning(), 500);
          }
        }
      } catch (error) {
        console.error('Error getting video devices:', error);
        onError?.('Failed to access camera devices');
      }
    };

    initializeScanner();

    return () => {
      stopScanning();
    };
  }, [autoStart]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());

      // Start barcode scanning with continuous scanning
      await codeReader.current.decodeFromVideoDevice(
        selectedDevice || undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const barcode = result.getText();
            console.log('Barcode detected:', barcode);
            onScan?.(barcode);
            // Continue scanning instead of stopping
            // stopScanning();
          }
          if (error && error.name !== 'NotFoundException') {
            console.error('Scanning error:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      setHasPermission(false);
      setIsScanning(false);
      onError?.('Failed to start camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setIsScanning(false);
  };

  const handleDeviceChange = (deviceId) => {
    setSelectedDevice(deviceId);
    if (isScanning) {
      stopScanning();
      setTimeout(() => startScanning(), 100);
    }
  };

  if (hasPermission === false) {
    return (
      <div className="text-center p-4">
        <CameraOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-sm font-medium text-gray-900 mb-1">Camera Access Denied</h3>
        <p className="text-xs text-gray-600 mb-2">
          Please allow camera access to scan barcodes.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary text-xs px-3 py-1"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Camera Selection - Compact */}
      {devices.length > 1 && (
        <div>
          <select
            value={selectedDevice}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="input text-xs"
            disabled={isScanning}
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Compact Video Preview */}
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3', maxHeight: '200px' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ display: isScanning ? 'block' : 'none' }}
        />
        
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Scanner Ready</p>
            </div>
          </div>
        )}

        {/* Scanning Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning line animation */}
            <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
              <div className="h-0.5 bg-red-500 animate-pulse"></div>
            </div>
            
            {/* Corner guides */}
            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-red-500"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-red-500"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-red-500"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-red-500"></div>
            
            {/* Active scanning indicator */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              SCANNING
            </div>
          </div>
        )}
      </div>

      {/* Compact Controls */}
      <div className="flex justify-center space-x-2">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="btn-primary text-xs px-3 py-1 flex items-center space-x-1"
            disabled={devices.length === 0}
          >
            <Camera className="h-3 w-3" />
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="btn-secondary text-xs px-3 py-1 flex items-center space-x-1"
          >
            <CameraOff className="h-3 w-3" />
            <span>Stop</span>
          </button>
        )}
      </div>

      {/* Compact Instructions */}
      <div className="text-center text-xs text-gray-600">
        <p>Scanner active - position barcode in view</p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
