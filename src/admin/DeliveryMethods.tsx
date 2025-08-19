import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Save, X, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeliveryMethod {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  description: string;
  order: number;
}

const DeliveryMethods: React.FC = () => {
  const [methods, setMethods] = useState<DeliveryMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState<Partial<DeliveryMethod>>({});
  const [newMethod, setNewMethod] = useState<Partial<DeliveryMethod>>({
    name: '',
    icon: '',
    description: '',
    active: true,
    order: 1
  });
  const { toast } = useToast();

  // Fetch delivery methods
  const fetchMethods = async () => {
    try {
      const response = await fetch('/api/delivery/methods/admin');
      const data = await response.json();
      
      if (data.success) {
        setMethods(data.methods);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch delivery methods",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching methods:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update delivery method
  const updateMethod = async (id: string, updates: Partial<DeliveryMethod>) => {
    try {
      const response = await fetch(`/api/delivery/methods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMethods(prev => prev.map(method => 
          method.id === id ? { ...method, ...updates } : method
        ));
        toast({
          title: "Success",
          description: "Delivery method updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update method",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating method:', error);
      toast({
        title: "Error",
        description: "Failed to update method",
        variant: "destructive",
      });
    }
  };

  // Add new delivery method
  const addMethod = async () => {
    if (!newMethod.name || !newMethod.id) {
      toast({
        title: "Error",
        description: "ID and name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/delivery/methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMethod,
          order: methods.length + 1
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMethods(prev => [...prev, data.method]);
        setNewMethod({ name: '', icon: '', description: '', active: true, order: 1 });
        setShowAddForm(false);
        toast({
          title: "Success",
          description: "New delivery method added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add method",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding method:', error);
      toast({
        title: "Error",
        description: "Failed to add method",
        variant: "destructive",
      });
    }
  };

  // Delete delivery method
  const deleteMethod = async (id: string) => {
    if (['email', 'whatsapp'].includes(id)) {
      toast({
        title: "Error",
        description: "Cannot delete core delivery methods",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this delivery method?')) {
      return;
    }

    try {
      const response = await fetch(`/api/delivery/methods/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMethods(prev => prev.filter(method => method.id !== id));
        toast({
          title: "Success",
          description: "Delivery method deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete method",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting method:', error);
      toast({
        title: "Error",
        description: "Failed to delete method",
        variant: "destructive",
      });
    }
  };

  // Toggle active status
  const toggleActive = async (id: string, active: boolean) => {
    await updateMethod(id, { active });
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingId) return;
    
    await updateMethod(editingId, editForm);
    setEditingId(null);
    setEditForm({});
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Start editing
  const startEdit = (method: DeliveryMethod) => {
    setEditingId(method.id);
    setEditForm(method);
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Methods</h1>
          <p className="text-gray-600">Manage how customers receive their orders</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Method
        </Button>
      </div>

      {/* Add New Method Form */}
      {showAddForm && (
        <Card className="p-6 border-2 border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Add New Delivery Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">ID *</label>
              <Input
                value={newMethod.id || ''}
                onChange={(e) => setNewMethod(prev => ({ ...prev, id: e.target.value }))}
                placeholder="e.g., telegram"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                value={newMethod.name || ''}
                onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Telegram"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <Input
                value={newMethod.icon || ''}
                onChange={(e) => setNewMethod(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="e.g., telegram (optional)"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newMethod.active || false}
                onCheckedChange={(checked) => setNewMethod(prev => ({ ...prev, active: checked }))}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                value={newMethod.description || ''}
                onChange={(e) => setNewMethod(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe how this delivery method works"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={addMethod} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Add Method
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddForm(false);
                setNewMethod({ name: '', icon: '', description: '', active: true, order: 1 });
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Methods List */}
      <div className="space-y-4">
        {methods.map((method) => (
          <Card key={method.id} className="p-6">
            {editingId === method.id ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Icon</label>
                    <Input
                      value={editForm.icon || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, icon: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Input
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveEdit} size="sm" className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button onClick={cancelEdit} variant="outline" size="sm">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src={`/assets/icons/${method.icon || method.id}.svg`} alt={method.name} className="w-6 h-6" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{method.name}</h3>
                      <Badge variant={method.active ? "default" : "secondary"}>
                        {method.active ? "Active" : "Inactive"}
                      </Badge>
                      {['email', 'whatsapp'].includes(method.id) && (
                        <Badge variant="outline">Core</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{method.description}</p>
                    <p className="text-xs text-gray-400">ID: {method.id} • Order: {method.order}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={method.active}
                    onCheckedChange={(checked) => toggleActive(method.id, checked)}
                  />
                  <Button
                    onClick={() => startEdit(method)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  {!['email', 'whatsapp'].includes(method.id) && (
                    <Button
                      onClick={() => deleteMethod(method.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {methods.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No delivery methods found</p>
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="mt-4"
          >
            Add Your First Method
          </Button>
        </Card>
      )}
    </div>
  );
};

export default DeliveryMethods;
