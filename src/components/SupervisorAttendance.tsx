"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface AttendanceEntry {
  id: string;
  supervisor_id: string;
  date: string;
  check_in: string;
  check_out: string;
  status: string;
  remarks: string;
}

const SupervisorAttendance = () => {
  const { toast } = useToast();
  const [supervisors, setSupervisors] = useState<{ id: string; name: string }[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("Present");

  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");
  const [reportSupervisor, setReportSupervisor] = useState("");

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    const { data, error } = await supabase.from("supervisors").select("id, name");
    if (!error && data) {
      setSupervisors(data);
    }
  };

  const submitAttendance = async () => {
    if (!selectedSupervisor || !attendanceDate) {
      toast({ title: "Missing Fields", description: "Select supervisor and date.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("supervisor_attendance").insert({
      supervisor_id: selectedSupervisor,
      date: attendanceDate,
      check_in: checkIn,
      check_out: checkOut,
      status,
      remarks,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Attendance recorded" });
      setSelectedSupervisor("");
      setAttendanceDate("");
      setCheckIn("");
      setCheckOut("");
      setRemarks("");
      setStatus("Present");
    }
  };

  const generateReport = async () => {
    if (!reportStart || !reportEnd) return;

    let query = supabase.from("supervisor_attendance").select("*")
      .gte("date", reportStart)
      .lte("date", reportEnd);

    if (reportSupervisor) {
      query = query.eq("supervisor_id", reportSupervisor);
    }

    const { data, error } = await query;
    if (!error && data) setEntries(data);
  };

  const downloadExcel = () => {
    const formatted = entries.map((entry) => {
      const supervisor = supervisors.find((s) => s.id === entry.supervisor_id)?.name || entry.supervisor_id;
      return {
        Date: entry.date,
        Supervisor: supervisor,
        CheckIn: entry.check_in,
        CheckOut: entry.check_out,
        Status: entry.status,
        Remarks: entry.remarks,
      };
    });

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "supervisor_attendance.xlsx");
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Supervisor Attendance Entry</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Supervisor</Label>
            <select
              className="w-full border rounded px-2 py-1"
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
            >
              <option value="">Select</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <select
              className="w-full border rounded px-2 py-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
              <option value="Half Day">Half Day</option>
            </select>
          </div>
          <div>
            <Label>Check-In</Label>
            <Input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div>
            <Label>Check-Out</Label>
            <Input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
          <div className="col-span-full">
            <Label>Remarks</Label>
            <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
          <Button className="mt-2 col-span-full" onClick={submitAttendance}>
            Submit
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Report & Export</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>From</Label>
            <Input type="date" value={reportStart} onChange={(e) => setReportStart(e.target.value)} />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={reportEnd} onChange={(e) => setReportEnd(e.target.value)} />
          </div>
          <div>
            <Label>Supervisor</Label>
            <select
              className="w-full border rounded px-2 py-1"
              value={reportSupervisor}
              onChange={(e) => setReportSupervisor(e.target.value)}
            >
              <option value="">All</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={generateReport}>Generate</Button>
          </div>

          {entries.length > 0 && (
            <div className="col-span-full space-y-4 mt-4">
              <Button onClick={downloadExcel}>Download Excel</Button>

              <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Date</th>
                      <th className="border px-2 py-1">Supervisor</th>
                      <th className="border px-2 py-1">Check-In</th>
                      <th className="border px-2 py-1">Check-Out</th>
                      <th className="border px-2 py-1">Status</th>
                      <th className="border px-2 py-1">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="border px-2 py-1">{entry.date}</td>
                        <td className="border px-2 py-1">
                          {supervisors.find((s) => s.id === entry.supervisor_id)?.name || entry.supervisor_id}
                        </td>
                        <td className="border px-2 py-1">{entry.check_in}</td>
                        <td className="border px-2 py-1">{entry.check_out}</td>
                        <td className="border px-2 py-1">{entry.status}</td>
                        <td className="border px-2 py-1">{entry.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisorAttendance;