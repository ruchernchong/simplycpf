"use client";

import { Button } from "@heroui/react";

/** Hands the sheet to the browser's print dialogue; print styles do the rest. */
export function PrintButton() {
  return (
    <Button variant="outline" onPress={() => window.print()}>
      Print
    </Button>
  );
}
