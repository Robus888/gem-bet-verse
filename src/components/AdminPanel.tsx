
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { parseInputValue, formatNumber } from '@/utils/formatNumber';

export const AdminPanel = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [level, setLevel] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [banReason, setBanReason] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First check if current user is admin or owner
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userCheck } = await supabase
        .from('profiles')
        .select('is_admin, is_owner')
        .eq('id', user.id)
        .single();

      if (!userCheck?.is_admin && !userCheck?.is_owner) {
        toast({
          title: "Access Denied",
          description: "You don't have admin or owner privileges",
          variant: "destructive",
        });
        return;
      }

      // Get user by username
      const { data: targetUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (!targetUser) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }

      // If owner is trying to ban user
      if (userCheck.is_owner && banReason) {
        const { error: banError } = await supabase
          .from('banned_users')
          .insert({
            user_id: targetUser.id,
            banned_by: user.id,
            reason: banReason
          });

        if (banError) throw banError;

        toast({
          title: "Success",
          description: `Banned ${username}`,
        });
        setBanReason('');
      }

      // If owner is trying to give admin privileges
      if (userCheck.is_owner && makeAdmin) {
        const { error: adminError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', targetUser.id);

        if (adminError) throw adminError;
      }

      // Update user's wallet if amount is provided
      if (amount) {
        const parsedAmount = parseInputValue(amount);
        const { error: walletError } = await supabase
          .from('wallets')
          .update({ balance: parsedAmount })
          .eq('user_id', targetUser.id);

        if (walletError) throw walletError;
      }

      // Update user's level if provided and user is owner
      if (level && userCheck.is_owner) {
        const { error: levelError } = await supabase
          .from('wallets')
          .update({ level: parseInt(level) })
          .eq('user_id', targetUser.id);

        if (levelError) throw levelError;
      }

      toast({
        title: "Success",
        description: `Updated ${username}'s settings`,
      });

      setUsername('');
      setAmount('');
      setLevel('');
      setMakeAdmin(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkPermissions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('is_admin, is_owner')
        .eq('id', user.id)
        .single();

      setIsAdmin(data?.is_admin || false);
      setIsOwner(data?.is_owner || false);
    };

    checkPermissions();
  }, []);

  if (!isAdmin && !isOwner) return null;

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex flex-col items-center text-gray-500 hover:text-gray-300"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm">{isOwner ? 'Owner' : 'Admin'}</span>
      </button>

      {showPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-white">{isOwner ? 'Owner Panel' : 'Admin Panel'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-gray-500 focus:bg-gray-600 focus:ring-0 text-white"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Amount</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-gray-500 focus:bg-gray-600 focus:ring-0 text-white"
                  placeholder="Enter amount (e.g. 1M, 1B)"
                />
              </div>
              {isOwner && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Level</label>
                    <input
                      type="number"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-gray-500 focus:bg-gray-600 focus:ring-0 text-white"
                      placeholder="Enter level"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Ban Reason</label>
                    <input
                      type="text"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-gray-500 focus:bg-gray-600 focus:ring-0 text-white"
                      placeholder="Enter ban reason"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={makeAdmin}
                      onChange={(e) => setMakeAdmin(e.target.checked)}
                      className="rounded bg-gray-700 border-transparent focus:ring-offset-gray-800"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-300">
                      Make Admin
                    </label>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowPanel(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-400"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
