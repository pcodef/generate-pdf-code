const letterMap = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
    'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'
};

let frases = [];

function normalizarTexto(texto) {
    return texto
        .replace(/[áéíóúÁÉÍÓÚ]/g, letra => letterMap[letra] || letra) // Quitar tildes
        .toLowerCase()
        .replace(/[^a-zñ]/g, ''); // Eliminar todo lo que no sea una letra
}

function agregarFrase() {
    let input = document.getElementById("inputFrase").value;
    let fraseLimpia = normalizarTexto(input);

    if (!fraseLimpia) {
        alert("Ingresa una frase válida");
        return;
    }

    frases.push(fraseLimpia);
    mostrarVistaPrevia();
}

function mostrarVistaPrevia() {
    let preview = document.getElementById("preview");
    preview.innerHTML = ''; // Limpiar la vista previa

    frases.forEach(frase => {
        let fila = document.createElement("div");
        fila.classList.add('row-code');
        fila.dataset.tooltip = frase; 

        for (let letra of frase) {
            let img = document.createElement("img");
            img.src = `images/${letra}.png`; // Asegúrate de tener imágenes en /images/
            img.dataset.tooltip = frase; 
            fila.appendChild(img);
        }

        preview.appendChild(fila);

        // Eventos para mostrar/ocultar el tooltip (adaptado del ejemplo anterior)
        fila.addEventListener('mouseover', (event) => {
            const tooltip = document.createElement('div'); // Crear el tooltip dinámicamente
            tooltip.classList.add('tooltip');
            tooltip.textContent = event.target.dataset.tooltip; // Obtener el valor del data-tooltip

            // Posicionar el tooltip (ajusta los valores según necesites)
            const rect = event.target.getBoundingClientRect();
            tooltip.style.left = rect.right + 10 + 'px'; // Ajusta el desplazamiento horizontal
            tooltip.style.top = rect.top + 'px';       // Ajusta el desplazamiento vertical
            document.body.appendChild(tooltip); // Añadir al body para que se muestre sobre todo

            // Almacenar el tooltip en el elemento fila para poder eliminarlo luego
            fila.tooltipElement = tooltip;
        });

        fila.addEventListener('mouseout', () => {
            if (fila.tooltipElement) {
                fila.tooltipElement.remove(); // Eliminar el tooltip
                delete fila.tooltipElement; // Limpiar la referencia
            }
        });
    });
}

async function generarPDF() {
    if (frases.length === 0) {
        alert("Agrega al menos una frase antes de generar el PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    let pdf = new jsPDF();

    await new Promise((resolve) => {
        // añadir logotipo 
        let imgLogo = new Image();
        imgLogo.src = `images/macogop.png`;
        imgLogo.onload = function () {
            pdf.addImage(imgLogo, 'PNG', 163, 10, 34.2, 10.75);
            resolve();
        }
    })
    
    // Valores iniciales para la primera hoja
    const xInicio = 15;
    const yInicio = 35;
    
    let x = xInicio;
    let y = yInicio;
    let contadorFrases = 0;

    for (const frase of frases) {
        
        x = xInicio;

        if (contadorFrases === 12) { 
            // Si ya se imprimieron 13 frases, creamos una nueva página
            pdf.addPage();
            y = yInicio;
            contadorFrases = 0; // Reiniciar el contador

            await new Promise((resolve) => {
                // añadir logotipo 
                let imgLogo = new Image();
                imgLogo.src = `images/macogop.png`;
                imgLogo.onload = function () {
                    pdf.addImage(imgLogo, 'PNG', 163, 10, 34.2, 10.75);
                    resolve();
                }
            })
        }

        for (const letra of frase) {
            await new Promise((resolve) => {
                let img = new Image();
                img.src = `images/${letra}.png`;
                img.onload = function () {
                    pdf.addImage(img, 'PNG', x, y, 7, 7);
                    x += 9;
                    if (x > 200) { 
                        x = xInicio;
                        y += 20;
                    }
                    resolve();
                };
            });
        }

        y += 20; // Mueve la siguiente frase a una nueva fila
        contadorFrases++; // Aumenta el conteo de frases en la página actual
    }

    pdf.save("codigo.pdf");
}

document.addEventListener('DOMContentLoaded', ()=> {
    const add_phrase_button = document.getElementById('add-phrase');
    const generate_pdf = document.getElementById('generate-pdf');

    add_phrase_button.addEventListener('click', agregarFrase);
    generate_pdf.addEventListener('click', generarPDF);
});