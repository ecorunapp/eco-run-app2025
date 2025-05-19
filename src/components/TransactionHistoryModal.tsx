import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jun', value: 2000 },
  { month: 'Jul', value: 3500 },
  { month: 'Aug', value: 4000 },
  { month: 'Sep', value: 7008 },
  { month: 'Oct', value: 3000 },
];

const transactions = [
  { label: 'Challenge Completed', value: 500, date: '30 Jun', type: 'income' },
  { label: 'Steps Earned', value: 200, date: '01 Jul', type: 'income' },
  { label: 'Task Completed', value: 150, date: '02 Jul', type: 'income' },
  { label: 'EcoCoins Growth', value: 100, date: '03 Jul', type: 'income' },
  { label: 'Amazon Gift Card Redeemed', value: 1000, date: '02 Sep', type: 'redeem' },
  { label: 'EV Charging Session', value: 50, date: '10 Sep', type: 'ev' },
  { label: 'Coffee Shop Purchase', value: 20, date: '12 Sep', type: 'spend' },
  { label: 'EcoTab Card Used', value: 300, date: '15 Sep', type: 'ecotab' },
];

export const TransactionHistoryModal = ({ open, onClose }) => {
  const [filter, setFilter] = React.useState<'earn' | 'spend'>('earn');

  const filteredTransactions = transactions.filter(tx =>
    filter === 'earn'
      ? tx.type === 'income'
      : tx.type === 'redeem' || tx.type === 'ev' || tx.type === 'spend' || tx.type === 'ecotab'
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-eco-dark-secondary text-eco-light rounded-2xl p-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold pt-4 text-eco-light">Card Transaction History</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <div className="text-center text-3xl font-bold text-pink-400 mb-2">7,008 pts</div>
          <div className="text-center text-eco-gray text-xs mb-4">All activity including rewards, EV charging, and spending</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={data}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#aaa" />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#222', color: '#fff', borderRadius: 8 }} />
              <Bar dataKey="value" fill="url(#colorUv)" radius={[10, 10, 0, 0]} />
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5f8f" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#ffb199" stopOpacity={1}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            <button
              className={`px-4 py-1 rounded-full font-semibold border ${filter === 'earn' ? 'bg-eco-dark text-eco-light border-eco-gray' : 'bg-eco-dark-secondary text-eco-gray border-eco-gray'}`}
              onClick={() => setFilter('earn')}
            >
              Earnings
            </button>
            <button
              className={`px-4 py-1 rounded-full font-semibold border ${filter === 'spend' ? 'bg-eco-dark text-eco-light border-eco-gray' : 'bg-eco-dark-secondary text-eco-gray border-eco-gray'}`}
              onClick={() => setFilter('spend')}
            >
              Spending
            </button>
          </div>
          <div className="mt-6">
            <div className="font-semibold mb-2 text-eco-light">Card Transaction</div>
            {filteredTransactions.map((tx, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-eco-gray last:border-b-0">
                <div>
                  <div className="font-medium text-eco-light">{tx.label}</div>
                  <div className="text-xs text-eco-gray">{tx.date}</div>
                </div>
                <div className={
                  `font-bold ${
                    tx.type === 'income' ? 'text-green-400' :
                    tx.type === 'redeem' ? 'text-pink-400' :
                    tx.type === 'ev' ? 'text-blue-400' :
                    tx.type === 'spend' ? 'text-yellow-400' :
                    tx.type === 'ecotab' ? 'text-purple-400' : 'text-eco-gray'
                  }`
                }>
                  {tx.type === 'income' ? '+' : '-'}{tx.value.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogClose asChild>
          <button className="w-full py-3 bg-eco-dark text-eco-light font-semibold rounded-b-2xl border-t border-eco-gray">Close</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
} 