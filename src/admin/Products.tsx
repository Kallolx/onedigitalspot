import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  Gamepad2,
  Monitor,
  Gift,
  Bot,
  BadgeDollarSign,
  X,
  Save,
  AlertTriangle,
  Upload,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { databases } from "@/lib/appwrite";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const categories = [
  { key: "all", name: "All", icon: null },
  { key: "mobileGames", name: "Mobile Games", icon: Gamepad2 },
  { key: "pcGames", name: "PC Games", icon: Monitor },
  { key: "giftCards", name: "Gift Cards", icon: Gift },
  { key: "aiTools", name: "AI Tools", icon: Bot },
  { key: "subscriptions", name: "Subscriptions", icon: BadgeDollarSign },
];

const Products = () => {
  // Modal states
  const [viewProduct, setViewProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Add product states
  const [newProduct, setNewProduct] = useState({
    title: "",
    category: "",
    description: "",
    image: "",
    priceList: [],
  });
  const [selectedCategory, setSelectedCategory] = useState("");

  // Filter states
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState({ src: null, x: 0, y: 0 });

  // State for products by category
  const [productsByCategory, setProductsByCategory] = useState({
    mobileGames: [],
    pcGames: [],
    giftCards: [],
    aiTools: [],
    subscriptions: [],
    all: [],
  });

  // Load products from database
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
      const collectionMap = {
        mobileGames: import.meta.env.VITE_APPWRITE_COLLECTION_MOBILE_GAMES_ID,
        pcGames: import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID,
        giftCards: import.meta.env.VITE_APPWRITE_COLLECTION_GIFT_CARDS_ID,
        aiTools: import.meta.env.VITE_APPWRITE_COLLECTION_AI_TOOLS_ID,
        subscriptions: import.meta.env
          .VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID,
      };

      const results = await Promise.all(
        Object.entries(collectionMap).map(([key, collectionId]) =>
          databases
            .listDocuments(databaseId, collectionId)
            .then((response) => ({ key, documents: response.documents }))
            .catch(() => ({ key, documents: [] }))
        )
      );

      const newProductsByCategory = {
        mobileGames: [],
        pcGames: [],
        giftCards: [],
        aiTools: [],
        subscriptions: [],
        all: [],
      };

      results.forEach(({ key, documents }) => {
        newProductsByCategory[key] = documents;
      });

      newProductsByCategory.all = [
        ...newProductsByCategory.mobileGames,
        ...newProductsByCategory.pcGames,
        ...newProductsByCategory.giftCards,
        ...newProductsByCategory.aiTools,
        ...newProductsByCategory.subscriptions,
      ];

      setProductsByCategory(newProductsByCategory);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Get collection ID for a product
  const getCollectionId = (product) => {
    const collectionMap = {
      mobileGames: import.meta.env.VITE_APPWRITE_COLLECTION_MOBILE_GAMES_ID,
      pcGames: import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID,
      giftCards: import.meta.env.VITE_APPWRITE_COLLECTION_GIFT_CARDS_ID,
      aiTools: import.meta.env.VITE_APPWRITE_COLLECTION_AI_TOOLS_ID,
      subscriptions: import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID,
    };

    // Find which category this product belongs to
    for (const [category, products] of Object.entries(productsByCategory)) {
      if (products.some((p) => p.$id === product.$id)) {
        return collectionMap[category];
      }
    }
    return null;
  };

  // Handle changes for new product
  const handleNewProductChange = (field, value) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle changes for edit product
  const handleEditChange = (field, value) => {
    setEditProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle price list changes for new product
  const handleNewProductPriceListChange = (index, value) => {
    const newPriceList = [...(newProduct.priceList || [])];
    newPriceList[index] = value;
    setNewProduct((prev) => ({
      ...prev,
      priceList: newPriceList,
    }));
  };

  // Handle price list changes for edit product
  const handlePriceListChange = (index, value) => {
    const newPriceList = [...(editProduct.priceList || [])];
    newPriceList[index] = value;
    setEditProduct((prev) => ({
      ...prev,
      priceList: newPriceList,
    }));
  };

  // Add new price list item for new product
  const addNewProductPriceListItem = () => {
    const newPriceList = [
      ...(newProduct.priceList || []),
      "New Item|0৳|false|type",
    ];
    setNewProduct((prev) => ({
      ...prev,
      priceList: newPriceList,
    }));
  };

  // Add new price list item for edit product
  const addPriceListItem = () => {
    const newPriceList = [
      ...(editProduct.priceList || []),
      "New Item|0৳|false",
    ];
    setEditProduct((prev) => ({
      ...prev,
      priceList: newPriceList,
    }));
  };

  // Remove price list item for new product
  const removeNewProductPriceListItem = (index) => {
    const newPriceList = (newProduct.priceList || []).filter(
      (_, i) => i !== index
    );
    setNewProduct((prev) => ({
      ...prev,
      priceList: newPriceList,
    }));
  };

  // Remove price list item for edit product
  const removePriceListItem = (index) => {
    const newPriceList = (editProduct.priceList || []).filter(
      (_, i) => i !== index
    );
    setEditProduct((prev) => ({
      ...prev,
      priceList: newPriceList,
    }));
  };

  // Update product in database
  const handleUpdateProduct = async () => {
    if (!editProduct) return;

    setIsLoading(true);
    try {
      const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
      const collectionId = getCollectionId(editProduct);

      if (!collectionId) {
        throw new Error("Collection not found for product");
      }

      // Prepare update data
      const updateData = {
        title: editProduct.title,
        category: editProduct.category,
        price: editProduct.price,
        description: editProduct.description,
        image: editProduct.image,
        priceList: editProduct.priceList || [],
        status: true,
      };

      await databases.updateDocument(
        databaseId,
        collectionId,
        editProduct.$id,
        updateData
      );

      toast.success("Product updated successfully");
      setShowEditModal(false);
      setEditProduct(null);
      await loadProducts(); // Reload products
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete single product
  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;

    setIsLoading(true);
    try {
      const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
      const collectionId = getCollectionId(deleteProduct);

      if (!collectionId) {
        throw new Error("Collection not found for product");
      }

      await databases.deleteDocument(
        databaseId,
        collectionId,
        deleteProduct.$id
      );

      toast.success("Product deleted successfully");
      setShowDeleteDialog(false);
      setDeleteProduct(null);
      await loadProducts(); // Reload products
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete multiple products
  const handleBulkDelete = async () => {
    if (selected.length === 0) return;

    setIsLoading(true);
    try {
      const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
      const deletePromises = [];

      // Find products to delete
      const productsToDelete = products.filter((p) =>
        selected.includes(p.title)
      );

      for (const product of productsToDelete) {
        const collectionId = getCollectionId(product);
        if (collectionId) {
          deletePromises.push(
            databases.deleteDocument(databaseId, collectionId, product.$id)
          );
        }
      }

      await Promise.all(deletePromises);

      toast.success(`${selected.length} products deleted successfully`);
      setSelected([]);
      setShowBulkDeleteDialog(false);
      await loadProducts(); // Reload products
    } catch (error) {
      console.error("Error deleting products:", error);
      toast.error("Failed to delete products");
    } finally {
      setIsLoading(false);
    }
  };

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset =
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

    if (!cloudName) {
      throw new Error("Cloudinary cloud name not configured");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    // Only add folder if it's specified
    const folder = import.meta.env.VITE_CLOUDINARY_FOLDER_MODE;
    if (folder) {
      formData.append("folder", folder);
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  // Handle image upload
  const handleImageUpload = async (file, isEdit = false) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);

      if (isEdit) {
        setEditProduct((prev) => ({
          ...prev,
          image: imageUrl,
        }));
      } else {
        setNewProduct((prev) => ({
          ...prev,
          image: imageUrl,
        }));
      }

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // Add new product to database
  const handleAddProduct = async () => {
    if (!selectedCategory || !newProduct.title) {
      toast.error("Please select category and enter product title");
      return;
    }

    setIsLoading(true);
    try {
      const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
      const collectionMap = {
        mobileGames: import.meta.env.VITE_APPWRITE_COLLECTION_MOBILE_GAMES_ID,
        pcGames: import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID,
        giftCards: import.meta.env.VITE_APPWRITE_COLLECTION_GIFT_CARDS_ID,
        aiTools: import.meta.env.VITE_APPWRITE_COLLECTION_AI_TOOLS_ID,
        subscriptions: import.meta.env
          .VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID,
      };

      const collectionId = collectionMap[selectedCategory];
      if (!collectionId) {
        throw new Error("Invalid category selected");
      }

      // Set category name based on selected key
      const categoryNames = {
        mobileGames: "Mobile Games",
        pcGames: "PC Games",
        giftCards: "Gift Cards",
        aiTools: "AI Tools",
        subscriptions: "Subscriptions",
      };

      const productData = {
        title: newProduct.title,
        category: categoryNames[selectedCategory],
        description: newProduct.description,
        image: newProduct.image,
        priceList: newProduct.priceList,
        status: true,
      };

      await databases.createDocument(
        databaseId,
        collectionId,
        "unique()", // Auto-generate ID
        productData
      );

      toast.success("Product added successfully");
      setShowAddModal(false);
      resetNewProduct();
      await loadProducts(); // Reload products
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset new product form
  const resetNewProduct = () => {
    setNewProduct({
      title: "",
      category: "",
      description: "",
      image: "",
      priceList: [],
    });
    setSelectedCategory("");
  };

  // Handle file reset to default
  const resetToDefault = () => {
    // Show add product modal instead of resetting
    setShowAddModal(true);
    resetNewProduct();
  };

  // Filtered products for active category
  const products = (productsByCategory[activeCategory] || []).filter(
    (prod) =>
      prod.title?.toLowerCase().includes(search.toLowerCase()) ||
      (prod.category &&
        prod.category.toLowerCase().includes(search.toLowerCase()))
  );

  // Bulk actions
  const BulkActions = () => (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        size="sm"
        className="font-pixel"
        onClick={() => setShowBulkDeleteDialog(true)}
        disabled={isLoading}
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Delete ({selected.length})
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="font-pixel"
        disabled={isLoading}
      >
        <Download className="w-4 h-4 mr-1" />
        Export
      </Button>
    </div>
  );

  // Image preview portal
  const ImagePreview = preview.src
    ? ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            left: preview.x + 20,
            top: preview.y - 20,
            zIndex: 9999,
            pointerEvents: "none",
          }}
          className="bg-white border border-border rounded-lg shadow-lg p-2"
        >
          <img
            src={preview.src}
            alt="Preview"
            className="w-48 h-48 object-contain rounded-lg"
          />
        </div>,
        document.body
      )
    : null;

  return (
    <div className="space-y-8">
      {ImagePreview}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-pixel font-bold text-primary">
          Product Management
        </h1>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Loading...
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {categories.map((cat) => {
          const IconComp = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <Button
              key={cat.key}
              type="button"
              variant={isActive ? "default" : "ghost"}
              className={`px-4 py-2 text-xs sm:text-sm rounded-md min-w-[110px] font-pixel font-bold flex items-center gap-2 border ${
                isActive
                  ? "bg-primary text-white border-primary"
                  : "bg-background text-primary border-border hover:bg-primary/10 hover:text-primary"
              }`}
              onClick={() => setActiveCategory(cat.key)}
              disabled={isLoading}
            >
              {IconComp && (
                <IconComp
                  className={`w-6 h-6 ${
                    isActive ? "text-white" : "text-primary"
                  }`}
                />
              )}
              {cat.name}
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className={`ml-2 text-xs font-pixel ${
                  isActive
                    ? "bg-white/20 text-white border-white/20"
                    : "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                {productsByCategory[cat.key]?.length ?? 0}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Product List for Selected Category */}
      {activeCategory && (
        <div className="space-y-6">
          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${
                  categories.find((c) => c.key === activeCategory)?.name
                }...`}
                className="font-pixel"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="font-pixel"
                disabled={isLoading}
                onClick={resetToDefault}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
              <Button
                variant="outline"
                className="font-pixel"
                disabled={isLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                className="font-pixel"
                disabled={isLoading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>

          {/* Table */}
          <Card className="shadow-retro">
            {/* Bulk Actions */}
            {selected.length > 0 && (
              <CardHeader className="border-b bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-sm text-muted-foreground">
                    {selected.length} selected
                  </span>
                  <BulkActions />
                </div>
              </CardHeader>
            )}

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            selected.length === products.length &&
                            products.length > 0
                          }
                          onChange={(e) =>
                            setSelected(
                              e.target.checked
                                ? products.map((p) => p.title)
                                : []
                            )
                          }
                          disabled={isLoading}
                          className="rounded border-border"
                        />
                      </TableHead>
                      <TableHead className="font-pixel">Image</TableHead>
                      <TableHead className="font-pixel">Title</TableHead>
                      <TableHead className="font-pixel">Category</TableHead>
                      <TableHead className="font-pixel">Price</TableHead>
                      <TableHead className="font-pixel text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground font-pixel"
                        >
                          {isLoading
                            ? "Loading products..."
                            : "No products found."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((prod) => (
                        <TableRow
                          key={prod.$id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selected.includes(prod.title)}
                              onChange={(e) =>
                                setSelected(
                                  e.target.checked
                                    ? [...selected, prod.title]
                                    : selected.filter((t) => t !== prod.title)
                                )
                              }
                              disabled={isLoading}
                              className="rounded border-border"
                            />
                          </TableCell>
                          <TableCell>
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-12 h-12 rounded-lg object-cover border border-border cursor-pointer transition-transform hover:scale-110"
                              onMouseEnter={(e) =>
                                setPreview({
                                  src: prod.image,
                                  x: e.clientX,
                                  y: e.clientY,
                                })
                              }
                              onMouseMove={(e) =>
                                setPreview((prev) => ({
                                  ...prev,
                                  x: e.clientX,
                                  y: e.clientY,
                                }))
                              }
                              onMouseLeave={() =>
                                setPreview({ src: null, x: 0, y: 0 })
                              }
                            />
                          </TableCell>
                          <TableCell className="font-pixel font-medium text-primary">
                            {prod.title}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {prod.category}
                          </TableCell>
                          <TableCell className="font-semibold text-primary">
                            {prod.price}৳
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-pixel h-8 w-8 p-0"
                                onClick={() => {
                                  setViewProduct(prod);
                                  setShowViewModal(true);
                                }}
                                disabled={isLoading}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-pixel h-8 w-8 p-0"
                                onClick={() => {
                                  setEditProduct(prod);
                                  setShowEditModal(true);
                                }}
                                disabled={isLoading}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-pixel h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setDeleteProduct(prod);
                                  setShowDeleteDialog(true);
                                }}
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Product Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-pixel text-xl text-primary">
              Product Details
            </DialogTitle>
          </DialogHeader>
          {viewProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Section */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={viewProduct.image}
                    alt={viewProduct.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-pixel text-2xl text-primary mb-2">
                    {viewProduct.title}
                  </h3>
                  <Badge variant="secondary" className="font-pixel">
                    {viewProduct.category}
                  </Badge>
                </div>

                {/* Price List */}
                {Array.isArray(viewProduct.priceList) &&
                  viewProduct.priceList.length > 0 && (
                    <div>
                      <h4 className="font-pixel text-sm font-medium mb-3">
                        Price Options:
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {viewProduct.priceList.map((item, idx) => {
                          const [label, price, hot] = item.split("|");
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-pixel text-sm">
                                  {label}
                                </span>
                                {hot === "true" && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    🔥 Hot
                                  </Badge>
                                )}
                              </div>
                              <span className="font-pixel font-bold text-primary">
                                {price}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {viewProduct.description && (
                  <div>
                    <h4 className="font-pixel text-sm font-medium mb-2">
                      Description:
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {viewProduct.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-pixel text-xl text-primary">
              Add New Product
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="font-pixel text-sm font-medium mb-3 block">
                Select Category *
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {categories.slice(1).map((cat) => {
                  // Skip "All" category
                  const IconComp = cat.icon;
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <Button
                      key={cat.key}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={`p-2 rounded w-32 h-auto flex flex-col items-center gap-2 font-pixel text-xs ${
                        isSelected
                          ? "bg-primary text-white"
                          : "hover:bg-primary"
                      }`}
                      onClick={() => setSelectedCategory(cat.key)}
                    >
                      {IconComp && <IconComp className="w-5 h-5" />}
                      {cat.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Product Details Form */}
            {selectedCategory && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-pixel text-sm font-medium mb-2 block">
                      Title *
                    </label>
                    <Input
                      value={newProduct.title}
                      onChange={(e) =>
                        handleNewProductChange("title", e.target.value)
                      }
                      className="font-pixel border-2 border-border"
                      placeholder="Enter product title"
                    />
                  </div>
                  <div>
                    <label className="font-pixel text-sm font-medium mb-2 block">
                      Category
                    </label>
                    <Input
                      value={
                        categories.find((c) => c.key === selectedCategory)
                          ?.name || ""
                      }
                      className="font-pixel bg-muted border-2 border-border"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="font-pixel text-sm font-medium mb-2 block">
                    Image
                  </label>
                  <div className="space-y-2">
                    <Input
                      value={newProduct.image}
                      onChange={(e) =>
                        handleNewProductChange("image", e.target.value)
                      }
                      className="font-pixel border-2 border-border"
                      placeholder="Paste image URL or upload below"
                    />
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, false);
                          }
                        }}
                        className="font-pixel text-xs border-2 border-border"
                        disabled={isUploading}
                      />
                      {isUploading && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                          Uploading to Cloudinary...
                        </div>
                      )}
                    </div>
                    {newProduct.image && (
                      <div className="mt-2">
                        <img
                          src={newProduct.image}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Price List Editor */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-pixel text-sm font-medium">
                      Price List
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewProductPriceListItem}
                      className="font-pixel"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Price
                    </Button>
                  </div>

                  {newProduct.priceList.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground font-pixel text-sm">
                      No price options added yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {newProduct.priceList.map((item, idx) => {
                        const [label, price, hot, type] = item.split("|");
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                          >
                            <Input
                              placeholder="Label (e.g., 60 UC)"
                              value={label || ""}
                              onChange={(e) => {
                                const newValue = `${e.target.value}|${price}|${hot}|${type}`;
                                handleNewProductPriceListChange(idx, newValue);
                              }}
                              className="font-pixel text-xs"
                            />
                            <Input
                              placeholder="Price (e.g., 85৳)"
                              value={price || ""}
                              onChange={(e) => {
                                const newValue = `${label}|${e.target.value}|${hot}|${type}`;
                                handleNewProductPriceListChange(idx, newValue);
                              }}
                              className="font-pixel text-xs"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newHot =
                                  hot === "true" ? "false" : "true";
                                const newValue = `${label}|${price}|${newHot}|${type}`;
                                handleNewProductPriceListChange(idx, newValue);
                              }}
                              className={`font-pixel text-xs ${
                                hot === "true" ? "bg-primary text-white" : ""
                              }`}
                              title="Toggle hot item"
                            >
                              Populer
                            </Button>
                            <select
                              value={type || ""}
                              onChange={(e) => {
                                const newValue = `${label}|${price}|${hot}|${e.target.value}`;
                                handleNewProductPriceListChange(idx, newValue);
                              }}
                              className="font-pixel text-xs border border-muted rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                            >
                              <option value="">Type</option>
                              <option value="diamond">Diamond</option>
                              <option value="voucher">Voucher</option>
                              <option value="other">Shared</option>
                              <option value="subscription">Personal</option>
                              <option value="codes">Codes</option>
                            </select>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeNewProductPriceListItem(idx)}
                              className="font-pixel"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-pixel text-sm font-medium mb-2 block">
                    Description
                  </label>
                  <Textarea
                    value={newProduct.description}
                    onChange={(e) =>
                      handleNewProductChange("description", e.target.value)
                    }
                    className="font-pixel border-2 border-border"
                    rows={3}
                    placeholder="Enter product description"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      resetNewProduct();
                    }}
                    disabled={isLoading}
                    className="font-pixel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddProduct}
                    disabled={
                      isLoading || !selectedCategory || !newProduct.title
                    }
                    className="font-pixel"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-pixel text-xl text-primary">
              Edit Product
            </DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-pixel text-sm font-medium mb-2 block">
                    Title
                  </label>
                  <Input
                    value={editProduct.title || ""}
                    onChange={(e) => handleEditChange("title", e.target.value)}
                    className="font-pixel"
                  />
                </div>
                <div>
                  <label className="font-pixel text-sm font-medium mb-2 block">
                    Category
                  </label>
                  <Input
                    value={editProduct.category || ""}
                    onChange={(e) =>
                      handleEditChange("category", e.target.value)
                    }
                    className="font-pixel"
                  />
                </div>
              </div>

              <div>
                <label className="font-pixel text-sm font-medium mb-2 block">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <Input
                    value={editProduct.image || ""}
                    onChange={(e) => handleEditChange("image", e.target.value)}
                    className="font-pixel flex-1"
                    placeholder="Paste image URL or upload below"
                  />
                </div>
                <div className="mt-2">
                  <label className="font-pixel text-xs text-muted-foreground mb-1 block">
                    Or upload image:
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, true);
                      }
                    }}
                    className="font-pixel text-xs"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      Uploading to Cloudinary...
                    </div>
                  )}
                </div>
              </div>

              {/* Price List Editor */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-pixel text-sm font-medium">
                    Price List
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPriceListItem}
                    className="font-pixel"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(editProduct.priceList || []).map((item, idx) => {
                    const [label, price, hot, type] = item.split("|");
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                      >
                        <Input
                          placeholder="Label"
                          value={label || ""}
                          onChange={(e) => {
                            const newValue = `${e.target.value}|${price}|${hot}|${type}`;
                            handlePriceListChange(idx, newValue);
                          }}
                          className="font-pixel text-xs"
                        />
                        <Input
                          placeholder="Price"
                          value={price || ""}
                          onChange={(e) => {
                            const newValue = `${label}|${e.target.value}|${hot}|${type}`;
                            handlePriceListChange(idx, newValue);
                          }}
                          className="font-pixel text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newHot = hot === "true" ? "false" : "true";
                            const newValue = `${label}|${price}|${newHot}|${type}`;
                            handlePriceListChange(idx, newValue);
                          }}
                          className={`font-pixel text-xs ${
                            hot === "true" ? "bg-primary text-white" : ""
                          }`}
                        >
                          Populer
                        </Button>
                        <select
                          value={type || ""}
                          onChange={(e) => {
                            const newValue = `${label}|${price}|${hot}|${e.target.value}`;
                            handlePriceListChange(idx, newValue);
                          }}
                          className="font-pixel text-xs border border-muted rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                        >
                          <option value="">Type</option>
                          <option value="diamond">Diamond</option>
                          <option value="voucher">Voucher</option>
                          <option value="shared">Shared</option>
                          <option value="personal">Personal</option>
                          <option value="codes">Codes</option>
                        </select>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removePriceListItem(idx)}
                          className="font-pixel"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-pixel text-sm font-medium mb-2 block">
                  Description
                </label>
                <Textarea
                  value={editProduct.description || ""}
                  onChange={(e) =>
                    handleEditChange("description", e.target.value)
                  }
                  className="font-pixel"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={isLoading}
                  className="font-pixel"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdateProduct}
                  disabled={isLoading}
                  className="font-pixel"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-pixel text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProduct?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-pixel" disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isLoading}
              className="font-pixel bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-pixel text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Multiple Products
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selected.length} selected
              products? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-pixel" disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isLoading}
              className="font-pixel bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All ({selected.length})
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
