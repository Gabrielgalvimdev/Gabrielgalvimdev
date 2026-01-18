"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Upload, Trash2, List, Users, RotateCcw, Settings, Copy, FilePenLine, Search } from 'lucide-react';
import type { List as ListType } from '@/types';

interface ListManagerProps {
  lists: ListType[];
  selectedList: ListType | undefined;
  onSelectList: (id: string) => void;
  onCreateList: (name: string, description: string) => void;
  onRenameList: (id: string, newName: string) => void;
  onDeleteList: (id: string) => void;
  onDuplicateList: (id: string) => void;
  onAddName: (name: string) => void;
  onImportNames: (names: string) => void;
  onDeleteName: (id: string) => void;
  onResetList: () => void;
}

export function ListManager({ 
  lists, 
  selectedList, 
  onSelectList, 
  onCreateList,
  onRenameList,
  onDeleteList, 
  onDuplicateList,
  onAddName, 
  onImportNames, 
  onDeleteName, 
  onResetList 
}: ListManagerProps) {
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newSingleName, setNewSingleName] = useState('');
  const [importedNames, setImportedNames] = useState('');
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameListName, setRenameListName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    if (selectedList && isRenameDialogOpen) {
        setRenameListName(selectedList.name);
    }
  }, [isRenameDialogOpen, selectedList]);

  React.useEffect(() => {
    // Reset search term when list changes
    setSearchTerm('');
  }, [selectedList]);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateList(newListName, newListDesc);
    setNewListName('');
    setNewListDesc('');
  };

  const handleAddName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSingleName.trim()) return;
    onAddName(newSingleName);
    setNewSingleName('');
  };

  const handleRenameSubmit = () => {
    if (selectedList && renameListName.trim()) {
        onRenameList(selectedList.id, renameListName);
        setIsRenameDialogOpen(false);
    }
  };

  const handleDeleteList = () => {
    if (selectedList) {
        onDeleteList(selectedList.id);
    }
  };

  const handleDuplicateList = () => {
    if (selectedList) {
        onDuplicateList(selectedList.id);
    }
  };

  const filteredNames = React.useMemo(() => {
    if (!selectedList) return [];
    if (!searchTerm.trim()) return selectedList.names;
    return selectedList.names.filter(name =>
        name.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedList, searchTerm]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><List className="mr-2 h-6 w-6" />Gerenciar Listas</CardTitle>
        <CardDescription>Crie, selecione e adicione nomes às suas listas de sorteio.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="select">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Gerenciar</TabsTrigger>
            <TabsTrigger value="create">Criar Nova</TabsTrigger>
          </TabsList>
          <TabsContent value="select" className="pt-4 space-y-4">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="flex-grow">
                        <Select onValueChange={onSelectList} value={selectedList?.id || ''} disabled={lists.length === 0}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma lista..." />
                        </SelectTrigger>
                        <SelectContent>
                            {lists.map(list => (
                            <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    {selectedList && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Configurações da Lista</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={handleDuplicateList}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    <span>Duplicar Lista</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setIsRenameDialogOpen(true)}>
                                    <FilePenLine className="mr-2 h-4 w-4" />
                                    <span>Renomear Lista</span>
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Excluir Lista</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Você quer mesmo excluir a lista "{selectedList.name}"? Todo o seu conteúdo e histórico serão perdidos para sempre.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteList}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Excluir
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                 {lists.length === 0 && <p className="text-sm text-muted-foreground mt-2 text-center">Nenhuma lista encontrada. Crie uma na aba "Criar Nova".</p>}
            </div>
            
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Renomear Lista</DialogTitle>
                    </DialogHeader>
                    <div className="pt-4 space-y-4">
                        <Input
                            value={renameListName}
                            onChange={(e) => setRenameListName(e.target.value)}
                            placeholder="Novo nome da lista"
                            required
                        />
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setIsRenameDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleRenameSubmit}>Salvar Alterações</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

          </TabsContent>
          <TabsContent value="create" className="pt-4">
            <form onSubmit={handleCreateList} className="space-y-4">
              <Input placeholder="Nome da lista" value={newListName} onChange={(e) => setNewListName(e.target.value)} required />
              <Textarea placeholder="Descrição (opcional)" value={newListDesc} onChange={(e) => setNewListDesc(e.target.value)} />
              <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" />Criar Lista</Button>
            </form>
          </TabsContent>
        </Tabs>

        {selectedList && (
          <>
            <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold flex items-center mb-4"><Users className="mr-2 h-5 w-5" />Nomes na Lista ({filteredNames.length} / {selectedList.names.length})</h3>
                <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar nome na lista..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                        disabled={selectedList.names.length === 0}
                    />
                </div>
                <ScrollArea className="h-48 w-full rounded-md border p-2">
                    {selectedList.names.length > 0 ? (
                        filteredNames.length > 0 ? (
                            <ul className="space-y-1">
                                {filteredNames.map(name => (
                                    <li key={name.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50">
                                        <span className="truncate pr-2">{name.name}</span>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja remover "{name.name}" da lista?</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteName(name.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum nome encontrado para "{searchTerm}".</p>
                        )
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum nome na lista.</p>
                    )}
                </ScrollArea>
                <div className="mt-2 text-right">
                    <Button onClick={onResetList} variant="link" size="sm" className="text-muted-foreground">
                        <RotateCcw className="mr-2 h-3 w-3" />
                        Resetar 'Modo Justo' ({selectedList.drawnNames.length} sorteados)
                    </Button>
                </div>
            </div>

            <div className="mt-4 space-y-4 border-t pt-4">
                <form onSubmit={handleAddName} className="flex gap-2">
                    <Input placeholder="Adicionar um nome" value={newSingleName} onChange={(e) => setNewSingleName(e.target.value)} required />
                    <Button type="submit" size="icon" variant="outline"><PlusCircle className="h-4 w-4" /></Button>
                </form>

                <div>
                    <Textarea id="import" placeholder="Importar nomes (separados por vírgula ou linha)..." value={importedNames} onChange={(e) => setImportedNames(e.target.value)} className="mt-1" />
                    <Button onClick={() => { onImportNames(importedNames); setImportedNames(''); }} className="w-full mt-2" variant="secondary"><Upload className="mr-2 h-4 w-4" />Importar Nomes</Button>
                </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
