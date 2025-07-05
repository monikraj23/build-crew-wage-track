<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

interface Entry {
  entry_date: string;
  category: string;
  rate: number;
  normal_hours: number;
  overtime_hours: number;
  num_workers: number;
  site_id: string;
  supervisor_email?: string;
  overtime_multiplier?: number; // added for cost calc
}

interface DailyReport {
  date: string;
  totalWorkers: number;
  totalCost: number;
  entries: Entry[];
  categories: { name: string; workers: number; cost: number }[];
}

const ReportsSection = () => {
  const { toast } = useToast();
  const [reportData, setReportData] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [siteId, setSiteId] = useState("all");
  const [startDate, setStartDate] = useState("2025-06-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("daily_entries")
        .select("*")
        .gte("entry_date", startDate)
        .lte("entry_date", endDate);

      if (siteId !== "all") {
        query = query.eq("site_id", siteId);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const grouped = groupEntriesByDate(data || []);
      setReportData(grouped);

      toast({
        title: "Report Loaded",
        description: `${grouped.length} day(s) of data loaded`,
      });
    } catch {
      toast({
        title: "Unexpected Error",
        description: "Something went wrong while fetching data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateTotalCost = (
    rate: number,
    normalHours: number,
    overtimeHours: number,
    multiplier: number = 1.5,
    workers: number
  ) => {
    const normalCost = rate * normalHours * workers;
    const otCost = rate * overtimeHours * multiplier * workers;
    return normalCost + otCost;
  };

  const groupEntriesByDate = (entries: Entry[]): DailyReport[] => {
    const grouped: Record<string, DailyReport> = {};

    for (const entry of entries) {
      const dateOnly = entry.entry_date.split("T")[0] || entry.entry_date.split(" ")[0];
      const multiplier = entry.overtime_multiplier || 1.5;

      const totalCost = calculateTotalCost(
        entry.rate,
        entry.normal_hours,
        entry.overtime_hours,
        multiplier,
        entry.num_workers
      );

      if (!grouped[dateOnly]) {
        grouped[dateOnly] = {
          date: dateOnly,
          totalWorkers: 0,
          totalCost: 0,
          categories: [],
          entries: [],
        };
      }

      grouped[dateOnly].totalWorkers += entry.num_workers;
      grouped[dateOnly].totalCost += totalCost;
      grouped[dateOnly].entries.push(entry);

      const existing = grouped[dateOnly].categories.find((c) => c.name === entry.category);
      if (existing) {
        existing.workers += entry.num_workers;
        existing.cost += totalCost;
      } else {
        grouped[dateOnly].categories.push({
          name: entry.category,
          workers: entry.num_workers,
          cost: totalCost,
        });
      }
    }

    return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
  };

  const downloadExcel = () => {
    const rows: any[] = [];

    reportData.forEach((report) => {
      report.entries.forEach((entry) => {
        const multiplier = entry.overtime_multiplier || 1.5;
        const totalCost = calculateTotalCost(
          entry.rate,
          entry.normal_hours,
          entry.overtime_hours,
          multiplier,
          entry.num_workers
        );

        rows.push({
          Date: report.date,
          Site: entry.site_id,
          Category: entry.category,
          Workers: entry.num_workers,
          Cost: Math.round(totalCost),
          Supervisor: entry.supervisor_email || "Unknown",
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    XLSX.writeFile(workbook, "Site_Report.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Site Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Site</Label>
            <Select value={siteId} onValueChange={setSiteId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {Array.from({ length: 10 }).map((_, i) => (
                  <SelectItem key={`site${i + 1}`} value={`site${i + 1}`}>
                    Site {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={fetchData} disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
=======
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

interface EntryRow {
  id: string;
  entry_date: string;
  site_id: string;
  category_name: string;
  number_of_workers: number;
  normal_hours: number;
  overtime_hours: number;
  hourly_rate: number;
  overtime_multiplier: number;
}

interface MetricRow {
  id: string;
  entry_date: string;
  site_id: string;
  metric_name: string;
  quantity: number;
  rate: number;
  total_cost: number;
  unit: string;
}

const ReportsSection = () => {
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchSitesAndCategories();
  }, []);

  const fetchSitesAndCategories = async () => {
    const [{ data: entrySites }, { data: metricSites }] = await Promise.all([
      supabase.from("daily_entries").select("site_id"),
      supabase.from("daily_metrics").select("site_id"),
    ]);

    const allSites = [...(entrySites || []), ...(metricSites || [])]
      .map((d) => d.site_id)
      .filter(Boolean);

    setSites(Array.from(new Set(allSites)));

    const [{ data: entryCats }, { data: metricCats }] = await Promise.all([
      supabase.from("daily_entries").select("category_name"),
      supabase.from("daily_metrics").select("metric_name"),
    ]);

    const allCategories = [
      ...(entryCats || []).map((c) => c.category_name),
      ...(metricCats || []).map((m) => m.metric_name),
    ].filter(Boolean);

    setCategories(Array.from(new Set(allCategories)));
  };

  const fetchFilteredData = async () => {
    let entryQuery = supabase.from("daily_entries").select("*");
    let metricQuery = supabase.from("daily_metrics").select("*");

    if (fromDate) {
      entryQuery = entryQuery.gte("entry_date", fromDate);
      metricQuery = metricQuery.gte("entry_date", fromDate);
    }
    if (toDate) {
      entryQuery = entryQuery.lte("entry_date", toDate);
      metricQuery = metricQuery.lte("entry_date", toDate);
    }
    if (selectedSite) {
      entryQuery = entryQuery.eq("site_id", selectedSite);
      metricQuery = metricQuery.eq("site_id", selectedSite);
    }
    if (selectedCategory) {
      entryQuery = entryQuery.eq("category_name", selectedCategory);
      metricQuery = metricQuery.eq("metric_name", selectedCategory);
    }

    const [{ data: entryData }, { data: metricData }] = await Promise.all([
      entryQuery,
      metricQuery,
    ]);

    setEntries(entryData || []);
    setMetrics(metricData || []);
  };

  const calculateEntryCost = (entry: EntryRow) => {
    const normal = entry.number_of_workers * entry.normal_hours * entry.hourly_rate;
    const overtime =
      entry.number_of_workers * entry.overtime_hours * entry.hourly_rate * (entry.overtime_multiplier || 1.5);
    return normal + overtime;
  };

  const downloadExcel = () => {
    const entrySheet = XLSX.utils.json_to_sheet(
      entries.map((e) => ({
        Date: e.entry_date,
        Site: e.site_id,
        Category: e.category_name,
        Workers: e.number_of_workers,
        NormalHours: e.normal_hours,
        OvertimeHours: e.overtime_hours,
        Cost: calculateEntryCost(e),
      }))
    );

    const metricSheet = XLSX.utils.json_to_sheet(
      metrics.map((m) => ({
        Date: m.entry_date,
        Site: m.site_id,
        Metric: m.metric_name,
        Quantity: m.quantity,
        Rate: m.rate,
        TotalCost: m.total_cost,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, entrySheet, "Entries");
    XLSX.utils.book_append_sheet(workbook, metricSheet, "Metrics");
    XLSX.writeFile(workbook, "report.xlsx");
  };

  const totalEntryCost = entries.reduce((sum, e) => sum + calculateEntryCost(e), 0);
  const totalMetricCost = metrics.reduce((sum, m) => sum + (m.total_cost || 0), 0);
  const totalCombinedCost = totalEntryCost + totalMetricCost;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div>
            <Label>Site</Label>
            <select
              className="w-full border rounded px-2 py-1"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
            >
              <option value="">All</option>
              {sites.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Category</Label>
            <select
              className="w-full border rounded px-2 py-1"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4 flex gap-2">
            <Button onClick={fetchFilteredData}>Generate Report</Button>
            <Button onClick={downloadExcel} variant="outline">Download Excel</Button>
>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)
          </div>
        </CardContent>
      </Card>

<<<<<<< HEAD
      {/* Report Display */}
      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              Loading Report...
            </CardTitle>
          </CardHeader>
        </Card>
      ) : reportData.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <CardTitle>Daily Site Report</CardTitle>
            <Button variant="outline" onClick={downloadExcel}>
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {reportData.map((report) => (
              <div key={report.date} className="border p-4 rounded space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">{report.date}</p>
                    <p className="text-lg font-semibold">
                      Workers: {report.totalWorkers}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Total Cost</p>
                    <p className="text-xl font-bold text-orange-700">
                      ₹{report.totalCost.toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.entries.map((entry, idx) => {
                    const multiplier = entry.overtime_multiplier || 1.5;
                    const totalCost = calculateTotalCost(
                      entry.rate,
                      entry.normal_hours,
                      entry.overtime_hours,
                      multiplier,
                      entry.num_workers
                    );

                    return (
                      <div key={idx} className="bg-gray-100 p-3 rounded">
                        <p className="text-sm font-medium">{entry.category}</p>
                        <p className="text-sm">Workers: {entry.num_workers}</p>
                        <p className="text-sm">Cost: ₹{Math.round(totalCost)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Site: {entry.site_id}
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded by: {entry.supervisor_email || "Unknown"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Report Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No data for selected site/date. Try changing filters.
            </p>
=======
      {(entries.length > 0 || metrics.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Report Entries</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Type</th>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Site</th>
                  <th className="border px-2 py-1">Category/Metric</th>
                  <th className="border px-2 py-1">Qty/Workers</th>
                  <th className="border px-2 py-1">Hours</th>
                  <th className="border px-2 py-1">OT</th>
                  <th className="border px-2 py-1">Cost</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={`entry-${entry.id}`}>
                    <td className="border px-2 py-1">Entry</td>
                    <td className="border px-2 py-1">{entry.entry_date}</td>
                    <td className="border px-2 py-1">{entry.site_id}</td>
                    <td className="border px-2 py-1">{entry.category_name}</td>
                    <td className="border px-2 py-1">{entry.number_of_workers}</td>
                    <td className="border px-2 py-1">{entry.normal_hours}</td>
                    <td className="border px-2 py-1">{entry.overtime_hours}</td>
                    <td className="border px-2 py-1">₹{calculateEntryCost(entry).toFixed(2)}</td>
                  </tr>
                ))}
                {metrics.map((metric) => (
                  <tr key={`metric-${metric.id}`}>
                    <td className="border px-2 py-1">Metric</td>
                    <td className="border px-2 py-1">{metric.entry_date}</td>
                    <td className="border px-2 py-1">{metric.site_id}</td>
                    <td className="border px-2 py-1">{metric.metric_name}</td>
                    <td className="border px-2 py-1">{metric.quantity}</td>
                    <td className="border px-2 py-1">-</td>
                    <td className="border px-2 py-1">-</td>
                    <td className="border px-2 py-1">₹{metric.total_cost.toFixed(2)}</td>
                  </tr>
                ))}

                {/* ✅ Total Row */}
                <tr className="bg-gray-100 font-semibold">
                  <td className="border px-2 py-2 text-right" colSpan={7}>
                    Total Cost
                  </td>
                  <td className="border px-2 py-2">₹{totalCombinedCost.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsSection;