/**
 * AlPipe service stub
 *
 * This module provides a simple AI response generation layer for the current
 * backend. It uses the inventory database to answer questions about product
 * stock, prices, and low-stock alerts.
 */

function normalizeText(text) {
  return text.trim().toLowerCase();
}

function buildProductMatcher(query, products) {
  const normalizedQuery = normalizeText(query);
  return products.find((product) => {
    const name = product.name.toLowerCase();
    return (
      normalizedQuery.includes(name) ||
      name.includes(normalizedQuery) ||
      name.split(/\s+/).every((word) => normalizedQuery.includes(word))
    );
  });
}

function parseThreshold(query) {
  const match = query.match(/(?:di bawah|kurang dari|kurang|<=|<|≤)\s*(\d+)/i);
  if (match) {
    return Number(match[1]);
  }
  const fallback = query.match(/(\d+)/);
  return fallback ? Number(fallback[1]) : null;
}

async function generateAiResponse(message, prisma) {
  const normalized = normalizeText(message);

  if (!normalized) {
    return 'Harap masukkan pesan yang valid untuk menerima respons AI.';
  }

  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
  const product = buildProductMatcher(normalized, products);

  const mentionsStock = /\bstok\b|\bstock\b/.test(normalized);
  const mentionsPrice = /\bharga\b|\bprice\b/.test(normalized);
  const asksList = /daftar produk|semua produk|inventaris|persediaan|list produk|produk yang tersedia/.test(normalized);
  const asksLowStock = /stok rendah|low stock|alert stok|produk yang hampir habis|stok hampir habis|kurang dari|di bawah/.test(normalized);
  const asksSummary = /ringkasan|total produk|berapa produk|laporan inventaris/.test(normalized);

  if (product && mentionsStock && !mentionsPrice) {
    return `Stok untuk "${product.name}" adalah ${product.stock} unit. Harga saat ini Rp ${product.price.toLocaleString('id-ID')}.`;  
  }

  if (product && mentionsPrice && !mentionsStock) {
    return `Harga "${product.name}" adalah Rp ${product.price.toLocaleString('id-ID')}. Stok tersedia ${product.stock} unit.`;
  }

  if (product && mentionsStock && mentionsPrice) {
    return `"${product.name}" memiliki stok ${product.stock} unit dan harga Rp ${product.price.toLocaleString('id-ID')}.`;  
  }

  if (asksLowStock) {
    const threshold = parseThreshold(normalized) ?? 5;
    const lowStockProducts = products.filter((item) => item.stock <= threshold);
    if (lowStockProducts.length === 0) {
      return `Tidak ada produk dengan stok di bawah atau sama dengan ${threshold} unit. Semua produk dalam kondisi stok normal.`;
    }
    const list = lowStockProducts
      .map((item) => `- ${item.name}: ${item.stock} unit (Rp ${item.price.toLocaleString('id-ID')})`)
      .join('\n');
    return `Berikut produk dengan stok rendah (≤ ${threshold}):\n${list}`;
  }

  if (asksList || asksSummary) {
    if (products.length === 0) {
      return 'Tidak ada produk di inventaris saat ini. Silakan tambahkan produk terlebih dahulu.';
    }
    const list = products
      .map((item) => `- ${item.name}: stok ${item.stock}, harga Rp ${item.price.toLocaleString('id-ID')}`)
      .join('\n');
    return `Inventaris saat ini memiliki ${products.length} produk:\n${list}`;
  }

  if (product) {
    return `"${product.name}" tersedia dengan stok ${product.stock} unit dan harga Rp ${product.price.toLocaleString('id-ID')}. Apakah Anda ingin menanyakan stok atau harga produk lain?`;
  }

  if (mentionsStock) {
    if (products.length === 0) {
      return 'Belum ada produk di inventaris. Silakan tambahkan produk untuk memonitor stok.';
    }
    const list = products
      .map((item) => `- ${item.name}: ${item.stock} unit`)
      .join('\n');
    return `Informasi stok semua produk saat ini:\n${list}`;
  }

  if (mentionsPrice) {
    if (products.length === 0) {
      return 'Belum ada produk di inventaris. Silakan tambahkan produk untuk memonitor harga.';
    }
    const list = products
      .map((item) => `- ${item.name}: Rp ${item.price.toLocaleString('id-ID')}`)
      .join('\n');
    return `Informasi harga semua produk saat ini:\n${list}`;
  }

  if (asksLowStock) {
    return 'Silakan sebutkan ambang stok, misalnya "stok kurang dari 5" untuk melihat produk dengan stok rendah.';
  }

  return `Saya dapat membantu memantau stok dan harga produk. Anda dapat menanyakan hal seperti:
- "Berapa stok Keyboard Mekanik RGB?"
- "Berapa harga Mouse Wireless?"
- "Tampilkan produk dengan stok rendah"
- "Tampilkan inventaris saat ini"`;
}

module.exports = {
  generateAiResponse,
};
