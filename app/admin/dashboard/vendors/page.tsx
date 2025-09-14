import EnhancedTableVendors from "@/components/admin/dashboard/vendors/table";
import { getAllVendors } from "@/lib/database/actions/admin/vendor.actions";
import React from "react";

const AllVendorsPage = async () => {
  const data = await getAllVendors().catch((err) => console.log(err));
  console.log(data);
  return (
    <div className="container">
      <EnhancedTableVendors rows={data} />
    </div>
  );
};

export default AllVendorsPage;