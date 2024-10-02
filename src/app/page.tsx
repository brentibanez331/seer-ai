"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Board } from "@/components/Board";
import { ButtonComponent } from "@/components/Button";


export default function Home() {
  

  return (
    <main className="flex min-h-screen justify-evenly items-center w-full p-4">
      <Board></Board>
    </main>
  );
}
