import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, ImageIcon, Check, Loader2, FolderOpen, X } from 'lucide-react';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { MediaBucket, getMediaUrl } from '@/lib/secureMediaUpload';
import type { UploadStageType } from '@/components/admin/UploadProgress';
import { UploadProgress } from '@/components/admin/UploadProgress';
import { cn } from '@/lib/utils';

interface MediaPickerProps {
  value?: string; // Can be path or URL
  onChange: (value: string, path: string) => void; // Returns URL and path
  bucketType: MediaBucket;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function MediaPicker({
  value,
  onChange,
  bucketType,
  label = 'Image',
  placeholder = 'Select or upload an image',
  className,
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    loading,
    uploading,
    uploadProgress,
    loadFiles,
    upload,
  } = useMediaLibrary({
    bucketType,
    onUploadComplete: (result) => {
      setSelectedPath(result.path);
      setPreviewUrl(result.url);
    },
  });

  // Initialize preview from value
  useEffect(() => {
    if (value) {
      if (value.startsWith('http')) {
        setPreviewUrl(value);
        setUrlInput(value);
      } else {
        const url = getMediaUrl(value, bucketType);
        setPreviewUrl(url);
        setSelectedPath(value);
      }
    }
  }, [value, bucketType]);

  // Load files when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, loadFiles]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file);
    if (result) {
      onChange(result.url, result.path);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectExisting = (file: { path: string; url: string }) => {
    setSelectedPath(file.path);
    setPreviewUrl(file.url);
    onChange(file.url, file.path);
    setIsOpen(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setPreviewUrl(urlInput);
      onChange(urlInput, ''); // Empty path for external URLs
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setPreviewUrl('');
    setSelectedPath('');
    setUrlInput('');
    onChange('', '');
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      
      {/* Current Preview */}
      <div className="relative">
        {previewUrl ? (
          <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border bg-muted">
            <img
              src={previewUrl}
              alt="Selected"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setIsOpen(true)}
              >
                Change
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleClear}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full h-40 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          </button>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress.stage !== 'idle' && uploadProgress.stage !== 'complete' && uploadProgress.stage !== 'error' && (
        <UploadProgress
          progress={uploadProgress.progress}
          stage={uploadProgress.stage as UploadStageType}
        />
      )}

      {/* Media Picker Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="upload" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="library">
                <FolderOpen className="w-4 h-4 mr-2" />
                Library
              </TabsTrigger>
              <TabsTrigger value="url">
                <ImageIcon className="w-4 h-4 mr-2" />
                URL
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg mt-4">
                {uploading ? (
                  <div className="w-full max-w-xs">
                    <UploadProgress
                      progress={uploadProgress.progress}
                      stage={uploadProgress.stage as UploadStageType}
                      error={uploadProgress.error}
                    />
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4 text-center">
                      Drag and drop an image here, or click to select
                    </p>
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground mt-4">
                      JPG, PNG, WEBP • Max 2MB • Max 4000×4000px
                    </p>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="flex-1 min-h-0 mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mb-4" />
                  <p>No images in library</p>
                  <p className="text-sm">Upload images to see them here</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
                    {files.map((file) => (
                      <button
                        key={file.path}
                        type="button"
                        onClick={() => handleSelectExisting(file)}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                          selectedPath === file.path
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-transparent hover:border-primary/50'
                        )}
                      >
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        {selectedPath === file.path && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-5 h-5 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* URL Tab */}
            <TabsContent value="url" className="flex-1 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
                
                {urlInput && (
                  <div className="h-40 rounded-lg overflow-hidden border border-border bg-muted">
                    <img
                      src={urlInput}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="w-full"
                >
                  Use This URL
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
