import React from "react";
import {
  calculateTotalOrders,
  getDashboardData,
} from "@/lib/database/actions/admin/dashboard/dashboard.actions";
import DashboardCard from "@/components/admin/dashboard/dashboardCard";
import OrdersSummaryCard from "@/components/admin/dashboard/OrdersSummaryCard";
import ProductData from "@/components/admin/dashboard/product.perfomance";
import LowStockProducts from "@/components/admin/dashboard/low-stock-products";
import OutOfStockProducts from "@/components/admin/dashboard/out-of-stock-products";
import OrdersTable from "@/components/admin/dashboard/OrdersTable";

// Main Vendor Dashboard Page

const VendorDashboardPage = async () => {
  const data = await getDashboardData().catch((err) => {
    console.error("Error fetching dashboard data:", err);
    return { orders: [], products: [], name: "Admin", lowStockProducts: [], outOfStockProducts: [] };
  });

  const allOrdersData = await calculateTotalOrders().catch((err) => {
    console.error("Error calculating totals:", err);
    return { totalSales: 0, todaySales: 0, thisMonthSales: 0, thisWeekSales: 0, lastMonthSales: 0, growth: { day: "0.00", week: "0.00", month: "0.00" }, day: 0, week: 0, month: 0 };
  });

  return (
    <div className="container mx-auto p-4">
      {/* Dashboard cards */}
      <div className="my-6">
        {/* Pass only JSON-serializable data */}
        <DashboardCard
          data={{
            name: data?.name || "Admin",
            orders: Array.isArray(data?.orders) ? data.orders : [],
            products: Array.isArray(data?.products) ? data.products : [],
          }}
        />
      </div>

      {/* Orders summary */}
        <div className="titleStyle">Orders</div>
        <OrdersSummaryCard
          totalSales={allOrdersData?.totalSales || 0}
          todaySales={allOrdersData?.todaySales || 0 }
          thisMonthSales={allOrdersData?.thisMonthSales || 0}
          lastMonthSales={allOrdersData?.lastMonthSales || 0}
          thisWeekSales={allOrdersData?.thisWeekSales || 0}
          growth={allOrdersData?.growth || { day: "0.00", week: "0.00", month: "0.00" }}
        />
      {/* Recent Orders */}
      <div className="my-6">
        <OrdersTable data={{ orders: data?.orders || [] }} />
      </div>
      {/* Product stats */}
      <div className="my-6">
      <div className="titleStyle">Product Performance</div>
      <ProductData />
      </div>
      <div className="my-6">
        <LowStockProducts data={data?.lowStockProducts ?? []} />
      </div>
      <div className="my-6">  
      <OutOfStockProducts data={data?.outOfStockProducts ?? []}/>
    </div>
    </div>
  );
};

export default VendorDashboardPage;
