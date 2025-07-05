"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  DollarSign,
  Clock,
  Tag,
  Activity,
  TrendingUp,
} from "lucide-react";

const DashboardSection = () => {
  const { toast } = useToast();

  const [totalWorkers, setTotalWorkers] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalOTHours, setTotalOTHours] = useState(0);
  const [avgHourlyRate, setAvgHourlyRate] = useState(0);
  const [activeCategories, setActiveCategories] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("daily_entries")
        .select("*")
        .gte("entry_date", today)
        .lte("entry_date", today);

      if (error) {
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      let workers = 0;
      let cost = 0;
      let otHours = 0;
      let hourlyRates: number[] = [];
      let categorySet = new Set<string>();

      data.forEach((entry) => {
        const normalCost =
          entry.hourly_rate * entry.normal_hours * entry.number_of_workers;
        const otCost =
          entry.hourly_rate *
          entry.overtime_hours *
          (entry.overtime_multiplier || 1.5) *
          entry.number_of_workers;

        workers += entry.number_of_workers;
        otHours += entry.overtime_hours * entry.number_of_workers;
        hourlyRates.push(entry.hourly_rate);
        categorySet.add(entry.category_name);
        cost += normalCost + otCost;
      });

      setTotalWorkers(workers);
      setTotalCost(cost);
      setTotalOTHours(otHours);
      setActiveCategories(categorySet.size);

      const avgRate =
        hourlyRates.length > 0
          ? hourlyRates.reduce((a, b) => a + b, 0) / hourlyRates.length
          : 0;
      setAvgHourlyRate(avgRate);
    };

    fetchData();
  }, []);

  const StatCard = ({
    title,
    value,
    icon,
    color = "bg-orange-100 text-orange-700",
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <Card>
      <CardHeader className="flex items-center justify-between pb-2">
        <div className="flex flex-col w-full">
          <CardTitle className="text-sm font-bold text-orange-600 text-left">
            {title}
          </CardTitle>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-medium text-gray-800">{value}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Workers Today"
        value={totalWorkers}
        icon={<Users className="h-5 w-5" />}
      />
      <StatCard
        title="Total Cost Today"
        value={`₹${totalCost.toFixed(2)}`}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <StatCard
        title="Overtime Hours"
        value={totalOTHours}
        icon={<Clock className="h-5 w-5" />}
        color="bg-indigo-100 text-indigo-700"
      />
      <StatCard
        title="Average Hourly Rate"
        value={`₹${avgHourlyRate.toFixed(2)}`}
        icon={<Tag className="h-5 w-5" />}
        color="bg-blue-100 text-blue-700"
      />
      <StatCard
        title="Active Categories Today"
        value={activeCategories}
        icon={<Activity className="h-5 w-5" />}
        color="bg-green-100 text-green-700"
      />
      <StatCard
        title="Workforce Trend"
        value="Stable"
        icon={<TrendingUp className="h-5 w-5" />}
        color="bg-yellow-100 text-yellow-700"
      />
    </div>
  );
};

export default DashboardSection;