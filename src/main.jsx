import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, BarChart3, Check, Download, Lock, Menu, ShieldCheck, Sparkles, Upload, X } from 'lucide-react';
import './styles.css';

const demo = [
  { symbol: 'THYAO', name: 'Türk Hava Yolları', value: 48500, cost: 40200, sector: 'Ulaşım' },
  { symbol: 'ASELS', name: 'Aselsan', value: 36200, cost: 28500, sector: 'Savunma' },
  { symbol: 'BIST30', name: 'BIST 30 ETF', value: 29400, cost: 27100, sector: 'Fon' },
  { symbol: 'ALTIN', name: 'Altın', value: 23700, cost: 19800, sector: 'Emtia' },
  { symbol: 'NAKIT', name: 'Nakit', value: 12200, cost: 12200, sector: 'Nakit' },
];

const money = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
const pct = n => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV dosyasında veri bulunamadı.');
  const sep = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(sep).map(x => x.trim().toLowerCase());
  const find = (...names) => names.map(n => headers.indexOf(n)).find(i => i >= 0);
  const si = find('symbol', 'sembol'), vi = find('value', 'değer', 'deger'), ci = find('cost', 'maliyet');
  const ni = find('name', 'ad'), sec = find('sector', 'sektör', 'sektor');
  if ([si, vi, ci].some(i => i === undefined)) throw new Error('Gerekli sütunlar: sembol, değer, maliyet.');
  return lines.slice(1).map(line => {
    const c = line.split(sep).map(x => x.trim());
    const value = Number(c[vi].replace(/[^0-9.-]/g, ''));
    const cost = Number(c[ci].replace(/[^0-9.-]/g, ''));
    if (!c[si] || !Number.isFinite(value) || !Number.isFinite(cost)) throw new Error('Bazı satırlarda geçersiz değer var.');
    return { symbol: c[si].toUpperCase(), name: c[ni] || c[si], value, cost, sector: c[sec] || 'Diğer' };
  });
}

function App() {
  const [portfolio, setPortfolio] = useState(demo);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');
  const [mobile, setMobile] = useState(false);
  const stats = useMemo(() => {
    const total = portfolio.reduce((s, x) => s + x.value, 0);
    const cost = portfolio.reduce((s, x) => s + x.cost, 0);
    const sorted = [...portfolio].sort((a,b) => b.value-a.value);
    const concentration = total ? sorted.slice(0, 3).reduce((s,x)=>s+x.value,0) / total * 100 : 0;
    const sectors = new Set(portfolio.map(x => x.sector)).size;
    const score = Math.max(20, Math.round(92 - concentration * .55 - (sectors < 4 ? 10 : 0)));
    return { total, gain: total-cost, gainPct: cost ? (total-cost)/cost*100 : 0, concentration, sectors, score, sorted };
  }, [portfolio]);

  const upload = e => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { setPortfolio(parseCsv(reader.result)); setUploaded(true); setError(''); document.querySelector('#dashboard')?.scrollIntoView({behavior:'smooth'}); } catch(err) { setError(err.message); } };
    reader.readAsText(file);
  };
  const downloadSample = () => {
    const body = 'sembol;ad;değer;maliyet;sektör\nTHYAO;Türk Hava Yolları;48500;40200;Ulaşım\nASELS;Aselsan;36200;28500;Savunma';
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([body],{type:'text/csv'})); a.download='ornek-portfoy.csv'; a.click();
  };

  return <>
    <nav><a className="brand" href="#"><span>Q</span> Quantfolio</a><div className={`navlinks ${mobile?'open':''}`}><a href="#features">Özellikler</a><a href="#pricing">Fiyatlar</a><a href="#privacy">Gizlilik</a><a className="navcta" href="#analyze">Ücretsiz analiz</a></div><button className="menubtn" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button></nav>
    <main>
      <section className="hero" id="analyze">
        <div className="eyebrow"><Sparkles size={15}/> Yatırım kararlarında netlik</div>
        <h1>Portföyünün riskini<br/><em>saniyeler içinde gör.</em></h1>
        <p>Dağılımını analiz et, yoğunlaşma risklerini keşfet ve daha dengeli bir portföy için uygulanabilir öneriler al.</p>
        <div className="uploadbox">
          <label><Upload size={21}/><b>CSV dosyanı yükle</b><small>Verilerin yalnızca cihazında işlenir</small><input type="file" accept=".csv,text/csv" onChange={upload}/></label>
          <button onClick={downloadSample}><Download size={16}/> Örnek CSV</button>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="trust"><span><Lock size={14}/> Sunucuya yükleme yok</span><span><ShieldCheck size={14}/> Kayıt gerektirmez</span><span><Check size={14}/> Ücretsiz analiz</span></div>
      </section>

      <section className="dashboard" id="dashboard">
        <div className="dashhead"><div><span className="kicker">{uploaded?'PORTFÖYÜN':'İNTERAKTİF DEMO'}</span><h2>Risk panoraması</h2></div><span className="updated">● Anlık hesaplandı</span></div>
        <div className="metrics">
          <article><small>Toplam değer</small><strong>{money.format(stats.total)}</strong><span className="positive">{pct(stats.gainPct)} toplam getiri</span></article>
          <article><small>Net kazanç</small><strong>{money.format(stats.gain)}</strong><span>Maliyete göre</span></article>
          <article><small>Çeşitlendirme</small><strong>{stats.sectors} <i>sektör</i></strong><span>{portfolio.length} varlık</span></article>
          <article className="score"><small>Portföy skoru</small><strong>{stats.score}<i>/100</i></strong><span>{stats.score>65?'İyi dengelenmiş':'İyileştirilebilir'}</span></article>
        </div>
        <div className="panels">
          <article className="allocation"><div className="paneltitle"><h3>Varlık dağılımı</h3><span>Değere göre</span></div>{stats.sorted.map((x,i)=><div className="asset" key={x.symbol}><b>{x.symbol}<small>{x.name}</small></b><div className="bar"><i style={{width:`${x.value/stats.total*100}%`,background:`hsl(${160+i*25} 65% ${45+i*3}%)`}}/></div><strong>{(x.value/stats.total*100).toFixed(1)}%</strong></div>)}</article>
          <article className="risk"><div className="paneltitle"><h3>Risk radarı</h3><BarChart3 size={20}/></div><div className="riskrow"><span>İlk 3 varlık yoğunluğu</span><b>{stats.concentration.toFixed(0)}%</b></div><div className="meter"><i style={{width:`${stats.concentration}%`}}/></div><div className="insight"><Sparkles size={18}/><p><b>Quant içgörüsü</b>{stats.concentration>70?'Portföyünün büyük bölümü üç varlıkta. Yeni yatırımları farklı sektörlere yönlendirmek dalgalanmayı azaltabilir.':'Dağılımın dengeli görünüyor. Sektör ağırlıklarını düzenli kontrol etmeye devam et.'}</p></div><button className="report">Detaylı raporu hazırla <ArrowRight size={17}/></button></article>
        </div>
      </section>

      <section className="features" id="features"><div className="sectioncopy"><span className="kicker">NEDEN QUANTFOLIO?</span><h2>Rakamları karara dönüştür.</h2><p>Karmaşık tablolar yerine, neyin önemli olduğunu anlatan sade ve uygulanabilir analizler.</p></div><div className="featuregrid"><article><ShieldCheck/><h3>Önce gizlilik</h3><p>Dosyan tarayıcında işlenir. Finansal verilerin hiçbir sunucuya gönderilmez.</p></article><article><BarChart3/><h3>Anlaşılır risk</h3><p>Yoğunlaşma ve çeşitlendirme metriklerini tek bakışta yorumla.</p></article><article><Sparkles/><h3>Akıllı öneriler</h3><p>Portföy yapına göre sade, tarafsız ve uygulanabilir iyileştirmeler al.</p></article></div></section>
      <section className="pricing" id="pricing"><span className="kicker">BASİT FİYATLANDIRMA</span><h2>Önce gör, sonra derinleş.</h2><div className="pricecards"><article><h3>Ücretsiz</h3><strong>₺0</strong><p>Temel portföy özeti ve risk skoru</p><ul><li><Check/>CSV analizi</li><li><Check/>Dağılım görünümü</li><li><Check/>Temel risk içgörüsü</li></ul><a href="#analyze">Şimdi analiz et</a></article><article className="pro"><span className="popular">EN POPÜLER</span><h3>Pro Rapor</h3><strong>₺149 <small>/ rapor</small></strong><p>Derin analiz ve kişiselleştirilmiş aksiyon planı</p><ul><li><Check/>Tüm ücretsiz özellikler</li><li><Check/>PDF risk raporu</li><li><Check/>Yeniden dengeleme senaryosu</li><li><Check/>Geçmiş analiz karşılaştırması</li></ul><button>Yakında satışta <ArrowRight/></button></article></div></section>
    </main>
    <footer id="privacy"><a className="brand" href="#"><span>Q</span> Quantfolio</a><p>Yatırım tavsiyesi değildir. Analizler yalnızca bilgilendirme amaçlıdır.</p><small>© 2026 Quantfolio</small></footer>
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);
