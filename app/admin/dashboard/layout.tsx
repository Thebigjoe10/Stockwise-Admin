"use client";

import React from "react";
import "../../globals.css";
import "@mantine/core/styles.css";
import {
  AppShell,
  Burger,
  Button,
  Group,
  MantineProvider,
  ScrollArea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MdOutlineCategory, MdSpaceDashboard } from "react-icons/md";
import { IoListCircleSharp } from "react-icons/io5";
import { FaTable } from "react-icons/fa";
import { BsPatchPlus } from "react-icons/bs";
import { RiCoupon3Fill } from "react-icons/ri";
import { VscGraph } from "react-icons/vsc";
import { FaRegRectangleList, FaUsers } from "react-icons/fa6";
import { ImUsers } from "react-icons/im";
import Link from "next/link";
import { usePathname } from "next/navigation"; // ✅ for current route
import { ModalsProvider } from "@mantine/modals";
import Logo from "@/components/Logo";

// ---------------- Types ----------------
interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  section: string;
}

type NavItem = NavLink | NavSection;

// ---------------- Nav Items ----------------
const navItems: NavItem[] = [
  { label: "Admin Dashboard", href: "/admin/dashboard", icon: <MdSpaceDashboard size={20} /> },
  { label: "Users", href: "/admin/dashboard/users", icon: <ImUsers size={20} /> },
  { label: "Vendors", href: "/admin/dashboard/vendors", icon: <FaUsers size={20} /> },
  { label: "Coupons", href: "/admin/dashboard/coupons", icon: <RiCoupon3Fill size={20} /> },

  { section: "Orders" },
  { label: "Orders", href: "/admin/dashboard/orders", icon: <IoListCircleSharp size={20} /> },

  { section: "Products" },
  { label: "All Products", href: "/admin/dashboard/product/all/tabular", icon: <FaTable size={20} /> },
  { label: "Create Product", href: "/admin/dashboard/product/create", icon: <BsPatchPlus size={20} /> },

  { section: "Categories" },
  { label: "Categories", href: "/admin/dashboard/categories", icon: <MdOutlineCategory size={20} /> },
  {
    label: "Sub Categories",
    href: "/admin/dashboard/subCategories",
    icon: <MdOutlineCategory size={20} style={{ transform: "rotate(180deg)" }} />,
  },

  { section: "Analytics" },
  { label: "Order Analytics", href: "/admin/dashboard/analytics/order", icon: <VscGraph size={20} /> },

  { section: "Banners" },
  { label: "Website Banners", href: "/admin/dashboard/banners/website", icon: <FaRegRectangleList size={20} /> },
  { label: "App Banners", href: "/admin/dashboard/banners/app", icon: <FaRegRectangleList size={20} /> },
];

// ---------------- Sidebar ----------------
function SidebarNav() {
  const pathname = usePathname(); // ✅ current route

  return (
    <ScrollArea style={{ height: "100%" }}>
      <div>
        {navItems.map((item, idx) =>
          "section" in item ? (
            <div key={`section-${idx}`} className="mt-2 font-semibold">
              {item.section}:
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`flex gap-[30px] items-center p-[10px] rounded-md transition-colors
                hover:bg-blue-100 ${
                  pathname === item.href ? "bg-blue-200 font-semibold" : ""
                }`}
            >
              {item.icon}
              <div>{item.label}</div>
            </Link>
          )
        )}
      </div>
    </ScrollArea>
  );
}

// ---------------- Layout ----------------
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure();

  return (
    <MantineProvider>
      <ModalsProvider>
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 300,
            breakpoint: "sm",
            collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
          }}
          padding="md"
        >
          {/* HEADER */}
          <AppShell.Header>
            <Group h="100%" px="md">
              <Burger
                opened={mobileOpened}
                onClick={toggleMobile}
                hiddenFrom="sm"
                size="sm"
              />
              <Burger
                opened={desktopOpened}
                onClick={toggleDesktop}
                visibleFrom="sm"
                size="sm"
              />
              <Logo />
              <Link href={"/admin/dashboard/topbars"}>
                <Button variant="outline">TopBars</Button>
              </Link>
              <Link href={"/admin/dashboard/homescreenoffers"}>
                <Button variant="outline">Home Screen Offers</Button>
              </Link>
              <Link href={"/admin/dashboard/reviews"}>
                <Button variant="outline">Manage product reviews</Button>
              </Link>
            </Group>
          </AppShell.Header>

          {/* NAVBAR */}
          <AppShell.Navbar p="md">
            <SidebarNav />
          </AppShell.Navbar>

          {/* MAIN CONTENT */}
          <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
      </ModalsProvider>
    </MantineProvider>
  );
}
