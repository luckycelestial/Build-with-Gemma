"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ExecutiveControlRoom } from "@/components/control-room/ExecutiveControlRoom";

export default function Home() {
  return (
    <DashboardLayout activeRoute="/">
      <ExecutiveControlRoom />
    </DashboardLayout>
  );
}
