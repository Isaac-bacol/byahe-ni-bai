import React, { useState } from 'react';
import {
  Fuel,
  Plus,
  Trash2,
  CheckCircle2,
  Receipt,
  ArrowLeft,
  Camera,
  Sparkles,
  Pencil,
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
import { useData } from '../../context/DataContext';
import type { FuelType, FuelPurchase } from '../../types';
import { BOHOL_MUNICIPALITIES } from '../../lib/boholData';
import { PriceComparisonView } from './PriceComparisonView';
import { ReceiptScannerModal } from './ReceiptScannerModal';

interface Props {
  initialTab?: 'compare' | 'purchases';
  onOpenWhatsNew?: () => void;
  onBack?: () => void;
}

export const FuelManager: React.FC<Props> = ({ initialTab = 'compare', onOpenWhatsNew, onBack }) => {
  const {
    userFuelPurchases,
    addFuelPurchase,
    updateFuelPurchase,
    deleteFuelPurchase
  } = useData();

  const [activeTab, setActiveTab] = useState<'compare' | 'purchases'>(
    initialTab === 'purchases' ? 'purchases' : 'compare'
  );

  // Add / Edit purchase modal state
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<FuelPurchase | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [stationName, setStationName] = useState('Petron Tagbilaran North');
  const [locationMuni, setLocationMuni] = useState('Tagbilaran City');
  const [purchaseFuelType, setPurchaseFuelType] = useState<FuelType>('Gasoline');
  const [pricePerLiter, setPricePerLiter] = useState<number>(63.85);
  const [liters, setLiters] = useState<number>(3.0);
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [odometer, setOdometer] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  // Auto-calculate Total Fuel Cost = Price per Liter × Liters
  const totalCost = Math.round(pricePerLiter * liters * 100) / 100;

  const handleOpenAddModal = () => {
    setEditingPurchase(null);
    setStationName('Petron Tagbilaran North');
    setLocationMuni('Tagbilaran City');
    setPurchaseFuelType('Gasoline');
    setPricePerLiter(63.85);
    setLiters(3.0);
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setOdometer(undefined);
    setNotes('');
    setIsPurchaseModalOpen(true);
  };

  const handleOpenEditModal = (purchase: FuelPurchase) => {
    setEditingPurchase(purchase);
    setStationName(purchase.station_name);
    setLocationMuni(purchase.municipality);
    setPurchaseFuelType(purchase.fuel_type);
    setPricePerLiter(purchase.price_per_liter);
    setLiters(purchase.liters);
    setPurchaseDate(purchase.date ? purchase.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setOdometer(purchase.odometer_km);
    setNotes(purchase.notes || '');
    setIsPurchaseModalOpen(true);
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPurchase) {
      updateFuelPurchase(editingPurchase.id, {
        station_name: stationName,
        municipality: locationMuni,
        fuel_type: purchaseFuelType,
        price_per_liter: Number(pricePerLiter),
        liters: Number(liters),
        total_cost: totalCost,
        date: new Date(purchaseDate).toISOString(),
        odometer_km: odometer,
        notes,
      });
    } else {
      addFuelPurchase({
        station_name: stationName,
        municipality: locationMuni,
        fuel_type: purchaseFuelType,
        price_per_liter: Number(pricePerLiter),
        liters: Number(liters),
        total_cost: totalCost,
        date: new Date(purchaseDate).toISOString(),
        odometer_km: odometer,
        notes,
      });
    }

    setIsPurchaseModalOpen(false);
    setEditingPurchase(null);
    setNotes('');
    setOdometer(undefined);
  };

  const formatPHP = (num: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(num);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      {/* Top Controls */}
      <div className="glass-panel p-5 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-full glass-btn text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <Flaticon name="fuel" className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Fuel Management & Bohol FuelWatch</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live Bohol pump monitoring via FuelWatch PH and actual fuel receipts
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 active:scale-95 text-xs font-black shadow-xs transition-all cursor-pointer backdrop-blur-xs"
              title="Snap or upload physical Petron / gas receipt"
            >
              <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>SCAN RECEIPT (OCR)</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all cursor-pointer bg-sign hover:bg-sign-dark"
            >
              <Flaticon name="add" className="w-4 h-4" />
              <span>MANUAL LOG</span>
            </button>
          </div>
        </div>

        {/* Function Switcher Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-1 glass-panel-subtle rounded-2xl">
          <button
            onClick={() => setActiveTab('compare')}
            className={`py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
              activeTab === 'compare'
                ? 'glass-btn bg-white/80 dark:bg-white/15 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Live FuelWatch PH (Bohol)
          </button>

          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
              activeTab === 'purchases'
                ? 'glass-btn bg-white/80 dark:bg-white/15 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Purchases Log ({userFuelPurchases.length})
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FUNCTION A: BOHOL LIVE FUELWATCH MONITOR                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'compare' && (
        <PriceComparisonView
          onOpenWhatsNew={onOpenWhatsNew}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* FUNCTION B: FUEL PURCHASES LOG                                 */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          {/* Purchase Log list */}
          {userFuelPurchases.length === 0 ? (
            <div className="rounded-3xl glass-panel p-10 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Fuel Purchases Recorded</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Keep track of every liter and peso spent at Bohol gas stations. Scan your receipt or log manually.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Petron / Gas Receipt</span>
                </button>
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="px-4 py-2 rounded-xl glass-btn text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Enter Manually
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {userFuelPurchases.map(purchase => (
                <div
                  key={purchase.id}
                  className="glass-panel-interactive rounded-2xl p-4 transition-all shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10 dark:border-white/10">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <Fuel className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{purchase.station_name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{purchase.municipality}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-rose-600 dark:text-rose-400 block">
                        {formatPHP(purchase.total_cost)}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(purchase.date).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Math Formula breakdown as in prompt: Total = Price per Liter × Liters */}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div className="p-2 rounded-xl glass-panel-subtle text-center">
                      <span className="text-xs text-slate-400 dark:text-slate-400 font-bold block uppercase">Fuel Type</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{purchase.fuel_type}</span>
                    </div>

                    <div className="p-2 rounded-xl glass-panel-subtle text-center">
                      <span className="text-xs text-slate-400 dark:text-slate-400 font-bold block uppercase">Price / L</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">₱{purchase.price_per_liter.toFixed(2)}</span>
                    </div>

                    <div className="p-2 rounded-xl glass-panel-subtle text-center">
                      <span className="text-xs text-slate-400 dark:text-slate-400 font-bold block uppercase">Volume</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{purchase.liters} Liters</span>
                    </div>
                  </div>

                  {purchase.notes && (
                    <div className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
                      "{purchase.notes}"
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(purchase)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Edit fuel purchase details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this fuel purchase log?')) {
                          deleteFuelPurchase(purchase.id);
                        }
                      }}
                      className="text-xs font-bold text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Delete fuel purchase record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADD FUEL PURCHASE MODAL (Matching exact prompt formula)       */}
      {/* ------------------------------------------------------------- */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg glass-modal rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/20 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase">
                    {editingPurchase ? 'Edit Fuel Purchase' : 'Add Fuel Purchase'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editingPurchase ? 'Update your gas refuel receipt details' : 'Record actual gas refuel receipt'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPurchaseModalOpen(false);
                  setEditingPurchase(null);
                }}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!editingPurchase && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Have a printed receipt?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPurchaseModalOpen(false);
                    setIsScannerOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-500/30 cursor-pointer transition-all active:scale-95"
                >
                  Scan Receipt Photo
                </button>
              </div>
            )}

            <form onSubmit={handleSavePurchase} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gas Station</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Petron Tagbilaran North, Shell Panglao"
                  value={stationName}
                  onChange={e => setStationName(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <select
                    value={locationMuni}
                    onChange={e => setLocationMuni(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {BOHOL_MUNICIPALITIES.map(m => (
                      <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fuel Type</label>
                  <select
                    value={purchaseFuelType}
                    onChange={e => setPurchaseFuelType(e.target.value as FuelType)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Gasoline" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Gasoline</option>
                    <option value="Premium 95" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Premium 95</option>
                    <option value="Diesel" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Diesel</option>
                    <option value="Regular" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Regular</option>
                  </select>
                </div>
              </div>

              {/* Price / L & Liters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Price / L (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={pricePerLiter}
                    onChange={e => setPricePerLiter(Number(e.target.value))}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Liters (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={liters}
                    onChange={e => setLiters(Number(e.target.value))}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* AUTO-COMPUTED TOTAL FORMULA CARD */}
              <div className="p-3.5 rounded-2xl glass-panel-subtle border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    Formula: Total = Price/L × Liters
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    ₱{pricePerLiter.toFixed(2)} × {liters} L
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block uppercase">Total Fuel Cost</span>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">₱{totalCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Date & Odometer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={e => setPurchaseDate(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Odometer (Optional)</label>
                  <input
                    type="number"
                    placeholder="km reading"
                    value={odometer || ''}
                    onChange={e => setOdometer(e.target.value ? Number(e.target.value) : undefined)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Remarks / Receipt Note</label>
                <input
                  type="text"
                  placeholder="e.g. Full tank before trip to Carmen Chocolate Hills"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPurchaseModalOpen(false);
                    setEditingPurchase(null);
                  }}
                  className="px-4 py-2 rounded-xl glass-btn text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-900/20 cursor-pointer flex items-center space-x-1.5 transition-all bg-sign hover:bg-sign-dark"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingPurchase ? 'Update Purchase' : 'Save Purchase'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RECEIPT OCR SCANNER MODAL (Petron, Shell, Caltex, etc.)       */}
      {/* ------------------------------------------------------------- */}
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSavePurchase={(purchase) => addFuelPurchase(purchase)}
      />
    </div>
  );
};
