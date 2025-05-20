
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEcoCoins } from '@/context/EcoCoinsContext';
import TransactionHistoryItem from './TransactionHistoryItem'; // Import the item component
import { getIconForTransactionType } from '@/utils/iconHelper'; // Assuming you'll create this helper

// Sample data for the chart (can be dynamic later)
const sampleChartData = [
  { month: 'Jun', value: 2000 },
  { month: 'Jul', value: 3500 },
  { month: 'Aug', value: 4000 },
  { month: 'Sep', value: 7008 },
  { month: 'Oct', value: 3000 },
];

interface TransactionHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ open, onClose }) => {
  const [filter, setFilter] = React.useState<'earn' | 'spend'>('earn');
  const { history, balance } = useEcoCoins();

  const filteredTransactions = history.filter(tx =>
    filter === 'earn'
      ? tx.type === 'income'
      : tx.type === 'redeem' || tx.type === 'spend' || tx.type === 'ecotab' // Removed 'ev'
  );

  // Calculate total for the chart based on current balance or a specific period if needed
  // For simplicity, using current balance as the "total" display above chart
  const displayTotalPoints = balance; // Or calculate based on filtered history if preferred

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-eco-dark-secondary text-eco-light rounded-2xl p-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold pt-6 text-eco-light">Card Transaction History</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <div className="text-center text-3xl font-bold text-pink-400 mb-2">{displayTotalPoints.toLocaleString()} pts</div>
          <div className="text-center text-eco-gray text-xs mb-4">All activity including rewards and spending</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={sampleChartData}> {/* Using sampleChartData */}
              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#aaa" fontSize={12} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ background: 'rgba(30, 30, 30, 0.8)', color: '#fff', borderRadius: 8, border: '1px solid #444' }} 
                itemStyle={{ color: '#eee' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Bar dataKey="value" fill="url(#colorUv)" radius={[10, 10, 0, 0]} barSize={20} />
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5f8f" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#ffb199" stopOpacity={1}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-6 mb-6">
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors duration-200 ${filter === 'earn' ? 'bg-eco-accent text-eco-dark border-eco-accent' : 'bg-transparent text-eco-gray border-eco-gray hover:bg-eco-gray/20 hover:text-eco-light'}`}
              onClick={() => setFilter('earn')}
            >
              Earnings
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors duration-200 ${filter === 'spend' ? 'bg-eco-accent text-eco-dark border-eco-accent' : 'bg-transparent text-eco-gray border-eco-gray hover:bg-eco-gray/20 hover:text-eco-light'}`}
              onClick={() => setFilter('spend')}
            >
              Spending
            </button>
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1"> {/* Added max-height and scroll */}
            {filteredTransactions.length > 0 ? filteredTransactions.map((tx, idx) => (
              <TransactionHistoryItem
                key={idx} // Consider a more stable key if available
                icon={getIconForTransactionType(tx.type)}
                title={tx.label}
                descriptionType={tx.type}
                amount={tx.value}
                date={tx.date}
              />
            )) : (
              <p className="text-eco-gray text-center py-6 text-sm">
                No {filter === 'earn' ? 'earnings' : 'spending'} transactions yet.
              </p>
            )}
          </div>
        </div>
        <DialogClose asChild>
          <button className="w-full py-3.5 bg-eco-dark/80 text-eco-light font-semibold rounded-b-2xl border-t border-eco-gray/30 hover:bg-eco-dark transition-colors">Close</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
