// El código es ahora flexible y no requiere TOTAL_PREGUNTAS
const UMBRAL_COMBINACION = 25.0; // Umbral para considerar una tendencia fuerte

function calcularResultado() {
    let conteoColores = {
        rojo: 0,    // Analítico/Estructurado
        amarillo: 0, // Líder/Dominante
        verde: 0,   // Social/Influyente
        azul: 0      // Servicial/Estable
    };

    const cuestionario = document.getElementById('cuestionario');
    const cajaResultado = document.getElementById('caja-resultado');
    
    // --- 0. Inicialización y Limpieza ---
    cajaResultado.innerHTML = 'Calculando...';
    cajaResultado.className = 'resultado'; 
    cajaResultado.style.backgroundColor = '#f4f4f4';
    cajaResultado.style.color = '#333';

    let preguntas = cuestionario.querySelectorAll('.pregunta');
    let numeroPreguntas = preguntas.length;
    let preguntasIncompletas = 0;

    // --- 1. Conteo de Puntos y Validación ---
    preguntas.forEach(pregunta => {
        const selects = pregunta.querySelectorAll('select'); 
        let clasificacionesUsadas = []; 
        let clasificacionesValidas = 0; 

        selects.forEach(select => {
            const valor = parseInt(select.value); 
            const categoria = select.getAttribute('data-categoria');

            if (valor > 0) {
                // Validación de repetición
                if (clasificacionesUsadas.includes(valor)) {
                    preguntasIncompletas = numeroPreguntas; 
                    return; 
                }
                
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
    if (preguntasIncompletas > 0 || numeroPreguntas === 0) {
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
    
    // --- 3. Cálculo de porcentajes (respecto al puntaje total de la persona) ---
    
    // 💡 PASO 1: Sumar el total de puntos obtenidos en TODAS las categorías.
    let puntajeTotalAcumulado = 0;
    for (const color in conteoColores) {
        puntajeTotalAcumulado += conteoColores[color];
    }
    
    if (puntajeTotalAcumulado === 0) {
        cajaResultado.innerHTML = `⚠️ Error de cálculo. No se pudieron obtener puntos válidos.`;
        return;
    }

    // 💡 PASO 2: Calcular el porcentaje de cada color sobre ese total (el 100%).
    let porcentajes = {};
    for (const color in conteoColores) {
        // El porcentaje de la gráfica se calcula sobre el total de puntos de la persona.
        porcentajes[color] = ((conteoColores[color] / puntajeTotalAcumulado) * 100).toFixed(1);
    }
    
    // 4. Mostrar el resultado y la gráfica
    mostrarResultadoFinal(porcentajes, cajaResultado);
}

function mostrarResultadoFinal(porcentajes, elemento) {
    
    // Aseguramos que los porcentajes sean números para los cálculos
    const pRojo = parseFloat(porcentajes.rojo) || 0;     // Analítico/Estructurado
    const pAmarillo = parseFloat(porcentajes.amarillo) || 0; // Líder/Dominante
    const pVerde = parseFloat(porcentajes.verde) || 0;   // Social/Influyente
    const pAzul = parseFloat(porcentajes.azul) || 0;     // Servicial/Estable
    
    // Calcular dónde comienza cada segmento (sumando porcentajes)
    let startAmarillo = pRojo;
    let startVerde = startAmarillo + pAmarillo;
    let startAzul = startVerde + pVerde;

    // Colores CSS para los perfiles (AHORA INVERTIDOS):
    // ROJO/Analítico -> ROJO CSS (#e74c3c)
    // AMARILLO/Dominante -> Amarillo CSS (#f1c40f)
    // VERDE/Social -> VERDE CSS (#2ecc71)
    // AZUL/Servicial -> Azul CSS (#3498db)
    
    const pieChartStyle = `background: conic-gradient(
        /* ROJO (Analítico/Estructurado) - ROJO CSS */
        #e74c3c 0% ${pRojo}%, 
        /* AMARILLO (Líder/Dominante) - AMARILLO CSS */
        #f1c40f ${startAmarillo}% ${startVerde}%, 
        /* VERDE (Social/Influyente) - VERDE CSS */
        #2ecc71 ${startVerde}% ${startAzul}%,
        /* AZUL (Servicial/Estable) - AZUL CSS */
        #3498db ${startAzul}% 100%
    );`;

    // 2. Contenido del Resultado
    let htmlResultado = `
        <h2>Tu Perfil de Color Personalidad</h2>
        <div class="grafica-contenedor">
            <div id="pie-chart" style="${pieChartStyle}"></div>
            <div class="leyenda">
                <p><span class="color-dot rojo-bg"></span> Analítico/Estructurado (Rojo): <strong>${porcentajes.rojo}%</strong></p>
                <p><span class="color-dot amarillo-bg"></span> Líder/Dominante (Amarillo): <strong>${porcentajes.amarillo}%</strong></p>
                <p><span class="color-dot verde-bg"></span> Social/Influyente (Verde): <strong>${porcentajes.verde}%</strong></p>
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
// FUNCIÓN generarResumenTexto (CORREGIDO: Se elimina el error de referencia y se usa UMBRAL_COMBINACION)
// -------------------------------------------------------------------------------------------------

function generarResumenTexto(porcentajes) {
    // 💡 CORRECCIÓN: Se usa la variable UMBRAL_COMBINACION correctamente
    let texto = `<p>Tu perfil es una combinación de fortalezas. A continuación, un análisis de las **cuatro tendencias** que componen tu perfil, ordenadas de mayor a menor relevancia:</p>`;
    
    // Objeto de información de perfiles (sin cambios, ya es correcto)
    const perfiles = {
        rojo: {
            nombre: 'Analítico/Estructurado', fortalezas: ['Puntuales', 'Planificadores', 'Organizados', 'Estructurados'], debilidades: ['Pesimistas', 'Dudan', 'Analizan de más', 'Piensan mucho y no accionan'], miedo: 'Conflictos y discusiones', motivador: 'Reglas y procedimientos', comportamiento: 'En una llamada, pregunta por datos específicos y pide información para revisarla. Es frío y estructurado.', evita: 'Ser superficial, falta de detalles e impuntualidad.', recomendacion: 'Estudia MUY BIEN los productos. Si no sabes algo, reconócelo y cumple el plazo de respuesta.', clase_color: 'rojo-bg-ligero', dot_color: 'rojo-bg'
        },
        amarillo: {
            nombre: 'Líder/Dominante', fortalezas: ['Dirigen', 'De resultados', 'Determinados', 'Líderes Natos', 'Audaces'], debilidades: ['Interrumpen', 'No tienen tacto', 'Muy impacientes', 'No piden disculpas', 'Confrontantes'], miedo: 'Fallar', motivador: 'El poder', comportamiento: 'Hace preguntas desafiantes ("¿Qué gano?"). Adopta una postura impositiva y busca demostrar que él sabe más.', evita: 'Ser lento, dar rodeos o confrontarlo directamente.', recomendacion: 'Dale la razón. Hazle ver que él tomó la mejor decisión y halágalo de manera genuina.', clase_color: 'amarillo-bg-ligero', dot_color: 'amarillo-bg'
        },
        verde: {
            nombre: 'Social/Influyente', fortalezas: ['Extrovertidos', 'Positivos', 'Expresivos', 'Carismáticos', 'Entusiastas'], debilidades: ['Postergan', 'Desatentos a los detalles', 'Impuntuales', 'Hablan mucho', 'Impulsivos'], miedo: 'Rechazo', motivador: 'Reconocimiento', comportamiento: 'Quiere "echar chisme" y extender la plática personal. Es inquieto, pero busca influenciar a la gente.', evita: 'Ser rígido, obligarlo a tomar decisiones de forma rápida y el silencio prolongado.', recomendacion: 'Utiliza visuales. Sé su guía sin obligarlo. Hazle ver que es divertido trabajar contigo.', clase_color: 'verde-bg-ligero', dot_color: 'verde-bg'
        },
        azul: { 
            nombre: 'Servicial/Estable', fortalezas: ['Ayudan', 'Conciliadores', 'Empáticos', 'Leales', 'Te escuchan', 'Serviciales'], debilidades: ['Lentos para hablar', 'Temerosos', 'No les gusta el cambio', 'No le gusta decidir', 'Reacciona lento'], miedo: 'El cambio', motivador: 'La seguridad', comportamiento: 'Responde amablemente. Te pone toda la atención, es súper bonachón. No cancela por no ser grosero.', evita: 'Presionar, confrontar, forzar un cambio rápido y usar muchos datos/cifras.', recomendacion: 'Hazlo visualizar los beneficios. Dale seguridad. Necesita tiempo para asimilar las ideas.', clase_color: 'azul-bg-ligero', dot_color: 'azul-bg'
        }
    };
    
    // 1. Convertir porcentajes a un array de objetos
    const tendencias = Object.keys(porcentajes).map(color => ({
        color: color,
        porcentaje: parseFloat(porcentajes[color])
    }));

    // 2. Ordenar: Todos los colores, de mayor a menor porcentaje.
    const tendenciasOrdenadas = tendencias
        .sort((a, b) => b.porcentaje - a.porcentaje); // Orden descendente
    
    // 3. Generar el resumen usando el array ordenado (se muestran todos los 4)
    tendenciasOrdenadas.forEach(tendencia => {
        const color = tendencia.color;
        const porcentaje = tendencia.porcentaje;
        const perfil = perfiles[color];
        
        if (perfil) {
            // Se define la clase de estilo basada en el UMBRAL_COMBINACION
            const esTendenciaFuerte = tendencia.porcentaje >= UMBRAL_COMBINACION;
            const claseAdicional = esTendenciaFuerte ? 'tendencia-fuerte' : 'tendencia-secundaria';

            // INICIO DEL BLOQUE DE PERFIL
            texto += `<div class="perfil-resumen ${perfil.clase_color} ${claseAdicional}">`;
            
            // Título
            let titulo = `<h4><span class="color-dot ${perfil.dot_color}"></span> Tendencia ${color.toUpperCase()} (${perfil.nombre}): ${porcentaje}%`;
            
            if (esTendenciaFuerte) {
                 titulo += ` (PRINCIPAL) `;
            } else {
                 titulo += ` (Secundaria/Baja) `;
            }

            titulo += `</h4>`;
            texto += titulo;
            
            // Comportamiento Clave 
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
        }
    });

    return texto;
}
