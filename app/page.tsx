import React from "react";
import Header from "./components/header";
import ProductGallery from "./components/productGallery";
import ProductGrid from "./components/productGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4 mt-4">
          <h1 className="text-5xl font-bold text-primary">
            Campus Marketplace
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover amazing products from fellow students. Shop smart, save big! 🎓
        </p>
      </div>
      <ProductGallery />
      <ProductGrid />

      
    </main>
  );
}




















{/* <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-primary">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-48 relative mb-4 rounded-lg overflow-hidden bg-secondary">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-medium text-foreground">Seller: {product.seller}</span>
                  <span className="text-muted-foreground">{product.location}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="text-lg font-bold text-accent">${product.price}</span>
                <Button variant="default" size="sm" className="bg-primary text-primary-foreground">Contact Seller</Button>
              </CardFooter>
            </Card> */}