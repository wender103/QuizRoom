const apiKey = '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' // Substitua pela sua chave
const siteUrl = 'https://seusite.com' // Substitua pela URL do seu site
const siteName = 'Chat com IA' // Nome do seu site


async function Enviar_Prompt(userMessage) {
    if (!userMessage) return

    try {
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": siteUrl,
                "X-Title": siteName,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            })
        })

        if (!response.ok) {
            throw new Error('Erro ao obter resposta da IA.')
        }

        const data = await response.json()
        const aiMessage = data.choices[0].message.content
        return(aiMessage)
    } catch (error) {
        alert('Erro: Não foi possível obter uma resposta da IA. 😔')
        Excluir_Sala(Sala_Atual.Criador)
        console.error(error)
    }
}

const Container_Pag_Quiz = document.getElementById('Container_Pag_Quiz')
const p_Pergunta = document.getElementById('p_Pergunta')
const Container_Alternativas = document.getElementById('Container_Alternativas')
let Respondido = false
function Parse_Question(text) {
    // Determina qual termo está presente: "Resposta correta" ou "Alternativa correta"
    const separator = text.includes('Resposta correta:') 
        ? 'Resposta correta:' 
        : text.includes('Alternativa correta:') 
        ? 'Alternativa correta:' 
        : null

    if (!separator) {
        throw new Error('O texto não contém os separadores esperados: "Resposta correta:" ou "Alternativa correta:"')
    }

    // Separa a pergunta e alternativas da resposta correta
    const parts = text.split(separator)

    // A primeira parte contém a pergunta e as alternativas
    const questionAndAlternatives = parts[0]?.trim() || ''
    const resposta = parts[1]?.trim() || ''

    // Verifica se questionAndAlternatives e resposta existem
    if (!questionAndAlternatives || !resposta) {
        throw new Error('O texto fornecido não contém as partes esperadas.')
    }

    // Extrai a pergunta antes do primeiro "?"
    const pergunta = questionAndAlternatives.split('?')[0]?.trim() + '?'

    // Extrai as alternativas após o "?"
    const alternativasRaw = questionAndAlternatives.split('?')[1]?.trim()
    if (!alternativasRaw) {
        throw new Error('As alternativas não foram encontradas no texto.')
    }

    // Divide as alternativas em linhas, limpa espaços e remove vazios
    const alternativas = alternativasRaw
        .split('\n') // Divide por linhas
        .map(alt => alt.trim()) // Remove espaços extras
        .filter(alt => alt) // Remove linhas vazias

    // Retorna o objeto final
    return {
        Pergunta: pergunta,
        Alternativas: alternativas,
        Resposta: resposta
    }
}

function Contar_Acertos() {
    const { Jogadores, Quiz } = Sala_Atual
    const respostaCerta = Quiz.Resposta
    const numeroPergunta = Quiz.Numero_Da_Pergunta

    // Conta os jogadores que acertaram a resposta
    const totalAcertos = Jogadores.filter(jogador => jogador.Respostas[numeroPergunta] === respostaCerta).length + 1

    return totalAcertos
}

function Ativar_Quiz(Novo_Quiz) {
    
    Respondido = false
    Container_Pag_Quiz.classList.remove('Active')



    p_Pergunta.innerText = Novo_Quiz.Pergunta
    Container_Alternativas.innerHTML = ''

    for (let i = 0; i < Novo_Quiz.Alternativas.length; i++) {
        const alternativa = Novo_Quiz.Alternativas[i]
        const button = document.createElement('button')
        const Container_Imgs_Users_Alternativas = document.createElement('div')
        Container_Imgs_Users_Alternativas.className = 'Container_Imgs_Users_Alternativas'
        const p = document.createElement('p')
        p.innerText = alternativa
        button.appendChild(Container_Imgs_Users_Alternativas)
        button.appendChild(p)
        button.classList.add('Btn_Padrao')
        button.classList.add('Btn_Alternativas')
        button.id = 'Btn_Alternativa_' + i
        Container_Alternativas.appendChild(button)

        // Adiciona um evento de clique ao botão
        button.addEventListener('click', () => {
            if(!Respondido) {
                button.classList.add('Active')
                
                if (alternativa === Novo_Quiz.Resposta) {
                    for (let c = 0; c < Sala_Atual.Jogadores.length; c++) {
                        if(Sala_Atual.Jogadores[c].Email === Usuario.email) {
                            if(Contar_Acertos() > 0) {
                                
                                Sala_Atual.Jogadores[c].Pontos += parseInt(100 / Contar_Acertos())
                            } else {
                                
                                Sala_Atual.Jogadores[c].Pontos += 100
                            }
                            
                            Sala_Atual.Jogadores[c].Respostas[Novo_Quiz.Numero_Da_Pergunta] = alternativa

                            

                            if(Sala_Atual.Quiz.Numero_Da_Pergunta > 0 && Sala_Atual.Jogadores[c].Respostas[Sala_Atual.Quiz.Numero_Da_Pergunta - 1] === undefined) {
                                console.log('Caiu no if de ver a resposta n resopndida');
                                
                                Sala_Atual.Jogadores[c].Respostas[Sala_Atual.Quiz.Numero_Da_Pergunta - 1] == '#@$@$@$@#$@'
                            }
                            break
                        }
                    }

                } else {
                    for (let c = 0; c < Sala_Atual.Jogadores.length; c++) {
                        if(Sala_Atual.Jogadores[c].Email === Usuario.email) {
                            Sala_Atual.Jogadores[c].Pontos += 0
                            Sala_Atual.Jogadores[c].Respostas[Novo_Quiz.Numero_Da_Pergunta] = alternativa
                            break
                        }
                    }
                }

                const Btns = document.querySelectorAll('.Btn_Alternativas')
                for (let c = 0; c < Btns.length; c++) { 
                
                    if(Btns[c].id !== button.id) {
                        Btns[c].classList.remove('Active')
                        Btns[c].classList.add('Blocked')
                    }
                }

                Respondido = true
                db.collection('Salas_QuizRoom').doc(Sala_Atual.Criador).update({  
                    Jogadores: Sala_Atual.Jogadores
                })
            }
        })
    }
    Start_Countdown(Novo_Quiz.Time)
}

function Comecar_Quiz() {
    if(Sala_Atual.Estado != 'Jogando') {
        Sala_Atual.Estado = 'Jogando'

        db.collection('Salas_QuizRoom').doc(Sala_Atual.Criador).update({  
            Estado: Sala_Atual.Estado
        }).then(() => {
            Perguntar()
        })
    } else {
        Perguntar()
    }

    async function Perguntar() {
        if(Sala_Atual.Quiz.Numero_Da_Pergunta < Sala_Atual.Quiz.Max_Perguntas) {
            try {
            const Resposta = await Enviar_Prompt(
                `Crie uma única pergunta extremamente difícil com o tema: "${Sala_Atual.Tema}". A pergunta deve conter exatamente ${Sala_Atual.Quiz.Max_Alternativas} alternativas (deve incluir apenas uma resposta correta). 

                Use a seguinte estrutura:
                1. Escreva a pergunta.
                2. Liste as alternativas, uma abaixo da outra, identificadas por letras (a, b, c, d, etc.), respeitando o número de alternativas solicitado (${Sala_Atual.Quiz.Max_Alternativas}).
                3. Ao final, diga qual é a alternativa correta, utilizando exatamente o formato: "Alternativa correta: [letra da alternativa]) [conteúdo da alternativa]".

                Aqui está um exemplo do formato esperado, lembrando que a quantidade de alternativas deve ser igual ao número solicitado:
                Pergunta: Qual é o carro esportivo mais rápido do mundo em termos de velocidade máxima?

                a) Lamborghini Aventador  
                b) Bugatti Veyron  
                c) Koenigsegg Agera RS  
                d) McLaren Speedtail  

                Alternativa correta: c) Koenigsegg Agera RS`
            )

                const Resposta_Formatada = Parse_Question(Resposta)

                let Time_Sala = Sala_Atual.Quiz.Intervalo_Questao

                // Aqui você pode processar a resposta
                Sala_Atual.Quiz.Pergunta = Resposta_Formatada.Pergunta
                Sala_Atual.Quiz.Alternativas = Resposta_Formatada.Alternativas
                Sala_Atual.Quiz.Resposta = Resposta_Formatada.Resposta
                Sala_Atual.Quiz.Numero_Da_Pergunta = Sala_Atual.Quiz.Numero_Da_Pergunta + 1
                Sala_Atual.Quiz.Time = Adicionar_Hora(Time_Sala.Horas, Time_Sala.Minutos, Time_Sala.Segundos)

                db.collection('Salas_QuizRoom').doc(Sala_Atual.Criador).update({  
                    Quiz: Sala_Atual.Quiz
                }).then(() => {
                    Ativar_Quiz(Sala_Atual.Quiz)
                })

            } catch (error) {
                console.error('Erro ao gerar o quiz:', error)
            }
        }
    }
}