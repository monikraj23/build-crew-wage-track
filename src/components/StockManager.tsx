"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Boxes, Plus, Settings, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface StockItem {
  id: string;
  name: string;
  quantity: string;
  site: string;
  is_active: boolean;
  created_by_email?: string;
}

const StockManager = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    site: "Site 1",
  });

  const [stockRequest, setStockRequest] = useState({
    name: "",
    quantity: "",
    site: "Site 1",
  });

  const fetchStock = async () => {
    const { data, error } = await supabase.from("stock_items").select("*").order("name");
    if (error) {
      toast({ title: "Error fetching stock", description: error.message, variant: "destructive" });
    } else {
      setStockItems(data as StockItem[]);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const addItem = async () => {
    const { name, quantity, site } = newItem;

    if (!name || !quantity || !site) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields properly",
        variant: "destructive",
      });
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      toast({
        title: "User Error",
        description: "Unable to fetch user info",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("stock_items").insert([
      {
        name,
        quantity,
        site,
        is_active: true,
        created_by_email: user.email,
      },
    ]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Stock item added successfully" });
      setNewItem({ name: "", quantity: "", site: "Site 1" });
      fetchStock();
    }
  };

  const submitStockRequest = async () => {
    const { name, quantity, site } = stockRequest;

    if (!name || !quantity || !site) {
      toast({ title: "Missing Fields", description: "Fill all fields", variant: "destructive" });
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      toast({ title: "Auth Error", description: "Unable to identify user", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("stock_requests").insert([
      {
        name,
        quantity,
        site,
        requested_by: user.email,
      },
    ]);

    if (error) {
      toast({ title: "Request Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Requested", description: "Stock requirement sent" });
      setStockRequest({ name: "", quantity: "", site: "Site 1" });
    }
  };

  const updateItem = async (id: string, updates: Partial<StockItem>) => {
    const { error } = await supabase.from("stock_items").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Update Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: "Stock item updated" });
      fetchStock();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateItem(id, { is_active: !current });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "You have been logged out successfully." });
    navigate("/login");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Stock Manager</h2>
        <Button variant="destructive" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      {/* Add Item */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Add New Stock Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Item Name</Label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g., Cement Bags"
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              />
            </div>
            <div>
              <Label>Site</Label>
              <Select
                value={newItem.site}
                onValueChange={(value) => setNewItem({ ...newItem, site: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Site" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <SelectItem key={`site${i + 1}`} value={`Site ${i + 1}`}>
                      Site {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addItem} className="w-full bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Stock Items */}
      <Card>
        <CardHeader>
          <CardTitle>Current Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stockItems.map((item) => (
              <div key={item.id} className="border rounded p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} • Site: {item.site}
                    </p>
                    {item.created_by_email && (
                      <p className="text-xs text-muted-foreground">
                        Added by: {item.created_by_email}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${item.id}`} className="text-sm">
                        Active
                      </Label>
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={() => toggleActive(item.id, item.is_active)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Requirement Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Boxes className="h-5 w-5" />
            Request Stock Requirement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Item Name</Label>
              <Input
                value={stockRequest.name}
                onChange={(e) => setStockRequest({ ...stockRequest, name: e.target.value })}
                placeholder="e.g., Bricks"
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                value={stockRequest.quantity}
                onChange={(e) => setStockRequest({ ...stockRequest, quantity: e.target.value })}
              />
            </div>
            <div>
              <Label>Site</Label>
              <Select
                value={stockRequest.site}
                onValueChange={(value) => setStockRequest({ ...stockRequest, site: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Site" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <SelectItem key={`req-site${i + 1}`} value={`Site ${i + 1}`}>
                      Site {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={submitStockRequest} className="w-full bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



export default StockManager;