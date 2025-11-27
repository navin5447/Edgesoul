// Export/Import UI Component
'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, AlertCircle, CheckCircle, FileJson, Loader } from 'lucide-react';
import { exportUserData, importUserData, validateImportFile } from '@/lib/offline/dataExportImport';

export default function DataExportImport() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setExporting(true);
      setMessage({ type: 'info', text: 'Preparing your data export...' });

      const userId = localStorage.getItem('edgesoul_user_id') || 'user_001';
      await exportUserData(userId);

      setMessage({ type: 'success', text: 'Data exported successfully! Check your downloads folder.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Export failed. Please try again.' });
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setMessage({ type: 'info', text: 'Validating backup file...' });

      // Validate file
      const validation = await validateImportFile(file);
      if (!validation.valid) {
        setMessage({ type: 'error', text: validation.message });
        setImporting(false);
        return;
      }

      setMessage({ type: 'info', text: 'Importing your data...' });

      // Import data
      const result = await importUserData(file);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Refresh page after 2 seconds to show imported data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Import failed. Please try again.' });
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>
          Data Backup & Restore
        </h3>
        <p style={{ color: '#64748b' }}>
          Export your data for backup or import previously saved data
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl backdrop-blur-xl flex items-start gap-3"
          style={{
            background: message.type === 'success' 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08))'
              : message.type === 'error'
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08))'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08))',
            border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : message.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
            boxShadow: `0 0 20px ${message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
          }}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#22c55e' }} />
          ) : message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} />
          ) : (
            <FileJson className="w-5 h-5 flex-shrink-0" style={{ color: '#3b82f6' }} />
          )}
          <p className="text-sm" style={{ 
            color: message.type === 'success' ? '#22c55e' : message.type === 'error' ? '#ef4444' : '#3b82f6' 
          }}>
            {message.text}
          </p>
        </motion.div>
      )}

      {/* Export/Import Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Export Card */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="p-6 rounded-2xl backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3))',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.6)'
          }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
              }}>
              <Download className="w-6 h-6" style={{ color: '#22c55e' }} />
            </div>
            <div>
              <h4 className="text-xl font-bold mb-1" style={{ color: '#0f172a' }}>
                Export Data
              </h4>
              <p className="text-sm" style={{ color: '#64748b' }}>
                Download all your conversations, memories, and profile settings as a JSON file
              </p>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!exporting) {
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(34, 197, 94, 0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {exporting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Export Data</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Import Card */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="p-6 rounded-2xl backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3))',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.6)'
          }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
              }}>
              <Upload className="w-6 h-6" style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <h4 className="text-xl font-bold mb-1" style={{ color: '#0f172a' }}>
                Import Data
              </h4>
              <p className="text-sm" style={{ color: '#64748b' }}>
                Restore your data from a previously exported backup file
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={handleImportClick}
            disabled={importing}
            className="w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!importing) {
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {importing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Import Data</span>
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))',
          border: '1px solid rgba(168, 85, 247, 0.2)',
        }}
      >
        <h5 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#a855f7' }}>
          <AlertCircle className="w-4 h-4" />
          Important Notes
        </h5>
        <ul className="text-sm space-y-1" style={{ color: '#64748b' }}>
          <li>• Your data is exported as a JSON file and stored locally on your device</li>
          <li>• Backup files contain all your conversations, memories, emotions, and profile settings</li>
          <li>• Keep your backup files secure - they contain your personal data</li>
          <li>• Importing will merge with existing data (duplicates may occur)</li>
        </ul>
      </motion.div>
    </div>
  );
}
