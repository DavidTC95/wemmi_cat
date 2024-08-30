document.addEventListener('DOMContentLoaded', function () {
    fetch('data.csv')
        .then(response => response.text())
        .then(data => {
            const products = parseCSV(data);
            const filteredProducts = filterProducts(products); // Filtrar productos
            const sortedProducts = sortProducts(filteredProducts); // Ordenar esmaltes y tintes
            renderCatalog(sortedProducts);
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

    return products;
}

function filterProducts(products) {
    // Filtrar solo los productos que contienen "esmalte" o "tinte" en el nombre (ignorando mayúsculas/minúsculas)
    return products.filter(product => {
        const lowerCaseName = product.Nombre.toLowerCase();
        return lowerCaseName.includes('esmalte') || lowerCaseName.includes('tinte');
    });
}

function sortProducts(products) {
    // Separar productos en esmaltes y tintes
    const esmaltes = [];
    const tintes = [];
    
    products.forEach(product => {
        const lowerCaseName = product.Nombre.toLowerCase();
        if (lowerCaseName.includes('esmalte')) {
            esmaltes.push(product);
        } else if (lowerCaseName.includes('tinte')) {
            tintes.push(product);
        }
    });

    // Ordenar ambos grupos por nombre
    esmaltes.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
    tintes.sort((a, b) => a.Nombre.localeCompare(b.Nombre));

    // Concatenar esmaltes primero y luego tintes
    return esmaltes.concat(tintes);
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
