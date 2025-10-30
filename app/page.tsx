import React from "react";
import Header from "./components/header";
import ProductGallery from "./components/productGallery";
import ProductGrid from "./components/productGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
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