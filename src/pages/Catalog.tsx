import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

interface SymbolItem {
  symbol_norm: string;
  base_asset: string;
  quote_asset: string;
}

interface MarketItem {
  exchange: string;
  market_type: string;
  active: boolean;
}

function useSymbols() {
  return useQuery<{ symbols: SymbolItem[] }>({
    queryKey: ["symbols"],
    queryFn: () => fetch(`${API_URL}/symbols`).then((r) => r.json()),
    staleTime: 60_000,
  });
}

function useMarkets() {
  return useQuery<{ markets: MarketItem[] }>({
    queryKey: ["markets"],
    queryFn: () => fetch(`${API_URL}/markets`).then((r) => r.json()),
    staleTime: 60_000,
  });
}

const Catalog = () => {
  const [symbolSearch, setSymbolSearch] = useState("");
  const [exchangeFilter, setExchangeFilter] = useState("all");
  const [marketTypeFilter, setMarketTypeFilter] = useState("all");

  const { data: symbolsData, isLoading: symbolsLoading } = useSymbols();
  const { data: marketsData, isLoading: marketsLoading } = useMarkets();

  const symbols = symbolsData?.symbols ?? [];
  const markets = marketsData?.markets ?? [];

  const filteredSymbols = symbols.filter((s) => {
    const q = symbolSearch.toLowerCase();
    return (
      s.symbol_norm.toLowerCase().includes(q) ||
      s.base_asset.toLowerCase().includes(q) ||
      s.quote_asset.toLowerCase().includes(q)
    );
  });

  const exchanges = [...new Set(markets.map((m) => m.exchange))];

  const filteredMarkets = markets.filter((m) => {
    if (exchangeFilter !== "all" && m.exchange !== exchangeFilter) return false;
    if (marketTypeFilter !== "all" && m.market_type !== marketTypeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Instrument Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Normalized symbols and exchange markets
          </p>
        </div>

        <Tabs defaultValue="symbols">
          <TabsList>
            <TabsTrigger value="symbols">
              Symbols {symbols.length > 0 && <Badge variant="secondary" className="ml-2">{symbols.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="markets">
              Markets {markets.length > 0 && <Badge variant="secondary" className="ml-2">{markets.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* --- Symbols Tab --- */}
          <TabsContent value="symbols" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search symbols…"
                value={symbolSearch}
                onChange={(e) => setSymbolSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {symbolsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : filteredSymbols.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {symbols.length === 0
                  ? "No symbols synced yet. Run instrument sync first."
                  : "No matches."}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Base</TableHead>
                    <TableHead>Quote</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSymbols.map((s) => (
                    <TableRow key={s.symbol_norm}>
                      <TableCell className="font-medium">{s.symbol_norm}</TableCell>
                      <TableCell>{s.base_asset}</TableCell>
                      <TableCell>{s.quote_asset}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* --- Markets Tab --- */}
          <TabsContent value="markets" className="space-y-4">
            <div className="flex gap-3">
              <Select value={exchangeFilter} onValueChange={setExchangeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Exchange" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All exchanges</SelectItem>
                  {exchanges.map((ex) => (
                    <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={marketTypeFilter} onValueChange={setMarketTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="spot">spot</SelectItem>
                  <SelectItem value="linear">linear</SelectItem>
                  <SelectItem value="inverse">inverse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {marketsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : filteredMarkets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {markets.length === 0
                  ? "No markets synced yet. Run instrument sync first."
                  : "No matches."}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exchange</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMarkets.map((m) => (
                    <TableRow key={`${m.exchange}-${m.market_type}`}>
                      <TableCell className="font-medium">{m.exchange}</TableCell>
                      <TableCell>{m.market_type}</TableCell>
                      <TableCell>
                        <Badge variant={m.active ? "default" : "secondary"}>
                          {m.active ? "active" : "inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Catalog;
