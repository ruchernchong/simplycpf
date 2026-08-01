import { Button, Card, Typography } from "@heroui/react";
import { Home01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist on SimplyCPF.",
  // A 404 has nothing worth indexing, and should not inherit the site canonical.
  robots: { index: false, follow: true },
};

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
    <Card className="w-full max-w-md">
      <Card.Header>
        <Card.Title>404</Card.Title>
        <Card.Description>Page not found</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <Typography color="muted" type="body-sm">
          The page you're looking for doesn't exist.
        </Typography>
        <Link href="/" className="w-full">
          <Button className="w-full" variant="primary">
            <HugeiconsIcon
              icon={Home01Icon}
              className="mr-2 size-4"
              strokeWidth={2}
            />
            Back to Home
          </Button>
        </Link>
      </Card.Content>
    </Card>
  </div>
);

export default NotFound;
