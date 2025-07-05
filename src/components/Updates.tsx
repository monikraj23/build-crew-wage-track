"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface StockRequest {
  id: string;
  name: string;
  quantity: string;
  site: string;
  requested_by?: string;
  status?: string;
}

const UpdatesPage = () => {
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [updatedStatuses, setUpdatedStatuses] = useState<{ [id: string]: string }>({});

  const isStockManager = userEmail === "stockmanagerptsconstruction@gmail.com";

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("stock_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({
        title: "Failed to fetch stock updates",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStockRequests(data as StockRequest[]);

      // Initialize dropdown values
      const statusMap: { [id: string]: string } = {};
      data.forEach((req: StockRequest) => {
        if (req.id && req.status) {
          statusMap[req.id] = req.status;
        }
      });
      setUpdatedStatuses(statusMap);
    }
  };

  const updateStatus = async (id: string) => {
    const newStatus = updatedStatuses[id];
    if (!isStockManager || !newStatus) return;

    const { error } = await supabase
      .from("stock_requests")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `Updated to '${newStatus}' successfully`,
      });

      // Update the local stockRequests list
      setStockRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: newStatus } : req
        )
      );
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    };
    getUser();
    fetchRequests();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stock Request Updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stockRequests.length === 0 && (
            <p className="text-sm text-muted-foreground">No stock requests available.</p>
          )}
          {stockRequests.map((req) => (
            <div key={req.id} className="border p-4 rounded">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className="font-semibold">{req.name}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {req.quantity} • Site: {req.site}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requested by: {req.requested_by}
                  </p>
                </div>

                {isStockManager ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={updatedStatuses[req.id] || ""}
                      onValueChange={(value) =>
                        setUpdatedStatuses((prev) => ({ ...prev, [req.id]: value }))
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Select status">
                          {updatedStatuses[req.id]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {["yet to order", "ordered", "on the way", "delivered"].map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="secondary"
                      onClick={() => updateStatus(req.id)}
                      disabled={!updatedStatuses[req.id]}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">
                    Status:{" "}
                    <span className="font-medium">{req.status || "N/A"}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatesPage;