const TOTAL_PREGUNTAS = 17;
// 4 puntos por opción x 4 opciones por pregunta x 17 preguntas = 272 puntos totales
// 4 puntos por opción x 17 preguntas = 68 puntos máximo por color
const MAX_PUNTOS_POR_COLOR = 68; 
const UMBRAL_COMBINACION = 25.0; // Umbral para considerar una tendencia fuerte

function calcularResultado() {
    // Definimos los 4 colores y sus contadores iniciales (PUNTOS ACUMULADOS)
    let conteoColores = {
        rojo: 0,    // Analítico/Estructurado (VERDE en el doc)
        amarillo: 0, // Líder/Dominante (AMARILLO en el doc)
        verde: 0,   // Social/Influyente (ROJO en el doc)
        azul: 0      // Servicial/Estable (AZUL en el doc)
    };

    const cuestionario = document.getElementById('cuestionario');
    const cajaResultado = document.getElementById('caja-resultado');
    
    // --- 0. Inicialización y Limpieza ---
    cajaResultado.innerHTML = 'Calculando...';
    cajaResultado.className = 'resultado'; 
    cajaResultado.style.backgroundColor = '#f4f4f4';
    cajaResultado.style.color = '#333';

    let preguntas = cuestionario.querySelectorAll('.pregunta');
    let preguntasIncompletas = 0;

    // --- 1. Conteo de Puntos y Validación de al menos una respuesta por pregunta y no repetición ---
    preguntas.forEach(pregunta => {
        // Busca todos los <select> dentro de la pregunta
        const selects = pregunta.querySelectorAll('select'); 
        let clasificacionesUsadas = []; // Almacena 4, 3, 2, 1 o 0
        let clasificacionesValidas = 0; // Cuenta cuántas clasificaciones fueron dadas (valor > 0)

        selects.forEach(select => {
            const valor = parseInt(select.value); // El valor es el punto (4, 3, 2, 1 o 0)
            const categoria = select.getAttribute('data-categoria');

            if (valor > 0) {
                // Validación de repetición (Checa si ya se usó un valor de 1 a 4)
                if (clasificacionesUsadas.includes(valor)) {
                    // Si el valor ya está, hay un error de repetición
                    preguntasIncompletas = TOTAL_PREGUNTAS; // Dispara el error general
                    return; 
                }
                
                // Si la clasificación es válida y no se repite:
                clasificacionesUsadas.push(valor);
                clasificacionesValidas++;
                conteoColores[categoria] += valor;
            }
        });
        
        // Validación de que al menos una opción haya sido clasificada (valor > 0)
        if (clasificacionesValidas === 0) {
            preguntasIncompletas++;
        }
    });

    // --- 2. Validación Final ---
    if (preguntasIncompletas > 0 || preguntas.length !== TOTAL_PREGUNTAS) {
        cajaResultado.className = 'resultado';
        cajaResultado.innerHTML = `
            ⚠️ **Faltan clasificaciones o hay errores de repetición.**
            <br><br>
            **Instrucciones:** Debes clasificar al menos una opción en cada pregunta. Además, no puedes usar la misma clasificación (1, 2, 3 o 4) más de una vez por pregunta.
        `;
        cajaResultado.style.backgroundColor = '#ffeb3b';
        cajaResultado.style.color = '#333';
        cajaResultado.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    // --- 3. Cálculo de porcentajes (respecto al puntaje máximo de 68) ---
    let porcentajes = {};
    for (const color in conteoColores) {
        // El porcentaje se calcula sobre el máximo de puntos posibles para esa categoría (68)
        porcentajes[color] = ((conteoColores[color] / MAX_PUNTOS_POR_COLOR) * 100).toFixed(1);
    }
    
    // 4. Mostrar el resultado y la gráfica
    mostrarResultadoFinal(porcentajes, cajaResultado);
}

function mostrarResultadoFinal(porcentajes, elemento) {
    
    // --- 1. Generar la Gráfica de Pastel con 4 segmentos ---
    
    // Aseguramos que los porcentajes sean números para los cálculos
    const pRojo = parseFloat(porcentajes.rojo) || 0;
    const pAmarillo = parseFloat(porcentajes.amarillo) || 0;
    const pVerde = parseFloat(porcentajes.verde) || 0;
    const pAzul = parseFloat(porcentajes.azul) || 0;
    
    // Calcular dónde comienza cada segmento (sumando porcentajes)
    let startAmarillo = pRojo;
    let startVerde = startAmarillo + pAmarillo;
    let startAzul = startVerde + pVerde;

    // Corrección de la sintaxis CSS: usar 'background' en lugar de 'background-image'
    const pieChartStyle = `background: conic-gradient(
        /* ROJO (Analítico) - Mapeado a VERDE en CSS */
        #2ecc71 0% ${pRojo}%, 
        /* AMARILLO (Dominante) */
        #f1c40f ${startAmarillo}% ${startVerde}%, 
        /* VERDE (Social) - Mapeado a ROJO en CSS */
        #e74c3c ${startVerde}% ${startAzul}%,
        /* AZUL (Servicial) */
        #3498db ${startAzul}% 100%
    );`;

    // 2. Contenido del Resultado
    let htmlResultado = `
        <h2>Tu Perfil de Color Personalidad</h2>
        <div class="grafica-contenedor">
            <div id="pie-chart" style="${pieChartStyle}"></div>
            <div class="leyenda">
                <p><span class="color-dot verde-bg"></span> Analítico/Estructurado (Rojo): <strong>${porcentajes.rojo}%</strong></p>
                <p><span class="color-dot amarillo-bg"></span> Líder/Dominante (Amarillo): <strong>${porcentajes.amarillo}%</strong></p>
                <p><span class="color-dot rojo-bg"></span> Social/Influyente (Verde): <strong>${porcentajes.verde}%</strong></p>
                <p><span class="color-dot azul-bg"></span> Servicial/Estable (Azul): <strong>${porcentajes.azul}%</strong></p>
            </div>
        </div>
        
        <div class="resumen-texto">
            <h3>Análisis Detallado:</h3>
            ${generarResumenTexto(porcentajes)}
        </div>
    `;

    elemento.classList.remove('rojo', 'amarillo', 'verde', 'gris'); 
    elemento.innerHTML = htmlResultado;
    elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// -------------------------------------------------------------------------------------------------
// FUNCIÓN generarResumenTexto (Mantenida, ya tiene la retroalimentación completa)
// -------------------------------------------------------------------------------------------------

function generarResumenTexto(porcentajes) {
    let texto = `<p>Tu perfil es una combinación de fortalezas. A continuación, un análisis de tus **tendencias principales** (aquellas que superan el ${UMBRAL_COMBINACION}%):</p>`;
    
    // Objeto con la información COMPLETA del documento (mapeado a los colores del código)
    const perfiles = {
        // ROJO (Analítico/Estructurado, es VERDE en el doc)
        rojo: {
            nombre: 'Analítico/Estructurado',
            fortalezas: ['Puntuales', 'Planificadores', 'Organizados', 'Estructurados'], 
            debilidades: ['Pesimistas', 'Dudan', 'Analizan de más', 'Piensan mucho y no accionan'], 
            miedo: 'Conflictos y discusiones', 
            motivador: 'Reglas y procedimientos',
            comportamiento: 'En una llamada, pregunta por datos específicos y pide información para revisarla. Es frío y estructurado.',
            evita: 'Cantinflear, ser desordenado e impuntual.',
            recomendacion: 'Estudia MUY BIEN los productos. Si no sabes algo, reconócelo y cumple el plazo de respuesta.',
            clase_color: 'verde-bg-ligero', dot_color: 'verde-bg'
        },
        // AMARILLO (Líder/Dominante, es AMARILLO en el doc)
        amarillo: {
            nombre: 'Líder/Dominante',
            fortalezas: ['Dirigen', 'De resultados', 'Determinados', 'Líderes Natos', 'Audaces'], 
            debilidades: ['Interrumpen', 'No tienen tacto', 'Muy impacientes', 'No piden disculpas', 'Confrontantes'], 
            miedo: 'Fallar', 
            motivador: 'El poder',
            comportamiento: 'Hace preguntas desafiantes ("¿Qué gano?"). Adopta una postura impositiva y busca demostrar que él sabe más.',
            evita: 'Confrontarlo.',
            recomendacion: 'Dale la razón. Hazle ver que él tomó la mejor decisión y halágalo de manera genuina.',
            clase_color: 'amarillo-bg-ligero', dot_color: 'amarillo-bg'
        },
        // VERDE (Social/Influyente, es ROJO en el doc)
        verde: {
            nombre: 'Social/Influyente',
            fortalezas: ['Extrovertidos', 'Positivos', 'Expresivos', 'Carismáticos', 'Entusiastas'], 
            debilidades: ['Postergan', 'Desatentos a los detalles', 'Impuntuales', 'Hablan mucho', 'Impulsivos'], 
            miedo: 'Rechazo', 
            motivador: 'Reconocimiento',
            comportamiento: 'Quiere "echar chisme" y extender la plática personal. Es inquieto, pero busca influenciar a la gente.',
            evita: 'Ser rígido, obligarlo a tomar decisiones de forma rápida.',
            recomendacion: 'Utiliza visuales. Sé su guía sin obligarlo. Hazle ver que es divertido trabajar contigo.',
            clase_color: 'rojo-bg-ligero', dot_color: 'rojo-bg'
        },
        // AZUL (Servicial/Estable, es AZUL en el doc)
        azul: { 
            nombre: 'Servicial/Estable',
            fortalezas: ['Ayudan', 'Conciliadores', 'Empáticos', 'Leales', 'Te escuchan', 'Serviciales'], 
            debilidades: ['Lentos para hablar', 'Temerosos', 'No les gusta el cambio', 'No le gusta decidir', 'Reacciona lento'], 
            miedo: 'El cambio', 
            motivador: 'La seguridad',
            comportamiento: 'Responde amablemente. Te pone toda la atención, es súper bonachón. No cancela por no ser grosero.',
            evita: 'Confrontar, números, datos, presionar.',
            recomendacion: 'Hazlo visualizar los beneficios. Dale seguridad. Necesita tiempo para asimilar las ideas.',
            clase_color: 'azul-bg-ligero', dot_color: 'azul-bg'
        }
    };
    
    const colores = ['rojo', 'amarillo', 'verde', 'azul'];
    let perfilesEncontrados = 0;
    
    colores.forEach(color => {
        const porcentaje = parseFloat(porcentajes[color]);
        
        if (porcentaje >= UMBRAL_COMBINACION) {
            const perfil = perfiles[color];
            
            // INICIO DEL BLOQUE DE PERFIL
            texto += `<div class="perfil-resumen ${perfil.clase_color}">`;
            
            // Título
            texto += `<h4><span class="color-dot ${perfil.dot_color}"></span> Tendencia ${color.toUpperCase()} (${perfil.nombre}): ${porcentaje}%</h4>`;
            
            // Comportamiento Clave (Nueva Sección)
            texto += `<div class="tip-section comportamiento">
                        <span class="tip-icon">👤</span>
                        <strong>Comportamiento Clave:</strong> ${perfil.comportamiento}
                      </div>`;

            // Fortalezas y Debilidades
            texto += `<div class="fortaleza-debilidad">
                        <div>
                            <p><strong>💪 Fortalezas:</strong></p><ul>`;
                            perfil.fortalezas.forEach(f => {
                                texto += `<li>${f}</li>`;
                            });
                            texto += `</ul>
                        </div>
                        <div>
                            <p><strong>🚩 Debilidades/Áreas de Mejora:</strong></p><ul>`;
                            perfil.debilidades.forEach(d => {
                                texto += `<li>${d}</li>`;
                            });
                            texto += `</ul>
                        </div>
                      </div>`;
            
            // Miedo y Motivador
            texto += `<p class="miedo-motivador"><strong>Miedo principal:</strong> ${perfil.miedo}. <strong>Motivador:</strong> ${perfil.motivador}.</p>`;

            // Recomendación (Estilo Audaz)
            texto += `<div class="tip-section recomendacion">
                        <span class="tip-icon">💡</span>
                        <strong>Recomendación Estratégica:</strong> ${perfil.recomendacion}
                      </div>`;

            // Evita (Estilo Audaz)
            texto += `<div class="tip-section evita">
                        <span class="tip-icon">🚫</span>
                        <strong>Lo que debes EVITAR (en otros o en ti):</strong> ${perfil.evita}
                      </div>`;
            
            texto += `</div>`; // Fin del bloque de perfil
            
            perfilesEncontrados++;
        }
    });

    if (perfilesEncontrados === 0) {
         texto += `<p>Tu perfil es muy balanceado, sin una sola tendencia clara que supere el ${UMBRAL_COMBINACION}%. Eres una persona muy adaptable y versátil.</p>`;
    }
    
    return texto;
}