"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAILS = ["adminptsconstruction@gmail.com"]; // ✅ Replace with actual admin emails

const siteOptions = Array.from({ length: 10 }, (_, i) => ({
  id: `site${i + 1}`,
  name: `Site ${i + 1}`,
}));

const sanitizeFileName = (filename: string) => {
  return filename
    .replace(/\s+/g, "_")
    .replace(/:/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
};

const SupervisorBillUpload = () => {
  const { toast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [siteId, setSiteId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [email, setEmail] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [bills, setBills] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserAndBills = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        const userEmail = user.email || "";
        setEmail(userEmail);
        setIsAdmin(ADMIN_EMAILS.includes(userEmail));
        if (ADMIN_EMAILS.includes(userEmail)) {
          fetchBills();
        }
      }

      if (error) {
        toast({
          title: "Error fetching user",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchUserAndBills();
  }, []);

  const fetchBills = async () => {
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .order("bill_date", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching bills",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setBills(data || []);
    }
  };

  const handleDownload = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("bill-images")
      .download(path);

    if (error) {
      toast({
        title: "Download error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const url = window.URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = path.split("/").pop() || "bill-image.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (!imageFile || !siteId || !description) {
      toast({
        title: "Incomplete",
        description: "Please fill all fields and upload an image.",
        variant: "destructive",
      });
      return;
    }

    const safeFileName = `${Date.now()}-${sanitizeFileName(imageFile.name)}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("bill-images")
      .upload(safeFileName, imageFile);

    if (uploadError) {
      toast({
        title: "Upload Failed",
        description: uploadError.message,
        variant: "destructive",
      });
      return;
    }

    const { error: insertError } = await supabase.from("bills").insert([
      {
        image_path: uploadData?.path,
        description,
        supervisor_email: email,
        site_id: siteId,
        bill_date: date,
      },
    ]);

    if (insertError) {
      toast({
        title: "Error saving bill",
        description: insertError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bill Submitted",
        description: "Bill uploaded successfully.",
      });
      setDescription("");
      setImageFile(null);
      setSiteId("");
      if (isAdmin) fetchBills(); // Refresh list if admin
    }
  };

  return (
    <div className="space-y-10">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Bill</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Site</Label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">Select Site</option>
              {siteOptions.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Input
              type="text"
              placeholder="Bill description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Bill Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImageFile(e.target.files?.[0] || null)
              }
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-4">
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Bill Viewer */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>All Uploaded Bills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-x-auto">
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Site ID</th>
                  <th className="border px-2 py-1">Supervisor</th>
                  <th className="border px-2 py-1">Description</th>
                  <th className="border px-2 py-1">Download</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{bill.bill_date}</td>
                    <td className="border px-2 py-1">{bill.site_id}</td>
                    <td className="border px-2 py-1">{bill.supervisor_email}</td>
                    <td className="border px-2 py-1">{bill.description}</td>
                    <td className="border px-2 py-1 text-center">
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(bill.image_path)}
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupervisorBillUpload;