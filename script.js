document.addEventListener('DOMContentLoaded', function () {
    fetch('data.csv')
        .then(response => response.text())
        .then(data => {
            const products = parseCSV(data);
            renderCatalog(products);
        });
});

function parseCSV(data) {
    const lines = data.split('\n');
    const headers = lines[0].split(';'); // Cambiado a ';' porque el CSV usa punto y coma
    const products = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].split(';');
        if (line.length === headers.length) { // Asegurarse de que la línea tenga el número correcto de columnas
            const product = {};
            for (let j = 0; j < headers.length; j++) {
                product[headers[j].trim()] = line[j] ? line[j].trim() : '';
            }
            if (product.Nombre) { // Asegurarse de que el producto tenga un nombre
                products.push(product);
            }
        }
    }

    // Ordenar productos por nombre
    products.sort((a, b) => {
        const isSpecialA = isSpecialEsmalte(a.Nombre);
        const isSpecialB = isSpecialEsmalte(b.Nombre);

        if (isSpecialA && isSpecialB) {
            const digitsA = extractDigits(a.Nombre);
            const digitsB = extractDigits(b.Nombre);
            return digitsA - digitsB;
        } else if (isSpecialA) {
            return -1;
        } else if (isSpecialB) {
            return 1;
        } else {
            return a.Nombre.localeCompare(b.Nombre);
        }
    });

    return products;
}

function renderCatalog(products) {
    const catalog = document.getElementById('catalog');
    const categories = {};

    products.forEach(product => {
        const categoryKey = getCategoryKey(product.Categoría); // Usar la columna 'Categoría'
        if (!categories[categoryKey]) {
            categories[categoryKey] = [];
        }
        categories[categoryKey].push(product);
    });

    let pageNumber = 1;

    for (const category in categories) {
        const categoryProducts = categories[category];
        let pageIndex = 0;

        while (pageIndex < categoryProducts.length) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.innerHTML = `<h2>${category}</h2>`; // Título basado en la categoría

            const pageProducts = categoryProducts.slice(pageIndex, pageIndex + 16);
            pageProducts.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <img src="${product['Imagen URL']}" alt="${product.Nombre}">
                    <div class="product-name">${product.Nombre}</div>
                    <div class="product-ref">${product.Referencia}</div>
                `;
                categoryDiv.appendChild(productDiv);
            });

            catalog.appendChild(categoryDiv);
            pageNumber++;
            pageIndex += 16;
        }
    }
}

function isSpecialEsmalte(productName) {
    if (typeof productName !== 'string') {
        return false; // Si el nombre no es una cadena, no es un esmalte especial
    }
    return productName.includes('Esmalte permanente Wemmi Hema Free') && /\d+/.test(productName);
}

function extractDigits(productName) {
    const matches = productName.match(/\d+/g);
    if (matches) {
        return parseInt(matches[0]);
    } else {
        return Infinity;
    }
}

function getCategoryKey(categoryName) {
    if (typeof categoryName !== 'string') {
        return 'Uncategorized'; // Manejo de categorías no definidas o incorrectas
    }
    const words = categoryName.split(' ');
    if (words.length >= 2) {
        return `${words[0]}_${words[1]}`;
    } else {
        return categoryName;
    }
}
