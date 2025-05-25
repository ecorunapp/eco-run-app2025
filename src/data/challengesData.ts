
import { Walk, Run } from '@/components/icons';
import type { Challenge } from '@/types/Challenge';

export const challengesData: Omit<Challenge, 'status'>[] = [
  {
    id: 'walk1k',
    type: 'walk',
    distance: 1,
    reward: 100,
    title: '1km Walk Challenge',
    description: 'A brisk 1km walk to get you started.',
    icon: Walk,
  },
  {
    id: 'walk2k',
    type: 'walk',
    distance: 2,
    reward: 100,
    title: '2km Walk Challenge',
    description: 'Stretch your legs with a 2km walk.',
    icon: Walk,
  },
  {
    id: 'walk3k',
    type: 'walk',
    distance: 3,
    reward: 100,
    title: '3km Walk Challenge',
    description: 'Go the extra mile with a 3km walk.',
    icon: Walk,
  },
  {
    id: 'run1k',
    type: 'run',
    distance: 1,
    reward: 100,
    title: '1km Run Challenge',
    description: 'A quick 1km run to boost your energy.',
    icon: Run,
  },
  {
    id: 'run2k',
    type: 'run',
    distance: 2,
    reward: 100,
    title: '2km Run Challenge',
    description: 'Push yourself with a 2km run.',
    icon: Run,
  },
  {
    id: 'run3k',
    type: 'run',
    distance: 3,
    reward: 100,
    title: '3km Run Challenge',
    description: 'Conquer a 3km run and feel accomplished.',
    icon: Run,
  },
];

