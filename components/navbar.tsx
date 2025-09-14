import { Button } from "@mantine/core";
import Logo from "./Logo";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="p-[1rem] border-b-[1px] border-b-[#eaeaea]">
      <nav className="flex justify-between items-center">
        <Logo />
        <Link href={"/admin/dashboard"}>
          <Button variant="outline">Admin Dashboard</Button>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;