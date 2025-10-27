"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Status, StatusIndicator, StatusLabel } from "@/components/kibo-ui/status";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Loader2,
  Search,
  Filter,
  Star,
  Shield,
  Truck,
  Clock,
  Sparkles
} from "lucide-react";

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [imageLoading, setImageLoading] = useState(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    "All",
    "Books",
    "Electronics",
    "Clothing",
    "Food & Beverages",
    "Stationery",
    "Sports Equipment",
    "Furniture",
    "Beauty & Personal Care",
    "Other",
  ];

  // Price ranges for filtering
  const priceRanges = [
    { label: "Under ₦1,000", min: 0, max: 1000 },
    { label: "₦1,000 - ₦5,000", min: 1000, max: 5000 },
    { label: "₦5,000 - ₦10,000", min: 5000, max: 10000 },
    { label: "Over ₦10,000", min: 10000, max: Infinity },
  ];

  const getValidImages = (product) => {
    if (!product) return [];
    
    let images = [];
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      if (typeof product.images[0] === 'string') {
        images = product.images
          .filter(url => url && typeof url === 'string' && url.startsWith('http'))
          .map(url => ({
            url,
            publicId: `image-url-${images.indexOf(url)}`,
          }));
      } else {
        images = product.images.filter(img => 
          img && 
          typeof img === 'object' && 
          img.url && 
          typeof img.url === 'string' &&
          img.url.startsWith('http')
        );
      }
    }
    
    if (images.length === 0 && product.mainImage && typeof product.mainImage === 'string' && product.mainImage.startsWith('http')) {
      images = [{ 
        url: product.mainImage, 
        publicId: 'main-image-fallback' 
      }];
    }
    
    return images;
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Load wishlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading wishlist:", e);
      }
    }
  }, []);

  const toggleWishlist = (productId) => {
    const updated = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBuyNow = (product) => {
    if (product.vendor?.whatsappNumber) {
      const message = `Hi, I'm interested in buying: *${product.name}* (₦${product.price.toLocaleString()})`;
      const whatsappUrl = `https://wa.me/${product.vendor.whatsappNumber}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  // Image navigation
  const nextImage = (e) => {
    e.stopPropagation();
    const validImages = getValidImages(selectedProduct);
    if (validImages.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev + 1) % validImages.length
      );
      setImageErrors(prev => {
        const newSet = new Set(prev);
        validImages.forEach(img => newSet.delete(img.url));
        return newSet;
      });
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    const validImages = getValidImages(selectedProduct);
    if (validImages.length > 1) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + validImages.length) % validImages.length
      );
      setImageErrors(prev => {
        const newSet = new Set(prev);
        validImages.forEach(img => newSet.delete(img.url));
        return newSet;
      });
    }
  };

  // Image load handlers
  const handleImageLoad = (imageUrl, index) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
  };

  const handleImageError = (imageUrl, index) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
    setImageErrors(prev => new Set([...prev, imageUrl]));
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
    setImageErrors(new Set());
    setImageLoading(new Set());
  };

  const openModal = (product) => {
    const validImages = getValidImages(product);
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setImageErrors(new Set());
    setImageLoading(new Set());
  };

  const validImages = selectedProduct ? getValidImages(selectedProduct) : [];
  const currentImage = validImages[currentImageIndex] || null;
  const hasImageError = (imageUrl) => imageErrors.has(imageUrl);
  const isImageLoading = (imageUrl) => imageLoading.has(imageUrl);

  // Loading Skeleton
  const ProductSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="overflow-hidden border border-border bg-card animate-pulse rounded-lg">
          <div className="w-full h-48 bg-muted"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Enhanced Header */}


      {/* Enhanced Search & Filter Section */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search with icon */}
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products by name, category, or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* Filter Toggle for Mobile */}
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Categories with enhanced design */}
        <div className={`mt-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="px-4 py-2 cursor-pointer transition-all hover:scale-105 hover:shadow-sm"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{filteredProducts.length}</p>
          <p className="text-sm text-muted-foreground">Products</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{categories.length}</p>
          <p className="text-sm text-muted-foreground">Categories</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-500">
            {new Set(filteredProducts.map(p => p.vendor?.school)).size}
          </p>
          <p className="text-sm text-muted-foreground">Schools</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-500">{wishlist.length}</p>
          <p className="text-sm text-muted-foreground">Wishlisted</p>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <ProductSkeleton />
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || selectedCategory !== "All"
              ? "Try adjusting your search or filters"
              : "Be the first to list a product!"}
          </p>
          <Button onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => {
            const productImages = getValidImages(product);
            const isWishlisted = wishlist.includes(product.id);
            
            return (
              <div
                key={product.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-border bg-card cursor-pointer group hover:scale-105 rounded-lg"
                onClick={() => openModal(product)}
              >
                <div className="p-0">
                  {/* Enhanced Image Section */}
                  <div className="relative w-full h-48 bg-gradient-to-br from-secondary/50 to-muted/30 flex items-center justify-center overflow-hidden">
                    {productImages.length > 0 ? (
                      <>
                        <img
                          src={productImages[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
                      </>
                    ) : (
                      <div className="text-4xl flex items-center justify-center h-full">
                        📦
                      </div>
                    )}

                    {/* Image count badge */}
                    {productImages.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/80 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        +{productImages.length - 1}
                      </div>
                    )}

                    {/* Wishlist button with animation */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="absolute top-3 left-3 bg-white/90 p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110 shadow-sm"
                    >
                      <Heart
                        className={`w-4 h-4 transition-all duration-300 ${
                          isWishlisted
                            ? "fill-destructive text-destructive scale-110"
                            : "text-muted-foreground hover:text-destructive"
                        }`}
                      />
                    </button>

                    {/* Category badge */}
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-white/90">
                        {product.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Vendor  School Info */}
                    <div className="flex items-center gap-2 text-sm">
                      
                      <div>
                        
                        {product.vendor?.school && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {product.vendor.school}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary">
                        ₦{product.price.toLocaleString()}
                      </p>
                      {product.isAvailable && (
                        <Status
                            className="px-2 py-1 text-xs"
                            status="online"
                            variant="outline"
                         >
                           <StatusIndicator />
                           <StatusLabel className="font-medium"> In Stock</StatusLabel>
                         </Status>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyNow(product);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enhanced Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header with close button */}
            <div className="sticky top-0 bg-card border-b border-border p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground truncate">
                {selectedProduct.name}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-secondary rounded-lg transition hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 p-6">
              {/* Enhanced Image Carousel */}
              <div className="space-y-4">
                <div className="relative w-full h-80 bg-gradient-to-br from-secondary/30 to-muted/20 rounded-xl overflow-hidden">
                  {validImages.length > 0 && currentImage ? (
                    <>
                      {isImageLoading(currentImage.url) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      )}
                      
                      <img
                        key={currentImage.url}
                        src={currentImage.url}
                        alt={`${selectedProduct.name} ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        onLoad={() => handleImageLoad(currentImage.url, currentImageIndex)}
                        onError={() => handleImageError(currentImage.url, currentImageIndex)}
                      />

                      {hasImageError(currentImage.url) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📸</div>
                            <p className="text-sm text-muted-foreground">Image not available</p>
                          </div>
                        </div>
                      )}

                      {/* Navigation Arrows */}
                      {validImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-foreground p-3 rounded-full transition-all hover:scale-110 shadow-lg"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-foreground p-3 rounded-full transition-all hover:scale-110 shadow-lg"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      {validImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                          {currentImageIndex + 1} / {validImages.length}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <div className="text-6xl mb-2">📦</div>
                        <p>No images available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {validImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {validImages.map((img, idx) => (
                      <button
                        key={`${img.url}-${idx}`}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          currentImageIndex === idx
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Price & Category */}
                <div>
                  <p className="text-2xl font-bold text-primary mb-2">
                    ₦{selectedProduct.price.toLocaleString()}
                  </p>
                  <Badge variant="secondary" className="text-sm">
                    {selectedProduct.category}
                  </Badge>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-green-500" />
                    Student Verified
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="w-4 h-4 text-blue-500" />
                    Campus Delivery
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-orange-500" />
                    Quick Response
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Trusted Seller
                  </div>
                </div>

                {/* Vendor Information */}
                <div className="bg-secondary/20 rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-3">Seller Information</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedProduct.vendor?.name?.charAt(0) || "S"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {selectedProduct.vendor?.name || "Student Seller"}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedProduct.vendor?.school || "Campus Store"}
                      </p>
                      {selectedProduct.vendor?.email && (
                        <p className="text-sm text-muted-foreground">
                          ✉️ {selectedProduct.vendor.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 border-2 flex items-center justify-center gap-2 ${
                      wishlist.includes(selectedProduct.id)
                        ? 'bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20'
                        : 'bg-secondary/30 border-border text-foreground hover:bg-secondary/50 hover:scale-105'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        wishlist.includes(selectedProduct.id) ? 'fill-destructive' : ''
                      }`}
                    />
                    {wishlist.includes(selectedProduct.id) ? 'Wishlisted' : 'Wishlist'}
                  </button>

                  <Button
                    onClick={() => handleBuyNow(selectedProduct)}
                    className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold py-3 h-auto text-base transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductGrid;




