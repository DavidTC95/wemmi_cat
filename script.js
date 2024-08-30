document.addEventListener('DOMContentLoaded', function () {
    fetch('data.csv')
        .then(response => response.text())
        .then(data => {
            const products = parseCSV(data);
            renderCatalog(products);
        })
        .catch(error => console.error('Error al cargar el archivo CSV:', error));
});

function parseCSV(data) {
    const lines = data.split('\n').filter(line => line.trim() !== ''); // Ignorar líneas vacías
    const headers = lines[0].split(','); 
    const products = [];

    for (let i = 1; i < lines.length; i++) {
        const line = parseCSVLine(lines[i]);
        if (line.length === headers.length) {
            const product = {};
            for (let j = 0; j < headers.length; j++) {
                product[headers[j].trim()] = line[j] ? line[j].trim() : '';
            }
            if (product.Nombre) {
                products.push(product);
            }
        }
    }

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

function parseCSVLine(line) {
    const result = [];
    let insideQuotes = false;
    let value = '';

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(value);
            value = '';
        } else {
            value += char;
        }
    }
    result.push(value);

    return result;
}

function renderCatalog(products) {
    const catalog = document.getElementById('catalog');
    const categories = {};

    products.forEach(product => {
        const categoryKey = getCategoryKey(product.Categoría); 
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
            categoryDiv.innerHTML = `<h2>${category}</h2>`; 

            const pageProducts = categoryProducts.slice(pageIndex, pageIndex + 16);
            pageProducts.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <img src="${product['Imagen URL']}" alt="${product.Nombre}">
                    <div class="product-name">${product.Nombre}</div>
                    <div class="product-ref">${product.Referencia}</div>
                    <div class="product-price">${product.Precio} USD</div> 
                    <div class="product-quantity">Cantidad: ${product.Cantidad}</div>
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
    return productName.includes('Esmalte permanente Wemmi Hema Free') && /\d+/.test(productName);
}

function extractDigits(productName) {
    const matches = productName.match(/\d+/g);
    return matches ? parseInt(matches[0]) : Infinity;
}

function getCategoryKey(categoryName) {
    if (typeof categoryName !== 'string' || categoryName.trim() === '') {
        return 'Uncategorized';
    }
    const words = categoryName.split(' ');
    return words.length >= 2 ? `${words[0]}_${words[1]}` : categoryName;
}
