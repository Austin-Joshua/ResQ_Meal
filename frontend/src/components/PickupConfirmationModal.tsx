import { useRef, useState } from 'react';
import { Camera, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUpdateMatchStatus } from '@/hooks/useUpdateMatchStatus';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface PickupConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  foodName?: string;
  pickupAddress?: string;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PickupConfirmationModal({
  open,
  onOpenChange,
  matchId,
  foodName,
  pickupAddress,
}: PickupConfirmationModalProps) {
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const updateStatus = useUpdateMatchStatus();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleConfirm = async () => {
    try {
      let delivery_proof_photo: string | undefined;
      if (photo) {
        delivery_proof_photo = await fileToBase64(photo);
      }
      await updateStatus.mutateAsync({
        matchId,
        status: 'PICKED_UP',
        delivery_proof_photo,
      });
      toast.success(t('pickedUpStatus') || 'Pickup confirmed');
      onOpenChange(false);
      setPhoto(null);
      setPreview(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to confirm pickup';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm pickup</DialogTitle>
          <DialogDescription>
            {foodName ? `${foodName}` : 'Upload a photo as proof of pickup (optional).'}
            {pickupAddress ? ` · ${pickupAddress}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {preview ? (
            <img
              src={preview}
              alt="Pickup proof preview"
              className="w-full h-40 object-cover rounded-lg border"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 rounded-lg border border-dashed bg-muted/30">
              <Camera className="h-8 w-8 text-muted-foreground mb-2" aria-hidden />
              <p className="text-sm text-muted-foreground">Add pickup photo (optional)</p>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            id="pickup-photo-input"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="h-4 w-4 mr-2" aria-hidden />
            {photo ? 'Change photo' : 'Upload photo'}
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={updateStatus.isPending}>
            {updateStatus.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden />
            )}
            Confirm pickup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PickupConfirmationModal;
