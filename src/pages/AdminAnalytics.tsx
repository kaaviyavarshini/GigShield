import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { PremiumChart } from "@/components/admin/PremiumChart";
import { ClaimsPieChart } from "@/components/admin/ClaimsPieChart";

export default function AdminAnalytics() {
  return (
    <AdminLayout title="Risk Analytics" subtitle="Data-driven insurance insights" lastUpdated={new Date()}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Premium vs Payout Trends</h3>
          <PremiumChart />
        </Card>
        <Card className="p-6 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Claims Distribution</h3>
          <ClaimsPieChart />
        </Card>
      </div>
      
      <Card className="p-12 border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center text-center mt-8">
        <p className="text-slate-500 text-sm font-medium">Predictive Risk Modeling (AI)</p>
        <h2 className="text-xl font-bold text-slate-900 mt-1">Analyzing Zone Density Patterns...</h2>
        <div className="flex gap-1 mt-4">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </Card>
    </AdminLayout>
  );
}
