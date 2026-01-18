"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { List, Name, DrawResult } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Header } from '@/components/sorteador/Header';
import { ListManager } from '@/components/sorteador/ListManager';
import { DrawingPanel } from '@/components/sorteador/DrawingPanel';
import { DrawingResults } from '@/components/sorteador/DrawingResults';
import { DrawingHistory } from '@/components/sorteador/DrawingHistory';
import { StatisticsPanel } from '@/components/sorteador/StatisticsPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarDays, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import { type DateRange } from "react-day-picker";

export function SorteadorApp() {
  const { toast } = useToast();
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [history, setHistory] = useState<DrawResult[]>([]);
  const [lastResult, setLastResult] = useState<DrawResult | null>(null);
  const [historyDateRange, setHistoryDateRange] = useState<DateRange | undefined>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    try {
      const storedLists = localStorage.getItem('sorteador-x-lists');
      const storedHistory = localStorage.getItem('sorteador-x-history');
      
      if (storedLists) {
        const parsedLists: List[] = JSON.parse(storedLists);
        setLists(parsedLists);
        if (parsedLists.length > 0 && !selectedListId) {
          setSelectedListId(parsedLists[0].id);
        }
      }
      
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory).map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })));
      }
    } catch (error) {
      console.error("Falha ao carregar do armazenamento local", error);
      toast({ variant: "destructive", title: "Erro ao Carregar", description: "Não foi possível carregar os dados salvos." });
    }
  }, [isClient, toast]);

  useEffect(() => {
    if (!isClient) return;
    try {
        localStorage.setItem('sorteador-x-lists', JSON.stringify(lists));
    } catch (error) {
        console.error("Falha ao salvar listas no armazenamento local", error);
    }
  }, [lists, isClient]);

  useEffect(() => {
    if (!isClient) return;
    try {
        localStorage.setItem('sorteador-x-history', JSON.stringify(history));
    } catch (error) {
        console.error("Falha ao salvar histórico no armazenamento local", error);
    }
  }, [history, isClient]);

  const selectedList = useMemo(() => lists.find(l => l.id === selectedListId), [lists, selectedListId]);
  
  const listHistory = useMemo(() => {
    if (!selectedListId) return [];
    return history
      .filter(h => h.listId === selectedListId)
      .filter(h => {
        if (!historyDateRange || !historyDateRange.from) return true;
        const to = historyDateRange.to ? new Date(historyDateRange.to) : new Date(historyDateRange.from);
        to.setHours(23, 59, 59, 999);
        const from = new Date(historyDateRange.from);
        from.setHours(0, 0, 0, 0);
        const itemDate = new Date(h.timestamp);
        return itemDate >= from && itemDate <= to;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [history, selectedListId, historyDateRange]);
  
  const resultList = useMemo(() => {
    if (!lastResult) return undefined;
    return lists.find(l => l.id === lastResult.listId);
  }, [lists, lastResult]);

  const handleCreateList = useCallback((name: string, description: string) => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Nome Inválido", description: "O nome da lista não pode estar em branco." });
      return;
    }
    const listExists = lists.some(l => l.name.toLowerCase() === name.toLowerCase());
    if (listExists) {
        toast({ variant: "destructive", title: "Nome Duplicado", description: "Já existe uma lista com este nome." });
        return;
    }
    const newList: List = { id: crypto.randomUUID(), name, description, names: [], drawnNames: [] };
    setLists(prev => [...prev, newList]);
    setSelectedListId(newList.id);
    toast({ title: "Lista Criada!", description: `A lista "${name}" foi criada com sucesso.` });
  }, [toast, lists]);

  const updateList = useCallback((updatedList: List) => {
    setLists(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
  }, []);

  const handleRenameList = useCallback((listId: string, newName: string) => {
    if (!newName.trim()) {
      toast({ variant: "destructive", title: "Nome Inválido", description: "O nome da lista não pode estar em branco." });
      return;
    }
    const listExists = lists.some(l => l.name.toLowerCase() === newName.toLowerCase() && l.id !== listId);
    if (listExists) {
        toast({ variant: "destructive", title: "Nome Duplicado", description: "Já existe uma lista com este nome." });
        return;
    }
    setLists(prev => prev.map(l => l.id === listId ? { ...l, name: newName } : l));
    toast({ title: "Lista Renomeada!", description: `A lista foi renomeada para "${newName}".` });
  }, [lists, toast]);

  const handleDeleteList = useCallback((listId: string) => {
    const listToDelete = lists.find(l => l.id === listId);
    if (!listToDelete) return;

    setLists(prev => {
        const newLists = prev.filter(l => l.id !== listId);
        if (selectedListId === listId) {
            setSelectedListId(newLists.length > 0 ? newLists[0].id : null);
        }
        return newLists;
    });
    setHistory(prev => prev.filter(h => h.listId !== listId));
    toast({ title: "Lista Excluída!", description: `A lista "${listToDelete.name}" foi excluída.` });
  }, [lists, selectedListId, toast]);

  const handleDuplicateList = useCallback((listId: string) => {
    const listToDuplicate = lists.find(l => l.id === listId);
    if (!listToDuplicate) {
        toast({ variant: "destructive", title: "Erro", description: "Lista não encontrada para duplicação." });
        return;
    }

    let newName = `${listToDuplicate.name} (Cópia)`;
    let counter = 1;
    // Check if a list with the same name already exists and find a unique name
    while (lists.some(l => l.name.toLowerCase() === newName.toLowerCase())) {
        counter++;
        newName = `${listToDuplicate.name} (Cópia ${counter})`;
    }

    const newList: List = {
      id: crypto.randomUUID(),
      name: newName,
      description: listToDuplicate.description,
      names: listToDuplicate.names.map(name => ({...name})), // Deep enough copy for names
      drawnNames: [], // Reset drawn names for the new list
    };
    
    setLists(prev => [...prev, newList]);
    setSelectedListId(newList.id);
    toast({ title: "Lista Duplicada!", description: `A lista "${newName}" foi criada com sucesso.` });
  }, [lists, toast]);

  const handleAddName = useCallback((name: string) => {
    if (!selectedList) return;
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Nome Inválido", description: "O nome não pode estar em branco." });
      return;
    }
    if (selectedList.names.some(n => n.name.toLowerCase() === name.toLowerCase())) {
        toast({ variant: "destructive", title: "Nome Duplicado", description: "Este nome já existe na lista." });
        return;
    }
    const newName: Name = { id: crypto.randomUUID(), name };
    const updatedList = { ...selectedList, names: [...selectedList.names, newName] };
    updateList(updatedList);
  }, [selectedList, updateList, toast]);

  const handleImportNames = useCallback((namesString: string) => {
    if (!selectedList) return;
    const names = namesString.split(/[\n,]/).map(n => n.trim()).filter(Boolean);
    const newNames = names
      .filter(name => !selectedList.names.some(existing => existing.name.toLowerCase() === name.toLowerCase()))
      .map(name => ({ id: crypto.randomUUID(), name }));
    
    if (newNames.length === 0) {
        toast({ title: "Nenhum nome novo", description: "Todos os nomes importados já estavam na lista." });
        return;
    }

    const updatedList = { ...selectedList, names: [...selectedList.names, ...newNames] };
    updateList(updatedList);
    toast({ title: "Nomes Importados", description: `${newNames.length} novos nomes foram adicionados.` });
  }, [selectedList, updateList, toast]);

  const handleDeleteName = useCallback((nameId: string) => {
    if (!selectedList) return;
    const updatedList = { ...selectedList, names: selectedList.names.filter(n => n.id !== nameId) };
    updateList(updatedList);
  }, [selectedList, updateList]);

  const handleResetList = useCallback(() => {
    if (!selectedList) return;
    const updatedList = { ...selectedList, drawnNames: [] };
    updateList(updatedList);
    toast({ title: "Lista Resetada", description: "O histórico de sorteios 'Modo Justo' foi reiniciado." });
  }, [selectedList, updateList, toast]);

  const handleDraw = useCallback((quantity: number, withReplacement: boolean, fairMode: boolean, dryRun: boolean, animationEffects: boolean) => {
    if (!selectedList || selectedList.names.length === 0) {
      toast({ variant: "destructive", title: "Lista Vazia", description: "Adicione nomes à lista antes de sortear." });
      return;
    }

    let pool = [...selectedList.names];
    if (fairMode && !withReplacement) {
        const unDrawnIds = selectedList.names.map(n => n.id).filter(id => !selectedList.drawnNames.includes(id));
        if (unDrawnIds.length < quantity) {
            toast({ title: "Modo Justo: Reiniciando", description: "Todos os nomes foram sorteados. Reiniciando o ciclo." });
            if (!dryRun) {
                const updatedList = { ...selectedList, drawnNames: [] };
                updateList(updatedList);
            }
            pool = [...selectedList.names];
        } else {
            pool = selectedList.names.filter(n => unDrawnIds.includes(n.id));
        }
    }
    
    if (pool.length < quantity && !withReplacement) {
        toast({ variant: "destructive", title: "Nomes Insuficientes", description: `Não há nomes suficientes para sortear ${quantity} sem reposição.` });
        return;
    }

    const drawnNames: Name[] = [];
    let tempPool = [...pool];

    for (let i = 0; i < quantity; i++) {
        if (tempPool.length === 0) break;
        const randomIndex = Math.floor(Math.random() * tempPool.length);
        const winner = tempPool[randomIndex];
        drawnNames.push(winner);
        if (!withReplacement) {
            tempPool.splice(randomIndex, 1);
        }
    }
    
    const result: DrawResult = {
        id: crypto.randomUUID(),
        listId: selectedList.id,
        drawnNames,
        timestamp: new Date(),
        settings: { quantity, withReplacement, fairMode, animationEffects },
    };
    
    setLastResult(result);

    if (!dryRun) {
        setHistory(prev => [result, ...prev]);
        if (fairMode && !withReplacement) {
            const drawnIds = drawnNames.map(n => n.id);
            const updatedList = { ...selectedList, drawnNames: [...new Set([...selectedList.drawnNames, ...drawnIds])] };
            updateList(updatedList);
        }
        toast({ title: "Sorteio Realizado!", description: `${drawnNames.length} nomes foram sorteados.` });
    } else {
        toast({ title: "Simulação de Sorteio", description: "Este resultado não foi salvo." });
    }
  }, [selectedList, updateList, toast]);

  const handleClearHistory = () => {
    if (!selectedList) return;
    setHistory(prev => prev.filter(h => h.listId !== selectedList.id));
    toast({ title: "Histórico Limpo", description: `O histórico de sorteios para "${selectedList.name}" foi apagado.` });
  };

  const handleExportCSV = () => {
    if (!selectedList || listHistory.length === 0) {
      toast({ variant: "destructive", title: "Nada para exportar", description: "Não há histórico para exportar." });
      return;
    }

    const headers = ["Data/Hora", "Nomes Sorteados", "Quantidade", "Com Reposição", "Modo Justo"];
    const rows = listHistory.map(draw => [
      `"${new Date(draw.timestamp).toLocaleString('pt-BR')}"`,
      `"${draw.drawnNames.map(n => n.name).join(', ')}"`,
      draw.drawnNames.length,
      draw.settings.withReplacement ? "Sim" : "Não",
      draw.settings.fairMode ? "Sim" : "Não"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historico_${selectedList.name.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exportado com Sucesso", description: "O arquivo CSV foi baixado." });
  };

  const handleExportPDF = () => {
      toast({ title: "Em breve!", description: "A exportação para PDF está em desenvolvimento." });
  };

  if (!isClient) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                {/* Você pode adicionar um esqueleto de carregamento aqui se desejar */}
            </main>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
            <ListManager
              lists={lists}
              selectedList={selectedList}
              onSelectList={setSelectedListId}
              onCreateList={handleCreateList}
              onRenameList={handleRenameList}
              onDeleteList={handleDeleteList}
              onDuplicateList={handleDuplicateList}
              onAddName={handleAddName}
              onImportNames={handleImportNames}
              onDeleteName={handleDeleteName}
              onResetList={handleResetList}
            />
          </div>

          <div className="lg:col-span-2 space-y-8">
            {selectedList ? (
                <>
                    <DrawingPanel list={selectedList} onDraw={handleDraw} />
                    
                    {lastResult && resultList && <DrawingResults result={lastResult} list={resultList} />}

                    <Card>
                        <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                            <CardTitle>Histórico de Sorteios</CardTitle>
                            <CardDescription>Sorteios realizados para a lista "{selectedList.name}".</CardDescription>
                            </div>
                            <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={'outline'} className="w-full sm:w-auto justify-start text-left font-normal">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {historyDateRange?.from ? (
                                    historyDateRange.to ? (
                                    <>
                                        {new Date(historyDateRange.from).toLocaleDateString('pt-BR')} - {new Date(historyDateRange.to).toLocaleDateString('pt-BR')}
                                    </>
                                    ) : (
                                    new Date(historyDateRange.from).toLocaleDateString('pt-BR')
                                    )
                                ) : (
                                    <span>Filtrar por data</span>
                                )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={historyDateRange?.from}
                                selected={historyDateRange}
                                onSelect={setHistoryDateRange}
                                numberOfMonths={2}
                                />
                            </PopoverContent>
                            </Popover>
                        </div>
                        </CardHeader>
                        <CardContent>
                        <DrawingHistory history={listHistory} />
                        </CardContent>
                        <CardFooter className="flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                        <Button onClick={handleExportCSV} variant="outline" size="sm" disabled={listHistory.length === 0}><FileSpreadsheet className="mr-2 h-4 w-4" />Exportar CSV</Button>
                        <Button onClick={handleExportPDF} variant="outline" size="sm" disabled={listHistory.length === 0}><FileText className="mr-2 h-4 w-4" />Exportar PDF</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={history.filter(h => h.listId === selectedList.id).length === 0}><Trash2 className="mr-2 h-4 w-4" />Limpar Histórico</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Limpeza</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tem certeza que deseja apagar todo o histórico de sorteios para a lista "{selectedList.name}"? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearHistory}>Confirmar e Limpar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </CardFooter>
                    </Card>

                    <StatisticsPanel list={selectedList} history={listHistory} />
                </>
            ) : (
                <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Nenhuma lista selecionada</CardTitle>
                        <CardDescription>Crie ou selecione uma lista para ver o painel de sorteio e o histórico.</CardDescription>
                    </CardHeader>
                </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

    