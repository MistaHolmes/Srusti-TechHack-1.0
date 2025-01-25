import React from "react";
import { Outlet } from "react-router-dom";
import { NavNav } from "./components/NavNav";

export function Layout() {
  return (
    <div>
      <NavNav />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
