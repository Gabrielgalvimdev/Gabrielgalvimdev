"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { DrawResult, List, Name } from "@/types";
import { Trophy, Gift, Copy, Download, ImageIcon, Loader2 } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { generateResultImage } from "@/ai/flows/generate-result-image-flow";


interface DrawingResultsProps {
  result: DrawResult;
  list: List;
}

const AnimatedWinnerBadge = ({ winner, allNames, delay }: { winner: Name, allNames: string[], delay: number }) => {
    const [displayName, setDisplayName] = useState("...")
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        let animationInterval: NodeJS.Timeout | undefined;
        let animationTimeout: NodeJS.Timeout | undefined;
        
        const startAnimation = () => {
            if (allNames.length === 0) {
                setDisplayName(winner.name);
                setIsRevealed(true);
                return;
            }

            const animationTime = 2000 + Math.random() * 1000; // 2-3 seconds spin
            const updateInterval = 100;

            animationInterval = setInterval(() => {
                const randomIndex = Math.floor(Math.random() * allNames.length);
                setDisplayName(allNames[randomIndex]);
            }, updateInterval);

            animationTimeout = setTimeout(() => {
                if (animationInterval) clearInterval(animationInterval);
                setDisplayName(winner.name);
                setIsRevealed(true);
            }, animationTime);
        };
        
        const revealTimeout = setTimeout(startAnimation, delay);

        return () => {
            clearTimeout(revealTimeout);
            if (animationInterval) clearInterval(animationInterval);
            if (animationTimeout) clearTimeout(animationTimeout);
        };
    }, [winner, allNames, delay]);

    return (
        <div
            className={isRevealed ? "winner-animate" : ""}
            style={{ animationDelay: `0ms` }}
        >
            <Badge 
                variant="default"
                className="bg-accent text-accent-foreground text-lg sm:text-xl font-bold px-4 py-2 sm:px-6 sm:py-3 shadow-lg"
            >
                <span className="inline-block text-center truncate max-w-xs">
                    {displayName}
                </span>
            </Badge>
        </div>
    );
};

const PodiumDisplay = ({ winners }: { winners: Name[] }) => {
    const podiumData = [
        { winner: winners[1], place: "2º", height: "h-24 sm:h-28", color: "bg-slate-300 dark:bg-slate-600", textColor: "text-slate-800 dark:text-slate-100", placeColor: "text-slate-500 dark:text-slate-400", trophyColor: "text-slate-500" },
        { winner: winners[0], place: "1º", height: "h-32 sm:h-40", color: "bg-amber-400 dark:bg-amber-500", textColor: "text-amber-900 dark:text-amber-50", placeColor: "text-amber-600 dark:text-amber-300", trophyColor: "text-amber-500" },
        { winner: winners[2], place: "3º", height: "h-20 sm:h-20", color: "bg-yellow-600/70 dark:bg-yellow-700/80", textColor: "text-yellow-900 dark:text-yellow-100", placeColor: "text-yellow-700 dark:text-yellow-500", trophyColor: "text-yellow-700" }
    ];

    return (
        <div className="flex justify-center items-end gap-1 md:gap-2 text-center w-full max-w-md mx-auto">
            {podiumData.map(({ winner, place, height, color, textColor, placeColor, trophyColor }) => (
                <div key={winner.id} className="flex flex-col items-center w-1/3">
                    <Trophy className={`h-6 w-6 sm:h-8 sm:w-8 ${trophyColor} ${place === '1º' ? 'mb-1 text-amber-400' : 'mb-0'}`} />
                    <span className={`text-2xl sm:text-3xl font-bold ${placeColor}`}>{place}</span>
                    <div className={`flex flex-col justify-center items-center p-2 rounded-t-lg w-full ${height} ${color}`}>
                        <span className={`font-bold truncate w-full px-1 ${textColor}`}>{winner.name}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export function DrawingResults({ result, list }: DrawingResultsProps) {
  const { toast } = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    setGeneratedImage(null);
  }, [result]);

  const listName = list.name;
  const allNames = list.names.map(n => n.name);
  const useAnimation = result.settings.animationEffects ?? true;
  const showPodium = !useAnimation && result.drawnNames.length >= 3;
  const otherWinners = showPodium ? result.drawnNames.slice(3) : [];


  const isSingleWinner = result.drawnNames.length === 1;
  const winnersText = result.drawnNames.map(n => n.name).join(', ');
  const shareText = `🎉 Resultado do Sorteio: ${listName} 🎉\n\n${isSingleWinner ? 'O grande vencedor é' : 'Os vencedores são'}: ${winnersText}`;


  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    toast({ title: "Resultado Copiado!", description: "Você pode colar o resultado onde quiser." });
  };

  const handleShare = (platform: 'whatsapp' | 'telegram') => {
    const encodedText = encodeURIComponent(shareText);
    let url = '';
    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodedText}`;
    } else {
      const appUrl = encodeURIComponent(window.location.href);
      url = `https://t.me/share/url?url=${appUrl}&text=${encodedText}`;
    }
    window.open(url, '_blank');
  };

  const handleGenerateImage = async () => {
    if (!listName) {
      toast({ variant: "destructive", title: "Erro", description: "Nome da lista não encontrado para gerar a imagem." });
      return;
    }
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    try {
      const response = await generateResultImage({
        listName: listName,
        winners: result.drawnNames.map(n => n.name),
      });
      if (response.imageDataUri) {
        setGeneratedImage(response.imageDataUri);
        toast({ title: "Imagem Gerada!", description: "Você pode baixar a imagem do resultado." });
      } else {
        throw new Error("A resposta da API não continha uma imagem.");
      }
    } catch (error) {
      console.error("Image generation failed", error);
      toast({ variant: "destructive", title: "Erro ao Gerar Imagem", description: "Não foi possível gerar a imagem. Tente novamente." });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <Card className="bg-primary/10 border-primary/20 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center text-primary">
          {isSingleWinner ? <Trophy className="mr-2 h-6 w-6" /> : <Gift className="mr-2 h-6 w-6" />}
          Resultado do Sorteio
        </CardTitle>
        <CardDescription>
          {isSingleWinner ? "O grande vencedor é..." : `Os ${result.drawnNames.length} vencedores são...`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {useAnimation ? (
            <div className="flex flex-wrap justify-center gap-4">
            {result.drawnNames.map((name, index) => (
                <AnimatedWinnerBadge 
                    key={name.id}
                    winner={name}
                    allNames={allNames}
                    delay={index * 300}
                />
            ))}
            </div>
        ) : showPodium ? (
            <div className="space-y-6">
                <PodiumDisplay winners={result.drawnNames} />
                {otherWinners.length > 0 && (
                    <div className="text-center pt-6 border-t border-primary/20">
                        <h4 className="font-semibold text-muted-foreground">Demais Sorteados (4º em diante)</h4>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                            {otherWinners.map(winner => (
                                <Badge key={winner.id} variant="secondary">{winner.name}</Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="flex flex-wrap justify-center gap-4">
                {result.drawnNames.map((name, index) => (
                <div
                    key={name.id}
                    className="winner-animate"
                    style={{ animationDelay: `${index * 150}ms` }}
                >
                    <Badge 
                    variant="default"
                    className="bg-accent text-accent-foreground text-lg sm:text-xl font-bold px-4 py-2 sm:px-6 sm:py-3 shadow-lg transform hover:scale-105 transition-transform"
                    >
                    {name.name}
                    </Badge>
                </div>
                ))}
            </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-center gap-4 pt-4">
        <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={handleCopy} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" /> Copiar
            </Button>
            <Button onClick={() => handleShare('whatsapp')} variant="outline" size="sm" className="bg-[#25D366]/20 hover:bg-[#25D366]/30 border-[#25D366]/30 text-green-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                WhatsApp
            </Button>
            <Button onClick={() => handleShare('telegram')} variant="outline" size="sm" className="bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border-[#0088cc]/30 text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m22 2-7 20-4-9-9-4 20-7z"></path><path d="m22 2-11 11"></path></svg>
                Telegram
            </Button>
            <Button onClick={handleGenerateImage} disabled={isGeneratingImage} variant="outline" size="sm">
                {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                {isGeneratingImage ? 'Gerando...' : 'Gerar Imagem'}
            </Button>
        </div>
        {generatedImage && (
            <div className="mt-4 p-4 border rounded-lg bg-background w-full text-center">
                <h4 className="font-semibold mb-2">Sua imagem está pronta!</h4>
                <img src={generatedImage} alt="Resultado do sorteio" className="rounded-md mx-auto max-w-full h-auto shadow-md" />
                <a href={generatedImage} download={`sorteio-${listName.replace(/ /g, '_')}.png`} className="inline-block mt-4">
                    <Button size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Imagem
                    </Button>
                </a>
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
