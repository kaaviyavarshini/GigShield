import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { PremiumChart } from "@/components/admin/PremiumChart";
import { ClaimsPieChart } from "@/components/admin/ClaimsPieChart";

export default function AdminAnalytics() {
  return (
    <AdminLayout title="Risk Analytics" subtitle="Data-driven insurance insights" lastUpdated={new Date()}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 border border-[#BAE6FD] bg-white shadow-lg shadow-[#0EA5E9]/5">
          <h3 className="text-sm font-bold text-[#0C1A2E] mb-6 uppercase tracking-wider">Premium vs Payout Trends</h3>
          <PremiumChart />
        </Card>
        <Card className="p-6 border border-[#BAE6FD] bg-white shadow-lg shadow-[#0EA5E9]/5">
          <h3 className="text-sm font-bold text-[#0C1A2E] mb-6 uppercase tracking-wider">Claims Distribution</h3>
          <ClaimsPieChart />
        </Card>
      </div>
      
      <Card className="p-12 border border-dashed border-[#BAE6FD] bg-[#F0F9FF] flex flex-col items-center justify-center text-center mt-8">
        <p className="text-[#64748B] text-sm font-bold uppercase tracking-widest">Predictive Risk Modeling (AI)</p>
        <h2 className="text-[20px] font-black text-[#0C1A2E] mt-2">Analyzing Zone Density Patterns...</h2>
        <div className="flex gap-2 mt-6">
          <div className="w-2.5 h-2.5 bg-[#0EA5E9] rounded-full animate-bounce shadow-[0_0_8px_#0EA5E9]"></div>
          <div className="w-2.5 h-2.5 bg-[#0EA5E9] rounded-full animate-bounce delay-100 shadow-[0_0_8px_#0EA5E9]"></div>
          <div className="w-2.5 h-2.5 bg-[#0EA5E9] rounded-full animate-bounce delay-200 shadow-[0_0_8px_#0EA5E9]"></div>
        </div>
      </Card>
    </AdminLayout>
  );
}
