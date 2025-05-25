
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, UploadCloud, Loader2, Save } from '@/components/icons';
import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const profileFormSchema = z.object({
  full_name: z.string().min(2, { message: "Full name must be at least 2 characters." }).max(50),
  weight_kg: z.coerce.number().positive({ message: "Weight must be positive." }).optional().nullable(),
  height_cm: z.coerce.number().positive({ message: "Height must be positive." }).optional().nullable(),
  avatar_file: z.instanceof(FileList).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const EditProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, isLoading: profileLoading } = useUserProfile();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: '',
      weight_kg: null,
      height_cm: null,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
      });
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile, form]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
      form.setValue('avatar_file', files);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !profile) {
      toast.error("User session not found. Please log in again.");
      return;
    }

    setIsSaving(true);
    let newAvatarUrl = profile.avatar_url;

    if (data.avatar_file && data.avatar_file.length > 0) {
      setIsUploading(true);
      const file = data.avatar_file[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile_pictures')
          .upload(filePath, file, { upsert: true }); // Use upsert to overwrite if file exists

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('profile_pictures')
          .getPublicUrl(uploadData.path);
        newAvatarUrl = urlData.publicUrl;
        toast.success("Avatar uploaded successfully!");
      } catch (error: any) {
        toast.error(`Avatar upload failed: ${error.message}`);
        setIsUploading(false);
        setIsSaving(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const profileUpdates: Partial<UserProfile> = {
      full_name: data.full_name,
      weight_kg: data.weight_kg,
      height_cm: data.height_cm,
      avatar_url: newAvatarUrl,
      // username is email, typically not editable by user directly in this form
    };
    
    // Filter out undefined values to avoid overwriting with undefined
    const filteredUpdates = Object.entries(profileUpdates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            (acc as any)[key] = value;
        }
        return acc;
    }, {} as Partial<UserProfile>);


    try {
      await updateProfile(user.id, filteredUpdates);
      toast.success("Profile updated successfully!");
      navigate('/profile');
    } catch (error: any) {
      toast.error(`Profile update failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (profileLoading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-eco-accent" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-32 h-32 border-4 border-eco-accent">
          <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
          <AvatarFallback className="bg-eco-accent text-eco-dark text-5xl">
            {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : <User size={60} />}
          </AvatarFallback>
        </Avatar>
        <div className="relative">
          <Button type="button" variant="outline" size="sm" asChild>
            <Label htmlFor="avatar_file" className="cursor-pointer flex items-center">
              <UploadCloud size={16} className="mr-2" /> Change Photo
            </Label>
          </Button>
          <Input
            id="avatar_file"
            type="file"
            accept="image/png, image/jpeg, image/gif"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            {...form.register('avatar_file')}
            onChange={handleAvatarChange}
            disabled={isUploading || isSaving}
          />
        </div>
        {form.formState.errors.avatar_file && (
            <p className="text-sm text-destructive">{form.formState.errors.avatar_file.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="full_name" className="text-eco-light">Full Name</Label>
        <Input
          id="full_name"
          className="bg-eco-dark-secondary border-eco-gray focus:border-eco-accent"
          {...form.register('full_name')}
          disabled={isSaving}
        />
        {form.formState.errors.full_name && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.full_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="weight_kg" className="text-eco-light">Weight (kg)</Label>
          <Input
            id="weight_kg"
            type="number"
            step="0.1"
            className="bg-eco-dark-secondary border-eco-gray focus:border-eco-accent"
            {...form.register('weight_kg')}
            disabled={isSaving}
          />
          {form.formState.errors.weight_kg && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.weight_kg.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="height_cm" className="text-eco-light">Height (cm)</Label>
          <Input
            id="height_cm"
            type="number"
            step="0.1"
            className="bg-eco-dark-secondary border-eco-gray focus:border-eco-accent"
            {...form.register('height_cm')}
            disabled={isSaving}
          />
          {form.formState.errors.height_cm && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.height_cm.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full bg-eco-accent text-eco-dark hover:bg-eco-accent/90" disabled={isUploading || isSaving}>
        {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
        {isUploading ? 'Uploading...' : isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
};

export default EditProfileForm;
