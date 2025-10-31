"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Loader2,
  Star,
  Shield,
  Truck,
  Clock,
  Heart,
  MessageCircle
} from "lucide-react";

const ProductModal = ({ 
  selectedProduct, 
  closeModal, 
  validImages, 
  currentImage, 
  currentImageIndex, 
  setCurrentImageIndex,
  isImageLoading,
  handleImageLoad,
  handleImageError,
  hasImageError,
  prevImage,
  nextImage,
  wishlist,
  toggleWishlist,
  handleBuyNow 
}) => {
  if (!selectedProduct) return null;

  return (
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
  );
};

export default ProductModal;