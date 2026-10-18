
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

        // Imagens disponíveis para os carros inimigos
        const imagens = [
            "assets/cars/car_red_2.png",
            "assets/cars/car_green_3.png",
            "assets/cars/car_yellow_5.png",
            "assets/cars/car_black_4.png"
        ];

        // Escolhe uma imagem aleatoriamente
        const imagemAleatoria = imagens[
            Math.floor(Math.random() * imagens.length)
        ];

        // Chama o construtor da classe Carro
        super(faixa, -80, "#ff4545", imagemAleatoria);
    }

    desenhar(ctx) {
        // Salva as configurações do Canvas
        ctx.save();

        // Move a origem para o centro do carro
        ctx.translate(
            this.x + this.largura / 2,
            this.y + this.altura / 2
        );

        // Gira o carro inimigo em 180 graus
        ctx.rotate(Math.PI);

        // Retorna a origem para a posição anterior
        ctx.translate(
            -(this.x + this.largura / 2),
            -(this.y + this.altura / 2)
        );

        // Reutiliza o método desenhar da classe Carro
        super.desenhar(ctx);

        // Restaura as configurações do Canvas
        ctx.restore();
    }

    atualizar(velocidade) {
        // Move o carro inimigo para baixo
        this.y += velocidade;
    }
}
