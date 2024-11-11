"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/netflix_logo.svg";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import UserNav from "./UserNav";

interface linkProps {
  name: string;
  href: string;
}

const links: linkProps[] = [
  { name: "Home", href: "/home" },
  { name: "Tv Shows", href: "/home/shows" },
  { name: "Movies", href: "/home/movies" },
  { name: "Recently Added", href: "/home/recently" },
  { name: "Favorites", href: "/home/user/list" },
];

export default function Navbar() {
  const pathName = usePathname();

  return (
    <div className="w-full max-w-7xl mx-auto items-center justify-between px-5 sm:px-6 py-5 lg:px-8 flex">
      <div className="flex items-center">
        <Link href="/home" className="w-32">
          <Image src={Logo} alt="Netflix logo" priority />
        </Link>
        <ul className="lg:flex gap-x-8 ml-14 hidden">
          {links.map((link, idx) => (
            <li key={idx}>
              <Link
                href={link.href}
                className={`text-sm font-semibold relative transition-all duration-300 ease-in-out 
                ${pathName === link.href ? "text-white" : "text-gray-300"}
                ${pathName !== link.href ? "hover:text-white hover:before:w-full before:w-0" : ""}
                before:absolute before:left-0 before:-bottom-1 before:h-[2px] before:bg-gradient-to-r from-red-500 to-yellow-500 before:transition-all before:duration-300`}
                prefetch
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-x-8">
        <Search className="w-5 h-5 text-gray-300 cursor-pointer hover:text-white transition-transform hover:scale-110" />
        <Bell className="h-5 w-5 text-gray-300 cursor-pointer hover:text-white transition-transform hover:scale-110" />
        <UserNav />
      </div>
    </div>
  );
}
