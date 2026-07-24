"use client";
import React, { Suspense } from "react";
import LogoButton from "../buttons/LogoButton";
import { UserButton } from "../buttons/UserButton";
import { useSidebar } from "../ui/sidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const Navbar = () => {
  const { toggleSidebar } = useSidebar();
  const user = useCurrentUser();
  const pathName = usePathname()

  return (
    <nav className="flex items-center justify-between border-b px-2 py-4 md:px-4 lg:px-6 bg-black">
      <Suspense>
         <Image
                    alt={"qrcode"}
                    src={"/white-wings.png"}
                    width={150}
                    height={90}
                    className="bg-transparent rounded-xl"
                  />
        {/* <LogoButton /> */}
      </Suspense>
      <div className="flex items-center gap-2">
        {user?.role !== "USER" && pathName?.includes("admin") && (
          <Button onClick={toggleSidebar} size="sm" variant={"ghost"} className="text-white">
            <Menu />
          </Button>
        )}
        <UserButton />
      </div>
    </nav>
  );
};

export default Navbar;
