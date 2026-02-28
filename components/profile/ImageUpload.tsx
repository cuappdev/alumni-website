"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ImageUploadProps {
  currentUrl?: string;
  onFileSelect: (file: File) => void;
  label?: string;
}

export function ImageUpload({ currentUrl, onFileSelect, label = "Photo" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentUrl);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14">
          <AvatarImage src={preview} />
          <AvatarFallback className="text-xs">IMG</AvatarFallback>
        </Avatar>
        <Input type="file" accept="image/*" onChange={handleChange} className="max-w-xs" />
      </div>
    </div>
  );
}
