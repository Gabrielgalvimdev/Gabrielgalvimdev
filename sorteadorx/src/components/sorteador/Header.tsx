"use client";

import Link from 'next/link';
import { Ticket, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeCustomizer } from "@/components/theme-customizer";

export function Header() {
  return (
    <header className="bg-card/80 backdrop-blur-lg sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
                <Ticket className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-foreground tracking-tight">
              SorteadorX
            </h1>
          </Link>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeCustomizer />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Sobre">
                  <Info className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">O que é?</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>O que é o SorteadorX?</DialogTitle>
                  <DialogDescription className="pt-2">
                  SorteadorX é uma ferramenta online e gratuita para criar listas de nomes e realizar sorteios de forma simples e customizável. Perfeito para eventos, promoções, ou qualquer situação onde você precise de um sorteio justo e transparente.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Como usar">
                  <HelpCircle className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Como usar</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Como Usar o SorteadorX</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-muted-foreground mt-4">
                    <ol className="space-y-4 list-decimal list-inside">
                        <li>
                            <strong>Crie uma Lista:</strong> Na seção "Gerenciar Listas", vá para a aba "Criar Nova", dê um nome para sua lista e clique em "Criar Lista".
                        </li>
                        <li>
                            <strong>Adicione Nomes:</strong> Com a lista selecionada, você pode adicionar nomes um por um ou importar vários nomes de uma vez (separados por vírgula ou quebra de linha).
                        </li>
                        <li>
                            <strong>Configure o Sorteio:</strong> No "Painel de Sorteio", defina quantos nomes serão sorteados. Escolha opções como "sorteio com reposição" ou o "Modo Justo" (que garante que todos sejam sorteados antes de repetir).
                        </li>
                        <li>
                            <strong>Sorteie!</strong> Clique no botão "Sortear". Os vencedores aparecerão em destaque!
                        </li>
                        <li>
                            <strong>Consulte o Histórico:</strong> Cada sorteio (exceto simulações) é salvo no histórico da lista para sua conferência.
                        </li>
                    </ol>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  );
}
