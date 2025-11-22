import DashboardNav from "@/components/DashboardNav";
import ProfileCard from "@/components/ProfileCard";
import SavingsBalanceCard from "@/components/SavingsBalanceCard";
import ProgressChartCard from "@/components/ProgressChartCard";
import CommunityStatsCard from "@/components/CommunityStatsCard";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#EFF5FF]">
      {/* Mobile container - 390px width */}
      <div className="relative h-screen w-[390px] overflow-y-auto bg-[#EFF5FF]">
        {/* Top Navigation */}
        <DashboardNav />

        {/* Dashboard content */}
        <div className="flex flex-col gap-4 px-4 pb-8">
          {/* Profile Card */}
          <ProfileCard />

          {/* Savings Balance Card */}
          <SavingsBalanceCard />

          {/* Progress Chart Card */}
          <ProgressChartCard />

          {/* Community Stats Card */}
          <CommunityStatsCard />
        </div>
      </div>
    </div>
  );
}
