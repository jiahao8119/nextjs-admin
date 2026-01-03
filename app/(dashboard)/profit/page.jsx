"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Users,
  AlertCircle,
  Package,
  Calendar,
  Filter,
  Download,
  MoreVertical,
  HelpCircle,
  Info,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";

const ProfitDashboard = () => {
  const [dateRange, setDateRange] = useState("Today");
  const [channel, setChannel] = useState("All");
  const [outlet, setOutlet] = useState("All outlets");

  // Dummy Data
  const kpiData = [
    {
      title: "Today: Profit",
      value: "RM 1,240.50",
      trend: "+5.2%",
      isPositive: true,
      icon: <DollarSign className="text-success-500" />,
      bg: "bg-success-100 dark:bg-success-900/30",
      helpText: "Actual net money kept after all costs today.",
    },
    {
      title: "Money In (Sales)",
      value: "RM 4,560.00",
      trend: "+8.1%",
      isPositive: true,
      icon: <ShoppingCart className="text-info-500" />,
      bg: "bg-info-100 dark:bg-info-900/30",
      helpText: "Total revenue from all channels.",
    },
    {
      title: "Money Out (Costs)",
      value: "RM 3,319.50",
      trend: "+2.4%",
      isPositive: false,
      icon: <ArrowDownRight className="text-warning-500" />,
      bg: "bg-warning-100 dark:bg-warning-900/30",
      helpText: "Total expenses (COGS, Staff, OpEx).",
    },
    {
      title: "Net Margin %",
      value: "27.2%",
      trend: "+1.2%",
      isPositive: true,
      icon: <TrendingUp className="text-primary-500" />,
      bg: "bg-primary-100 dark:bg-primary-900/30",
      helpText: "Efficiency: Profit as a percentage of Sales.",
    },
  ];

  const insights = [
    {
      text: "Profit is down today mainly because staff cost went up +RM120 and stock wastage increased.",
      type: "warning",
    },
    {
      text: "RM 450 savings identified if you reduce delivery commission by 2%.",
      type: "info",
    },
    {
      text: "Biggest Revenue Change: Walk-in orders are up 15% today.",
      type: "success",
    },
  ];

  const topProducts = [
    {
      name: "Classic Pepperoni Pizza",
      sold: 145,
      revenue: "RM 5,510",
      cost: "RM 1,820",
      profit: "RM 3,690",
      margin: "67%",
      tags: ["Fast Seller", "High Margin"],
    },
    {
      name: "Cheesy Garlic Bread",
      sold: 89,
      revenue: "RM 1,240",
      cost: "RM 310",
      profit: "RM 930",
      margin: "75%",
      tags: ["High Margin"],
    },
    {
      name: "BBQ Chicken Feast",
      sold: 72,
      revenue: "RM 3,240",
      cost: "RM 1,450",
      profit: "RM 1,790",
      margin: "55%",
      tags: ["Popular"],
    },
    {
      name: "Mushroom Soup",
      sold: 65,
      revenue: "RM 975",
      cost: "RM 260",
      profit: "RM 715",
      margin: "73%",
      tags: ["Steady"],
    },
    {
      name: "Hawaiian Blast",
      sold: 48,
      revenue: "RM 2,160",
      cost: "RM 980",
      profit: "RM 1,180",
      margin: "54%",
      tags: ["Growing"],
    },
  ];

  const costLeaks = [
    { label: "Overtime", amount: "RM 450", percent: 65, hint: "Check shift scheduling" },
    { label: "Refunds", amount: "RM 210", percent: 45, hint: "Review kitchen QC" },
    { label: "Stock Shrinkage", amount: "RM 180", percent: 35, hint: "Weekly audit due" },
    { label: "Platform Fees", amount: "RM 890", percent: 80, hint: "Promo ROI is low" },
  ];

  const staffCosts = [
    { name: "Base Salary", value: 4500, color: "#4F46E5" },
    { name: "OT", value: 1200, color: "#EF4444" },
    { name: "Commission", value: 800, color: "#10B981" },
  ];

  const alerts = [
    {
      title: "Low stock: Mozzarella Cheese (2kg left)",
      severity: "danger",
      icon: <AlertCircle className="h-4 w-4" />,
    },
    {
      title: "High shrinkage: Pepperoni (missing 5 units this week)",
      severity: "warning",
      icon: <Package className="h-4 w-4" />,
    },
    {
      title: "Action needed: Verify RM 120 stock wastage record",
      severity: "info",
      icon: <Info className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Real Profit Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400">Know if you really made money — today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1">
            {["Today", "7 days", "30 days"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 text-sm rounded ${
                  dateRange === range
                    ? "bg-primary-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-700 dark:text-slate-300">
              <Filter className="h-4 w-4" />
              {channel}
            </button>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-700 dark:text-slate-300">
              <Package className="h-4 w-4" />
              {outlet}
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded text-sm font-medium hover:bg-slate-800 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="overflow-hidden" bodyClass="p-5">
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                {kpi.icon}
              </div>
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
                <div className="absolute right-0 top-6 w-48 bg-slate-800 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  {kpi.helpText}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.title}</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{kpi.value}</h3>
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                  kpi.isPositive ? "bg-success-100 text-success-600" : "bg-danger-100 text-danger-600"
                }`}>
                  {kpi.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {kpi.trend}
                </span>
                <span className="text-[10px] text-slate-400">vs yesterday</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Why Profit Changed Insight Strip */}
      <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-none bg-primary-500 p-2 rounded-lg text-white">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-primary-900 dark:text-primary-100">Daily Insight Spotlight</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-primary-800 dark:text-primary-200">
                <div className={`h-1.5 w-1.5 rounded-full ${
                  insight.type === "success" ? "bg-success-500" : insight.type === "warning" ? "bg-danger-500" : "bg-info-500"
                }`} />
                {insight.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Profitable Products Table */}
        <div className="lg:col-span-2">
          <Card title="Top Profitable Products" headerslot={
            <button className="text-primary-600 text-sm font-medium hover:underline">View all</button>
          }>
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sold</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Profit</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {topProducts.map((product, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white">{product.name}</span>
                          <div className="flex gap-1 mt-1">
                            {product.tags.map(tag => (
                              <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded ${
                                tag === "High Margin" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              }`}>{tag}</span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{product.sold}</td>
                      <td className="px-6 py-4 text-sm font-bold text-success-600 text-right">{product.profit}</td>
                      <td className="px-6 py-4 text-right">
                        <Badge label={product.margin} className="bg-success-100 text-success-700 dark:bg-success-900/30" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Aside Cards */}
        <div className="space-y-6">
          {/* Biggest Cost Leak */}
          <Card title="Biggest Cost Leak">
            <div className="space-y-5">
              {costLeaks.map((leak, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{leak.label}</p>
                      <p className="text-[11px] text-danger-500 font-medium italic">Hint: {leak.hint}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{leak.amount}</p>
                  </div>
                  <ProgressBar
                    value={leak.percent}
                    className={leak.percent > 70 ? "bg-danger-500" : "bg-warning-500"}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Stock Risk Alerts */}
          <Card title="Stock Risk Alerts" className="border-l-4 border-danger-500 rounded-lg">
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                  alert.severity === "danger" ? "bg-danger-50 border border-danger-100 dark:bg-danger-900/10 dark:border-danger-900/20" : 
                  alert.severity === "warning" ? "bg-warning-50 border border-warning-100 dark:bg-warning-900/10 dark:border-warning-900/20" :
                  "bg-info-50 border border-info-100 dark:bg-info-900/10 dark:border-info-900/20"
                }`}>
                  <div className={`mt-0.5 ${
                    alert.severity === "danger" ? "text-danger-500" : alert.severity === "warning" ? "text-warning-500" : "text-info-500"
                  }`}>
                    {alert.icon}
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{alert.title}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Staff Cost Ratio Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Staff Cost Ratio">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={staffCosts}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {staffCosts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="relative -top-24 text-center">
                <span className="text-2xl font-bold">18.5%</span>
              </div>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-3">
                {staffCosts.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">RM {item.value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <span className="font-bold text-success-600">Healthy!</span> Your staff ratio is 18.5%. SME healthy range is usually 10–20%.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Extra Space for more metrics or scannability */}
        <Card title="Quick Action Panel" bodyClass="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 h-full">
            <div className="p-6 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group">
              <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Staff Audit</h4>
              <p className="text-xs text-slate-500 mt-1">Review OT pattern for last 7 days to optimize cost.</p>
            </div>
            <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group">
              <div className="h-10 w-10 bg-warning-100 text-warning-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Inventory Sync</h4>
              <p className="text-xs text-slate-500 mt-1">Update stock in/out for missing high-shrinkage items.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfitDashboard;
