import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Server, Radio, Database } from "lucide-react";

interface ServiceStatus {
  name: string;
  url: string;
  healthPath: string;
  icon: React.ReactNode;
  status: "unknown" | "loading" | "ok" | "error";
  data?: Record<string, unknown>;
  error?: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:3002";
const COLLECTOR_URL = import.meta.env.VITE_COLLECTOR_URL ?? "http://localhost:3003";

const INITIAL_SERVICES: ServiceStatus[] = [
  {
    name: "api-service",
    url: API_URL,
    healthPath: "/health",
    icon: <Server className="h-5 w-5" />,
    status: "unknown",
  },
  {
    name: "ws-hub",
    url: WS_URL,
    healthPath: "/health",
    icon: <Radio className="h-5 w-5" />,
    status: "unknown",
  },
  {
    name: "md-collector",
    url: COLLECTOR_URL,
    healthPath: "/health",
    icon: <Database className="h-5 w-5" />,
    status: "unknown",
  },
];

const statusColor = (s: ServiceStatus["status"]) => {
  switch (s) {
    case "ok":
      return "default";
    case "error":
      return "destructive";
    case "loading":
      return "secondary";
    default:
      return "outline";
  }
};

const Index = () => {
  const [services, setServices] = useState<ServiceStatus[]>(INITIAL_SERVICES);

  const checkHealth = useCallback(async () => {
    setServices((prev) =>
      prev.map((s) => ({ ...s, status: "loading" as const }))
    );

    const results = await Promise.all(
      INITIAL_SERVICES.map(async (svc) => {
        try {
          const res = await fetch(`${svc.url}${svc.healthPath}`, {
            signal: AbortSignal.timeout(5000),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return { ...svc, status: "ok" as const, data, error: undefined };
        } catch (err) {
          return {
            ...svc,
            status: "error" as const,
            error: err instanceof Error ? err.message : "Unknown error",
            data: undefined,
          };
        }
      })
    );

    setServices(results);
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Market Data Platform
            </h1>
            <p className="text-sm text-muted-foreground">
              Repo A — Service Status Dashboard
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={checkHealth}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {services.map((svc) => (
            <Card key={svc.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  {svc.icon}
                  {svc.name}
                </CardTitle>
                <Badge variant={statusColor(svc.status)}>
                  {svc.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {svc.url}
                  {svc.healthPath}
                </p>
                {svc.data && (
                  <pre className="mt-2 rounded bg-muted p-2 text-xs">
                    {JSON.stringify(svc.data, null, 2)}
                  </pre>
                )}
                {svc.error && (
                  <p className="mt-2 text-xs text-destructive">{svc.error}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Services not running locally? Start them with{" "}
          <code className="rounded bg-muted px-1">pnpm dev</code>
        </p>
      </div>
    </div>
  );
};

export default Index;
