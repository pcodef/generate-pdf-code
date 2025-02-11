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

        for (let letra of frase) {
            let img = document.createElement("img");
            img.src = `images/${letra}.png`; // Asegúrate de tener imágenes en /images/
            img.alt = letra;
            img.style.width = "50px"; // Tamaño ajustable
            img.style.height = "50px";
            fila.appendChild(img);
        }

        preview.appendChild(fila);
    });
}

async function generarPDF() {
    if (frases.length === 0) {
        alert("Agrega al menos una frase antes de generar el PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    let pdf = new jsPDF();

    // añadir logotipo 
    let imgLogo = new Image();
    imgLogo.src = `images/macogop.png`;
    imgLogo.onload = function () {
        pdf.addImage(imgLogo, 'PNG', 163, 10, 34.2, 10.75);
    }
    
    // Valores iniciales para la primera hoja
    const xInicio = 15;
    const yInicio = 25;
    
    let x = xInicio;
    let y = yInicio;
    let contadorFrases = 0;

    for (const frase of frases) {
        
        x = xInicio;

        if (contadorFrases === 13) { 
            // Si ya se imprimieron 13 frases, creamos una nueva página
            pdf.addPage();
            y = yInicio;
            contadorFrases = 0; // Reiniciar el contador
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