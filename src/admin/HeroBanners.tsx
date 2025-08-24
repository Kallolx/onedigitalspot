import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash, Upload, Edit, Save, ArrowUp, ArrowDown, Image, Plus, X } from "lucide-react";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const HERO_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_BANNER_ID;

async function fetchBanners() {
  if (!DATABASE_ID || !HERO_COLLECTION_ID) return [];
  const res = await databases.listDocuments(DATABASE_ID, HERO_COLLECTION_ID, [Query.orderAsc("order")]);
  return res.documents || [];
}

const HeroBanners = () => {
  const qc = useQueryClient();

  const query = useQuery<any[], Error>({ queryKey: ["hero-banners"], queryFn: fetchBanners });
  const data = query.data || [];
  const isLoading = query.isLoading;

  const [title, setTitle] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [order, setOrder] = React.useState(1);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingFields, setEditingFields] = React.useState<{ title?: string; order?: number; isActive?: boolean }>({});
  const [isUploading, setIsUploading] = React.useState(false);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true);
    try {
      const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "");
      form.append("folder", import.meta.env.VITE_CLOUDINARY_FOLDER_MODE || "hero_banners");

      const resp = await fetch(url, { method: "POST", body: form });
      const json = await resp.json();
      return json.secure_url || json.url;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFile = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const uploaded = await uploadToCloudinary(file);
    setImageUrl(uploaded);
  };

  const clearPreview = () => setImageUrl("");

  const updateBanner = async (id: string, updates: Partial<any>) => {
    if (!DATABASE_ID || !HERO_COLLECTION_ID) return;
    try {
      await databases.updateDocument(DATABASE_ID, HERO_COLLECTION_ID, id, updates);
      qc.invalidateQueries({ queryKey: ["hero-banners"] });
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed");
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingId) return;
    await updateBanner(id, editingFields);
    setEditingId(null);
    setEditingFields({});
  };

  const moveBanner = async (id: string, direction: 'up' | 'down') => {
    const list = (data || []).slice().sort((a: any, b: any) => a.order - b.order);
    const idx = list.findIndex((i: any) => i.$id === id);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const a = list[idx];
    const b = list[swapIdx];
    try {
      await databases.updateDocument(DATABASE_ID, HERO_COLLECTION_ID, a.$id, { order: b.order });
      await databases.updateDocument(DATABASE_ID, HERO_COLLECTION_ID, b.$id, { order: a.order });
      qc.invalidateQueries({ queryKey: ["hero-banners"] });
    } catch (err) {
      console.error('Reorder failed', err);
      alert('Reorder failed');
    }
  };

  const handleCreate = async () => {
    if (!DATABASE_ID || !HERO_COLLECTION_ID) {
      alert("Hero collection not configured. Set VITE_APPWRITE_COLLECTION_HERO_ID and VITE_APPWRITE_DATABASE_ID");
      return;
    }
    try {
      await databases.createDocument(DATABASE_ID, HERO_COLLECTION_ID, ID.unique(), {
        title,
        imageUrl,
        order: Number(order) || 1,
        createdAt: new Date().toISOString(),
      });
      setTitle("");
      setImageUrl("");
      setOrder(1);
      setShowCreateDialog(false);
      qc.invalidateQueries({ queryKey: ["hero-banners"] });
    } catch (err) {
      console.error(err);
      alert("Error creating banner. Check console.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!DATABASE_ID || !HERO_COLLECTION_ID) return;
    try {
      await databases.deleteDocument(DATABASE_ID, HERO_COLLECTION_ID, id);
      qc.invalidateQueries({ queryKey: ["hero-banners"] });
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hero Banners</h1>
          <p className="text-muted-foreground mt-2">Manage your website's hero banner images</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            {data.length} {data.length === 1 ? 'Banner' : 'Banners'}
          </Badge>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Banner</DialogTitle>
                <DialogDescription>
                  Upload an image and add details for your new hero banner.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Banner Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter banner title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={String(order)}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    min="1"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Banner Image</Label>
                  
                  {/* Upload Button */}
                  <div className="flex items-center gap-4">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">
                          {isUploading ? 'Uploading...' : 'Upload Image'}
                        </span>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </Label>
                    <span className="text-sm text-muted-foreground">or</span>
                    <div className="flex-1">
                      <Input
                        placeholder="Paste image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Image Preview */}
                  {imageUrl && (
                    <div className="relative">
                      <div className="border rounded-lg p-3 bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Preview</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearPreview}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded border"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!imageUrl || !title}>
                  Create Banner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Loading banners...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {data && data.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Image className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl mb-2">No banners yet</CardTitle>
            <CardDescription className="text-center mb-6 max-w-sm">
              Get started by creating your first hero banner. Upload an image and add some details.
            </CardDescription>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Banner
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Banner List */}
      {data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((banner: any, index) => (
            <Card key={banner.$id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center">
                  {/* Image Section */}
                  <div className="relative w-48 h-32 bg-muted flex-shrink-0">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No image</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        {editingId === banner.$id ? (
                          <div className="space-y-3">
                            <Input
                              value={editingFields.title || banner.title}
                              onChange={(e) => setEditingFields(prev => ({ ...prev, title: e.target.value }))}
                              className="font-semibold"
                            />
                            <Input
                              type="number"
                              value={editingFields.order || banner.order}
                              onChange={(e) => setEditingFields(prev => ({ ...prev, order: Number(e.target.value) }))}
                              className="w-24"
                            />
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-xl font-semibold">{banner.title || "Untitled"}</h3>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="outline">Order: {banner.order}</Badge>
                              <Badge variant="secondary">
                                Created {new Date(banner.createdAt).toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {editingId === banner.$id ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(banner.$id)}
                              className="gap-2"
                            >
                              <Save className="h-4 w-4" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingId(null);
                                setEditingFields({});
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveBanner(banner.$id, 'up')}
                              disabled={index === 0}
                              title="Move up"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveBanner(banner.$id, 'down')}
                              disabled={index === data.length - 1}
                              title="Move down"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingId(banner.$id);
                                setEditingFields({ title: banner.title, order: banner.order });
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this banner?')) {
                                  handleDelete(banner.$id);
                                }
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Configuration Alert */}
      {(!DATABASE_ID || !HERO_COLLECTION_ID) && (
        <Alert className="mt-6">
          <AlertDescription>
            <strong>Configuration needed:</strong> Set VITE_APPWRITE_COLLECTION_BANNER_ID and VITE_APPWRITE_DATABASE_ID environment variables.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default HeroBanners;