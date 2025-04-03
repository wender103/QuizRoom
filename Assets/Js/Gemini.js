const apiKey = 'AIzaSyCPOgQxs2HeishfhsEvo548lrmj8jEJNl0'
const siteUrl = 'https://wender103.github.io/QuizRoom/'
const siteName = 'Chat com IA'


async function Enviar_Prompt(userMessage) {
    if (!userMessage) return

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: userMessage }]
                    }
                ]
            })
        })

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao processar resposta."
        return aiMessage
    } catch (error) {
        alert(`Erro: ${error.message} 😔`)
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
                const variacaoContexto = Date.now()
                const enfoquesPorDificuldade = {
                facil: ['conceito básico', 'exemplo cotidiano', 'identificação visual', 'função principal'],
                medio: ['aplicação prática', 'comparação simples', 'contexto histórico', 'termo técnico'],
                dificil: ['mecanismo interno', 'análise crítica', 'exceção notável', 'detalhe avançado'],
                expert: ['cenário hipotético', 'solução não trivial', 'dados específicos', 'integração multidisciplinar']
                }

                const angulosPorDificuldade = {
                facil: ['o que é', 'para que serve', 'onde encontramos', 'exemplo simples'],
                medio: ['como funciona', 'diferenças básicas', 'quando surgiu', 'problemas comuns'],
                dificil: ['por que ocorre', 'consequências complexas', 'limitações', 'otimizações'],
                expert: ['críticas especializadas', 'soluções alternativas', 'análise quantitativa', 'tendências futuras']
                }

                const Resposta = await Enviar_Prompt(
                    `Crie uma pergunta de múltipla escolha ÚNICA com:

                    PARÂMETROS-CHAVE:
                    • Tema: "${Sala_Atual.Tema}"
                    • Dificuldade: ${Sala_Atual.Quiz.Dificuldade}
                    • Alternativas: ${Sala_Atual.Quiz.Max_Alternativas} (UMA correta)
                    • Contexto único: ${variacaoContexto}

                    DIRETRIZES POR DIFICULDADE:
                    ${Sala_Atual.Quiz.Dificuldade === 'facil' ? 
                    "- Use linguagem acessível\n- Foque em reconhecimento\n- Alternativas com erros óbvios (para iniciantes)" :
                    Sala_Atual.Quiz.Dificuldade === 'medio' ?
                    "- Exija compreensão básica\n- Inclua 1-2 termos técnicos\n- Erros sutis nas alternativas" :
                    Sala_Atual.Quiz.Dificuldade === 'dificil' ?
                    "- Requira conhecimento aplicado\n- Use casos específicos\n- Alternativas com meias-verdades" :
                    "- Desafie especialistas\n- Inclua dados precisos\n- Alternativas com armadilhas sofisticadas"}

                    ESTRUTURA CRIATIVA:
                    • Enfoque: ${enfoquesPorDificuldade[Sala_Atual.Quiz.Dificuldade].sort(() => 0.5 - Math.random())[0]}
                    • Ângulo: ${angulosPorDificuldade[Sala_Atual.Quiz.Dificuldade].sort(() => 0.5 - Math.random())[0]}
                    ${Sala_Atual.Quiz.Dificuldade === 'expert' ? '• Inclua: ' + ['fórmula relevante', 'dado estatístico', 'caso de estudo real', 'citação técnica'].sort(() => 0.5 - Math.random())[0] : ''}

                    FORMATO EXIGIDO:
                    Pergunta: [Texto completo com complexidade adequada ao nível ${Sala_Atual.Quiz.Dificuldade}]

                    ${Array.from({length: Sala_Atual.Quiz.Max_Alternativas}, (_, i) => 
                    `${String.fromCharCode(97 + i)}) [Alternativa ${String.fromCharCode(65 + i)} - ${Sala_Atual.Quiz.Dificuldade === 'facil' ? 'erro claro' : 
                        Sala_Atual.Quiz.Dificuldade === 'expert' ? 'armadilha especializada' : 'distrator plausível'}]`).join('\n')}

                    Alternativa correta: [letra]) [Resposta tecnicamente precisa]

                    EXEMPLO ${Sala_Atual.Quiz.Dificuldade.toUpperCase()}:
                    Pergunta: ${Sala_Atual.Quiz.Dificuldade === 'facil' ? 
                    `Qual destes é um componente básico de ${Sala_Atual.Tema.includes('redes') ? 'uma rede de computadores?' : 'um sistema operacional?'}` :
                    Sala_Atual.Quiz.Dificuldade === 'expert' ?
                    `Considerando a equação ${Sala_Atual.Tema.includes('física') ? 'de Schrödinger' : 'de Black-Scholes'}, qual parâmetro tem maior impacto em ${Sala_Atual.Tema.includes('física') ? 'decoerência quântica' : 'hedge delta-neutral'}?` :
                    `Em ${Sala_Atual.Tema.includes('programação') ? 'OOP' : 'gestão ágil'}, qual princípio ${Sala_Atual.Tema.includes('programação') ? 'determina encapsulamento?' : 'prioriza entrega contínua?'}`}

                    ${Array.from({length: Sala_Atual.Quiz.Max_Alternativas}, (_, i) => 
                    `${String.fromCharCode(97 + i)}) ${gerarExemploAlternativa(Sala_Atual)}`).join('\n')}

                    Alternativa correta: ${Sala_Atual.Quiz.Dificuldade === 'facil' ? 'a) ' + (Sala_Atual.Tema.includes('redes') ? 'Roteador' : 'Kernel') :
                                        Sala_Atual.Quiz.Dificuldade === 'expert' ? 'c) ' + (Sala_Atual.Tema.includes('física') ? 'Constante de Planck reduzida' : 'Volatilidade implícita') :
                                        'b) ' + (Sala_Atual.Tema.includes('programação') ? 'Modificadores de acesso' : 'Princípio de Pareto')}`
                )

                // Função auxiliar para exemplos (simulada)
                function gerarExemploAlternativa(sala) {
                const temas = {
                    redes: ['Switch', 'Firewall', 'DNS', 'Cache CDN'],
                    programação: ['Herança', 'Polimorfismo', 'Coesão', 'Acoplamento'],
                    física: ['Massa', 'Carga elétrica', 'Spin', 'Superposição']
                }
                const t = Object.keys(temas).find(k => sala.Tema.includes(k)) || 'programação'
                return temas[t][Math.floor(Math.random() * temas[t].length)]
                }

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