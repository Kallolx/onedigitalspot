import React, { useState, useEffect } from "react";
import { databases } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdData {
  $id: string;
  title: string;
  description: string;
  websiteUrl: string;
  logo: string;
  features: string[];
  ctaText: string;
  isActive: boolean;
  showOnce: boolean;
  maxShows: number;
  createdAt?: string;
  updatedAt?: string;
}

const AdsManagement: React.FC = () => {
  const [ads, setAds] = useState<AdData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Omit<AdData, '$id' | 'createdAt' | 'updatedAt'>>({
    title: "",
    description: "",
    websiteUrl: "",
    logo: "",
    features: [""],
    ctaText: "",
    isActive: true,
    showOnce: false,
    maxShows: 3,
  });

  const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_ADS_ID;

  useEffect(() => {
    fetchAds();
  }, []);

  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true);
    try {
      const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "");
      form.append("folder", import.meta.env.VITE_CLOUDINARY_FOLDER_MODE || "ad_logos");

      const resp = await fetch(url, { method: "POST", body: form });
      const json = await resp.json();
      return json.secure_url || json.url;
    } finally {
      setIsUploading(false);
    }
  };

  const fetchAds = async () => {
    try {
      setIsLoading(true);
      const response = await databases.listDocuments(databaseId, collectionId);
      // Map Appwrite documents to our AdData interface
      const mappedAds = response.documents.map((doc: any) => ({
        $id: doc.$id,
        title: doc.title,
        description: doc.description,
        websiteUrl: doc.websiteUrl,
        logo: doc.logo,
        features: doc.features || [],
        ctaText: doc.ctaText,
        isActive: doc.isActive,
        showOnce: doc.showOnce,
        maxShows: doc.maxShows,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      }));
      setAds(mappedAds);
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast({
        title: "Error",
        description: "Failed to fetch ads",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let logoUrl = formData.logo;

      // Upload new logo if selected
      if (logoFile) {
        logoUrl = await uploadToCloudinary(logoFile);
      }

      const adData = {
        ...formData,
        logo: logoUrl,
        features: formData.features.filter(f => f.trim() !== ""),
      };

      if (editingAd?.$id) {
        // Update existing ad
        await databases.updateDocument(databaseId, collectionId, editingAd.$id, adData);
        toast({
          title: "Success",
          description: "Ad updated successfully",
        });
      } else {
        // Create new ad
        await databases.createDocument(databaseId, collectionId, "unique()", adData);
        toast({
          title: "Success",
          description: "Ad created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchAds();
    } catch (error) {
      console.error("Error saving ad:", error);
      toast({
        title: "Error",
        description: "Failed to save ad",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (adId: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      await databases.deleteDocument(databaseId, collectionId, adId);
      toast({
        title: "Success",
        description: "Ad deleted successfully",
      });
      fetchAds();
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast({
        title: "Error",
        description: "Failed to delete ad",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (ad: AdData) => {
    setEditingAd(ad);
    // Create form data without the $id field
    const { $id, createdAt, updatedAt, ...formDataWithoutId } = ad;
    setFormData(formDataWithoutId);
    setLogoPreview(ad.logo);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      websiteUrl: "",
      logo: "",
      features: [""],
      ctaText: "",
      isActive: true,
      showOnce: false,
      maxShows: 3,
    });
    setEditingAd(null);
    setLogoFile(null);
    setLogoPreview("");
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    setFormData(prev => ({ ...prev, logo: "" }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ads Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? "Edit Ad" : "Create New Ad"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    maxLength={255}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaText">CTA Text *</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                    maxLength={50}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  maxLength={1000}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL *</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  maxLength={255}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Logo *</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="relative">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-16 h-16 object-contain border rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0"
                        onClick={removeLogo}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="cursor-pointer"
                      disabled={isUploading}
                      required={!logoPreview}
                    />
                    {isUploading && (
                      <p className="text-xs text-gray-500 mt-1">Uploading...</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        maxLength={255}
                      />
                      {formData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.features.length < 10 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFeature}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>
                  )}
                  <p className="text-xs text-gray-500">Maximum 10 features allowed</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxShows">Max Shows</Label>
                <Input
                  id="maxShows"
                  type="number"
                  min="1"
                  max="3"
                  value={formData.maxShows}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxShows: parseInt(e.target.value) }))}
                />
                <p className="text-xs text-gray-500">Range: 1-3</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showOnce">Show Once Per Session</Label>
                  <Switch
                    id="showOnce"
                    checked={formData.showOnce}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showOnce: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isSubmitting ? "Saving..." : editingAd ? "Update Ad" : "Create Ad"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Ads</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading ads...</div>
          ) : ads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No ads found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Max Shows</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.$id}>
                    <TableCell>
                      {ad.logo ? (
                        <img 
                          src={ad.logo} 
                          alt={ad.title} 
                          className="w-10 h-10 object-contain rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-500 text-xs">
                            {ad.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ad.title}</div>
                        <div className="text-sm text-gray-500">{ad.ctaText}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {ad.isActive ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        {ad.showOnce && (
                          <Badge variant="outline">Once</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ad.maxShows}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {ad.features.slice(0, 2).join(", ")}
                        {ad.features.length > 2 && "..."}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(ad)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(ad.$id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdsManagement;
