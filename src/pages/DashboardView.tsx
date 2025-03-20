"use client";

import {
  Button,
  Checkbox,
  Label,
  Modal,
  TextInput,
  Accordion,
} from "flowbite-react";
import { useState } from "react";

const DashboardView = () => {
  const [openModal, setOpenModal] = useState(false);
  const [email, setEmail] = useState("");

  function onCloseModal() {
    setOpenModal(false);
    setEmail("");
  }

  return (
    <div>
      <Button onClick={() => setOpenModal(true)}>Toggle modal</Button>

      <Modal show={openModal} size="md" onClose={onCloseModal} popup>
        <Modal.Header />
        <div className="m-2 space-y-6">
          <h3 className="text-center text-xl font-medium text-gray-900 dark:text-white">
            ITM SKILLS UNIVERSITY
          </h3>
          <p className="text-center text-sm font-medium text-gray-900 dark:text-white">
            Campus: School Of Future Tech
          </p>
          <p className="text-center text-sm font-medium text-gray-900 dark:text-white">
            NO DUES CERTIFICATE
          </p>
        </div>
        <Accordion className="p-4">
          <Accordion.Panel>
            <Accordion.Title>Part - I</Accordion.Title>
            <Accordion.Content>
              <Modal.Body>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="email" value="Your email" />
                  </div>
                  <TextInput
                    id="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="password" value="Your password" />
                  </div>
                  <TextInput id="password" type="password" required />
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember">Remember me</Label>
                  </div>
                  <a
                    href="#"
                    className="text-sm text-cyan-700 hover:underline dark:text-cyan-500"
                  >
                    Lost Password?
                  </a>
                </div>
                <div className="w-full">
                  <Button>Log in to your account</Button>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
                  Not registered?&nbsp;
                  <a
                    href="#"
                    className="text-cyan-700 hover:underline dark:text-cyan-500"
                  >
                    Create account
                  </a>
                </div>
              </Modal.Body>
            </Accordion.Content>
          </Accordion.Panel>
          <Accordion.Panel>
            <Accordion.Title>Part - II</Accordion.Title>
            <Accordion.Content></Accordion.Content>
          </Accordion.Panel>
        </Accordion>
      </Modal>
    </div>
  );
};

export default DashboardView;
