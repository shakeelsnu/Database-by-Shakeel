import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Trash2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { FileData } from '../types';
import * as XLSX from 'xlsx';

interface FileUploadProps {
  files: FileData[];
  onFilesUpdate: (files: FileData[]) => void;
  userIP: string;
}

interface UploadStatus {
  fileName: string;
  status: 'uploading' | 'success' | 'error';
  message: string;
}

export default function FileUpload({ files, onFilesUpdate, userIP }: FileUploadProps) {
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File): Promise<FileData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const rawText = json.map((row: any) => row.join("\t")).join("\n");
          resolve({ 
            fileName: file.name, 
            data: rawText, 
            uploadDate: new Date().toLocaleString() 
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput?.files || fileInput.files.length === 0) return;

    const selectedFiles = Array.from(fileInput.files);
    setUploadStatuses(selectedFiles.map(file => ({
      fileName: file.name,
      status: 'uploading',
      message: `Uploading: ${file.name}...`
    })));

    const filePromises = selectedFiles.map(async (file, index) => {
      try {
        const fileData = await readFile(file);
        setUploadStatuses(prev => prev.map((status, i) => 
          i === index ? {
            ...status,
            status: 'success',
            message: `✅ Upload successful: ${file.name}`
          } : status
        ));
        return fileData;
      } catch (error) {
        setUploadStatuses(prev => prev.map((status, i) => 
          i === index ? {
            ...status,
            status: 'error',
            message: `❌ Upload failed: ${file.name}`
          } : status
        ));
        console.error("File read error:", error);
        return null;
      }
    });

    const uploadedFilesData = (await Promise.all(filePromises)).filter(Boolean) as FileData[];

    // Update the stored data with the newly uploaded files
    const updatedFiles = [...files];
    uploadedFilesData.forEach(newFile => {
      const existingIndex = updatedFiles.findIndex(f => f.fileName === newFile.fileName);
      if (existingIndex > -1) {
        updatedFiles[existingIndex] = newFile;
      } else {
        updatedFiles.push(newFile);
      }
    });

    onFilesUpdate(updatedFiles);
    
    // Clear file input
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const deleteFile = (fileName: string) => {
    const updatedFiles = files.filter(file => file.fileName !== fileName);
    onFilesUpdate(updatedFiles);
  };

  return (
    <div className="bg-pink-50 p-6 rounded-lg shadow-md border border-pink-200">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-600">Admin Panel</h3>
      </div>
      
      <div className="mb-4 text-sm text-gray-600">
        <span className="font-medium">Your IP:</span> {userIP}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            multiple
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Upload
          </button>
        </div>

        {uploadStatuses.length > 0 && (
          <div className="space-y-2">
            {uploadStatuses.map((status, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {status.status === 'uploading' && <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />}
                {status.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {status.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                <span className={`${status.status === 'success' ? 'text-green-600' : status.status === 'error' ? 'text-red-600' : 'text-orange-600'}`}>
                  {status.message}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <h5 className="font-medium text-blue-800">Uploaded Files</h5>
          </div>
          
          {files.length === 0 ? (
            <p className="text-gray-500 text-sm">No files uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">{file.fileName}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {file.uploadDate}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFile(file.fileName)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}