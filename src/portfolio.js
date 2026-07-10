const aliases = {
  symbol: ['symbol', 'sembol', 'ticker'],
  value: ['value', 'değer', 'deger', 'güncel değer', 'guncel deger'],
  cost: ['cost', 'maliyet', 'alış değeri', 'alis degeri'],
  name: ['name', 'ad', 'isim'],
  sector: ['sector', 'sektör', 'sektor'],
};

const normalize = value => value.trim().toLocaleLowerCase('tr-TR').replace(/^\uFEFF/, '');

export function parseNumber(raw) {
  const text = String(raw ?? '').trim().replace(/\s|₺|tl/gi, '');
  if (!text) return NaN;
  const comma = text.lastIndexOf(',');
  const dot = text.lastIndexOf('.');
  let normalized = text;
  if (comma > dot) normalized = text.replace(/\./g, '').replace(',', '.');
  else if (dot > comma && comma >= 0) normalized = text.replace(/,/g, '');
  else if (comma >= 0) normalized = text.replace(',', '.');
  return Number(normalized.replace(/[^0-9.-]/g, ''));
}

function splitRow(line, separator) {
  const cells = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"' && quoted) { value += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === separator && !quoted) { cells.push(value.trim()); value = ''; }
    else value += char;
  }
  cells.push(value.trim());
  return cells;
}

export function parseCsv(text) {
  const lines = String(text).split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) throw new Error('CSV dosyasında veri bulunamadı.');
  if (lines.length > 501) throw new Error('En fazla 500 varlık yükleyebilirsiniz.');
  const separator = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ';' : ',';
  const headers = splitRow(lines[0], separator).map(normalize);
  const index = key => aliases[key].map(normalize).map(name => headers.indexOf(name)).find(i => i >= 0);
  const si = index('symbol'); const vi = index('value'); const ci = index('cost');
  const ni = index('name'); const sec = index('sector');
  if ([si, vi, ci].some(i => i === undefined)) throw new Error('Gerekli sütunlar: sembol, değer, maliyet.');

  const parsed = lines.slice(1).map((line, row) => {
    const cells = splitRow(line, separator);
    const value = parseNumber(cells[vi]);
    const cost = parseNumber(cells[ci]);
    const symbol = cells[si]?.trim().toUpperCase();
    if (!symbol || !Number.isFinite(value) || !Number.isFinite(cost) || value < 0 || cost < 0) {
      throw new Error(`${row + 2}. satırda geçersiz sembol, değer veya maliyet var.`);
    }
    return { symbol, name: cells[ni]?.trim() || symbol, value, cost, sector: cells[sec]?.trim() || 'Diğer' };
  });
  if (!parsed.some(item => item.value > 0)) throw new Error('Portföy toplam değeri sıfırdan büyük olmalıdır.');
  return parsed;
}

export function calculateStats(portfolio) {
  const total = portfolio.reduce((sum, item) => sum + item.value, 0);
  const cost = portfolio.reduce((sum, item) => sum + item.cost, 0);
  const sorted = [...portfolio].sort((a, b) => b.value - a.value);
  const concentration = total ? sorted.slice(0, 3).reduce((sum, item) => sum + item.value, 0) / total * 100 : 0;
  const sectors = new Set(portfolio.map(item => item.sector)).size;
  const score = Math.max(20, Math.min(100, Math.round(92 - concentration * .55 - (sectors < 4 ? 10 : 0))));
  return { total, gain: total - cost, gainPct: cost ? (total - cost) / cost * 100 : 0, concentration, sectors, score, sorted };
}
