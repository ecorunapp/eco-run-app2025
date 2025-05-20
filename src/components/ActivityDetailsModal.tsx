
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Footprints, Zap, Clock, Flame, Leaf } from "@/components/icons"; // Assuming Leaf for CO2
import { Separator } from '@/components/ui/separator';

export interface ActivityDataPoint {
  name: string; // Day of the week or date string
  date: string; // Full date e.g., '2025-05-20'
  points: number; // EcoPoints
  steps?: number;
  distance?: number; // in km
  duration?: number; // in minutes
  calories?: number;
  co2Saved?: number; // in grams or kg
  type?: 'run' | 'walk' | 'cycle' | 'other';
}

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityDataPoint | null;
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({ isOpen, onClose, activity }) => {
  if (!activity) {
    return null;
  }

  const StatItem: React.FC<{ icon: React.ElementType, label: string, value: string | number | undefined, unit?: string }> = ({ icon: Icon, label, value, unit }) => (
    value !== undefined ? (
      <div className="flex items-center space-x-3">
        <Icon size={20} className="text-eco-accent" />
        <div>
          <p className="text-sm text-eco-gray">{label}</p>
          <p className="text-lg font-semibold text-eco-light">{value} {unit}</p>
        </div>
      </div>
    ) : null
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-eco-dark-secondary text-eco-light border-eco-accent shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-eco-accent flex items-center">
            <Calendar size={24} className="mr-2" /> Activity Details - {activity.name}
          </DialogTitle>
          <DialogDescription className="text-eco-gray">
            Summary of your activity on {new Date(activity.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="bg-eco-gray/20 my-4" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
          <StatItem icon={Zap} label="EcoPoints Earned" value={activity.points} unit="points" />
          {activity.type && <StatItem icon={Footprints} label="Activity Type" value={activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} />}
          <StatItem icon={Footprints} label="Steps Taken" value={activity.steps} unit="steps" />
          <StatItem icon={Clock} label="Duration" value={activity.duration} unit="min" />
          <StatItem icon={Flame} label="Calories Burned" value={activity.calories} unit="kcal" />
          <StatItem icon={Leaf} label="CO2 Saved" value={activity.co2Saved} unit="g" />
        </div>

        <Separator className="bg-eco-gray/20 my-4" />

        <DialogFooter>
          <Button onClick={onClose} className="bg-eco-accent text-eco-dark hover:bg-eco-accent/90">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDetailsModal;
