"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Status, StatusIndicator, StatusLabel } from "@/components/kibo-ui/status";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ProductModal from "./ProductModal";
import {
  Heart,
  MessageCircle,
  Search,
  Filter,
  MapPin
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
  // Prefer explicit WhatsApp number, but also accept other common phone fields
  const rawPhone = product?.vendor?.whatsappNumber || product?.vendor?.phone || product?.vendor?.contact;

  if (rawPhone) {
    // sanitize phone number to digits only (WhatsApp expects international format without +)
    const phone = String(rawPhone).replace(/[^0-9]/g, "");

    // Only send a textual message (product name and price) — no images per request
    const message = `Hi, I'm interested in buying:\n\n*${product.name}* (₦${product.price?.toLocaleString ? product.price.toLocaleString() : product.price})`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    if (typeof window !== 'undefined') window.open(whatsappUrl, "_blank");
  } else {
    // Fallback UX when no phone is available
    if (typeof window !== 'undefined') {
      // gentle notification for now; could be replaced with a nicer toast
      alert('Seller has no WhatsApp number listed. Check seller info or contact via email if available.');
    }
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
                      <Badge  className="bg-white/20 backdrop-blur-sm text-white border-0">
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          selectedProduct={selectedProduct}
          closeModal={closeModal}
          validImages={validImages}
          currentImage={currentImage}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageLoading={isImageLoading}
          handleImageLoad={handleImageLoad}
          handleImageError={handleImageError}
          hasImageError={hasImageError}
          prevImage={prevImage}
          nextImage={nextImage}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          handleBuyNow={handleBuyNow}
        />
      )}
    </div>
  );
}

export default ProductGrid;




