// Array de perguntas com objetos contendo pergunta, alternativas e resposta correta
const questions = [
    {
        question: "Qual é a capital do Brasil?",
        alternatives: ["São Paulo", "Rio de Janeiro", "Brasília", "Belo Horizonte"],
        correctAnswer: 2
    },
    {
        question: "Quem pintou a obra 'Mona Lisa'?",
        alternatives: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
        correctAnswer: 1
    },
    {
        question: "Qual é o maior planeta do Sistema Solar?",
        alternatives: ["Terra", "Marte", "Saturno", "Júpiter"],
        correctAnswer: 3
    },
    {
        question: "Em que ano o homem pisou na Lua pela primeira vez?",
        alternatives: ["1967", "1969", "1971", "1973"],
        correctAnswer: 1
    },
    {
        question: "Qual é o elemento químico representado pelo símbolo 'O'?",
        alternatives: ["Ouro", "Ósmio", "Oxigênio", "Ozônio"],
        correctAnswer: 2
    },
    {
        question: "Quantos continentes existem no mundo?",
        alternatives: ["5", "6", "7", "8"],
        correctAnswer: 2
    },
    {
        question: "Qual é o rio mais longo do mundo?",
        alternatives: ["Rio Amazonas", "Rio Nilo", "Rio Mississippi", "Rio Yangtzé"],
        correctAnswer: 1
    },
    {
        question: "Quem escreveu 'Dom Casmurro'?",
        alternatives: ["José de Alencar", "Machado de Assis", "Clarice Lispector", "Graciliano Ramos"],
        correctAnswer: 1
    },
    {
        question: "Qual é a fórmula química da água?",
        alternatives: ["CO2", "H2O", "O2", "CH4"],
        correctAnswer: 1
    },
    {
        question: "Em que país se localiza Machu Picchu?",
        alternatives: ["Chile", "Bolívia", "Peru", "Equador"],
        correctAnswer: 2
    }
];

// Variáveis de controle do jogo
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let gameData = {
    answers: [],
    startTime: null,
    endTime: null
};

// Elementos do DOM
const elements = {
    quizArea: document.getElementById('quiz-area'),
    resultsArea: document.getElementById('results-area'),
    questionText: document.getElementById('question-text'),
    alternativesContainer: document.getElementById('alternatives-container'),
    currentQuestionEl: document.getElementById('current-question'),
    currentScoreEl: document.getElementById('current-score'),
    bestScoreEl: document.getElementById('best-score'),
    progressFill: document.getElementById('progress-fill'),
    nextBtn: document.getElementById('next-btn'),
    restartBtn: document.getElementById('restart-btn'),
    finalScoreEl: document.getElementById('final-score'),
    scoreMessageEl: document.getElementById('score-message'),
    bestScoreDisplayEl: document.getElementById('best-score-display'),
    playAgainBtn: document.getElementById('play-again-btn')
};

// Função para carregar dados do localStorage
function loadGameData() {
    try {
        const savedData = localStorage.getItem('quizGameData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            return parsed;
        }
    } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
    }
    return { bestScore: 0, totalGames: 0, allScores: [] };
}

// Função para salvar dados no localStorage
function saveGameData(data) {
    try {
        localStorage.setItem('quizGameData', JSON.stringify(data));
    } catch (error) {
        console.error('Erro ao salvar dados no localStorage:', error);
    }
}

// Função para inicializar o jogo
function initGame() {
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswer = null;
    gameData = {
        answers: [],
        startTime: new Date(),
        endTime: null
    };

    const savedData = loadGameData();
    elements.bestScoreEl.textContent = savedData.bestScore;
    
    showQuestion();
    updateStats();
    updateProgressBar();
    
    elements.quizArea.classList.remove('hidden');
    elements.resultsArea.classList.add('hidden');
}

// Função para exibir a pergunta atual
function showQuestion() {
    const question = questions[currentQuestionIndex];
    elements.questionText.textContent = question.question;
    
    // Limpar alternativas anteriores
    elements.alternativesContainer.innerHTML = '';
    
    // Criar alternativas dinamicamente usando createElement
    question.alternatives.forEach((alternative, index) => {
        const alternativeEl = document.createElement('div');
        alternativeEl.className = 'alternative';
        alternativeEl.textContent = alternative;
        alternativeEl.dataset.index = index;
        
        alternativeEl.addEventListener('click', () => selectAnswer(index, alternativeEl));
        elements.alternativesContainer.appendChild(alternativeEl);
    });
    
    selectedAnswer = null;
    elements.nextBtn.disabled = true;
}

// Função para selecionar uma resposta
function selectAnswer(answerIndex, elementClicked) {
    if (selectedAnswer !== null) return; // Previne múltiplas seleções
    
    selectedAnswer = answerIndex;
    const question = questions[currentQuestionIndex];
    const isCorrect = answerIndex === question.correctAnswer;
    
    // Registrar a resposta
    gameData.answers.push({
        questionIndex: currentQuestionIndex,
        selectedAnswer: answerIndex,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        timeSpent: new Date() - gameData.startTime
    });
    
    if (isCorrect) {
        score++;
    }
    
    // Aplicar estilos visuais para mostrar acertos/erros
    const alternatives = elements.alternativesContainer.querySelectorAll('.alternative');
    
    // Usar laço de repetição para percorrer as alternativas
    for (let i = 0; i < alternatives.length; i++) {
        const alt = alternatives[i];
        alt.classList.add('disabled');
        
        // Usar condicionais para checar acertos e aplicar estilos
        if (i === question.correctAnswer) {
            alt.classList.add('correct');
        } else if (i === answerIndex && i !== question.correctAnswer) {
            alt.classList.add('incorrect');
        }
    }
    
    elements.nextBtn.disabled = false;
    updateStats();
}

// Função para ir para a próxima pergunta
function nextQuestion() {
    currentQuestionIndex++;
    
    // Usar condicional para controlar o fluxo do quiz
    if (currentQuestionIndex < questions.length) {
        showQuestion();
        updateStats();
        updateProgressBar();
    } else {
        endGame();
    }
}

// Função para finalizar o jogo
function endGame() {
    gameData.endTime = new Date();
    const savedData = loadGameData();
    
    // Atualizar estatísticas
    savedData.totalGames++;
    savedData.allScores.push(score);
    
    // Verificar se é um novo recorde
    const isNewRecord = score > savedData.bestScore;
    if (isNewRecord) {
        savedData.bestScore = score;
    }
    
    // Salvar dados atualizados
    saveGameData(savedData);
    
    showResults(isNewRecord);
}

// Função para exibir os resultados
function showResults(isNewRecord) {
    const percentage = Math.round((score / questions.length) * 100);
    
    elements.finalScoreEl.textContent = `${score}/${questions.length}`;
    
    // Mensagem baseada na pontuação
    let message = '';
    if (percentage >= 90) {
        message = '🏆 Excelente! Você é um verdadeiro conhecedor!';
    } else if (percentage >= 70) {
        message = '👏 Muito bem! Ótimo desempenho!';
    } else if (percentage >= 50) {
        message = '👍 Bom trabalho! Continue estudando!';
    } else {
        message = '📚 Que tal estudar um pouco mais e tentar novamente?';
    }
    
    elements.scoreMessageEl.textContent = message;
    
    if (isNewRecord) {
        elements.bestScoreDisplayEl.innerHTML = `🎉 <strong>Novo Recorde!</strong> Sua melhor pontuação: ${score}/${questions.length}`;
        elements.bestScoreDisplayEl.style.display = 'block';
    } else {
        const savedData = loadGameData();
        elements.bestScoreDisplayEl.innerHTML = `🏅 Seu recorde atual: ${savedData.bestScore}/${questions.length}`;
        elements.bestScoreDisplayEl.style.display = 'block';
    }
    
    elements.quizArea.classList.add('hidden');
    elements.resultsArea.classList.remove('hidden');
}

// Função para atualizar as estatísticas na tela
function updateStats() {
    elements.currentQuestionEl.textContent = currentQuestionIndex + 1;
    elements.currentScoreEl.textContent = score;
}

// Função para atualizar a barra de progresso
function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    elements.progressFill.style.width = `${progress}%`;
}

// Event listeners
elements.nextBtn.addEventListener('click', nextQuestion);
elements.restartBtn.addEventListener('click', initGame);
elements.playAgainBtn.addEventListener('click', initGame);

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', initGame);
