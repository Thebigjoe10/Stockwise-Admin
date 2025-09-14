"use client";

import AllOrdersTable from "@/components/admin/dashboard/orders/data-table";
import { getAllOrders } from "@/lib/database/actions/admin/orders/orders.actions";
import { useEffect, useState } from "react";

const OrdersPage = () => {
  type DateRange =
    | "today"
    | "yesterday"
    | "2d"
    | "7d"
    | "15d"
    | "30d"
    | "2m"
    | "5m"
    | "10m"
    | "12m"
    | "all"
    | "today_and_yesterday";
  type PaymentStatus = "paid" | "unPaid" | "-";
  type PaymentMethod = "cash" | "RazorPay" |  "Paystack" | "-";

  const [orders, setOrders] = useState<any>();
  const [range, setRange] = useState<DateRange>("today");
  const [isPaid, setIsPaid] = useState<PaymentStatus>("-");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("-");


  useEffect(() => {
    async function getOrdersForVendor() {
      try {
        await getAllOrders(range, isPaid, paymentMethod)
          .then((res) => {
            setOrders(res);
            console.log(res);
          })
          .catch((err) => alert(err));
      } catch (error: any) {
        console.log(error);
        alert(error);
      }
    }
    getOrdersForVendor();
  }, [range, isPaid, paymentMethod]);
  return (
    <div>
      <AllOrdersTable
        rows={orders}
        range={range}
        setRange={setRange}
        setIsPaid={setIsPaid}
        isPaid={isPaid}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />
    </div>
  );
};

export default OrdersPage;
