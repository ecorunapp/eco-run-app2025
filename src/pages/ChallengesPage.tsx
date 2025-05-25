import React from 'react';
import { useChallenges } from '@/context/ChallengesContext';
import ChallengeCard from '@/components/ChallengeCard';
import BottomNav from '@/components/BottomNav'; // Assuming BottomNav should be here
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

const ChallengesPage: React.FC = () => {
  const {
    challenges,
    isLoading
  } = useChallenges();

  // Separate walk and run challenges for display
  const walkChallenges = challenges.filter(c => c.type === 'walk');
  const runChallenges = challenges.filter(c => c.type === 'run');
  if (isLoading) {
    return <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="p-4 sticky top-0 bg-background z-10 shadow-sm">
          <h1 className="text-2xl font-bold text-center text-primary">Challenges</h1>
        </header>
        <main className="flex-grow p-4 space-y-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[220px] w-full rounded-lg" />)}
          </div>
        </main>
        <BottomNav />
      </div>;
  }
  return <div className="flex flex-col min-h-screen text-foreground bg-gray-900">
      <header className="p-4 sticky top-0 z-10 shadow-sm border-b bg-gray-900">
        <h1 className="text-2xl font-bold text-center text-primary">Challenges</h1>
      </header>
      <main className="flex-grow p-4 space-y-8 pb-20 bg-gray-900"> {/* Added pb-20 for BottomNav */}
        
        {/* Walk Challenges Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Walk Challenges</h2>
          {walkChallenges.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {walkChallenges.map(challenge => <ChallengeCard key={challenge.id} challenge={challenge} />)}
            </div> : <p className="text-muted-foreground">No walking challenges available right now.</p>}
        </section>

        {/* Run Challenges Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Run Challenges</h2>
          {runChallenges.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {runChallenges.map(challenge => <ChallengeCard key={challenge.id} challenge={challenge} />)}
            </div> : <p className="text-muted-foreground">No running challenges available right now.</p>}
        </section>
        
      </main>
      <BottomNav />
    </div>;
};
export default ChallengesPage;