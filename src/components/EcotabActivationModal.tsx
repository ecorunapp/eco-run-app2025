
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";

interface EcotabActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
}

const addressSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  addressLine1: z.string().min(5, { message: "Address line 1 must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  postalCode: z.string().min(3, { message: "Postal code must be at least 3 characters." }),
});

type AddressFormData = z.infer<typeof addressSchema>;

const EcotabActivationModal: React.FC<EcotabActivationModalProps> = ({ isOpen, onClose, challengeTitle }) => {
  const { toast } = useToast();
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      addressLine1: '',
      city: '',
      postalCode: '',
    },
  });

  const onSubmit = (data: AddressFormData) => {
    console.log('Ecotab Activation Form Data:', data);
    toast({
      title: "Order Submitted (Simulated)",
      description: `Thank you, ${data.fullName}! Your Ecotab card order for the ${challengeTitle} is being processed. Delivery details: ${data.addressLine1}, ${data.city}.`,
    });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-eco-dark-secondary text-eco-light border-eco-gray-dark">
        <DialogHeader>
          <DialogTitle className="text-2xl text-eco-accent">Activate Your EcoTab Card</DialogTitle>
          <DialogDescription className="text-eco-light-gray">
            Complete your details for the {challengeTitle} and get your physical EcoTab card.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <div className="h-40 bg-gray-700 rounded-lg flex items-center justify-center my-4 border border-eco-gray">
            <p className="text-eco-light-gray text-center">
              Interactive 3D EcoTab Card Preview
              <br />
              (Placeholder - Imagine a cool 360° view here!)
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-2 text-eco-accent">Card Benefits:</h4>
          <ul className="list-disc list-inside space-y-1 text-eco-light-gray text-sm">
            <li>Unlock exclusive partner rewards & discounts.</li>
            <li>Track your environmental impact in style.</li>
            <li>Gain access to premium app features.</li>
            <li>Priority customer support.</li>
            <li>Be part of the exclusive EcoTab community.</li>
          </ul>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-eco-light-gray">Full Name on Card</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Alex Green" {...field} className="bg-eco-dark border-eco-gray focus:ring-eco-accent" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-eco-light-gray">Delivery Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, Building, Apartment No." {...field} className="bg-eco-dark border-eco-gray focus:ring-eco-accent" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-eco-light-gray">City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dubai" {...field} className="bg-eco-dark border-eco-gray focus:ring-eco-accent" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-eco-light-gray">Postal Code (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 00000" {...field} className="bg-eco-dark border-eco-gray focus:ring-eco-accent" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
             <p className="text-center font-semibold text-eco-accent text-md my-6 pt-2">
              One-time Activation & Delivery Fee: 60 AED
            </p>
            <DialogFooter className="sm:justify-start">
              <Button type="submit" className="w-full bg-eco-accent text-eco-dark hover:bg-eco-accent/90">
                Confirm & Proceed to Payment (Simulated)
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <DialogClose asChild>
            <button className="hidden" onClick={onClose}>Close</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default EcotabActivationModal;
