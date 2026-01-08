import { useState, useCallback } from 'react';
import { 
  uploadMediaSecure,
  deleteMediaSecure,
  listMediaFromLibrary,
  MediaBucket,
  MediaFile,
  UploadResult 
} from '@/lib/secureMediaUpload';
import { useToast } from '@/hooks/use-toast';

export interface UploadProgress {
  stage: 'idle' | 'validating' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
}

interface UseMediaLibraryOptions {
  bucketType: MediaBucket;
  folder?: string;
  onUploadComplete?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export function useMediaLibrary({ bucketType, folder, onUploadComplete, onError }: UseMediaLibraryOptions) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ stage: 'idle', progress: 0 });
  const { toast } = useToast();

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const mediaFiles = await listMediaFromLibrary(bucketType);
      setFiles(mediaFiles);
    } catch (error: any) {
      console.error('Failed to load media files:', error);
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  }, [bucketType, onError]);

  const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
    setUploading(true);
    setUploadProgress({ stage: 'validating', progress: 10 });

    try {
      setUploadProgress({ stage: 'uploading', progress: 30 });
      
      const result = await uploadMediaSecure(file, bucketType, folder);
      
      setUploadProgress({ stage: 'complete', progress: 100 });
      onUploadComplete?.(result);
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
      
      // Refresh file list
      await loadFiles();
      
      return result;
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadProgress({ stage: 'error', progress: 0, error: error.message });
      onError?.(error.message);
      
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message,
      });
      
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress({ stage: 'idle', progress: 0 });
      }, 2000);
    }
  }, [bucketType, folder, loadFiles, onUploadComplete, onError, toast]);

  const remove = useCallback(async (path: string) => {
    try {
      await deleteMediaSecure(path, bucketType);
      await loadFiles();
      
      toast({
        title: 'Deleted',
        description: 'Image removed successfully',
      });
    } catch (error: any) {
      console.error('Delete failed:', error);
      onError?.(error.message);
      
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: error.message,
      });
    }
  }, [bucketType, loadFiles, onError, toast]);

  const resetProgress = useCallback(() => {
    setUploadProgress({ stage: 'idle', progress: 0 });
  }, []);

  return {
    files,
    loading,
    uploading,
    uploadProgress,
    loadFiles,
    upload,
    remove,
    resetProgress,
  };
}
