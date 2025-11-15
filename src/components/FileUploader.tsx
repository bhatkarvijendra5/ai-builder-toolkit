import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface FileUploaderProps {
  accept?: Record<string, string[]>;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string;
}

const FileUploader = ({
  accept,
  maxFiles = 1,
  onFilesSelected,
  acceptedFileTypes = "All files",
}: FileUploaderProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, maxFiles);
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [selectedFiles, maxFiles, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`glass-card cursor-pointer border-2 border-dashed p-12 text-center transition-all ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-6">
            <Upload className="h-12 w-12 text-primary" />
          </div>
          {isDragActive ? (
            <p className="text-lg font-medium">Drop your files here</p>
          ) : (
            <>
              <p className="text-lg font-medium">
                Drag & drop your files here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                {acceptedFileTypes} • Max {maxFiles} file{maxFiles > 1 ? "s" : ""}
              </p>
              <Button type="button" className="gradient-primary">
                Select Files
              </Button>
            </>
          )}
        </div>
      </Card>

    </div>
  );
};

export default FileUploader;
