import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export type UploadStageType = 'idle' | 'validating' | 'compressing' | 'uploading' | 'complete' | 'error';

interface UploadProgressProps {
  progress: number;
  stage: UploadStageType;
  fileName?: string;
  error?: string;
}

const stageLabels: Record<UploadStageType, string> = {
  idle: 'Ready to upload',
  validating: 'Validating image...',
  compressing: 'Compressing image...',
  uploading: 'Uploading...',
  complete: 'Upload complete!',
  error: 'Upload failed',
};

export const UploadProgress = ({ progress, stage, fileName, error }: UploadProgressProps) => {
  if (stage === 'idle') return null;

  const isComplete = stage === 'complete';
  const isError = stage === 'error';
  const isProcessing = stage === 'validating' || stage === 'compressing';

  return (
    <div className={`w-full space-y-3 p-4 rounded-lg border animate-fade-in ${
      isError ? 'bg-destructive/10 border-destructive/50' : 'bg-muted/50 border-border'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-destructive" />
          ) : isProcessing ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-primary" />
          )}
          <span className={`text-sm font-medium ${isError ? 'text-destructive' : ''}`}>
            {stageLabels[stage]}
          </span>
        </div>
        {!isError && (
          <span className="text-sm font-semibold text-primary">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      
      {!isError && <Progress value={progress} className="h-2" />}
      
      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
      
      {fileName && !error && (
        <p className="text-xs text-muted-foreground truncate">
          {fileName}
        </p>
      )}
    </div>
  );
};
