
import { Carro } from "./Carro.js";

// Classe responsável pelos carros adversários
export class CarroInimigo extends Carro {
    constructor() {
        // Define as posições das três faixas
        const faixas = [85, 180, 275];

        // Escolhe uma faixa aleatoriamente
        const faixa = faixas[
            Math.floor(Math.random() * faixas.length)
        ];

        // Chama o construtor da classe Carro
        super(faixa, -80, "#ff4545");
    }

    atualizar(velocidade) {
        // Move o carro inimigo para baixo
        this.y += velocidade;
    }
}
