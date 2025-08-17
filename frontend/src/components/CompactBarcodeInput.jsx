import React, { useState, useRef, useEffect } from 'react';
import { Scan, Wifi, WifiOff, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const CompactBarcodeInput = ({ onScan, onError, recentScans = [], shouldAutoFocus = true }) => {
  const [isActive, setIsActive] = useState(true);
  const [currentInput, setCurrentInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [scanStatus, setScanStatus] = useState('ready'); // 'ready', 'scanning', 'success', 'error'
  const [isPaused, setIsPaused] = useState(false);
  const inputRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const focusTimeoutRef = useRef(null);

  useEffect(() => {
    // Auto-focus the input field to capture scanner input
    if (isActive && shouldAutoFocus && !isPaused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive, shouldAutoFocus, isPaused]);

  useEffect(() => {
    // Smart focus management - only auto-focus when appropriate
    const handleSmartFocus = () => {
      // Don't auto-focus if paused or if shouldAutoFocus is false
      if (!isActive || !shouldAutoFocus || isPaused) {
        return;
      }

      // Check if any form inputs are currently focused
      const activeElement = document.activeElement;
      const isFormInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.contentEditable === 'true'
      );

      // Only auto-focus if no other form elements are focused and our input isn't already focused
      if (!isFormInputFocused && inputRef.current && document.activeElement !== inputRef.current) {
        // Add a small delay to prevent focus fighting
        focusTimeoutRef.current = setTimeout(() => {
          if (inputRef.current && !isPaused) {
            inputRef.current.focus();
          }
        }, 100);
      }
    };

    // Use a longer interval to be less aggressive
    const interval = setInterval(handleSmartFocus, 2000);
    return () => {
      clearInterval(interval);
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, [isActive, shouldAutoFocus, isPaused]);

  useEffect(() => {
    // Listen for focus events on other form elements to pause auto-focus
    const handleFocusIn = (e) => {
      const target = e.target;
      // If focus is on a form element that's not our scanner input, pause auto-focus
      if (target && target !== inputRef.current && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.contentEditable === 'true'
      )) {
        setIsPaused(true);
        // Resume auto-focus after a delay when the other input loses focus
        setTimeout(() => {
          if (document.activeElement !== target) {
            setIsPaused(false);
          }
        }, 1000);
      }
    };

    const handleFocusOut = (e) => {
      // Resume auto-focus when other form elements lose focus
      setTimeout(() => {
        const activeElement = document.activeElement;
        const isFormInputFocused = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.contentEditable === 'true'
        );
        
        if (!isFormInputFocused || activeElement === inputRef.current) {
          setIsPaused(false);
        }
      }, 500);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const processBarcodeInput = async (barcode) => {
    setIsScanning(false);
    setScanStatus('scanning');
    setLastScanTime(new Date());

    try {
      await onScan(barcode);
      setScanStatus('success');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setScanStatus('ready');
      }, 2000);
    } catch (error) {
      setScanStatus('error');
      onError?.(error.message || 'Scan failed');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setScanStatus('ready');
      }, 3000);
    }
  };

  const getStatusIcon = () => {
    switch (scanStatus) {
      case 'scanning':
        return <Scan className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return isActive ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (scanStatus) {
      case 'scanning':
        return 'Scanning...';
      case 'success':
        return 'Scan Success!';
      case 'error':
        return 'Scan Failed';
      default:
        if (!isActive) return 'Scanner Inactive';
        if (isPaused) return 'Scanner Paused';
        return 'Scanner Ready';
    }
  };

  const getStatusColor = () => {
    switch (scanStatus) {
      case 'scanning':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        if (!isActive) return 'text-gray-600 bg-gray-50 border-gray-200';
        if (isPaused) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <Scan className="h-4 w-4 mr-2" />
          Barcode Scanner
        </h3>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`text-xs px-2 py-1 rounded ${
            isActive 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      {/* Status Indicator */}
      <div className={`flex items-center space-x-2 p-2 rounded-lg border ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-xs font-medium">{getStatusText()}</span>
        {lastScanTime && (
          <span className="text-xs opacity-75 ml-auto">
            {lastScanTime.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Hidden Input Field for Barcode Scanner Hardware */}
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={(e) => {
          const value = e.target.value;
          setCurrentInput(value);
          
          // Show scanning indicator when input is being received
          if (value.length > 0 && !isScanning) {
            setIsScanning(true);
            setScanStatus('scanning');
          }

          // Clear any existing timeout
          if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
          }

          // Set timeout to process the barcode (barcode scanners typically input quickly)
          scanTimeoutRef.current = setTimeout(() => {
            if (value.trim().length >= 8) { // Minimum barcode length
              processBarcodeInput(value.trim());
              setCurrentInput(''); // Clear input after processing
            }
          }, 100); // Short delay to capture full barcode
        }}
        onKeyPress={(e) => {
          // Handle Enter key (some scanners send Enter after barcode)
          if (e.key === 'Enter' && currentInput.trim().length >= 8) {
            e.preventDefault();
            if (scanTimeoutRef.current) {
              clearTimeout(scanTimeoutRef.current);
            }
            processBarcodeInput(currentInput.trim());
            setCurrentInput(''); // Clear input after processing
          }
        }}
        className="sr-only"
        disabled={!isActive}
        autoComplete="off"
        spellCheck="false"
        tabIndex={-1}
      />


      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Point barcode scanner at product and trigger</p>
        <p>• Scanner input will be processed automatically</p>
        {isPaused ? (
          <p className="text-yellow-600">• Auto-focus paused while using other fields</p>
        ) : (
          <p>• Auto-focus active for barcode scanning</p>
        )}
      </div>
    </div>
  );
};

export default CompactBarcodeInput;
