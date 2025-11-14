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

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Selected Files:</h3>
          {selectedFiles.map((file, index) => (
            <Card key={index} className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
