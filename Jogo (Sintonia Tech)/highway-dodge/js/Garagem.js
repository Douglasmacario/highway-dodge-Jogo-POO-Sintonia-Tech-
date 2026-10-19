
export class Garagem {
    constructor() {
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

        // Carrega o maior recorde salvo
        const recordeSalvo = Number(
            localStorage.getItem("highwayDodgeRecorde")
        );

        this.recorde = Number.isFinite(recordeSalvo) &&
            recordeSalvo >= 0
            ? recordeSalvo
            : 0;

        // Carrega o carro selecionado
        this.carroSelecionado =
            localStorage.getItem("highwayDodgeCarro") || "audi";

        // Impede usar carro que não foi desbloqueado
        if (!this.podeUsar(this.carroSelecionado)) {
            this.carroSelecionado = "audi";
            this.salvar();
        }
    }

    podeUsar(id) {
        const carro = this.carros.find(c => c.id === id);

        return !!carro &&
            this.recorde >= carro.pontosNecessarios;
    }

    atualizarRecorde(pontos) {
        if (!Number.isFinite(pontos) || pontos < 0) {
            return;
        }

        const novoRecorde = Math.floor(pontos);

        if (novoRecorde > this.recorde) {
            this.recorde = novoRecorde;
            this.salvar();
        }
    }

    selecionarCarro(id) {
        if (!this.podeUsar(id)) {
            return false;
        }

        this.carroSelecionado = id;
        this.salvar();

        return true;
    }

    obterCarroSelecionado() {
        return this.carros.find(
            c => c.id === this.carroSelecionado
        );
    }

    salvar() {
        localStorage.setItem(
            "highwayDodgeRecorde",
            this.recorde
        );

        localStorage.setItem(
            "highwayDodgeCarro",
            this.carroSelecionado
        );
    }
}
