import React, { useRef } from 'react';
import { Paperclip, X } from 'lucide-react';

interface UploadedFile {
  name: string;
  type: string;
  data: string; // Base64
  size: number;
}

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  files, 
  onFilesChange, 
  maxFiles = 5,
  maxSizeMB = 10 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Solo puedes subir hasta ${maxFiles} archivos`);
      return;
    }

    const processedFiles: UploadedFile[] = [];
    
    for (const file of selectedFiles) {
      // Verificar tamaño
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        alert(`El archivo "${file.name}" excede el límite de ${maxSizeMB}MB`);
        continue;
      }

      // Verificar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/plain',
      ];

      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx?|xlsx?|txt)$/i)) {
        alert(`Tipo de archivo no soportado: "${file.name}". Solo se permiten PDF, Word, Excel y TXT.`);
        continue;
      }

      // Convertir a base64
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const base64Data = await base64Promise;
        processedFiles.push({
          name: file.name,
          type: file.type,
          data: base64Data,
          size: file.size,
        });
      } catch (error) {
        console.error(`Error procesando "${file.name}":`, error);
        alert(`Error procesando "${file.name}"`);
      }
    }

    if (processedFiles.length > 0) {
      onFilesChange([...files, ...processedFiles]);
    }

    // Resetear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['xls', 'xlsx'].includes(ext || '')) return '📊';
    if (ext === 'txt') return '📃';
    return '📎';
  };

  return (
    <div className="space-y-2">
      {/* Archivos subidos */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm group hover:border-[#AAFF00]/30 transition-all"
            >
              <span className="text-base">{getFileIcon(file.name)}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-gray-200 truncate max-w-[150px] text-xs font-medium">
                  {file.name}
                </span>
                <span className="text-gray-500 text-[10px]">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="ml-1 p-1 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="h-3 w-3 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botón de subir archivo */}
      {files.length < maxFiles && (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-[#AAFF00] hover:bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-[#AAFF00]/30 transition-all"
            title="Subir archivos (PDF, Word, Excel, TXT)"
          >
            <Paperclip className="h-4 w-4" />
            <span className="text-xs">Adjuntar archivo</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
