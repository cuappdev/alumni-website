"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { PostType } from "@/types";
import { CitySelector } from "@/components/profile/CitySelector";

const schema = z
  .object({
    type: z.enum(["post", "job", "announcement", "event"]),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    company: z.string().optional(),
    city: z.string().optional(),
    applyUrl: z.string().optional(),
    eventDate: z.string().optional(),
    url: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "job" && !data.company) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Company is required", path: ["company"] });
    }
    if (data.type === "event" && !data.eventDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Event date is required", path: ["eventDate"] });
    }
  });

type FormData = z.infer<typeof schema>;

type TypeOption = { value: PostType; label: string; adminOnly?: boolean };

const ALL_TYPE_OPTIONS: TypeOption[] = [
  { value: "post", label: "Post" },
  { value: "job", label: "Job listing" },
  { value: "announcement", label: "Announcement", adminOnly: true },
  { value: "event", label: "Event", adminOnly: true },
];

const DIALOG_TITLES: Record<PostType, string> = {
  post: "Create a post",
  job: "Post a job listing",
  announcement: "Create an announcement",
  event: "Create an event",
};

interface Props {
  onSuccess?: () => void;
  allowedTypes?: PostType[];
  defaultType?: PostType;
  label?: string;
}

export function CreatePostDialog({ onSuccess, allowedTypes, defaultType = "post", label }: Props) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [eventCityId, setEventCityId] = useState<string | undefined>(undefined);
  const { isAdmin } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: defaultType },
  });

  const selectedType = watch("type");

  const availableTypes = ALL_TYPE_OPTIONS.filter((t) => {
    if (t.adminOnly && !isAdmin) return false;
    if (allowedTypes && !allowedTypes.includes(t.value)) return false;
    return true;
  });

  const showTypeSelector = availableTypes.length > 1;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = { ...data, ...(data.type === "event" ? { cityId: eventCityId } : {}) };
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Posted!");
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setFormKey((k) => k + 1); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {label ?? "New post"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{DIALOG_TITLES[selectedType]}</DialogTitle>
        </DialogHeader>

        {showTypeSelector && (
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {availableTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue("type", t.value)}
                className={`cursor-pointer flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  selectedType === t.value
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <form key={formKey} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("type")} />

          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">{selectedType === "event" ? "Details" : "Description"}</Label>
            <Textarea id="description" rows={4} {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {selectedType === "job" && (
            <>
              <div className="space-y-1">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register("company")} />
                {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="city">City <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="city" placeholder="e.g. New York, NY" {...register("city")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="applyUrl">Apply link <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="applyUrl" type="url" placeholder="https://..." {...register("applyUrl")} />
                {errors.applyUrl && <p className="text-sm text-destructive">{errors.applyUrl.message}</p>}
              </div>
            </>
          )}

          {selectedType === "event" && (
            <>
              <div className="space-y-1">
                <Label htmlFor="eventDate">Date & time</Label>
                <Input id="eventDate" type="datetime-local" {...register("eventDate")} />
                {errors.eventDate && <p className="text-sm text-destructive">{errors.eventDate.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>City <span className="text-muted-foreground">(optional)</span></Label>
                <CitySelector selectedId={eventCityId} onChange={setEventCityId} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="url">Link <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="url" type="url" placeholder="https://..." {...register("url")} />
                {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Posting…" : "Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
