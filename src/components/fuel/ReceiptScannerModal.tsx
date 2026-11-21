import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Fuel,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { preprocessReceiptImage, parseReceiptText, type ParsedReceiptData } from '../../lib/receiptOcrParser';
import { BOHOL_MUNICIPALITIES } from '../../lib/boholData';
import type { FuelPurchase, FuelType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSavePurchase: (purchase: Omit<FuelPurchase, 'id' | 'user_id' | 'created_at'>) => void;
}

// Sample Petron receipt text for one-click testing / demo on desktop
const SAMPLE_PETRON_RECEIPT_TEXT = `
       PETRON CORPORATION
    PETRON TAGBILARAN NORTH
   CPG North Ave., Tagbilaran City
   TIN: 000-123-456-000-NV
   POS: 02    OR#: 88392104
   DATE: 11/15/2026   TIME: 14:10

   PRODUCT: XCS PLUS (RON 95)
   PUMP: 03
   VOLUME : 4.50 L
   PRICE / L: P 63.85 /L
   TOTAL AMOUNT: P 287.33

   PAYMENT: CASH / PVC
   PVC POINTS EARNED: 2.87
   THANK YOU COME AGAIN
`;

export const ReceiptScannerModal: React.FC<Props> = ({ isOpen, onClose, onSavePurchase }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [parsedData, setParsedData] = useState<ParsedReceiptData | null>(null);
  const [showRawText, setShowRawText] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states for manual review and tweaking
  const [stationName, setStationName] = useState<string>('');
  const [municipality, setMunicipality] = useState<string>('Tagbilaran City');
  const [fuelType, setFuelType] = useState<FuelType>('Gasoline');
  const [pricePerLiter, setPricePerLiter] = useState<number>(63.85);
  const [liters, setLiters] = useState<number>(3.0);
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [odometer, setOdometer] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');

  // Live in-app camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async (facing: 'environment' | 'user' = 'environment') => {
    setErrorMessage(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback to native file/capture input if MediaDevices is unavailable
      cameraInputRef.current?.click();
      return;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraFacing(facing);
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: unknown) {
      console.warn('Live camera access failed, falling back to system camera/file chooser:', err);
      // Fallback to file input
      cameraInputRef.current?.click();
    }
  };

  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          handleProcessImage(blob);
        }
      },
      'image/jpeg',
      0.95
    );
  };

  // Synchronize extracted data into review form
  const applyExtractedData = (data: ParsedReceiptData) => {
    setParsedData(data);
    setStationName(data.stationName);
    setMunicipality(data.municipality);
    setFuelType(data.fuelType);
    setPricePerLiter(data.pricePerLiter);
    setLiters(data.liters);
    setPurchaseDate(data.date);
    setNotes(`Scanned Petron/fuel receipt (${data.fuelType})`);
  };

  const resetState = () => {
    stopCamera();
    setImagePreview(null);
    setIsProcessing(false);
    setScanStatus('');
    setScanProgress(0);
    setParsedData(null);
    setShowRawText(false);
    setErrorMessage(null);
    setStationName('');
    setMunicipality('Tagbilaran City');
    setFuelType('Gasoline');
    setPricePerLiter(63.85);
    setLiters(3.0);
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setOdometer(undefined);
    setNotes('');
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Process receipt file through Canvas preprocessor + Tesseract OCR
  const handleProcessImage = async (file: File | Blob) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setScanProgress(10);
    setScanStatus('Enhancing receipt contrast & sharpness...');

    try {
      // 1. Canvas Pre-processing
      const processedDataUrl = await preprocessReceiptImage(file);
      setImagePreview(processedDataUrl);
      setScanProgress(25);
      setScanStatus('Loading Tesseract OCR engine...');

      // 2. Initialize Tesseract Worker
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round(m.progress * 60) + 30; // 30% to 90%
            setScanProgress(pct);
            setScanStatus(`Reading receipt characters... ${Math.round(m.progress * 100)}%`);
          } else if (m.status) {
            setScanStatus(`${m.status}...`);
          }
        },
      });

      // 3. Recognize Text
      const ret = await worker.recognize(processedDataUrl);
      await worker.terminate();

      setScanProgress(95);
      setScanStatus('Extracting fuel liters, station & pricing...');

      const rawText = ret.data.text || '';
      if (!rawText.trim()) {
        throw new Error('No text was detected on the receipt. Please try taking a closer, well-lit photo.');
      }

      // 4. Parse fuel specifics
      const extracted = parseReceiptText(rawText);
      applyExtractedData(extracted);
      setScanProgress(100);
      setScanStatus('Receipt successfully parsed!');
    } catch (err: unknown) {
      console.error('OCR processing error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to scan receipt image. Please enter details manually.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessImage(file);
    }
  };

  // Demo sample loader
  const handleUseSampleReceipt = () => {
    setErrorMessage(null);
    setIsProcessing(true);
    setScanProgress(50);
    setScanStatus('Simulating Petron thermal receipt scan...');

    setTimeout(() => {
      const extracted = parseReceiptText(SAMPLE_PETRON_RECEIPT_TEXT);
      applyExtractedData(extracted);
      setImagePreview(null);
      setIsProcessing(false);
      setScanProgress(100);
      setScanStatus('Sample Petron receipt parsed!');
    }, 600);
  };

  // Re-calculate Total
  const totalCost = Math.round(pricePerLiter * liters * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePurchase({
      station_name: stationName || 'Petron Station',
      municipality,
      fuel_type: fuelType,
      price_per_liter: Number(pricePerLiter),
      liters: Number(liters),
      total_cost: totalCost,
      date: new Date(purchaseDate).toISOString(),
      odometer_km: odometer,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="glass-modal w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile top handle */}
        <div className="pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-white/30 dark:bg-white/20 rounded-full mx-auto" />
        </div>

        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-md shadow-emerald-600/20 bg-sign hover:bg-sign-dark">
              <Camera className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  Petron & Fuel Receipt Scanner
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
                  Receipt OCR
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Snap or upload your printed gas receipt to auto-log liters and cost
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/15 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Live Camera Viewfinder */}
          {isCameraActive && !isProcessing && !parsedData && (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-3/4 sm:aspect-4/3 max-h-[55vh] flex items-center justify-center border border-slate-700 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Receipt alignment guide overlay */}
                <div className="absolute inset-5 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs self-start">
                    Align receipt inside frame
                  </div>
                  <div className="w-full text-center text-xs text-white/90 bg-black/60 py-0.5 rounded-md backdrop-blur-xs">
                    Hold steady in good light
                  </div>
                </div>
              </div>

              {/* Shutter and Camera Controls */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3.5 py-2.5 rounded-xl glass-btn text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSnapPhoto}
                  className="flex-1 py-2.5 px-4 rounded-xl active:scale-95 text-white text-xs font-black shadow-md shadow-emerald-900/30 flex items-center justify-center space-x-2 cursor-pointer transition-all bg-sign hover:bg-sign-dark"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Receipt Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => startCamera(cameraFacing === 'environment' ? 'user' : 'environment')}
                  title="Switch Camera (Front / Back)"
                  className="p-2.5 rounded-xl glass-btn text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Upload / Capture Section */}
          {!parsedData && !isProcessing && !isCameraActive && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => startCamera('environment')}
                  className="p-4 rounded-2xl glass-panel-interactive border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 flex flex-col items-center justify-center text-center group cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">Take Photo</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Snap receipt with your camera
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl glass-panel-interactive border-2 border-dashed border-blue-500/40 hover:border-blue-500 flex flex-col items-center justify-center text-center group cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">Upload Receipt Image</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select PNG, JPG, or screenshot
                  </span>
                </button>
              </div>

              {/* Demo button for quick review */}
              <div className="flex items-center justify-between p-3 rounded-xl glass-panel-subtle text-xs">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No receipt on hand? Test with an authentic sample:</span>
                </div>
                <button
                  type="button"
                  onClick={handleUseSampleReceipt}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  Load Sample Petron
                </button>
              </div>
            </div>
          )}

          {/* OCR Processing Progress */}
          {isProcessing && (
            <div className="p-6 rounded-2xl glass-panel text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Scanning Receipt</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{scanStatus}</p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-300 bg-sign hover:bg-sign-dark"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-400">{scanProgress}%</span>
            </div>
          )}

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Scan Incomplete</p>
                <p className="text-xs opacity-90">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Extracted & Editable Review Form */}
          {parsedData && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Success Banner & Re-scan Button */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Fields Extracted ({parsedData.confidence}% confidence)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetState}
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Scan Another</span>
                </button>
              </div>

              {/* If estimated fields exist */}
              {(parsedData.isPriceEstimated || parsedData.isLitersEstimated) && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs leading-relaxed">
                    {parsedData.isLitersEstimated && parsedData.isPriceEstimated
                      ? 'Liters and Price/L were estimated from the detected total. Please verify the numbers against your receipt.'
                      : parsedData.isLitersEstimated
                      ? 'Liters was calculated from the total amount. Please verify against your printed receipt.'
                      : 'Price/L was estimated from the total amount. Please verify against your printed receipt.'}
                  </p>
                </div>
              )}

              {/* Station Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gas Station
                </label>
                <input
                  type="text"
                  required
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Municipality & Fuel Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bohol Municipality
                  </label>
                  <select
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {BOHOL_MUNICIPALITIES.map((m) => (
                      <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as FuelType)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Gasoline" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      Gasoline (Regular)
                    </option>
                    <option value="Premium 95" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      Premium 95 (XCS / V-Power)
                    </option>
                    <option value="Diesel" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      Diesel
                    </option>
                    <option value="Regular" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      Regular (RON 91)
                    </option>
                  </select>
                </div>
              </div>

              {/* Price / L & Liters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Price / L (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={pricePerLiter}
                    onChange={(e) => setPricePerLiter(Number(e.target.value))}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Liters (L)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={liters}
                    onChange={(e) => setLiters(Number(e.target.value))}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="p-3.5 rounded-2xl glass-panel-subtle border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    Formula: Price/L × Liters
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    ₱{pricePerLiter.toFixed(2)} × {liters} L
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block uppercase">
                    Total Fuel Cost
                  </span>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                    ₱{totalCost.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Date & Odometer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Odometer (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="km reading"
                    value={odometer || ''}
                    onChange={(e) => setOdometer(e.target.value ? Number(e.target.value) : undefined)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Receipt Remarks / Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Petron Tagbilaran PVC refuel"
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Raw OCR Text Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowRawText(!showRawText)}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center space-x-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showRawText ? 'Hide' : 'View'} scanned receipt text</span>
                  {showRawText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {showRawText && (
                  <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                    {parsedData.rawText}
                  </pre>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl glass-btn text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-900/20 cursor-pointer flex items-center space-x-1.5 transition-all bg-sign hover:bg-sign-dark"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save to Fuel Log</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
