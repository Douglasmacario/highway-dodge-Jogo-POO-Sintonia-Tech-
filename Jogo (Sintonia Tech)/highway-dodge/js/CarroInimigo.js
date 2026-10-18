
import { Carro } from "./Carro.js";

export class CarroInimigo extends Carro {
    constructor() {
        // Quatro faixas da rodovia
        const faixas = [
            { x: 90, sentido: "contrario" },
            { x: 150, sentido: "contrario" },
            { x: 210, sentido: "mesmo" },
            { x: 270, sentido: "mesmo" }
        ];

        // Escolhe uma faixa aleatória
        const faixa = faixas[
            Math.floor(Math.random() * faixas.length)
        ];

        // Veículos que aparecem no trânsito
        const veiculos = [
            {
                imagem: "Car_Lancia_Delta_Integrale_Yellow_86x145.png",
                largura: 48,
                altura: 82
            },
            {
                imagem: "Car_Lancia_Delta_Integrale_Police_86x145.png",
                largura: 48,
                altura: 82
            },
            {
                imagem: "Car_AM_General_Hummer_98x164.png",
                largura: 48,
                altura: 82
            },
            {
                imagem: "Truck_A_139x353.png",
                largura: 48,
                altura: 122
            },
            {
                imagem: "Truck_B_139x353.png",
                largura: 48,
                altura: 122
            }
        ];

        // Escolhe um veículo aleatório
        const veiculo = veiculos[
            Math.floor(Math.random() * veiculos.length)
        ];

        // Centraliza o veículo na faixa
        const x = faixa.x + (40 - veiculo.largura) / 2;

        // Faz o veículo nascer fora da tela
        const y = -veiculo.altura;

        super(
            x,
            y,
            "#ff4545",
            `assets/cars/transito/${veiculo.imagem}`
        );

        // Define o tamanho do veículo
        this.largura = veiculo.largura;
        this.altura = veiculo.altura;

        // Define o sentido da faixa
        this.sentido = faixa.sentido;
    }

    atualizar(velocidade) {
        if (this.sentido === "contrario") {
            // Veículos na contramão se aproximam mais rápido
            this.y += velocidade * 1.6;
        } else {
            // Veículos no mesmo sentido se aproximam mais devagar
            this.y += velocidade * 0.7;
        }
    }

    desenhar(ctx) {
        if (this.sentido === "contrario") {
            // Gira os veículos que vêm na contramão
            ctx.save();

            ctx.translate(
                this.x + this.largura / 2,
                this.y + this.altura / 2
            );

            ctx.rotate(Math.PI);

            if (
                this.imagem &&
                this.imagem.complete &&
                this.imagem.naturalWidth > 0
            ) {
                ctx.drawImage(
                    this.imagem,
                    -this.largura / 2,
                    -this.altura / 2,
                    this.largura,
                    this.altura
                );
            } else {
                ctx.fillStyle = this.cor;

                ctx.fillRect(
                    -this.largura / 2,
                    -this.altura / 2,
                    this.largura,
                    this.altura
                );
            }

            ctx.restore();
        } else {
            // Veículos no mesmo sentido
            super.desenhar(ctx);
        }
    }
}
