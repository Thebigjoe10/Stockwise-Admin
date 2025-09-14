"use client";

import ProductsDataTable from "@/components/admin/dashboard/data.products.table";
import { getAllProducts } from "@/lib/database/actions/admin/products/products.actions";
import { useState, useEffect } from "react";
const AllProductsPage = () => {
  const [products, setProducts] = useState<any>();

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        await getAllProducts()
          .then((res) => {
            setProducts(res);
          })
          .catch((err) => alert(err));
      } catch (error: any) {
        console.log(error);
      }
    };
    fetchAllProducts();
  }, []);
  useEffect(() => {
    console.log("all", products);
  }, [products]);
  return (
    <div className="container">
      <div className="mb-[1rem] titleStyle text-brand">All Products</div>
      {Array.isArray(products) && products.length > 0 ? (
        <ProductsDataTable products={products} />
      ) : (
        <p>No Products Found!!!</p>
      )}
    </div>
  );
};

export default AllProductsPage;