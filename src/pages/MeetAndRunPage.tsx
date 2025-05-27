
import React from 'react';
import BottomNav from '@/components/BottomNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MapPin, CalendarDays, PlayCircle } from 'lucide-react';

const MeetAndRunPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="p-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-center text-purple-700">Meet & Run</h1>
      </header>

      <main className="flex-grow p-4 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-purple-600">
              <Users className="mr-2 h-6 w-6" />
              Find a Running Buddy
            </CardTitle>
            <CardDescription>
              Invite friends or discover nearby users to join you for a run and earn rewards together!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <Users className="mr-2 h-5 w-5" /> Invite a Friend
            </Button>
            <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
              <MapPin className="mr-2 h-5 w-5" /> Discover Nearby Runners
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-green-600">
              <CalendarDays className="mr-2 h-6 w-6" />
              Upcoming Meet & Runs
            </CardTitle>
            <CardDescription>
              You have no upcoming meet & runs scheduled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for list of upcoming meets */}
            <p className="text-sm text-gray-500 text-center">
              Start a new Meet & Run to see it here.
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-blue-600">
              <PlayCircle className="mr-2 h-6 w-6" />
              Active Meet & Run
            </CardTitle>
            <CardDescription>
              No active session.
            </CardDescription>
          </CardHeader>
           <CardContent>
            {/* Placeholder for active meet */}
            <p className="text-sm text-gray-500 text-center">
              Accept an invite or start a challenge!
            </p>
          </CardContent>
        </Card>

      </main>

      <BottomNav />
    </div>
  );
};

export default MeetAndRunPage;
