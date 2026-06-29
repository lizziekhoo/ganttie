"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, SidebarProvider, useSidebar } from "@/components/layout/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut, CalendarDays, CheckCircle, ClipboardList, Users } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    {
      label: "Calendar",
      href: "/calendar",
      icon: (
        <CalendarDays className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Designers",
      href: "/designers",
      icon: (
        <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "/logout",
      icon: (
        <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const [hoveredProjects, setHoveredProjects] = useState(false);
  const [hoveredTasks, setHoveredTasks] = useState(false);

  return (
    <SidebarProvider open={sidebarOpen} setOpen={setSidebarOpen}>
      <SidebarLayoutContent links={links} hoveredProjects={hoveredProjects} setHoveredProjects={setHoveredProjects} hoveredTasks={hoveredTasks} setHoveredTasks={setHoveredTasks}>
        {children}
      </SidebarLayoutContent>
    </SidebarProvider>
  );
}

function SidebarLayoutContent({
  children,
  links,
  hoveredProjects,
  setHoveredProjects,
  hoveredTasks,
  setHoveredTasks
}: {
  children: React.ReactNode;
  links: any[];
  hoveredProjects: boolean;
  setHoveredProjects: (value: boolean) => void;
  hoveredTasks: boolean;
  setHoveredTasks: (value: boolean) => void;
}) {
  const { isCollapsed, open } = useSidebar();

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full h-screen overflow-hidden">
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {!isCollapsed ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">

              {/* Projects + Completed Projects dropdown */}
              <div
                className="flex flex-col"
                onMouseEnter={() => setHoveredProjects(true)}
                onMouseLeave={() => setHoveredProjects(false)}
              >
                <SidebarLink
                  link={{
                    label: "Projects",
                    href: "/",
                    icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                  }}
                />

                <AnimatePresence>
                  {hoveredProjects && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -4 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 pl-2 ml-1">
                        <div className="w-px self-stretch bg-neutral-300 dark:bg-neutral-600 ml-2 my-1" />
                        <Link
                          href="/completed-projects"
                          className="flex items-center gap-2 py-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 flex-shrink-0" />
                          <motion.span
                            animate={{
                              display: !isCollapsed ? "inline-block" : "none",
                              opacity: !isCollapsed ? 1 : 0,
                            }}
                            className="whitespace-pre text-sm"
                          >
                            Completed Projects
                          </motion.span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tasks + Individual dropdown */}
              <div
                className="flex flex-col"
                onMouseEnter={() => setHoveredTasks(true)}
                onMouseLeave={() => setHoveredTasks(false)}
              >
                <SidebarLink
                  link={{
                    label: "Tasks",
                    href: "/tasks",
                    icon: <ClipboardList className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                  }}
                />

                <AnimatePresence>
                  {hoveredTasks && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -4 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 pl-2 ml-1">
                        <div className="w-px self-stretch bg-neutral-300 dark:bg-neutral-600 ml-2 my-1" />
                        <Link
                          href="/tasks"
                          className="flex items-center gap-2 py-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                        >
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <motion.span
                            animate={{
                              display: !isCollapsed ? "inline-block" : "none",
                              opacity: !isCollapsed ? 1 : 0,
                            }}
                            className="whitespace-pre text-sm"
                          >
                            Individual
                          </motion.span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>

          <div>
            <SidebarLink
              link={{
                label: "Manu Arora",
                href: "#",
                icon: (
                  <Image
                    src="https://assets.aceternity.com/manu.png"
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <motion.div
        className="flex-1 overflow-hidden"
        animate={{
          width: open ? "calc(100% - 300px)" : "calc(100% - 60px)"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full w-full bg-white dark:bg-neutral-900 overflow-y-auto rounded-tl-2xl">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Acet Labs
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};