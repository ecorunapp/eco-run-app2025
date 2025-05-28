
import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Lightbulb } from 'lucide-react'; // Or any other relevant icon

interface MotivationalMessageCardProps {
  message: string;
  onDismiss: () => void;
}

const MotivationalMessageCard: React.FC<MotivationalMessageCardProps> = ({ message, onDismiss }) => {
  const [exitX, setExitX] = useState(-200); // Default exit to left

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50; // Minimum pixels to count as a swipe
    if (Math.abs(info.offset.x) > swipeThreshold) {
      setExitX(info.offset.x > 0 ? 200 : -200); // Set exit direction based on swipe
      onDismiss();
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: exitX, transition: { duration: 0.3 } }}
      className="bg-eco-dark-secondary rounded-xl shadow-lg p-4 m-4 cursor-grab active:cursor-grabbing"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start">
        <Lightbulb className="text-eco-accent mr-3 mt-1 flex-shrink-0" size={24} />
        <div>
          <h4 className="font-semibold text-eco-light mb-1">Daily Boost!</h4>
          <p className="text-sm text-eco-gray">{message}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MotivationalMessageCard;
