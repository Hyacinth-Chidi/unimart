"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  MessageCircle,
  Heart,
  MapPin,
  Star,
  Shield,
  Truck,
  Clock,
  Sparkles,
  ZoomIn,
  Play,
  Pause
} from "lucide-react";

function ProductGallery() {
  const apiRef = useRef(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ✅ Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const data = await response.json();
        console.log("API data:", data);
        const products = data.products || [];
        // Sort by price or rating to get best products for gallery
        const sortedProducts = products
          .sort((a, b) => (b.price || 0) - (a.price || 0))
          .slice(0, 6); // Show 6 featured products
        
        setFeaturedProducts(sortedProducts);
        if (sortedProducts.length > 0) {
          setSelectedProduct(sortedProducts[0]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setFeaturedProducts([]);
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

  // Auto-swipe with play/pause control
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      if (apiRef.current) {
        apiRef.current.scrollNext();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Track current slide
  useEffect(() => {
    if (apiRef.current) {
      apiRef.current.on("select", () => {
        setCurrentSlide(apiRef.current.selectedScrollSnap());
      });
    }
  }, []);

  const handleBuyNow = (product = selectedProduct) => {
    if (product?.vendor?.whatsappNumber) {
      const message = `Hi, I'm interested in buying: *${product.name}* (₦${product.price?.toLocaleString()})`;
      const whatsappUrl = `https://wa.me/${product.vendor.whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto pb-16 px-4">
        <div className="text-center mb-8">
          <div className="h-8 bg-muted rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-muted h-96 rounded-2xl animate-pulse"></div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto pb-16 px-4">
        <div className="bg-card border border-border rounded-2xl h-96 flex flex-col items-center justify-center text-center p-8">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No Featured Products</h3>
          <p className="text-muted-foreground mb-6">
            Check back soon for amazing student products!
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pb-16 px-4">
    

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Carousel Section - Main Focus */}
        <div className="xl:col-span-3">
          <div className="relative group">
            <Carousel
              setApi={(api) => (apiRef.current = api)}
              className="w-full"
              opts={{ 
                loop: true,
                align: "start"
              }}
            >
              <div className="relative">
                <CarouselContent>
                  {featuredProducts.map((product, idx) => (
                    <CarouselItem
                      key={product.id}
                      className="relative rounded-2xl overflow-hidden cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="aspect-video bg-gradient-to-br from-secondary/40 to-muted/30 rounded-2xl overflow-hidden">
                        {product.mainImage ? (
                          <>
                            <img
                              src={product.mainImage}
                              alt={product.name}
                              className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Product Info Overlay */}
                            <div className="absolute bottom-6 left-6 right-6 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                                  <p className="text-lg font-semibold text-primary-foreground">
                                    ₦{product.price?.toLocaleString()}
                                  </p>
                                </div>
                                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                                  {product.category}
                                </Badge>
                              </div>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="absolute top-6 right-6 flex gap-2 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWishlist(product.id);
                                }}
                                className="bg-white/90 p-2 rounded-full hover:bg-white transition hover:scale-110 shadow-lg"
                              >
                                <Heart
                                  className={`w-5 h-5 transition ${
                                    wishlist.includes(product.id)
                                      ? "fill-destructive text-destructive"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBuyNow(product);
                                }}
                                className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition hover:scale-110 shadow-lg"
                              >
                                <MessageCircle className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Zoom Indicator */}
                            <div className="absolute top-6 left-6 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm flex items-center gap-2">
                                <ZoomIn className="w-4 h-4" />
                                Click to view details
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                            <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg">{product.name}</p>
                            <p className="text-sm mt-2">₦{product.price?.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Enhanced Navigation Arrows */}
                <div className="hidden md:block">
                  <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none group-hover:pointer-events-auto">
                    <CarouselPrevious 
                      className="pointer-events-auto bg-white/90 hover:bg-white shadow-lg border-0 w-12 h-12 hover:scale-110 transition-transform" 
                      size="lg"
                    />
                    <CarouselNext 
                      className="pointer-events-auto bg-white/90 hover:bg-white shadow-lg border-0 w-12 h-12 hover:scale-110 transition-transform" 
                      size="lg"
                    />
                  </div>
                </div>

                {/* Play/Pause Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2">
                  <button
                    onClick={toggleAutoPlay}
                    className="text-white hover:text-primary transition"
                  >
                    {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <div className="flex gap-1">
                    {featuredProducts.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => apiRef.current?.scrollTo(idx)}
                        className={`w-2 h-2 rounded-full transition ${
                          currentSlide === idx 
                            ? "bg-primary" 
                            : "bg-white/50 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Carousel>
          </div>

          {/* Enhanced Thumbnails */}
          <div className="mt-6">
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {featuredProducts.map((product, idx) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    apiRef.current?.scrollTo(idx);
                  }}
                  className={`flex-shrink-0 relative group/thumb rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedProduct?.id === product.id
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-border hover:border-primary/50 hover:scale-105"
                  }`}
                >
                  <div className="w-24 h-20 bg-gradient-to-br from-secondary/30 to-muted/20">
                    {product.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover transition group-hover/thumb:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  
                  {/* Active Indicator */}
                  {selectedProduct?.id === product.id && (
                    <div className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-xl" />
                  )}

                  {/* Price Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs font-semibold text-white text-center">
                      ₦{product.price?.toLocaleString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Product Details Section */}
        {selectedProduct && (
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full">
            {/* Header with Wishlist */}
            <div className="flex items-start justify-between mb-4">
              <Badge variant="secondary" className="text-sm">
                Featured
              </Badge>
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className="p-2 hover:bg-secondary rounded-lg transition hover:scale-110"
              >
                <Heart
                  className={`w-5 h-5 transition ${
                    wishlist.includes(selectedProduct.id)
                      ? "fill-destructive text-destructive"
                      : "text-muted-foreground hover:text-destructive"
                  }`}
                />
              </button>
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2 leading-tight">
                  {selectedProduct.name}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selectedProduct.description?.substring(0, 200)}
                  {selectedProduct.description?.length > 200 && "..."}
                </p>
              </div>

              {/* Price & Category */}
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">
                  ₦{selectedProduct.price?.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedProduct.category}
                  </Badge>
                  {selectedProduct.isAvailable && (
                    <Badge variant="default" className="bg-green-500 text-xs">
                      In Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 py-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 text-green-500" />
                  Verified Seller
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="w-4 h-4 text-blue-500" />
                  Campus Delivery
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Quick Response
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Premium Product
                </div>
              </div>

              {/* Vendor Information */}
              {selectedProduct.vendor && (
                <div className="bg-secondary/20 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-foreground text-sm">Seller Information</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {selectedProduct.vendor.name?.charAt(0) || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {selectedProduct.vendor.name || "Student Seller"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" />
                        {selectedProduct.vendor.school || "Campus Store"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Count & Details */}
              <div className="space-y-2 text-sm">
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      📸 <span className="font-semibold">{selectedProduct.images.length}</span> photos
                    </span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Featured in {selectedProduct.category} category
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 mt-4 border-t border-border">
              <Button
                onClick={() => handleBuyNow(selectedProduct)}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold py-3 h-auto text-base transition-all duration-300 hover:scale-105 hover:shadow-lg"
                size="lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Buy on WhatsApp
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setSelectedProduct(selectedProduct)}
                className="w-full border-2 border-border hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300"
              >
                View Full Details
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Gallery Stats */}
      {/* <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{featuredProducts.length}</p>
          <p className="text-sm text-muted-foreground">Featured Products</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">
            {new Set(featuredProducts.map(p => p.vendor?.school)).size}
          </p>
          <p className="text-sm text-muted-foreground">Campus Stores</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-500">
            {featuredProducts.filter(p => p.isAvailable).length}
          </p>
          <p className="text-sm text-muted-foreground">In Stock</p>
        </div>
      </div> */}
    </div>
  );
}

export default ProductGallery;