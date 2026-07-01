import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/UI/Toast';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import {
  Settings,
  Plus,
  Trash2,
  Download,
  Upload,
  Database,
  Trash,
  Info,
  Fish,
  Building2,
  HardDrive,
  FileCode,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    fishVarieties,
    addFishVariety,
    deleteFishVariety,
    exportAllData,
    importAllData,
    clearAllData,
    employees,
    refreshKey,
  } = useData();

  const toast = useToast();

  // ─── Local State ────────────────────────────────────────────
  const [newVariety, setNewVariety] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [varietyToDelete, setVarietyToDelete] = useState(null);

  // ─── Compute storage size statistics ────────────────────────
  const storageStats = useMemo(() => {
    let totalBytes = 0;
    const keysCount = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('fisheries_') || key === 'fisheries_auth')) {
        const val = localStorage.getItem(key) || '';
        const bytes = val.length * 2; // UTF-16 characters are 2 bytes
        totalBytes += bytes;
        keysCount[key] = bytes;
      }
    }
    return {
      totalSizeKB: (totalBytes / 1024).toFixed(2),
      keysCount,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // ─── Variety Handlers ───────────────────────────────────────
  const handleAddVariety = (e) => {
    e.preventDefault();
    const name = newVariety.trim();
    if (!name) {
      toast.error('Please enter a variety name.');
      return;
    }

    // Duplicate check
    const exists = fishVarieties.some(
      (v) => v.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      toast.error('This fish variety already exists.');
      return;
    }

    addFishVariety(name);
    toast.success(`Added fish variety: ${name}`);
    setNewVariety('');
  };

  const handleDeleteVariety = () => {
    if (!varietyToDelete) return;
    deleteFishVariety(varietyToDelete.id);
    toast.success(`Deleted fish variety: ${varietyToDelete.name}`);
    setVarietyToDelete(null);
  };

  // ─── Data Backup & Restore Handlers ────────────────────────
  const handleExportData = () => {
    try {
      const data = exportAllData();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `kdt_seafood_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Database backup downloaded successfully.');
    } catch {
      toast.error('Failed to export data.');
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Invalid backup file structure.');
        }
        
        // Basic signature validation
        const hasExpectedKeys = Object.keys(parsed).some(key => key.startsWith('fisheries_'));
        if (!hasExpectedKeys) {
          throw new Error('This file does not contain valid KDT Sea Food backup records.');
        }

        importAllData(parsed);
        toast.success('Database restored successfully!');
        // Reset file input value so same file can be uploaded again
        e.target.value = '';
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    clearAllData();
    toast.success('All system data cleared. Reset to default configurations.');
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-brand-ivory animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-brand-teal" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-brand-dark">Settings</h1>
              <p className="text-sm text-brand-gray">Configure system parameters, manage fish list and manage data backups</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Middle Columns: Fish Varieties & Database Backup */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Fish Varieties Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-display font-semibold text-brand-dark mb-4 flex items-center gap-2">
                <Fish className="w-4.5 h-4.5 text-brand-teal" />
                Fish Varieties
              </h2>

              {/* Add Variety Form */}
              <form onSubmit={handleAddVariety} className="flex gap-3 mb-5">
                <input
                  type="text"
                  value={newVariety}
                  onChange={(e) => setNewVariety(e.target.value)}
                  placeholder="e.g. Kumbala, Katta..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-brand-dark
                    focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                    transition-all-custom"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-teal text-white text-sm
                    font-semibold rounded-xl hover:bg-brand-teal-light active:bg-brand-teal-dark
                    shadow-sm active:scale-[0.98] transition-all-custom cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                  Add
                </button>
              </form>

              {/* List of Varieties */}
              <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50 max-h-[300px] overflow-y-auto pr-1">
                {fishVarieties.length === 0 ? (
                  <p className="text-sm text-brand-gray text-center py-6">No fish varieties configured.</p>
                ) : (
                  fishVarieties.map((v) => (
                    <div key={v.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
                      <span className="text-sm font-medium text-brand-dark">{v.name}</span>
                      <button
                        type="button"
                        onClick={() => setVarietyToDelete(v)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50
                          transition-all-custom cursor-pointer"
                        title={`Delete ${v.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Database & Storage Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <h2 className="text-base font-display font-semibold text-brand-dark flex items-center gap-2">
                <Database className="w-4.5 h-4.5 text-brand-teal" />
                Data Management
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Export Card */}
                <div className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between items-start space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                    <Download className="w-4 h-4 text-brand-teal" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-dark">Backup Database</h3>
                    <p className="text-xs text-brand-gray mt-1">Download a local copy of all records (.json format)</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="w-full text-center text-xs font-semibold py-2 px-3 bg-brand-teal/5 text-brand-teal
                      hover:bg-brand-teal hover:text-white rounded-lg transition-all-custom cursor-pointer"
                  >
                    Export Data
                  </button>
                </div>

                {/* Import Card */}
                <div className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between items-start space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-dark">Restore Database</h3>
                    <p className="text-xs text-brand-gray mt-1">Upload a JSON backup file to overwrite current data</p>
                  </div>
                  <label className="w-full text-center text-xs font-semibold py-2 px-3 bg-blue-50 text-blue-600
                    hover:bg-blue-600 hover:text-white rounded-lg transition-all-custom cursor-pointer block">
                    Restore Data
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Clear Card */}
                <div className="border border-red-50 rounded-xl p-4 flex flex-col justify-between items-start space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <Trash className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-600">Reset System</h3>
                    <p className="text-xs text-brand-gray mt-1 font-light">Destructive: Wipe all employees, catches, invoices, and settings</p>
                  </div>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full text-center text-xs font-semibold py-2 px-3 bg-red-50 text-red-500
                      hover:bg-red-500 hover:text-white rounded-lg transition-all-custom cursor-pointer"
                  >
                    Clear Database
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Organization Details & System Stats */}
          <div className="space-y-6">
            
            {/* Organization Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-display font-semibold text-brand-dark flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-brand-teal" />
                Organization Details
              </h2>
              
              <div className="space-y-3.5 pt-1">
                <div>
                  <p className="text-[10px] uppercase font-bold text-brand-gray tracking-wider">Company Name</p>
                  <p className="text-sm font-semibold text-brand-dark mt-0.5">KDT SEA FOOD</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-brand-gray tracking-wider">Base Location</p>
                  <p className="text-sm font-semibold text-brand-dark mt-0.5">Karaitheevu, Kalmunai, Sri Lanka</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-brand-gray tracking-wider">Operating Week</p>
                  <p className="text-sm font-semibold text-brand-dark mt-0.5">Saturday to Friday</p>
                </div>
              </div>
            </div>

            {/* Storage Footprint */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-display font-semibold text-brand-dark flex items-center gap-2">
                <HardDrive className="w-4.5 h-4.5 text-brand-teal" />
                System Health & Stats
              </h2>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-gray flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-brand-gray/60" />
                    Storage Footprint:
                  </span>
                  <span className="font-semibold text-brand-dark font-mono">{storageStats.totalSizeKB} KB</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-gray">Registered Fishermen:</span>
                  <span className="font-semibold text-brand-dark font-mono">{employees.length}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-gray">Fish Varieties Count:</span>
                  <span className="font-semibold text-brand-dark font-mono">{fishVarieties.length}</span>
                </div>

                {/* Storage Health Info */}
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-brand-gray mt-0.5 shrink-0" />
                  <p className="text-[11px] text-brand-gray leading-normal">
                    This system operates entirely on local client storage. Make sure to export regular database backups to prevent data loss when cleaning your web browser.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Delete Fish Variety Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!varietyToDelete}
          onClose={() => setVarietyToDelete(null)}
          onConfirm={handleDeleteVariety}
          title="Delete Fish Variety"
          message={
            varietyToDelete ? (
              <>
                Are you sure you want to delete <span className="font-bold text-brand-dark">{varietyToDelete.name}</span>?
                <br />
                <span className="text-xs text-red-500 mt-2 block font-light">
                  Warning: Existing catch entries referencing this variety will remain, but you won't be able to select this variety for new entries.
                </span>
              </>
            ) : ''
          }
          confirmLabel="Delete Variety"
          danger={true}
        />

        {/* Clear All Data Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={handleClearData}
          title="Clear Database"
          message={
            <>
              Are you sure you want to perform a full system reset?
              <br />
              <strong className="text-red-500">This will wipe all fishermen, catches, invoices, and settings.</strong> This action is completely irreversible!
            </>
          }
          confirmLabel="Wipe All Data"
          danger={true}
        />
      </div>
    </div>
  );
}
