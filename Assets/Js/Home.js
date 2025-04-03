let Pag_Atual = {
    Nome: 'Home'
}
const Btns_Pags = document.querySelectorAll('.Btns_Pags')

const Btn_Jogar_Novamente = document.getElementById('Btn_Jogar_Novamente')
const Btn_Personalizar_Sala = document.getElementById('Btn_Personalizar_Sala')
const Btn_Sair_Da_Sala = document.getElementById('Btn_Sair_Da_Sala')

function AtualizarQuantidadeQuestoes(valor) {
  const questoesSelecionadas = document.getElementById('Questoes_Selecionadas')
  questoesSelecionadas.textContent = `${valor} questão${valor > 1 ? 's' : ''}`
}

Btns_Pags.forEach(Btn => {
  Btn.addEventListener('click', () => {
    Abrir_Pagina(Btn.id.replace('Btn_Pag_', ''))
  })
})

const Btn_Voltar = document.getElementById('Btn_Voltar')
Btn_Voltar.addEventListener('click', () => {
  Voltar_Pagina()
})

const Pages = document.querySelectorAll('.Pages')
function Abrir_Pagina(_Nome_Pagina) {
  if(Usuario) {
    Pages.forEach(Pagina => {
      if (Pagina.id == `Pag_${_Nome_Pagina}`) {
        Pagina.classList.add('Active')

        Pag_Atual.Nome = _Nome_Pagina

        if(_Nome_Pagina != 'Home') {
          Btn_Voltar.style.display = 'block'
        } else {
          Btn_Voltar.style.display = 'none'
        }

        if(_Nome_Pagina == 'Espera') {
          try {
            if(!Sala_Atual.Is_Publica && Sala_Atual.Criador != Usuario.email) {
              document.getElementById('Codigo_Da_Sala').style.display = 'none'
            } else {
              document.getElementById('Codigo_Da_Sala').style.display = 'block'
              document.getElementById('Codigo_Da_Sala').innerText = Sala_Atual.Codigo
            }

            if(Sala_Atual.Criador != Usuario.email) {
              document.getElementById('Btn_Comecar_Quiz').style.display = 'none'
            } else if(Sala_Atual.Criador == Usuario.email && Sala_Atual.Jogadores.length > 1) {
              document.getElementById('Btn_Comecar_Quiz').style.display = 'block'
            }
            
          } catch{}
        } else if(_Nome_Pagina == 'Fim_De_Jogo') {
          try {
            if(Usuario.email == Sala_Atual.Criador) {
              Btn_Jogar_Novamente.style.display = 'block'
              Btn_Personalizar_Sala.style.display = 'block'
            } else {
              Btn_Personalizar_Sala.style.display = 'none'
              Btn_Jogar_Novamente.style.display = 'none'
            }

            if(Sala_Atual.Is_Publica || Sala_Atual.Criador == Usuario.email) {
              P_Codigo_Fim_De_Jogo.style.display = 'block'
              P_Codigo_Fim_De_Jogo.innerText = Sala_Atual.Codigo
            } else {
              P_Codigo_Fim_De_Jogo.style.display = 'none'
            }
          } catch{}
        } else if(_Nome_Pagina == 'Entrar_Em_Sala') {
          Carregar_Salas_Criadas()
        }

      } else {
        Pagina.classList.remove('Active')
      }
    })

  } else {
    Fazer_Login()
  }
}

function Voltar_Pagina() {
  if(Pag_Atual.Nome == 'Criar_Sala' || Pag_Atual.Nome == 'Entrar_Em_Sala' || Pag_Atual.Nome == 'Espera' || Pag_Atual == 'Quiz' || Pag_Atual == 'Fim_De_Jogo') {
    Abrir_Pagina('Home')
  }

  if(Pag_Atual.Nome == 'Espera' || Pag_Atual.Nome == 'Quiz' || Pag_Atual.Nome == 'Fim_De_Jogo') {
    if(Usuario.email == Sala_Atual.Criador) {
      Excluir_Sala()
    } else {
      Adversario_Saiu_Da_Sala()
    }
  }
}

function Adicionar_Hora(hours=0, minutes=0, seconds=0) {
  // Cria um novo objeto Date com a data e hora atuais
  const now = new Date()
  
  // Adiciona o tempo passado aos valores atuais
  now.setHours(now.getHours() + hours)
  now.setMinutes(now.getMinutes() + minutes)
  now.setSeconds(now.getSeconds() + seconds)

  // Retorna a data completa no formato "Dia Mês Ano - Hora:Minuto:Segundo"
  const day = now.getDate().toString().padStart(2, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const year = now.getFullYear()
  const hour = now.getHours().toString().padStart(2, '0')
  const minute = now.getMinutes().toString().padStart(2, '0')
  const second = now.getSeconds().toString().padStart(2, '0')

  return `${day}/${month}/${year} - ${hour}:${minute}:${second}`
}

function Converter_Segundos_E_Adicionar(totalSegundos) {
  const Horas = Math.floor(totalSegundos / 3600) // Calcula as horas
  const Minutos = Math.floor((totalSegundos % 3600) / 60) // Calcula os minutos
  const Segundos = totalSegundos % 60 // Calcula os segundos restantes

  return { Horas, Minutos, Segundos }
}

let Intervalo_Cronometro // Variável global para armazenar o intervalo

function Start_Countdown(targetTime) {
  const container = document.getElementById('Container_Cronometro')

  // Se houver um intervalo existente, limpa antes de iniciar um novo
  if (Intervalo_Cronometro) {
    clearInterval(Intervalo_Cronometro)
  }

  // Converte a string de data para um objeto Date
  const targetDate = new Date(targetTime.split(' - ')[0].split('/').reverse().join('-') + ' ' + targetTime.split(' - ')[1])

  // Função para atualizar a contagem regressiva
  function updateCountdown() {
    const now = new Date()
    const timeLeft = targetDate - now

    // Se o tempo acabou, pare a contagem
    if (timeLeft <= 0) {
      container.innerHTML = 'Tempo esgotado!'
      try {
        if(Usuario.email == Sala_Atual.Criador) {
          // console.log('Rapaz ----------------------------------------------- Rapaz ----------------------------------- Rapaz------------------------------- Rapaz--------------------')
          Comecar_Quiz()
        }
      } catch{}
      clearInterval(Intervalo_Cronometro)
      return
    }

    // Calcula os minutos e segundos restantes
    const minutes = Math.floor(timeLeft / 60000) // 60,000 ms em um minuto
    const seconds = Math.floor((timeLeft % 60000) / 1000) // Restante em segundos

    // Formata o tempo para ser sempre de 2 dígitos
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = seconds.toString().padStart(2, '0')

    // Exibe a contagem no container
    container.innerHTML = `${formattedMinutes}:${formattedSeconds}`
    
    // Animação: Fade-in suave a cada atualização
    container.style.opacity = 0
    setTimeout(() => {
      container.style.transition = 'opacity 0.5s'
      container.style.opacity = 1
    }, 50)
  }

  // Atualiza a contagem regressiva a cada segundo
  Intervalo_Cronometro = setInterval(updateCountdown, 1000)

  // Inicializa a contagem ao carregar
  updateCountdown()

  setTimeout(() => {
    Container_Pag_Quiz.classList.add('Active')
  }, 2000)
}


function Ativar_Questao() {
  const container = document.getElementById('Container_Pag_Quiz')
  container.classList.toggle('Active')
}

function Create_Ranking(data) {
  const rankingContainer = document.getElementById('Container_Ranking')
  rankingContainer.innerHTML = ''

  // Ordena os usuários por pontos em ordem decrescente
  const sortedData = data.sort((a, b) => b.Pontos - a.Pontos)

  // Renderiza o ranking
  sortedData.forEach((user, index) => {
    const item = document.createElement('div')
    item.className = 'ranking-item'
    item.style.animationDelay = `${index * 0.2}s`

    item.innerHTML = `
      <img src="${user.Foto_Perfil}" alt="${user.Nome}">
      <div class="info">
        <div class="name">${user.Nome}</div>
        <div class="email">${user.Email}</div>
      </div>
      <div class="bar">
        <span style="width: 0%"></span>
      </div>
      <div class="points">${user.Pontos} pontos</div>
    `

    rankingContainer.appendChild(item)

    // Anima a barra de pontuação após adicionar ao DOM
    setTimeout(() => {
      item.querySelector('.bar span').style.width = `${Math.min(user.Pontos / 1000, 100)}%`
    }, 100)
  })
}