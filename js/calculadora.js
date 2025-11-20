/* ========================================
   ALTORRA - Calculadora de Financiamiento
   ======================================== */

(function() {
  'use strict';

  // Formatear número como moneda COP
  function formatCOP(num) {
    if (!num && num !== 0) return '';
    return '$ ' + Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Calcular cuota mensual (fórmula de amortización francesa)
  function calcularCuota(monto, tasaAnual, plazoAnios) {
    const tasaMensual = (tasaAnual / 100) / 12;
    const numCuotas = plazoAnios * 12;

    if (tasaMensual === 0) {
      return monto / numCuotas;
    }

    const cuota = monto * (tasaMensual * Math.pow(1 + tasaMensual, numCuotas)) /
                  (Math.pow(1 + tasaMensual, numCuotas) - 1);

    return cuota;
  }

  // Crear HTML de la calculadora
  function createCalculatorHTML(precio = 0) {
    const montoInicial = precio > 0 ? Math.round(precio * 0.7) : ''; // 70% del precio como préstamo inicial

    return `
      <section class="calculator-card" id="calculadora-financiamiento">
        <h3>Calculadora de Financiamiento</h3>

        <div class="calc-form">
          <div class="calc-field">
            <label for="calc-monto">Monto del préstamo (COP)</label>
            <div class="input-with-prefix">
              <input
                type="number"
                id="calc-monto"
                value="${montoInicial}"
                placeholder="Ej: 300000000"
                min="0"
                step="1000000"
              >
            </div>
          </div>

          <div class="calc-field">
            <label for="calc-tasa">Tasa de interés anual (%)</label>
            <div class="input-with-suffix">
              <input
                type="number"
                id="calc-tasa"
                value="12.5"
                placeholder="Ej: 12.5"
                min="0"
                max="50"
                step="0.1"
              >
            </div>
          </div>

          <div class="calc-field">
            <label>Plazo (años)</label>
            <div class="calc-presets" id="calc-plazos">
              <button type="button" class="calc-preset" data-years="10">10 años</button>
              <button type="button" class="calc-preset" data-years="15">15 años</button>
              <button type="button" class="calc-preset active" data-years="20">20 años</button>
              <button type="button" class="calc-preset" data-years="25">25 años</button>
              <button type="button" class="calc-preset" data-years="30">30 años</button>
            </div>
            <input type="hidden" id="calc-plazo" value="20">
          </div>

          <button type="button" class="calc-btn" id="calc-calcular">
            Calcular cuota mensual
          </button>
        </div>

        <div class="calc-results hidden" id="calc-resultados">
          <div class="calc-result-main">
            <div class="label">Cuota mensual estimada</div>
            <div class="value" id="calc-cuota">$ 0</div>
          </div>

          <div class="calc-result-details">
            <div class="calc-detail-item">
              <div class="label">Total a pagar</div>
              <div class="value" id="calc-total">$ 0</div>
            </div>
            <div class="calc-detail-item">
              <div class="label">Total intereses</div>
              <div class="value" id="calc-intereses">$ 0</div>
            </div>
          </div>
        </div>

        <p class="calc-note">
          * Cálculo estimativo. Las condiciones finales dependen de la entidad financiera.
          Consulta con tu banco para obtener una cotización oficial.
        </p>
      </section>
    `;
  }

  // Inicializar eventos de la calculadora
  function initCalculator() {
    const calcularBtn = document.getElementById('calc-calcular');
    const plazosContainer = document.getElementById('calc-plazos');
    const plazoInput = document.getElementById('calc-plazo');

    if (!calcularBtn) return;

    // Manejar selección de plazo
    if (plazosContainer) {
      plazosContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('calc-preset')) {
          // Remover active de todos
          plazosContainer.querySelectorAll('.calc-preset').forEach(btn => {
            btn.classList.remove('active');
          });
          // Agregar active al seleccionado
          e.target.classList.add('active');
          // Actualizar valor
          plazoInput.value = e.target.dataset.years;
        }
      });
    }

    // Manejar cálculo
    calcularBtn.addEventListener('click', () => {
      const monto = parseFloat(document.getElementById('calc-monto').value) || 0;
      const tasa = parseFloat(document.getElementById('calc-tasa').value) || 0;
      const plazo = parseInt(document.getElementById('calc-plazo').value) || 20;

      if (monto <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
      }

      if (tasa <= 0) {
        alert('Por favor ingresa una tasa de interés válida');
        return;
      }

      // Calcular
      const cuotaMensual = calcularCuota(monto, tasa, plazo);
      const totalPagar = cuotaMensual * plazo * 12;
      const totalIntereses = totalPagar - monto;

      // Mostrar resultados
      document.getElementById('calc-cuota').textContent = formatCOP(cuotaMensual);
      document.getElementById('calc-total').textContent = formatCOP(totalPagar);
      document.getElementById('calc-intereses').textContent = formatCOP(totalIntereses);

      // Mostrar panel de resultados
      const resultados = document.getElementById('calc-resultados');
      resultados.classList.remove('hidden');

      // Animación suave
      resultados.style.opacity = '0';
      resultados.style.transform = 'translateY(10px)';
      setTimeout(() => {
        resultados.style.transition = 'all 0.3s ease';
        resultados.style.opacity = '1';
        resultados.style.transform = 'translateY(0)';
      }, 10);

      // Scroll al resultado si está fuera de vista
      resultados.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Calcular automáticamente al presionar Enter
    ['calc-monto', 'calc-tasa'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            calcularBtn.click();
          }
        });
      }
    });
  }

  // Función pública para insertar calculadora
  window.AltorraCalculadora = {
    insert: function(containerId, precio = 0) {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn('Contenedor de calculadora no encontrado:', containerId);
        return;
      }

      container.innerHTML = createCalculatorHTML(precio);
      initCalculator();
    },

    // Insertar después de un elemento
    insertAfter: function(elementId, precio = 0) {
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn('Elemento no encontrado:', elementId);
        return;
      }

      const wrapper = document.createElement('div');
      wrapper.innerHTML = createCalculatorHTML(precio);
      element.parentNode.insertBefore(wrapper.firstElementChild, element.nextSibling);
      initCalculator();
    },

    // Crear e insertar en un contenedor existente
    appendTo: function(selector, precio = 0) {
      const container = document.querySelector(selector);
      if (!container) {
        console.warn('Contenedor no encontrado:', selector);
        return;
      }

      const wrapper = document.createElement('div');
      wrapper.innerHTML = createCalculatorHTML(precio);
      container.appendChild(wrapper.firstElementChild);
      initCalculator();
    }
  };

  // Auto-inicializar si encuentra el contenedor
  document.addEventListener('DOMContentLoaded', () => {
    const autoContainer = document.getElementById('calculadora-container');
    if (autoContainer) {
      const precio = autoContainer.dataset.precio || 0;
      window.AltorraCalculadora.insert('calculadora-container', parseFloat(precio));
    }
  });

})();
