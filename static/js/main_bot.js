class LogicaFijas {
    constructor() {
        this.numeroFinal = new Array(10).fill(null);
        this.primeraFila = new Array(10).fill(null);
        this.aBC = new Array(3).fill(null);
        this.indexABC = new Array(3).fill(null);
        this.posiciones = Array.from({ length: 10 }, () => new Array(10).fill(false));
        this.masUnoPrimeraFila = false;
        this.fijas = -1;
        this.numeroPrueba = new Array(10).fill(null);
    }

    prearranque() {
        this.crearNumero();
    }

    hayNumerosHallados() {
        return this.numeroFinal.some(numero => numero !== null);
    }

    crearNumero() {
        for (let i = 0; i < this.numeroPrueba.length; i++) {
            let prueba;
            do {
                prueba = Math.floor(Math.random() * 10);
            } while (this.encontrarNumero(prueba, i));
            this.numeroPrueba[i] = prueba;
        }
    }

    encontrarNumero(prueba, j) {
        for (let i = 0; i < j; i++) {
            if (this.numeroPrueba[i] === prueba) {
                return true;
            }
        }
        return false;
    }

    usarFija() {
        for (let i = 0; i < this.numeroFinal.length; i++) {
            if (this.numeroFinal[i] !== null) {
                this.indexABC[2] = i;
                this.aBC[2] = this.numeroFinal[i];
                break;
            }
        }
        this.numeroPrueba[this.indexABC[2]] = this.aBC[0];
        this.numeroPrueba[this.indexABC[1]] = this.aBC[2];
    }

    lanzar() {
        return this.numeroPrueba;
    }

    hallarPrimeraFila(fijas) {
        if (this.fijas === fijas) {
            this.primeraFila[this.indexABC[1]] = 0;
        } else if (this.fijas + 1 === fijas) {
            this.primeraFila[this.indexABC[1]] = 1;
            if (this.analizarPrimeraFilaMas() && this.analizarPrimeraFilaMenos1()) {
                this.procesarPrimeraFila();
                return;
            }
        } else if (this.fijas + 2 === fijas) {
            this.primeraFila[this.indexABC[1]] = 2;
            if (this.analizarPrimeraFilaMas() && this.analizarPrimeraFilaMenos1()) {
                this.procesarPrimeraFila();
                return;
            }
        } else if (this.fijas - 2 === fijas) {
            this.primeraFila[this.indexABC[1]] = -2;
            if (this.analizarPrimeraFilaMenos2()) {
                this.procesarPrimeraFila();
                return;
            }
        } else if (this.fijas - 1 === fijas) {
            this.primeraFila[this.indexABC[1]] = -1;
            if (this.analizarPrimeraFilaMenos1() && this.analizarPrimeraFilaMas()) {
                this.procesarPrimeraFila();
                return;
            }
        }
        this.cambiarAB();
    }

    analizarPrimeraFilaMenos1() {
        if (this.fijas === 0) {
            return true;
        } else if (this.primeraFila[0] !== null && this.primeraFila[0] === -1) {
            return false;
        } else if (this.primeraFila[1] !== null && this.primeraFila[2] !== null) {
            if (this.fijas === 1 && this.primeraFila[1] < 0 && this.primeraFila[2] < 0) {
                this.primeraFila[0] = -1;
                this.primeraFila[1] = 0;
                this.primeraFila[2] = 0;
                return true;
            } else {
                let fijasContador = this.fijas;
                for (let integer of this.primeraFila) {
                    if (integer !== null && integer === -1) {
                        fijasContador--;
                    }
                }
                return fijasContador === 0;
            }
        }
        return false;
    }

    analizarPrimeraFilaMas() {
        if (this.primeraFila[0] !== null && this.primeraFila[0] === -1) {
            return true;
        }
        let fijasContador = 2;
        for (let integer of this.primeraFila) {
            if (integer !== null && integer > 0) {
                fijasContador -= integer;
            }
        }
        return fijasContador === 0;
    }

    analizarPrimeraFilaMenos2() {
        let fijasContador = this.fijas;
        this.primeraFila[0] = -1;
        for (let i = 0; i < this.primeraFila.length; i++) {
            if (this.primeraFila[i] === null || this.primeraFila[i] === 0) {
                continue;
            } else if (this.primeraFila[i] === -1 && (i !== 0)) {
                this.primeraFila[i] = 0;
            } else {
                fijasContador--;
            }
        }
        return fijasContador === 0;
    }

    procesarPrimeraFila() {
        this.alistarNumero(true);
        let masUno = false;
        let numeroPosicionMasuno = [];
        for (let i = 0; i < this.primeraFila.length; i++) {
            switch (this.primeraFila[i]) {
                case 1:
                    masUno = true;
                    numeroPosicionMasuno.push(this.numeroPrueba[i]);
                    numeroPosicionMasuno.push(i);
                    break;
                case 2:
                    this.numeroFinal[i] = this.numeroPrueba[0];
                    this.numeroFinal[0] = this.numeroPrueba[i];
                    this.numeroPrueba[i] = this.numeroFinal[i];
                    this.numeroPrueba[0] = this.numeroFinal[0];
                    this.fijas += 2;
                    break;
                case -1:
                    this.numeroFinal[i] = this.numeroPrueba[i];
                    break;
                case -2:
                    this.numeroFinal[i] = this.numeroPrueba[i];
                    this.numeroFinal[0] = this.numeroPrueba[0];
                    break;
            }
        }
        if (masUno) {
            this.masUnoPrimeraFila = true;
            this.aBC[0] = this.numeroPrueba[0];
            this.aBC[1] = numeroPosicionMasuno[0];
            this.aBC[2] = numeroPosicionMasuno[2];
            this.indexABC[0] = 0;
            this.indexABC[1] = numeroPosicionMasuno[1];
            this.indexABC[2] = numeroPosicionMasuno[3];
            this.numeroPrueba[this.indexABC[0]] = this.aBC[1];
            this.numeroPrueba[this.indexABC[1]] = this.aBC[2];
            this.numeroPrueba[this.indexABC[2]] = this.aBC[0];
        } else {
            this.iniciarNuevoAB();
        }
    }

    iniciarNuevoAB() {
        this.CambiarNuevoAB();
        this.alistarNumero(false);
    }

    alistarNumero(revertir) {
        if (!revertir) {
            this.numeroPrueba[this.indexABC[1]] = this.aBC[0];
            this.numeroPrueba[this.indexABC[0]] = this.aBC[1];
        } else {
            this.numeroPrueba[this.indexABC[0]] = this.aBC[0];
            this.numeroPrueba[this.indexABC[1]] = this.aBC[1];
        }
    }

    recibirFeedback(fijas) {
        if (fijas === 10) {
            return;
        } else if (this.indexABC[0] === null) {
            this.tiroInicial(fijas);
        } else if (!this.hayNumerosHallados() && !this.masUnoPrimeraFila) {
            this.hallarPrimeraFila(fijas);
        } else if (this.masUnoPrimeraFila) {
            this.hallarMasunos(fijas);
        } else {
            this.hallarTodasFijas(fijas);
        }
    }
    hallarMasunos(fijas) {
        if (this.fijas < fijas) {
            this.masUnoPrimeraFila = false;
            if (this.numeroPrueba[0] === this.aBC[2]) {
                this.numeroFinal[this.indexABC[0]] = this.aBC[2];
                this.numeroFinal[this.indexABC[1]] = this.aBC[0];
                this.fijas += 2;
                if (this.fijas + 1 === fijas) {
                    this.numeroFinal[this.indexABC[2]] = this.aBC[1];
                    this.fijas += 1;
                } else {
                    this.posiciones[this.aBC[1]][this.indexABC[2]] = true;
                }
                this.iniciarNuevoAB();
            } else {
                this.numeroFinal[this.indexABC[0]] = this.aBC[1];
                this.numeroFinal[this.indexABC[2]] = this.aBC[0];
                this.fijas += 2;
                if (this.fijas + 1 === fijas) {
                    this.numeroFinal[this.indexABC[1]] = this.aBC[2];
                    this.fijas += 1;
                } else {
                    this.posiciones[this.aBC[2]][this.indexABC[1]] = true;
                }
                this.iniciarNuevoAB();
            }
        } else {
            this.numeroPrueba[this.indexABC[0]] = this.aBC[2];
            this.numeroPrueba[this.indexABC[1]] = this.aBC[0];
            this.numeroPrueba[this.indexABC[2]] = this.aBC[1];
        }
    }

    hallarTodasFijas(fijas) {
        if (this.fijas === fijas) {
            this.posiciones[this.aBC[0]][this.indexABC[1]] = true;
            this.posiciones[this.aBC[1]][this.indexABC[0]] = true;
            this.cambiarAB();
        } else if (this.fijas + 1 === fijas) {
            if (this.posiciones[this.aBC[0]][this.indexABC[1]]) {
                this.numeroFinal[this.indexABC[0]] = this.aBC[1];
                this.CambiarNuevoAB();
            } else if (this.posiciones[this.aBC[1]][this.indexABC[0]]) {
                this.numeroFinal[this.indexABC[1]] = this.aBC[0];
                this.CambiarNuevoAB();
            } else {
                this.usarFija();
            }
            this.fijas++;
        } else if (this.fijas + 2 === fijas) {
            this.numeroFinal[this.indexABC[1]] = this.aBC[0];
            this.numeroFinal[this.indexABC[0]] = this.aBC[1];
            this.CambiarNuevoAB();
            this.fijas += 2;
        } else if (this.fijas - 1 === fijas) {
            this.numeroPrueba[this.indexABC[2]] = this.aBC[2];
            this.numeroFinal[this.indexABC[0]] = this.aBC[1];
            this.numeroPrueba[this.indexABC[1]] = this.aBC[0];
            this.posiciones[this.aBC[0]][this.indexABC[1]] = true;
            this.CambiarNuevoAB();
        } else if (this.fijas - 2 === fijas) {
            this.numeroPrueba[this.indexABC[2]] = this.aBC[2];
            this.numeroFinal[this.indexABC[1]] = this.aBC[0];
            this.numeroPrueba[this.indexABC[1]] = this.aBC[0];
            this.posiciones[this.aBC[1]][this.indexABC[0]] = true;
            this.CambiarNuevoAB();
        }
    }
    CambiarNuevoAB() {
        let nuevoIndex = this.buscarNuevoIndexIJ(this.indexABC[0]);
        this.indexABC[0] = nuevoIndex[0];
        this.indexABC[1] = nuevoIndex[1];
        this.aBC[0] = this.numeroPrueba[this.indexABC[0]];
        this.aBC[1] = this.numeroPrueba[this.indexABC[1]];
        this.numeroPrueba[this.indexABC[1]] = this.aBC[0]; // En el índice de b pongo a
        this.numeroPrueba[this.indexABC[0]] = this.aBC[1]; // En el índice de a pongo b
    }

    // Método usado únicamente cuando se halla la primera fila, utilizado para darle un nuevo valor a A y B
    cambiarAB() {
        this.numeroPrueba[this.indexABC[1]] = this.aBC[1]; // Reubico a b en donde estaba antes
        for (let i = this.indexABC[1] + 1; i < this.numeroFinal.length; i++) {
            if (this.numeroFinal[i] === null) {
                this.indexABC[1] = i;
                this.aBC[1] = this.numeroPrueba[i];
                break;
            }
        }
        this.alistarNumero(false);
    }

    tiroInicial(fijas) {
        this.fijas = fijas;
        this.indexABC[0] = 0;
        this.indexABC[1] = 1;
        this.aBC[0] = this.numeroPrueba[0];
        this.aBC[1] = this.numeroPrueba[1];
        this.alistarNumero(false);
    }

    // Este método es usado para hallarle un nuevo valor a A y B
    buscarNuevoIndexIJ(i) {
        let nuevoIndex = new Array(2);
        for (let k = i; k < this.numeroFinal.length; k++) {
            if (this.numeroFinal[k] === null) {
                nuevoIndex[0] = k;
                for (let l = k + 1; l < this.numeroFinal.length; l++) {
                    if (this.numeroFinal[l] === null) {
                        nuevoIndex[1] = l;
                        return nuevoIndex;
                    }
                }
            }
        }
        return null;
    }
}