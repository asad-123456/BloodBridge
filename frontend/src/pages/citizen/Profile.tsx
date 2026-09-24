import type { DonorStatsOut } from "../../types";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { apiBaseUrl } from "../../api/client";
import { Award, Droplet, Heart, Clock, ShieldCheck, Activity } from "lucide-react";

export function Profile() {
  const { user, accessToken } = useAuth();
  const [stats, setStats] = useState<DonorStatsOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (accessToken) {
      fetch(`${apiBaseUrl}/donors/me/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [accessToken]);

  if (loading) return <div className="p-8">Loading profile...</div>;

  const isEligible = !stats?.eligible_after || new Date(stats.eligible_after) <= new Date();
  const cooldownDays = stats?.eligible_after 
    ? Math.ceil((new Date(stats.eligible_after).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* Digital Donor Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Droplet size={150} />
        </div>
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-slate-500 font-bold tracking-widest text-sm uppercase mb-1">BloodBridge Donor</p>
            <h1 className="text-3xl font-black">{user?.name || "Citizen"}</h1>
            <p className="text-slate-300 mt-2 flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-400" />
              Verified Account
            </p>
          </div>
          <div className="text-right bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
            <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Blood Type</p>
            <p className="text-4xl font-black text-red-400">{stats?.blood_type || "O+"}</p>
          </div>
        </div>

        {/* Eligibility Status */}
        <div className="mt-8 bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-4">
          <div className={`p-3 rounded-full ${isEligible ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
            <Activity size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{isEligible ? "Eligible to Donate" : "In Cooldown Period"}</h3>
            <p className="text-sm text-slate-300">
              {isEligible 
                ? "You are currently medically eligible to commit to new blood requests." 
                : `For your health, you must wait ${cooldownDays} more days before your next donation.`}
            </p>
          </div>
        </div>
      </div>

      {/* Gamification / Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <Droplet size={24} />
          </div>
          <h2 className="text-3xl font-black text-slate-900">{stats?.units_donated || 0}</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Units Donated</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
            <Heart size={24} />
          </div>
          <h2 className="text-3xl font-black text-slate-900">{stats?.lives_impacted || 0}</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Lives Impacted</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <h2 className="text-3xl font-black text-slate-900">{stats?.donations_count || 0}</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Total Donations</p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Award className="text-yellow-500" />
          Earned Badges
        </h3>
        
        {(stats?.badges?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats?.badges?.map((badge: string, idx: number) => (
              <div key={idx} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <div className="h-14 w-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white shadow-lg mb-3">
                  <Award size={28} />
                </div>
                <span className="font-bold text-sm text-slate-800">{badge}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="h-16 w-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={32} />
            </div>
            <p className="text-slate-500 font-medium">No badges earned yet. Commit to a request to earn your first badge!</p>
          </div>
        )}
      </div>

    </div>
  );
}

