<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
=======
import { useState } from "react";
>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)
import {
  Users,
  Calendar,
  FileText,
  Settings,
<<<<<<< HEAD
  TrendingUp,
  Clock,
} from "lucide-react";
import DailyEntryForm from "@/components/DailyEntryForm";
import WorkerCategoryManager from "@/components/WorkerCategoryManager";
import ReportsSection from "@/components/ReportsSection";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  const [todayStats, setTodayStats] = useState({
    totalWorkers: 0,
    totalCost: 0,
    activeCategories: 0,
    hoursWorked: 0,
  });

  const [recentEntries, setRecentEntries] = useState<
    { date: string; workers: number; cost: number }[]
  >([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("daily_entries")
        .select("*")
        .gte("entry_date", `${today}T00:00:00`)
        .lte("entry_date", `${today}T23:59:59`);

      if (error) {
        console.error("Dashboard fetch error:", error.message);
        toast({
          title: "Error loading dashboard stats",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      let totalWorkers = 0;
      let totalCost = 0;
      let activeCategories = new Set<string>();
      let hoursWorked = 0;

      data.forEach((entry) => {
        const {
          rate,
          normal_hours,
          overtime_hours,
          num_workers,
          category,
          overtime_multiplier,
        } = entry;

        const hourlyRate = rate;
        const otMultiplier = overtime_multiplier || 1.5;
        const normalCost = hourlyRate * normal_hours * num_workers;
        const otCost = hourlyRate * overtime_hours * otMultiplier * num_workers;
        const cost = normalCost + otCost;

        totalWorkers += num_workers;
        totalCost += cost;
        hoursWorked += (normal_hours + overtime_hours) * num_workers;
        activeCategories.add(category);
      });

      setTodayStats({
        totalWorkers,
        totalCost,
        hoursWorked,
        activeCategories: activeCategories.size,
      });
    };

    const fetchRecentEntries = async () => {
      const { data, error } = await supabase
        .from("daily_entries")
        .select("*")
        .order("entry_date", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Recent entries fetch error:", error.message);
        return;
      }

      const grouped: Record<string, { workers: number; cost: number }> = {};

      data.forEach((entry) => {
        const date = entry.entry_date.split("T")[0];
        const hourlyRate = entry.rate;
        const otMultiplier = entry.overtime_multiplier || 1.5;
        const normalCost = hourlyRate * entry.normal_hours * entry.num_workers;
        const otCost = hourlyRate * entry.overtime_hours * otMultiplier * entry.num_workers;
        const cost = normalCost + otCost;

        if (!grouped[date]) {
          grouped[date] = { workers: 0, cost: 0 };
        }

        grouped[date].workers += entry.num_workers;
        grouped[date].cost += cost;
      });

      const formatted = Object.entries(grouped)
        .map(([date, { workers, cost }]) => ({
          date,
          workers,
          cost,
        }))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 3);

      setRecentEntries(formatted);
    };

    fetchDashboardStats();
    fetchRecentEntries();
  }, []);

=======
  Clock,
  Package,
  UserCheck,
  UploadCloud,
  TrendingUp,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DailyEntryForm from "@/components/DailyEntryForm";
import ReportsSection from "@/components/ReportsSection";
import WorkerCategoryManager from "@/components/WorkerCategoryManager";
import StockManager from "@/components/StockManager";
import SupervisorAttendance from "@/components/SupervisorAttendance";
import SupervisorBillUpload from "@/components/SupervisorBillUpload";
import Updates from "@/components/Updates";
import DashboardSection from "@/components/DashboardSection"; // ✅ Added

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  PTS Constructions
                </h1>
                <p className="text-gray-600">
                  Construction Workforce Management
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Project: Downtown Construction
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

<<<<<<< HEAD
      <div className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 mb-6">
=======
      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-6">
>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="entry" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily Entry
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
<<<<<<< HEAD
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Workers Today
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {todayStats.totalWorkers}
                  </div>
                  <p className="text-xs text-gray-600">Across all categories</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today's Cost
                  </CardTitle>
                  <div className="text-orange-500">₹</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">
                    ₹{todayStats.totalCost.toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-600">Including overtime</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Categories
                  </CardTitle>
                  <Settings className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {todayStats.activeCategories}
                  </div>
                  <p className="text-xs text-gray-600">Worker types</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Hours Worked
                  </CardTitle>
                  <Clock className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {todayStats.hoursWorked}
                  </div>
                  <p className="text-xs text-gray-600">Total man-hours</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Daily Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{entry.date}</p>
                          <p className="text-sm text-gray-600">
                            {entry.workers} workers
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-600">
                          ₹{entry.cost.toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-600">Daily cost</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab("entry")}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Add Today's Entry
                  </Button>
                  <Button
                    onClick={() => setActiveTab("reports")}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button
                    onClick={() => setActiveTab("settings")}
                    variant="outline"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Categories
                  </Button>
                </div>
              </CardContent>
            </Card>
=======
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Stock
            </TabsTrigger>
            <TabsTrigger value="supervisor" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Supervisor
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4" />
              Upload Bill
            </TabsTrigger>
            <TabsTrigger value="updates" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Updates
            </TabsTrigger>
          </TabsList>

          {/* ✅ TabsContent */}
          <TabsContent value="dashboard">
            <DashboardSection />
>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)
          </TabsContent>

          <TabsContent value="entry">
            <DailyEntryForm />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsSection />
          </TabsContent>

          <TabsContent value="settings">
            <WorkerCategoryManager />
          </TabsContent>
<<<<<<< HEAD
=======

          <TabsContent value="stock">
            <StockManager />
          </TabsContent>

          <TabsContent value="supervisor">
            <SupervisorAttendance />
          </TabsContent>

          <TabsContent value="bills">
            <SupervisorBillUpload />
          </TabsContent>

          <TabsContent value="updates">
            <Updates />
          </TabsContent>
>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)
        </Tabs>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default Index;
=======
export default Index;
>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)
