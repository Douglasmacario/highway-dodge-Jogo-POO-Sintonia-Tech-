
import { Carro } from "./Carro.js";

export class CarroJogador extends Carro {
    constructor() {
        super(
            260,
            490,
            "#32a8ff",
            "assets/cars/car_blue_1.png"
        );

        this.largura = 48;
        this.altura = 82;

        this.velocidadeLateral = 5;
        this.velocidadeFrente = 2;
        this.velocidadeTras = 3;

        this.limiteEsquerdo = 65;
        this.limiteDireito = 295;

        this.limiteSuperior = 20;
        this.limiteInferior = 510;
    }

    atualizar(teclas) {
        let movimentoX = 0;
        let movimentoY = 0;

        if (teclas["ArrowLeft"] || teclas["a"]) {
            movimentoX -= this.velocidadeLateral;
        }

        if (teclas["ArrowRight"] || teclas["d"]) {
            movimentoX += this.velocidadeLateral;
        }

        if (teclas["ArrowUp"] || teclas["w"]) {
            movimentoY -= this.velocidadeFrente;
        }

        if (teclas["ArrowDown"] || teclas["s"]) {
            movimentoY += this.velocidadeTras;
        }

        // Evita movimento diagonal exagerado
        if (movimentoX !== 0 && movimentoY !== 0) {
            movimentoX *= Math.SQRT1_2;
            movimentoY *= Math.SQRT1_2;
        }

        this.x += movimentoX;
        this.y += movimentoY;

        // Mantém o carro dentro da pista
        this.x = Math.max(
            this.limiteEsquerdo,
            Math.min(this.limiteDireito, this.x)
        );

        this.y = Math.max(
            this.limiteSuperior,
            Math.min(this.limiteInferior, this.y)
        );
    }

    estaNoTopo() {
        return this.y <= this.limiteSuperior + 0.5;
    }
}
