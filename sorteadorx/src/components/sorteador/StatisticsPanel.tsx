"use client";

import { useMemo } from 'react';
import type { List, DrawResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Trophy, Percent, Hash } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface StatisticsPanelProps {
  list: List | undefined;
  history: DrawResult[];
}

export function StatisticsPanel({ list, history }: StatisticsPanelProps) {
  const stats = useMemo(() => {
    if (!list || list.names.length === 0) {
      return {
        totalDraws: 0,
        mostFrequentWinners: [],
        winDistribution: [],
        participantPerformance: [],
      };
    }

    const winCounts = new Map<string, number>();
    list.names.forEach(name => winCounts.set(name.name, 0));

    let totalWinnersDrawn = 0;
    history.forEach(draw => {
      draw.drawnNames.forEach(winner => {
        // Handle cases where a name might have been deleted but is still in history
        if (winCounts.has(winner.name)) {
            totalWinnersDrawn++;
            const currentWins = winCounts.get(winner.name) ?? 0;
            winCounts.set(winner.name, currentWins + 1);
        }
      });
    });

    let maxWins = 0;
    winCounts.forEach(count => {
      if (count > maxWins) {
        maxWins = count;
      }
    });
    
    const mostFrequentWinners: string[] = [];
    if (maxWins > 0) {
        winCounts.forEach((count, name) => {
            if (count === maxWins) {
                mostFrequentWinners.push(name);
            }
        });
    }

    const winDistribution = Array.from(winCounts.entries())
      .map(([name, wins]) => ({ name, vitórias: wins }))
      .filter(item => item.vitórias > 0)
      .sort((a, b) => b.vitórias - a.vitórias);

    const participantPerformance = list.names.map(name => {
      const wins = winCounts.get(name.name) ?? 0;
      const winPercentage = totalWinnersDrawn > 0 ? (wins / totalWinnersDrawn) * 100 : 0;
      return {
        id: name.id,
        name: name.name,
        wins: wins,
        winPercentage: parseFloat(winPercentage.toFixed(1)),
      }
    }).sort((a,b) => b.wins - a.wins);

    return {
      totalDraws: history.length,
      mostFrequentWinners,
      winDistribution,
      participantPerformance
    };
  }, [list, history]);

  if (!list || list.names.length === 0) {
    return null;
  }

  const chartConfig = {
    vitórias: {
      label: "Vitórias",
      color: "hsl(var(--primary))",
    },
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas da Lista</CardTitle>
        <CardDescription>Análise dos resultados dos sorteios para "{list.name}".</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {history.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-card rounded-lg border">
                    <Hash className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">{stats.totalDraws}</p>
                    <p className="text-sm text-muted-foreground">Total de Sorteios</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                    <Trophy className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-lg font-bold truncate h-7">{stats.mostFrequentWinners.length > 0 ? stats.mostFrequentWinners.join(', ') : 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">Quem Mais Ganhou</p>
                </div>
            </div>

            {stats.winDistribution.length > 0 && (
                 <div>
                    <h3 className="text-lg font-semibold mb-4">Distribuição de Vitórias</h3>
                    <ChartContainer config={chartConfig} className="h-64 w-full">
                        <BarChart accessibilityLayer data={stats.winDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis
                                dataKey="vitórias"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                allowDecimals={false}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="vitórias" fill="var(--color-vitórias)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </div>
            )}
           
            {stats.participantPerformance.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><Percent className="mr-2 h-5 w-5"/>Desempenho dos Participantes</h3>
                    <ScrollArea className="h-64">
                        <div className="space-y-4 pr-4">
                            {stats.participantPerformance.map(p => (
                                <div key={p.id} className="text-sm">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-medium truncate pr-2">{p.name}</span>
                                        <span className="text-muted-foreground">{p.wins} vitórias ({p.winPercentage}%)</span>
                                    </div>
                                    <Progress value={p.winPercentage} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Nenhum sorteio realizado para esta lista ainda.</p>
            <p className="text-xs">Realize sorteios para ver as estatísticas.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
