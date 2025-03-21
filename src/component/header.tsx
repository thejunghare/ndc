"use client";

import { Button, Navbar } from "flowbite-react";

const Header = () => {
  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="">
        <img
          src="../../public/ISU_LOGO.webp"
          className="mr-3 h-6 sm:h-9"
          alt="Flowbite React Logo"
        />
        {/* <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Flowbite React
        </span> */}
      </Navbar.Brand>
      <div className="flex md:order-2">
        <Button>Logout</Button>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link href="#" active>
          Dashboard
        </Navbar.Link>
        <Navbar.Link href="#">About</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
