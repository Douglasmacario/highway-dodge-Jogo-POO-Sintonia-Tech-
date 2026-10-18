
export class Garagem {
    constructor() {
        // Carros disponíveis na garagem
        this.carros = [
            {
                id: "audi",
                nome: "Audi Sport Quattro",
                imagem: "assets/cars/realistas/Car_Audi_Sport_Quattro_86x145.png",
                pontosNecessarios: 0
            },
            {
                id: "bmw",
                nome: "BMW M1",
                imagem: "assets/cars/realistas/Car_BMW_M1_86x145.png",
                pontosNecessarios: 500
            },
            {
                id: "camaro",
                nome: "Chevrolet Camaro ZL1",
                imagem: "assets/cars/realistas/Car_Chevrolet_Camaro_ZL-1_86x145.png",
                pontosNecessarios: 1500
            },
            {
                id: "ford",
                nome: "Ford GT40",
                imagem: "assets/cars/realistas/Car_Ford_GT40_86x145.png",
                pontosNecessarios: 3000
            },
            {
                id: "ferrari",
                nome: "Ferrari F40",
                imagem: "assets/cars/realistas/Car_Ferrari_F40_86x145.png",
                pontosNecessarios: 5000
            }
        ];

        // Recupera os pontos acumulados
        const pontosSalvos = Number(
            localStorage.getItem("highwayDodgePontos")
        );

        this.pontosTotais =
            Number.isFinite(pontosSalvos) && pontosSalvos >= 0
                ? pontosSalvos
                : 0;

        // Recupera o carro escolhido
        this.carroSelecionado =
            localStorage.getItem("highwayDodgeCarro") || "audi";

        // Corrige seleções antigas ou bloqueadas
        if (!this.podeUsar(this.carroSelecionado)) {
            this.carroSelecionado = "audi";
            this.salvar();
        }
    }

    // Verifica se o carro está desbloqueado
    podeUsar(id) {
        const carro = this.carros.find(
            carro => carro.id === id
        );

        if (!carro) {
            return false;
        }

        return this.pontosTotais >= carro.pontosNecessarios;
    }

    // Adiciona pontos ao progresso
    adicionarPontos(pontos) {
        if (!Number.isFinite(pontos) || pontos <= 0) {
            return;
        }

        this.pontosTotais += Math.floor(pontos);
        this.salvar();
    }

    // Seleciona um carro desbloqueado
    selecionarCarro(id) {
        if (!this.podeUsar(id)) {
            return false;
        }

        this.carroSelecionado = id;
        this.salvar();

        return true;
    }

    // Retorna o carro selecionado
    obterCarroSelecionado() {
        return this.carros.find(
            carro => carro.id === this.carroSelecionado
        );
    }

    // Salva o progresso no navegador
    salvar() {
        localStorage.setItem(
            "highwayDodgePontos",
            this.pontosTotais
        );

        localStorage.setItem(
            "highwayDodgeCarro",
            this.carroSelecionado
        );
    }
}
