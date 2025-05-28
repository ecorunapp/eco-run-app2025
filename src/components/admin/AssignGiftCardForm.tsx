
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { UserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Gift } from '@/components/icons';

// Define GiftCard type based on your gift_cards table structure
export interface GiftCard {
  id: string; // uuid
  title: string;
  value_coins: number;
  image_url?: string | null;
  monetary_value_aed?: number | null;
  card_key?: string | null; // This could be the promo code
  is_active?: boolean | null;
  // Add other relevant fields from your gift_cards table
}

const assignGiftCardSchema = z.object({
  userId: z.string().uuid('Invalid user ID.'),
  giftCardId: z.string().uuid('Invalid gift card ID.'),
});

type AssignGiftCardFormData = z.infer<typeof assignGiftCardSchema>;

interface AssignGiftCardFormProps {
  users: UserProfile[];
  giftCards: GiftCard[];
  isOpen: boolean;
  onClose: () => void;
  onAssignmentSuccess: () => void; // Callback to potentially refresh data
}

const AssignGiftCardForm: React.FC<AssignGiftCardFormProps> = ({ users, giftCards, isOpen, onClose, onAssignmentSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AssignGiftCardFormData>({
    resolver: zodResolver(assignGiftCardSchema),
  });

  const selectedUserId = watch('userId');
  const selectedGiftCardId = watch('giftCardId');

  const onSubmit: SubmitHandler<AssignGiftCardFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const selectedGiftCard = giftCards.find(gc => gc.id === data.giftCardId);
      if (!selectedGiftCard) {
        toast.error("Selected gift card not found.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from('user_gift_cards').insert({
        user_id: data.userId,
        gift_card_id: data.giftCardId,
        prize_title: selectedGiftCard.title,
        prize_image_url: selectedGiftCard.image_url,
        associated_eco_coins_value: selectedGiftCard.value_coins,
        prize_monetary_value_aed: selectedGiftCard.monetary_value_aed,
        prize_promo_code: selectedGiftCard.card_key, // Assuming card_key is the promo code
        assigned_at: new Date().toISOString(),
        status: 'assigned', // Default status
      });

      if (error) throw error;

      toast.success(`Gift card "${selectedGiftCard.title}" assigned successfully!`);
      onAssignmentSuccess();
      onClose();
    } catch (error: any) {
      toast.error(`Failed to assign gift card: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter for active gift cards
  const activeGiftCards = giftCards.filter(gc => gc.is_active !== false);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-eco-dark-secondary text-eco-light border-eco-dark-tertiary">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Gift size={20} className="mr-2 text-eco-accent" /> Assign Gift Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="userId" className="text-eco-gray">Select User</Label>
            <Select
              onValueChange={(value) => setValue('userId', value, { shouldValidate: true })}
              value={selectedUserId}
            >
              <SelectTrigger id="userId" className="w-full bg-eco-dark border-eco-dark-tertiary text-eco-light focus:ring-eco-accent">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="bg-eco-dark-secondary border-eco-dark-tertiary text-eco-light">
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id} className="hover:bg-eco-dark-tertiary focus:bg-eco-dark-tertiary">
                    {user.username || user.email || user.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.userId && <p className="text-red-400 text-sm mt-1">{errors.userId.message}</p>}
          </div>

          <div>
            <Label htmlFor="giftCardId" className="text-eco-gray">Select Gift Card</Label>
            <Select
              onValueChange={(value) => setValue('giftCardId', value, { shouldValidate: true })}
              value={selectedGiftCardId}
            >
              <SelectTrigger id="giftCardId" className="w-full bg-eco-dark border-eco-dark-tertiary text-eco-light focus:ring-eco-accent">
                <SelectValue placeholder="Select a gift card" />
              </SelectTrigger>
              <SelectContent className="bg-eco-dark-secondary border-eco-dark-tertiary text-eco-light">
                 {activeGiftCards.length > 0 ? activeGiftCards.map(gc => (
                  <SelectItem key={gc.id} value={gc.id} className="hover:bg-eco-dark-tertiary focus:bg-eco-dark-tertiary">
                    {gc.title} ({gc.value_coins} coins)
                  </SelectItem>
                )) : <SelectItem value="no-cards" disabled>No active gift cards available</SelectItem>}
              </SelectContent>
            </Select>
            {errors.giftCardId && <p className="text-red-400 text-sm mt-1">{errors.giftCardId.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="text-eco-gray border-eco-gray hover:bg-eco-dark-tertiary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || activeGiftCards.length === 0} className="bg-eco-accent text-eco-dark hover:bg-eco-accent/80">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignGiftCardForm;
