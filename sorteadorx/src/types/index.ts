export interface Name {
  id: string;
  name: string;
}

export interface List {
  id: string;
  name: string;
  description: string;
  names: Name[];
  drawnNames: string[]; // Armazena IDs de nomes sorteados para o modo justo
}

export interface DrawResult {
  id: string;
  listId: string;
  drawnNames: Name[];
  timestamp: Date;
  settings: {
    quantity: number;
    withReplacement: boolean;
    fairMode: boolean;
    animationEffects?: boolean;
  };
}
