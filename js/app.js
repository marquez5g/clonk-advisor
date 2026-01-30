// Clonk Advisor - Quiz Application

(function() {
  'use strict';

  // Quiz configuration
  const questions = [
    {
      id: 'business_type',
      text: '¿Qué tipo de negocio tienes?',
      type: 'context',
      options: [
        { value: 'restaurant', label: 'Restaurante' },
        { value: 'retail', label: 'Retail' },
        { value: 'hotel', label: 'Hotel' },
        { value: 'services', label: 'Servicios' },
        { value: 'other', label: 'Otro' }
      ]
    },
    {
      id: 'employee_count',
      text: '¿Cuántos empleados programas regularmente?',
      type: 'context',
      options: [
        { value: '1-10', label: '1-10' },
        { value: '11-30', label: '11-30' },
        { value: '31-50', label: '31-50' },
        { value: '50+', label: 'Más de 50' }
      ]
    },
    {
      id: 'scheduling_method',
      text: '¿Cómo programas los turnos actualmente?',
      type: 'diagnostic',
      options: [
        { value: 'paper', label: 'Papel o pizarra', weight: 1 },
        { value: 'excel', label: 'Excel o Google Sheets', weight: 2 },
        { value: 'whatsapp', label: 'WhatsApp + improvisación', weight: 1 },
        { value: 'software', label: 'Software especializado', weight: 4 }
      ]
    },
    {
      id: 'overtime_tracking',
      text: '¿Sabes cuántas horas extras generaste el mes pasado?',
      type: 'diagnostic',
      options: [
        { value: 'no_idea', label: 'No tengo idea', weight: 1 },
        { value: 'many', label: 'Sé que fueron muchas pero no el número exacto', weight: 2 },
        { value: 'approximate', label: 'Sí, tengo el número aproximado', weight: 3 },
        { value: 'weekly', label: 'Sí, lo mido cada semana', weight: 4 }
      ]
    },
    {
      id: 'schedule_changes',
      text: '¿Con qué frecuencia cambias turnos a última hora?',
      type: 'diagnostic',
      options: [
        { value: 'daily', label: 'Casi todos los días', weight: 1 },
        { value: 'weekly', label: 'Varias veces por semana', weight: 2 },
        { value: 'occasional', label: 'Ocasionalmente', weight: 3 },
        { value: 'rare', label: 'Rara vez, todo está planificado', weight: 4 }
      ]
    }
  ];

  // Results content by level
  const levelContent = {
    reactive: {
      name: 'Reactivo',
      icon: '🔥',
      color: '#F54359',
      diagnosis: 'Tu gestión de turnos está en modo supervivencia',
      problems: [
        'Horas extras no planificadas que disparan costos',
        'Empleados insatisfechos por cambios constantes',
        'No sabes cuánto te cuesta realmente la nómina hasta fin de mes'
      ],
      wins: [
        'Empieza a registrar las horas extras esta semana (aunque sea en papel)',
        'Define un "día de cierre" de turnos (ej: jueves para la próxima semana)',
        'Identifica tus 3 empleados más flexibles para emergencias'
      ]
    },
    structured: {
      name: 'Estructurado',
      icon: '⚙️',
      color: '#ec6851',
      diagnosis: 'Tienes proceso pero te falta visibilidad',
      problems: [
        'Sabes que hay ineficiencias pero no sabes cuantificarlas',
        'Los cambios de último minuto siguen generando caos',
        'Dependes de la memoria para saber quién puede cubrir qué'
      ],
      wins: [
        'Crea un dashboard simple con horas programadas vs ejecutadas',
        'Implementa un sistema de "disponibilidad" semanal de empleados',
        'Analiza qué día/turno genera más horas extras y por qué'
      ]
    },
    optimized: {
      name: 'Optimizado',
      icon: '🚀',
      color: '#1aa979',
      diagnosis: 'Estás listo para automatizar y escalar',
      problems: [
        'El proceso manual consume tiempo que podrías usar en estrategia',
        'Dificultad para proyectar costos laborales futuros',
        'Quieres crecer pero el sistema actual no escala'
      ],
      wins: [
        'Automatiza alertas cuando un empleado se acerca a horas extras',
        'Implementa reportes de costo laboral por turno/ubicación',
        'Usa datos históricos para predecir demanda y optimizar plantilla'
      ]
    }
  };

  // Application state
  let state = {
    currentStep: 0, // 0 = welcome, 1-5 = questions, 6 = results, 7 = email, 8 = cta
    answers: {},
    score: 0,
    level: null
  };

  // Load state from localStorage
  function loadState() {
    try {
      const saved = localStorage.getItem('clonk_advisor_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if not completed
        if (parsed.currentStep < 6) {
          state = parsed;
        }
      }
    } catch (e) {
      console.log('Could not load saved state');
    }
  }

  // Save state to localStorage
  function saveState() {
    try {
      localStorage.setItem('clonk_advisor_state', JSON.stringify(state));
    } catch (e) {
      console.log('Could not save state');
    }
  }

  // Clear saved state
  function clearState() {
    try {
      localStorage.removeItem('clonk_advisor_state');
    } catch (e) {
      console.log('Could not clear state');
    }
  }

  // Calculate score from diagnostic questions
  function calculateScore() {
    let totalWeight = 0;
    let maxWeight = 0;

    questions.forEach(q => {
      if (q.type === 'diagnostic' && state.answers[q.id]) {
        const answer = state.answers[q.id];
        const option = q.options.find(o => o.value === answer);
        if (option && option.weight) {
          totalWeight += option.weight;
          maxWeight += 4; // Max weight per question is 4
        }
      }
    });

    // Normalize to 0-100
    const normalizedScore = maxWeight > 0 ? Math.round((totalWeight / maxWeight) * 100) : 0;
    return normalizedScore;
  }

  // Determine level based on score
  function determineLevel(score) {
    if (score <= 33) return 'reactive';
    if (score <= 66) return 'structured';
    return 'optimized';
  }

  // Render welcome screen
  function renderWelcome() {
    return `
      <div class="screen active" id="screen-welcome">
        <div class="welcome-content">
          <img src="assets/logo.svg" alt="Clonk" class="logo">
          <h1>Diagnóstico de Gestión de Turnos</h1>
          <p class="subtitle">Descubre tu nivel de madurez y recibe recomendaciones personalizadas en 2 minutos</p>
          <button class="btn btn-primary btn-full" onclick="app.start()">
            Comenzar diagnóstico
            <span class="icon">→</span>
          </button>
        </div>
      </div>
    `;
  }

  // Render question screen
  function renderQuestion(questionIndex) {
    const question = questions[questionIndex];
    const progress = ((questionIndex + 1) / questions.length) * 100;
    const selectedValue = state.answers[question.id] || null;

    const optionsHtml = question.options.map(opt => `
      <label class="option-card">
        <input type="radio" name="${question.id}" value="${opt.value}"
          ${selectedValue === opt.value ? 'checked' : ''}
          onchange="app.selectOption('${question.id}', '${opt.value}')">
        <span class="option-label">
          <span class="option-radio"></span>
          ${opt.label}
        </span>
      </label>
    `).join('');

    return `
      <div class="screen active" id="screen-question-${questionIndex}">
        <div class="card animate">
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-text">Pregunta ${questionIndex + 1} de ${questions.length}</div>
          </div>

          <p class="question-text">${question.text}</p>

          <div class="options-container">
            ${optionsHtml}
          </div>

          <div class="nav-buttons">
            ${questionIndex > 0 ? `
              <button class="btn btn-secondary" onclick="app.prevQuestion()">
                <span class="icon">←</span>
                Anterior
              </button>
            ` : ''}
            <button class="btn btn-primary" id="next-btn"
              ${!selectedValue ? 'disabled' : ''}
              onclick="app.nextQuestion()">
              ${questionIndex === questions.length - 1 ? 'Ver resultados' : 'Siguiente'}
              <span class="icon">→</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Render results screen
  function renderResults() {
    const level = levelContent[state.level];
    const circumference = 2 * Math.PI * 90; // radius = 90
    const offset = circumference - (state.score / 100) * circumference;

    const problemsHtml = level.problems.map(p => `<li>${p}</li>`).join('');
    const winsHtml = level.wins.map(w => `<li>${w}</li>`).join('');

    return `
      <div class="screen active" id="screen-results">
        <div class="results-content">
          <div class="card animate">
            <div class="gauge-container">
              <div class="gauge">
                <svg viewBox="0 0 200 200">
                  <circle class="gauge-bg" cx="100" cy="100" r="90"/>
                  <circle class="gauge-fill" cx="100" cy="100" r="90"
                    stroke="${level.color}"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${circumference}"
                    id="gauge-progress"/>
                </svg>
                <div class="gauge-center">
                  <div class="gauge-score" id="score-display" style="color: ${level.color}">0</div>
                  <div class="gauge-label">puntos</div>
                </div>
              </div>
              <div class="level-badge ${state.level}">
                <span>${level.icon}</span>
                <span>Nivel ${level.name}</span>
              </div>
            </div>
          </div>

          <div class="card animate">
            <div class="diagnosis-text">"${level.diagnosis}"</div>

            <div class="problems-section">
              <h3 class="section-title">
                <span>⚠️</span>
                Problemas comunes en tu nivel
              </h3>
              <ul class="problems-list">
                ${problemsHtml}
              </ul>
            </div>

            <div class="wins-section">
              <h3 class="section-title">
                <span>✅</span>
                3 Quick Wins para esta semana
              </h3>
              <ul class="wins-list">
                ${winsHtml}
              </ul>
            </div>
          </div>

          <div class="card animate">
            <div class="cta-section">
              <h3>¿Quieres optimizar tu gestión de turnos?</h3>
              <p style="color: #5a7a8a; margin-bottom: 0;">Clonk te ayuda a reducir horas extras y mejorar la satisfacción de tu equipo.</p>
              <div class="cta-buttons">
                <a href="https://meet.brevo.com/clonk/demo" target="_blank" class="btn btn-action btn-full">
                  Agenda una demo de Clonk
                  <span class="icon">→</span>
                </a>
                <button class="btn btn-secondary btn-full" onclick="app.shareResults()">
                  <span class="icon">📤</span>
                  Compartir mi resultado
                </button>
                <div class="share-success" id="share-success">
                  ¡Link copiado al portapapeles!
                </div>
                <button class="btn btn-link" onclick="app.restart()">
                  Volver a empezar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Animate score counter
  function animateScore() {
    const scoreDisplay = document.getElementById('score-display');
    const gaugeProgress = document.getElementById('gauge-progress');

    if (!scoreDisplay || !gaugeProgress) return;

    const circumference = 2 * Math.PI * 90;
    const targetScore = state.score;
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentScore = Math.round(easeOut * targetScore);
      scoreDisplay.textContent = currentScore;

      const offset = circumference - (easeOut * targetScore / 100) * circumference;
      gaugeProgress.style.strokeDashoffset = offset;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // Render the current screen
  function render() {
    const container = document.getElementById('app');

    if (state.currentStep === 0) {
      container.innerHTML = renderWelcome();
    } else if (state.currentStep <= questions.length) {
      container.innerHTML = renderQuestion(state.currentStep - 1);
    } else {
      container.innerHTML = renderResults();
      // Animate score after render
      setTimeout(animateScore, 100);
    }
  }

  // Public API
  window.app = {
    init() {
      loadState();
      render();
    },

    start() {
      state.currentStep = 1;
      state.answers = {};
      saveState();
      render();
    },

    selectOption(questionId, value) {
      state.answers[questionId] = value;
      saveState();

      // Enable next button
      const nextBtn = document.getElementById('next-btn');
      if (nextBtn) {
        nextBtn.disabled = false;
      }
    },

    nextQuestion() {
      const currentQuestion = questions[state.currentStep - 1];
      if (!state.answers[currentQuestion.id]) return;

      if (state.currentStep < questions.length) {
        state.currentStep++;
        saveState();
        render();
      } else {
        // Calculate results
        state.score = calculateScore();
        state.level = determineLevel(state.score);
        state.currentStep = questions.length + 1;
        saveState();
        render();
      }
    },

    prevQuestion() {
      if (state.currentStep > 1) {
        state.currentStep--;
        saveState();
        render();
      }
    },

    shareResults() {
      const shareUrl = window.location.href;
      const shareText = `Mi nivel de madurez en gestión de turnos es "${levelContent[state.level].name}" con ${state.score} puntos. ¡Descubre el tuyo!`;

      if (navigator.share) {
        navigator.share({
          title: 'Mi Diagnóstico de Gestión de Turnos - Clonk',
          text: shareText,
          url: shareUrl
        }).catch(() => {
          // Fallback to clipboard
          copyToClipboard(shareUrl);
        });
      } else {
        copyToClipboard(shareUrl);
      }
    },

    restart() {
      clearState();
      state = {
        currentStep: 0,
        answers: {},
        score: 0,
        level: null
      };
      render();
    }
  };

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      const successEl = document.getElementById('share-success');
      if (successEl) {
        successEl.classList.add('show');
        setTimeout(() => {
          successEl.classList.remove('show');
        }, 3000);
      }
    }).catch(() => {
      alert('No se pudo copiar el link. URL: ' + text);
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else {
    app.init();
  }
})();
