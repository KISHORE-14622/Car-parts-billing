import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, CameraOff, Loader2 } from 'lucide-react';

const BarcodeScanner = ({ onScan, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    
    // Get available video devices
    const getDevices = async () => {
      try {
        const videoDevices = await codeReader.current.listVideoInputDevices();
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error getting video devices:', error);
        onError?.('Failed to access camera devices');
      }
    };

    getDevices();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());

      // Start barcode scanning
      await codeReader.current.decodeFromVideoDevice(
        selectedDevice || undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const barcode = result.getText();
            console.log('Barcode detected:', barcode);
            onScan?.(barcode);
            stopScanning();
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
      <div className="text-center p-8">
        <CameraOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Access Denied</h3>
        <p className="text-gray-600 mb-4">
          Please allow camera access to scan barcodes. You may need to refresh the page and grant permission.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera Selection */}
      {devices.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Camera
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="input"
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

      {/* Video Preview */}
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ display: isScanning ? 'block' : 'none' }}
        />
        
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Click "Start Scanning" to begin</p>
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
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-red-500"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-red-500"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-red-500"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-red-500"></div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="btn-primary flex items-center space-x-2"
            disabled={devices.length === 0}
          >
            <Camera className="h-4 w-4" />
            <span>Start Scanning</span>
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="btn-secondary flex items-center space-x-2"
          >
            <CameraOff className="h-4 w-4" />
            <span>Stop Scanning</span>
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600">
        <p>Position the barcode within the camera view.</p>
        <p>The scanner will automatically detect and read the barcode.</p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
