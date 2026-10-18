
import { Carro } from "./Carro.js";

// Classe responsável pelo carro do jogador
export class CarroJogador extends Carro {
    constructor() {
        super(180, 490, "#32a8ff", "assets/cars/car_blue_1.png");
        this.velocidade = 5;
    }

    atualizar(teclas) {
        // Movimentação para a esquerda
        if (teclas["ArrowLeft"] || teclas["a"]) {
            this.x -= this.velocidade;
        }

        // Movimentação para a direita
        if (teclas["ArrowRight"] || teclas["d"]) {
            this.x += this.velocidade;
        }

        // Impede que o carro saia da pista
        this.x = Math.max(65, this.x);
        this.x = Math.min(295, this.x);
    }
}

