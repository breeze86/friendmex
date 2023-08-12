import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import axios from "axios";
import Card from "components/Card";
import { Global } from "state/global";
import { truncateAddress } from "utils";
import Address from "components/Address";
import { formatDistance } from "date-fns";
import type { Trade } from "@prisma/client";
import { useEffect, useState, useCallback } from "react";
import { CrossCircledIcon, SymbolIcon } from "@radix-ui/react-icons";

export default function RecentTokenTrades() {
  // Loading state
  const [loading, setLoading] = useState<boolean>(true);
  // Token address
  const { address }: { address: string } = Global.useContainer();
  // Trades
  const [trades, setTrades] = useState<Trade[]>([]);

  /**
   * Collect trades from API backend
   */
  const collectTrades = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { trades },
      } = await axios.post("/api/token/trades", {
        address,
      });
      setTrades(trades);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [address]);

  // On address change, collect trades
  useEffect(() => {
    async function run() {
      await collectTrades();
    }

    run();
  }, [address, collectTrades]);

  return (
    <Card title="Recent Token Trades">
      <div className="h-full">
        {loading && (
          <div className="flex mx-auto mt-4 items-center flex-col justify-center w-[calc(100%-2rem)] h-[calc(100%-2rem)] border-2 border-dashed rounded-md">
            <SymbolIcon className="h-12 w-12 animate-spin" />
            <span className="text-lg pt-2">Loading trades...</span>
          </div>
        )}

        {!loading && trades.length === 0 && (
          <div className="flex mt-4 mx-auto items-center flex-col justify-center w-[calc(100%-2rem)] h-[calc(100%-2rem)] border-2 border-dashed rounded-md">
            <CrossCircledIcon className="h-12 w-12" />
            <span className="text-lg pt-2">
              {!address ? "Select an address" : "No trades found"}
            </span>
          </div>
        )}

        {!loading && trades.length > 0 && (
          <Table className="[&_td]:py-0.5">
            <TableHeader>
              <TableRow>
                <TableHead>Hash</TableHead>
                <TableHead>Time Since</TableHead>
                <TableHead>Block #</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <a
                      href={`https://basescan.org/tx/${trade.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {truncateAddress(trade.hash, 6)}
                    </a>
                  </TableCell>
                  <TableCell suppressHydrationWarning={true}>
                    {formatDistance(
                      new Date(trade.timestamp * 1000),
                      new Date(),
                      {
                        addSuffix: true,
                      }
                    )}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://basescan.org/block/${trade.blockNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {trade.blockNumber}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Address address={trade.fromAddress} numTruncate={6} />
                  </TableCell>
                  <TableCell>
                    <Address address={trade.subjectAddress} numTruncate={6} />
                  </TableCell>
                  <TableCell>
                    {trade.isBuy ? "+" : "-"}
                    {trade.amount}
                  </TableCell>
                  <TableCell>
                    {trade.isBuy ? (
                      <span className="text-buy">
                        {(Number(trade.cost) / 1e18).toFixed(6)} ETH
                      </span>
                    ) : (
                      <span className="text-sell">
                        {(Number(trade.cost) / 1e18).toFixed(6)} ETH
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
}