
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { UserProfile } from '@/hooks/useUserProfile'; // Ensure this type matches your definition
import { toast } from 'sonner';
import { Loader2 } from '@/components/icons';

const editUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long').optional().or(z.literal('')),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name too long').optional().or(z.literal('')),
  // Add other editable fields here if needed, e.g., email (with caution)
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  userToEdit: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: (userId: string, data: Partial<UserProfile>) => Promise<UserProfile | null>;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ userToEdit, isOpen, onClose, onUserUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: '',
      full_name: '',
    }
  });

  useEffect(() => {
    if (userToEdit) {
      reset({
        username: userToEdit.username || '',
        full_name: userToEdit.full_name || '',
      });
    } else {
      reset({
        username: '',
        full_name: '',
      });
    }
  }, [userToEdit, reset]);

  const onSubmit: SubmitHandler<EditUserFormData> = async (data) => {
    if (!userToEdit) return;
    setIsSubmitting(true);
    try {
      const updates: Partial<UserProfile> = {};
      if (data.username && data.username !== userToEdit.username) {
        updates.username = data.username;
      }
      if (data.full_name && data.full_name !== userToEdit.full_name) {
        updates.full_name = data.full_name;
      }

      if (Object.keys(updates).length === 0) {
        toast.info("No changes detected.");
        onClose();
        setIsSubmitting(false);
        return;
      }
      
      const updatedUser = await onUserUpdate(userToEdit.id, updates);
      if (updatedUser) {
        toast.success(`User ${updatedUser.username || updatedUser.id} updated successfully.`);
        onClose();
      } else {
        // Error toast is handled by useUserProfile's updateProfile
      }
    } catch (error: any) {
      toast.error(`Failed to update user: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userToEdit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-eco-dark-secondary text-eco-light border-eco-dark-tertiary">
        <DialogHeader>
          <DialogTitle>Edit User: {userToEdit.username || userToEdit.id}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-eco-gray">Username</Label>
            <Input
              id="username"
              {...register('username')}
              className="bg-eco-dark border-eco-dark-tertiary text-eco-light placeholder-eco-gray-dark focus:ring-eco-accent"
              placeholder={userToEdit.username || "Enter username"}
            />
            {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <Label htmlFor="full_name" className="text-eco-gray">Full Name</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              className="bg-eco-dark border-eco-dark-tertiary text-eco-light placeholder-eco-gray-dark focus:ring-eco-accent"
              placeholder={userToEdit.full_name || "Enter full name"}
            />
            {errors.full_name && <p className="text-red-400 text-sm mt-1">{errors.full_name.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="text-eco-gray border-eco-gray hover:bg-eco-dark-tertiary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="bg-eco-accent text-eco-dark hover:bg-eco-accent/80">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserForm;
