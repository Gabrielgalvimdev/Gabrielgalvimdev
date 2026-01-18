"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DrawResult } from "@/types";
import { History, Users, Tag, CheckCircle, XCircle, Repeat, Scale } from "lucide-react";

interface DrawingHistoryProps {
  history: DrawResult[];
}

export function DrawingHistory({ history }: DrawingHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <History className="mx-auto h-12 w-12 mb-4" />
        <p>Nenhum sorteio encontrado para esta lista ou período.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-96">
      <Accordion type="single" collapsible className="w-full">
        {history.map((draw, index) => (
          <AccordionItem value={`item-${index}`} key={draw.id}>
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex flex-col text-left">
                  <span className="font-semibold">{draw.drawnNames.length} nome(s) sorteado(s)</span>
                  <span className="text-xs text-muted-foreground">{new Date(draw.timestamp).toLocaleString('pt-BR')}</span>
                </div>
                {draw.settings.fairMode && <Badge variant="secondary" className="hidden sm:inline-flex"><Scale className="mr-1 h-3 w-3" />Modo Justo</Badge>}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center"><Users className="mr-2 h-4 w-4" />Nomes Sorteados:</h4>
                  <div className="flex flex-wrap gap-2">
                    {draw.drawnNames.map((name) => (
                      <Badge key={name.id} variant="outline" className="text-sm">{name.name}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2 flex items-center"><Tag className="mr-2 h-4 w-4" />Configurações:</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center">{draw.settings.withReplacement ? <CheckCircle className="text-green-500 mr-2 h-4 w-4" /> : <XCircle className="text-red-500 mr-2 h-4 w-4" />} Com Reposição</p>
                        <p className="flex items-center">{draw.settings.fairMode ? <CheckCircle className="text-green-500 mr-2 h-4 w-4" /> : <XCircle className="text-red-500 mr-2 h-4 w-4" />} Modo Justo</p>
                    </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  );
}
