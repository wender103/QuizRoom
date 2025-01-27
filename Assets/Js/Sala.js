let Sala_Atual = undefined
let Esta_Personalizando_Sala = false

const Input_Nome_Sala = document.getElementById('Input_Nome_Sala')
const Input_Tema_Sala = document.getElementById('Input_Tema_Sala')
const Quantidade_Questoes = document.getElementById('Quantidade_Questoes')
const Select_Max_Alternativas = document.getElementById('Select_Max_Alternativas')
const Tempo_Entre_Questoes = document.getElementById('Tempo_Entre_Questoes')

function Criar_Sala() {
    if(!Esta_Personalizando_Sala) {
        if (Input_Nome_Sala.value.trim() != '' && Input_Tema_Sala.value.trim() != '') {
            const { Horas, Minutos, Segundos } = Converter_Segundos_E_Adicionar(parseInt(Tempo_Entre_Questoes.value))

            Sala_Atual = {
                Nome: Input_Nome_Sala.value,
                Criador: Usuario.email,
                Is_Publica: document.getElementById('Checkbox_Sala_Publica').checked,
                Tema: Input_Tema_Sala.value,
                Estado: "Esperando",
                Max_Jogadores: 10,
                Quiz: {
                    Pergunta: "",
                    Alternativas: [],
                    Resposta: "",
                    Numero_Da_Pergunta: -1,
                    Max_Perguntas: parseInt(Quantidade_Questoes.value),
                    Max_Alternativas: parseInt(Select_Max_Alternativas.value),
                    Intervalo_Questao: { Horas, Minutos, Segundos },
                    Time: ''
                },
                Jogadores: [{
                    Nome: Usuario.displayName,
                    Email: Usuario.email,
                    Foto_Perfil: Usuario.photoURL,
                    Respostas: [],
                    Pontos: 0
                }],
                Codigo: db.collection('Salas_QuizRoom').doc().id,
            }

            db.collection('Salas_QuizRoom').doc(Usuario.email).set(Sala_Atual).then(() => {
                Atualizar_Jodadores_Tela()
                document.getElementById('Codigo_Da_Sala').innerText = Sala_Atual.Codigo
                Abrir_Pagina('Espera')
                Listner_Sala(Sala_Atual.Criador)
            })
        }
    } else {
        const { Horas, Minutos, Segundos } = Converter_Segundos_E_Adicionar(parseInt(Tempo_Entre_Questoes.value))
        
        Sala_Atual.Nome = Input_Nome_Sala.value
        Sala_Atual.Is_Publica = document.getElementById('Checkbox_Sala_Publica').checked
        Sala_Atual.Tema = Input_Tema_Sala.value
        Sala_Atual.Quiz.Max_Perguntas = parseInt(Quantidade_Questoes.value)
        Sala_Atual.Quiz.Max_Alternativas = parseInt(Select_Max_Alternativas.value)
        Sala_Atual.Quiz.Intervalo_Questao = { Horas, Minutos, Segundos }

        db.collection('Salas_QuizRoom').doc(Sala_Atual.Criador).update({
            Nome: Input_Nome_Sala.value,
            Is_Publica: document.getElementById('Checkbox_Sala_Publica').checked,
            Tema: Input_Tema_Sala.value,
            "Quiz.Max_Perguntas": parseInt(Quantidade_Questoes.value),
            "Quiz.Max_Alternativas": parseInt(Select_Max_Alternativas.value),
            "Quiz.Intervalo_Questao": {
                Horas,
                Minutos,
                Segundos
            }
        })

        Abrir_Pagina('Fim_De_Jogo')
    }
}

const Container_Imgs_Perfil_Jogadores = document.getElementById('Container_Imgs_Perfil_Jogadores')
function Atualizar_Jodadores_Tela() {
    Container_Imgs_Perfil_Jogadores.innerHTML = ''

    for (let c = 0; c < Sala_Atual.Jogadores.length; c++) {
        const Img_Jogador = document.createElement('img')
        Img_Jogador.src = Sala_Atual.Jogadores[c].Foto_Perfil
        Container_Imgs_Perfil_Jogadores.appendChild(Img_Jogador)
    }

    if(Sala_Atual.Criador == Usuario.email && Sala_Atual.Jogadores.length > 1) {
        document.getElementById('Btn_Comecar_Quiz').style.display = 'block'
    } else {
        document.getElementById('Btn_Comecar_Quiz').style.display = 'none'
    }
}

function Excluir_Sala() {
    db.collection('Salas_QuizRoom').doc(Usuario.email).delete()
}

const Container_Salas_Criadas = document.getElementById('Container_Salas_Criadas')
function Carregar_Salas_Criadas() {
    Container_Salas_Criadas.innerHTML = ''
    let Todas_As_Salas = []
    db.collection('Salas_QuizRoom').get().then(Snapshot => {
        let Snapshot_Salas = Snapshot.docs

        Snapshot_Salas.forEach(Sala => {
            Todas_As_Salas.push(Sala.data())

            if(Sala.data().Is_Publica && Sala.data().Estado == 'Esperando') {
                const Div_Sala = document.createElement('div')
                const Nome_Sala = document.createElement('p')

                Nome_Sala.innerText = Sala.data().Nome
                Div_Sala.classList.add('Salas')

                Div_Sala.appendChild(Nome_Sala)
                Container_Salas_Criadas.appendChild(Div_Sala)

                Div_Sala.addEventListener('click', () => {
                    Entrar_Na_Sala(Sala.data().Codigo)
                })
            }
        })
    })
}

function Entrar_Na_Sala(_Codigo_Sala) {
    db.collection('Salas_QuizRoom').get().then(Snapshot =>  {
        let Snapshot_Salas = Snapshot.docs

        Snapshot_Salas.forEach(Sala => {
            if(Sala.data().Codigo == _Codigo_Sala) {
                if(Sala.data().Jogadores.length >= Sala.data().Max_Jogadores) {
                    Abrir_Pagina('Entrar_Em_Sala')
                    alert('A sala está cheia!')
                    Carregar_Salas_Criadas()

                } else {
                    Sala_Atual = Sala.data()
                    const New_Jogador = {
                        Nome: Usuario.displayName,
                        Email: Usuario.email,
                        Foto_Perfil: Usuario.photoURL,
                        Respostas: [],
                        Pontos: 0
                    }

                    Sala_Atual.Jogadores.push(New_Jogador)

                    db.collection('Salas_QuizRoom').doc(Sala_Atual.Criador).update({  
                        Jogadores: Sala_Atual.Jogadores
                    }).then(() => {
                        
                        Listner_Sala(Sala_Atual.Criador)
                        Abrir_Pagina('Espera')
                    })
                }
            }
        })
    })
}

function Adversario_Saiu_Da_Sala() {
    for (let c = 0; c < Sala_Atual.Jogadores.length; c++) {
        if (Sala_Atual.Jogadores[c].Email == Usuario.email) {
            Sala_Atual.Jogadores.splice(c, 1)
            break
        }
    }

    // Desativar o listener
    if (unsubscribeListener) {
        unsubscribeListener()
        unsubscribeListener = null
    }

    db.collection('Salas_QuizRoom').doc(Sala_Atual.Criador).update({
        Jogadores: Sala_Atual.Jogadores
    }).then(() => {
        Sala_Atual = undefined
        Abrir_Pagina('Home')
    })
}

let Last_Quiz = {
    Pergunta: '',
}

let unsubscribeListener = null

function Listner_Sala(_Email_Sala) {
    if (unsubscribeListener) {
        // Se houver um listener ativo, remova-o antes de criar um novo
        unsubscribeListener()
    }

    unsubscribeListener = db.collection('Salas_QuizRoom').doc(_Email_Sala).onSnapshot(Snapshot => {
        if (Snapshot.exists) {
            const dadosSala = Snapshot.data()

            Sala_Atual = dadosSala

            //? Vai atualizar as imgs dos jogadores
            Atualizar_Jodadores_Tela()

            if (Sala_Atual.Estado == 'Jogando') {
                //? Caso o jogo comece, vai mandar o jogador para o quiz
                if (Pag_Atual.Nome != 'Quiz') {
                    Abrir_Pagina('Quiz')
                }

                const Btns = document.querySelectorAll('.Btn_Alternativas')
                let User_Ja_Clicou = false
                Btns.forEach(Button => {
                    if (Button.classList.contains('Active')) {
                        Atualizar_Btns()
                        User_Ja_Clicou = true
                    }
                })

                if (User_Ja_Clicou) {
                    Btns.forEach(Button => {
                        if (Button.innerText == Sala_Atual.Quiz.Resposta) {
                            Button.style.backgroundColor = '#00ff1c54'
                        } else {
                            Button.style.backgroundColor = '#ff000063'
                        }
                    })
                }

                let All_Jogadores = Sala_Atual.Jogadores

                let Falta_Responder = false
                for (let c = 0; c < All_Jogadores.length; c++) {
                    if (All_Jogadores[c].Respostas[Sala_Atual.Quiz.Numero_Da_Pergunta] == undefined) {
                        Falta_Responder = true
                        break
                    }
                }

                if (!Falta_Responder && Usuario.email == Sala_Atual.Criador) {
                    Sala_Atual.Quiz.Time = Adicionar_Hora(0, 0, 5)
                    db.collection('Salas_QuizRoom').doc(Sala_Atual.Criador).update({
                        Quiz: Sala_Atual.Quiz
                    }).then(() => {
                        Start_Countdown(Sala_Atual.Quiz.Time)
                    })
                }

                if (Sala_Atual.Quiz.Time != Last_Quiz.Time) {
                    Start_Countdown(Sala_Atual.Quiz.Time)
                }

                if (Sala_Atual.Quiz.Numero_Da_Pergunta >= Sala_Atual.Quiz.Max_Perguntas) {
                    Abrir_Pagina('Fim_De_Jogo')
                    Create_Ranking(Sala_Atual.Jogadores)
                    clearInterval(Intervalo_Cronometro)

                    if (Usuario.email == Sala_Atual.Criador) {
                        Sala_Atual.Estado = 'Esperando'

                        db.collection('Salas_QuizRoom').doc(Sala_Atual.Criador).update({
                            Estado: 'Esperando'
                        })
                    }
                }

                if (Sala_Atual.Jogadores.length <= 1) {
                    Resetar_Sala()
                }

                try {
                    if (Last_Quiz.Pergunta != Sala_Atual.Quiz.Pergunta && Sala_Atual.Criador != Usuario.email) {
                        Ativar_Quiz(Sala_Atual.Quiz)
                        Last_Quiz = Sala_Atual.Quiz
                    }
                } catch { }
            }
        } else {
            if(Pag_Atual.Nome == 'Quiz' || Pag_Atual.Nome == 'Esperando' || Pag_Atual.Nome == 'Fim_De_Jogo' || Pag_Atual.Nome == 'Criar_Sala') {
                if(Usuario.email == Sala_Atual.Criador) {
                    Abrir_Pagina('Home')

                } else {
                    Abrir_Pagina('Entrar_Em_Sala')
                    Carregar_Salas_Criadas()
                }

                document.getElementById('Container_Imgs_Perfil_Jogadores').innerHTML = ''
                Sala_Atual = undefined
            }
        }
    })
}

function Atualizar_Btns() {
    const Btns = document.querySelectorAll('.Btn_Alternativas')
    Btns.forEach(Button => {
        Button.querySelector('.Container_Imgs_Users_Alternativas').innerHTML = ''
        let All_Jogadores = Sala_Atual.Jogadores
        for (let c = 0; c < All_Jogadores.length; c++) {
            if(All_Jogadores[c].Respostas[Sala_Atual.Quiz.Numero_Da_Pergunta] == Button.querySelector('p').innerText) {
                const Img_Jogador = document.createElement('img')
                Img_Jogador.src = All_Jogadores[c].Foto_Perfil
                Button.querySelector('.Container_Imgs_Users_Alternativas').appendChild(Img_Jogador)
            }
        }
    })
}

function Fim_De_Jogo() {

}

function Jogar_Novamente() {
    Last_Quiz.Pergunta = ''

    db.collection('Salas_QuizRoom').doc(Sala_Atual.Criador).update({
        Estado: 'Jogando',
        "Quiz.Pergunta": '',
        "Quiz.Alternativas": [],
        "Quiz.Resposta": '',
        "Quiz.Numero_Da_Pergunta": -1,
        "Quiz.Time": '',
        Jogadores: Sala_Atual.Jogadores.map(jogador => ({
            ...jogador,
            Respostas: [],
            Pontos: 0
        }))
    }).then(() => {
        Comecar_Quiz()
    })
}

const H1_Criar_Sala = document.getElementById('H1_Criar_Sala')
const Btn_Criar_Sala = document.getElementById('Btn_Criar_Sala')

function Abrir_Personalizar_Sala() {
    Esta_Personalizando_Sala = true

    H1_Criar_Sala.innerText = 'Personalizar Sala'
    Btn_Criar_Sala.innerText = 'Salvar'

    Input_Nome_Sala.value = Sala_Atual.Nome
    Input_Tema_Sala.value = Sala_Atual.Tema
    Quantidade_Questoes.value = Sala_Atual.Quiz.Max_Perguntas

    Abrir_Pagina('Criar_Sala')
}

function Fechar_Personalizar_Sala() {
    Resetar_Criar_Sala()
    Abrir_Pagina('Fim_De_Jogo')
}   

function Resetar_Criar_Sala() {
    H1_Criar_Sala.innerText = 'Criar Sala'
    Btn_Criar_Sala.innerText = 'Criar Sala'

    Esta_Personalizando_Sala = false
}

function Resetar_Sala() {
    Last_Quiz.Pergunta = ''
    clearInterval(Intervalo_Cronometro)

    db.collection('Salas_QuizRoom').doc(Sala_Atual.Criador).update({
        Estado: 'Esperando',
        "Quiz.Pergunta": '',
        "Quiz.Alternativas": [],
        "Quiz.Resposta": '',
        "Quiz.Numero_Da_Pergunta": -1,
        "Quiz.Time": '',
        Jogadores: Sala_Atual.Jogadores.map(jogador => ({
            ...jogador,
            Respostas: [],
            Pontos: 0
        }))
    }).then(() => {
        Abrir_Pagina('Espera')
    })
}