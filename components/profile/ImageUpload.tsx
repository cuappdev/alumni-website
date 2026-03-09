"use client";

import { useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  currentUrl?: string;
  onFileSelected: (blob: Blob, previewUrl: string) => void;
  label?: string;
  name?: string;
}

function getCroppedBlob(image: HTMLImageElement, crop: Crop): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 800;
  const ctx = canvas.getContext("2d")!;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const px =
    crop.unit === "%"
      ? {
          x: (crop.x / 100) * image.width * scaleX,
          y: (crop.y / 100) * image.height * scaleY,
          w: (crop.width / 100) * image.width * scaleX,
          h: (crop.height / 100) * image.height * scaleY,
        }
      : {
          x: crop.x * scaleX,
          y: crop.y * scaleY,
          w: crop.width * scaleX,
          h: crop.height * scaleY,
        };

  ctx.drawImage(image, px.x, px.y, px.w, px.h, 0, 0, 800, 800);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))),
      "image/jpeg",
      0.95,
    );
  });
}

export function ImageUpload({ currentUrl, onFileSelected, label = "Photo", name }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentUrl || undefined);
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImgSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: "%", width: 90 }, 1, width, height), width, height));
  };

  const handleApply = async () => {
    if (!imgRef.current || !crop) return;
    const blob = await getCroppedBlob(imgRef.current, crop);
    const previewUrl = URL.createObjectURL(blob);
    setPreview(previewUrl);
    onFileSelected(blob, previewUrl);
    setImgSrc("");
  };

  return (
    <>
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarImage src={preview} />
            <AvatarFallback className="text-xs">
              {name
                ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                : "?"}
            </AvatarFallback>
          </Avatar>
          <Input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="max-w-xs"
          />
        </div>
      </div>

      <Dialog open={!!imgSrc} onOpenChange={(open) => !open && setImgSrc("")}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop photo</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, pct) => setCrop(pct)}
              aspect={1}
              circularCrop
              keepSelection
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imgRef} src={imgSrc || undefined} onLoad={onImageLoad} alt="Crop preview" />
            </ReactCrop>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImgSrc("")}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={!crop}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
