import { Button, Navbar } from "flowbite-react";

const Header = ({ onLogout }: { onLogout?: () => void }) => (
  <div>
    <Navbar fluid rounded className="bg-white shadow-md dark:bg-gray-800">
      <Navbar.Brand href="">
        <img
          src="/ISU_LOGO.webp"
          className="mr-3 h-6 sm:h-9"
          alt="Flowbite React Logo"
        />
        {/* <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Flowbite React
        </span> */}
      </Navbar.Brand>
      <div className="flex md:order-2">
        {onLogout && <Button onClick={onLogout}>Logout</Button>}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link href="#" active>
          Dashboard
        </Navbar.Link>
        <Navbar.Link href="#">About</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  </div>
);

export default Header;
