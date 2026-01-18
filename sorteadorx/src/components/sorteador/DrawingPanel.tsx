"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Ticket, HelpCircle, Repeat, Scale, TestTube2, CheckCircle, XCircle, Sparkles } from "lucide-react";
import type { List as ListType } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';

interface DrawingPanelProps {
  list: ListType | undefined;
  onDraw: (quantity: number, withReplacement: boolean, fairMode: boolean, dryRun: boolean, animationEffects: boolean) => void;
}

export function DrawingPanel({ list, onDraw }: DrawingPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [withReplacement, setWithReplacement] = useState(false);
  const [fairMode, setFairMode] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [animationEffects, setAnimationEffects] = useState(true);

  const handleDrawClick = () => {
    onDraw(quantity, withReplacement, fairMode, dryRun, animationEffects);
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setQuantity(value);
    } else {
      setQuantity(1);
    }
  };

  if (!list) {
    return null;
  }
  
  let poolSize = list.names.length;
  if (fairMode && !withReplacement) {
    const unDrawnIds = list.names.map(n => n.id).filter(id => !list.drawnNames.includes(id));
    if (unDrawnIds.length >= quantity) {
      poolSize = unDrawnIds.length;
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Ticket className="mr-2 h-6 w-6" />Painel de Sorteio</CardTitle>
        <CardDescription>Configure e realize o sorteio para a lista "{list.name}".</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantos nomes sortear?</Label>
          <Input 
            id="quantity" 
            type="number" 
            value={quantity} 
            onChange={handleQuantityChange} 
            min="1" 
            className="max-w-xs"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="with-replacement" className="flex items-center">
              <Repeat className="mr-2 h-4 w-4" />
              Sorteio com reposição
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="ml-2 h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent><p>Permite que o mesmo nome seja sorteado mais de uma vez.</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="flex items-center gap-3">
              <Switch 
                id="with-replacement" 
                checked={withReplacement} 
                onCheckedChange={setWithReplacement} 
                disabled={fairMode}
                className="data-[state=checked]:bg-green-500"
              />
              <span className={`w-20 text-sm font-medium ${withReplacement ? 'text-green-500' : 'text-muted-foreground'}`}>{withReplacement ? 'Ativado' : 'Desativado'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="fair-mode" className="flex items-center">
              <Scale className="mr-2 h-4 w-4" />
              Modo Justo
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="ml-2 h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent><p>Garante que todos sejam sorteados uma vez antes de repetir.</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="flex items-center gap-3">
              <Switch 
                id="fair-mode" 
                checked={fairMode} 
                onCheckedChange={(checked) => { setFairMode(checked); if (checked) setWithReplacement(false); }}
                className="data-[state=checked]:bg-green-500"
              />
              <span className={`w-20 text-sm font-medium ${fairMode ? 'text-green-500' : 'text-muted-foreground'}`}>{fairMode ? 'Ativado' : 'Desativado'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dry-run" className="flex items-center">
              <TestTube2 className="mr-2 h-4 w-4" />
              Simular sorteio (Dry Run)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="ml-2 h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent><p>Executa o sorteio, mas não salva o resultado no histórico.</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="flex items-center gap-3">
              <Switch 
                id="dry-run" 
                checked={dryRun} 
                onCheckedChange={setDryRun}
                className="data-[state=checked]:bg-green-500"
              />
              <span className={`w-20 text-sm font-medium ${dryRun ? 'text-green-500' : 'text-muted-foreground'}`}>{dryRun ? 'Ativado' : 'Desativado'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="animation-effects" className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                Efeitos de Animação
                <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="ml-2 h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent><p>Exibe animações ao revelar o vencedor.</p></TooltipContent>
                </Tooltip>
                </TooltipProvider>
            </Label>
            <div className="flex items-center gap-3">
              <Switch 
                id="animation-effects" 
                checked={animationEffects} 
                onCheckedChange={setAnimationEffects}
                className="data-[state=checked]:bg-green-500"
              />
              <span className={`w-20 text-sm font-medium ${animationEffects ? 'text-green-500' : 'text-muted-foreground'}`}>{animationEffects ? 'Ativado' : 'Desativado'}</span>
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full font-bold text-lg py-6" size="lg" disabled={list.names.length === 0}>
              <Ticket className="mr-2 h-5 w-5" />
              Sortear
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Sorteio</AlertDialogTitle>
              <AlertDialogDescription>
                Você está prestes a realizar um sorteio com as seguintes configurações. Por favor, confirme.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="text-sm space-y-3 my-4">
               <div className="font-semibold"><strong>Lista:</strong> {list.name}</div>
               <div className="font-semibold"><strong>Nomes a sortear:</strong> {quantity}</div>
               <div className="font-semibold"><strong>Participantes no sorteio:</strong> {poolSize} de {list.names.length}</div>
               <Separator className="my-2" />
               <div className="flex items-center justify-between">
                   <span>Com Reposição:</span>
                   <div className={`flex items-center gap-2 font-medium ${withReplacement ? 'text-green-500' : 'text-slate-500'}`}>
                       {withReplacement ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                       {withReplacement ? "Sim" : "Não"}
                   </div>
               </div>
               <div className="flex items-center justify-between">
                   <span>Modo Justo:</span>
                   <div className={`flex items-center gap-2 font-medium ${fairMode ? 'text-green-500' : 'text-slate-500'}`}>
                       {fairMode ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                       {fairMode ? "Sim" : "Não"}
                   </div>
               </div>
               <div className="flex items-center justify-between">
                   <span>Simulação (Dry Run):</span>
                   <div className={`flex items-center gap-2 font-medium ${dryRun ? 'text-green-500' : 'text-slate-500'}`}>
                       {dryRun ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                       {dryRun ? "Sim" : "Não"}
                   </div>
               </div>
               <div className="flex items-center justify-between">
                   <span>Efeitos de Animação:</span>
                   <div className={`flex items-center gap-2 font-medium ${animationEffects ? 'text-green-500' : 'text-slate-500'}`}>
                       {animationEffects ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                       {animationEffects ? "Sim" : "Não"}
                   </div>
               </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDrawClick}>Confirmar e Sortear</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </CardContent>
    </Card>
  );
}
