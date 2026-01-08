import { supabase } from '@/integrations/supabase/client';

// ============= Types =============
export type MediaBucket = 'portfolio' | 'logos';

export interface UploadResult {
  path: string;
  url: string;
}

export interface MediaFile {
  id: string;
  name: string; // For compatibility with MediaPicker
  filename: string;
  original_filename: string | null;
  path: string;
  bucket: string;
  url: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

// ============= Folder Configuration =============
const BUCKET_FOLDERS: Record<string, string> = {
  portfolio: '',
  logos: '',
  services: 'services',
  banners: 'banners',
};

// ============= Client-side validation (pre-upload) =============
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const validateImageClient = (file: File): { isValid: boolean; error?: string } => {
  if (!ALLOWED_FORMATS.includes(file.type)) {
    return { isValid: false, error: 'Invalid file format. Only JPG, PNG, and WEBP are allowed.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size exceeds 2MB limit.' };
  }
  return { isValid: true };
};

// ============= Secure Upload via Backend Function =============
export const uploadMediaSecure = async (
  file: File,
  bucketType: MediaBucket,
  folder?: string
): Promise<UploadResult> => {
  const validation = validateImageClient(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Determine bucket and folder
  const actualBucket = bucketType === 'portfolio' || bucketType === 'logos' ? bucketType : 'portfolio';
  const actualFolder = folder || BUCKET_FOLDERS[bucketType] || '';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', actualBucket);
  formData.append('folder', actualFolder);

  const { data, error } = await supabase.functions.invoke('secure-media-upload', {
    body: formData as any,
  });

  if (error) {
    // `invoke` wraps HTTP/network errors; surface the most useful message.
    throw new Error(error.message || 'Upload failed');
  }

  if (!data?.url || !data?.path) {
    throw new Error('Upload failed: Invalid response from server');
  }

  return { path: data.path, url: data.url };
};

// ============= Delete via Backend Function =============
export const deleteMediaSecure = async (path: string, bucket: MediaBucket): Promise<void> => {
  const { data, error } = await supabase.functions.invoke('secure-media-upload', {
    body: { path, bucket },
    method: 'DELETE',
  } as any);

  if (error) {
    throw new Error(error.message || 'Delete failed');
  }

  if (data?.error) {
    throw new Error(data.error);
  }
};

// ============= List Media from Library =============
export const listMediaFromLibrary = async (bucket?: MediaBucket): Promise<MediaFile[]> => {
  let query = supabase
    .from('media_library')
    .select('*')
    .order('created_at', { ascending: false });

  if (bucket) {
    query = query.eq('bucket', bucket);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch media: ${error.message}`);
  }

  // Generate URLs for each item
  return (data || []).map((item: any) => ({
    ...item,
    name: item.filename, // Alias for MediaPicker compatibility
    url: getMediaUrl(item.path, item.bucket as MediaBucket),
  }));
};

// ============= Get Public URL =============
export const getMediaUrl = (path: string, bucket: MediaBucket): string => {
  if (!path) return '';
  
  // If already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// ============= Check if path is relative =============
export const isRelativePath = (value: string): boolean => {
  if (!value) return false;
  return !value.startsWith('http://') && !value.startsWith('https://');
};
