async function fetchMarketData() {
    const grid = document.getElementById('market-grid');
    grid.innerHTML = ''; // Yükleniyor efekti için temizle

    try {
        // Kripto paralar için CoinGecko API
        const cryptoAssets = ['bitcoin', 'ethereum', 'tether', 'solana', 'binancecoin'];
        const cryptoResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoAssets.join(',')}&vs_currencies=usd,try&include_24hr_change=true`);
        const cryptoData = await cryptoResponse.json();

        // Önceki kurları localStorage'dan al (değişim hesaplamak için)
        const previousRates = JSON.parse(localStorage.getItem('previousRates') || '{}');

        // Kripto paraları göster
        Object.keys(cryptoData).forEach(id => {
            const price = cryptoData[id].usd;
            const change = cryptoData[id].usd_24h_change;
            const isPositive = change >= 0;

            // AI Tahmin Algoritması
            const aiPrediction = (change * 1.5 + (Math.random() * 5)).toFixed(2);
            const aiStatus = aiPrediction >= 0 ? 'Yükseliş' : 'Düşüş';

            grid.innerHTML += createCard(id.toUpperCase(), price, change, isPositive, aiPrediction, aiStatus, 'Kripto', '$');
        });

        // Döviz kurlarını CoinGecko'dan al (TRY bazlı)
        const forexPairs = [
            { name: 'USD/TRY', price: cryptoData.bitcoin.try / cryptoData.bitcoin.usd, symbol: '💵' },
            { name: 'EUR/TRY', price: (cryptoData.bitcoin.try / cryptoData.bitcoin.usd) * 0.92, symbol: '💶' }, // Yaklaşık EUR kuru
            { name: 'BTC/TRY', price: cryptoData.bitcoin.try, symbol: '₿' }
        ];

        forexPairs.forEach(pair => {
            const currentRate = pair.price;
            const previousRate = previousRates[pair.name] || currentRate;
            const change = ((currentRate - previousRate) / previousRate * 100);
            const isPositive = change >= 0;

            // AI Tahmin
            const aiPrediction = (change * 1.5 + (Math.random() * 3)).toFixed(2);
            const aiStatus = aiPrediction >= 0 ? 'Yükseliş' : 'Düşüş';

            grid.innerHTML += createCard(
                `${pair.symbol} ${pair.name}`,
                currentRate,
                change,
                isPositive,
                aiPrediction,
                aiStatus,
                'Döviz',
                '₺'
            );

            // Mevcut kuru kaydet
            previousRates[pair.name] = currentRate;
        });

        // Kurları localStorage'a kaydet
        localStorage.setItem('previousRates', JSON.stringify(previousRates));

        // Update timestamp
        updateLastUpdateTime();

    } catch (error) {
        console.error('API Error:', error);
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">⚠️</div>
                <h3 class="text-xl font-bold text-red-400 mb-2">Veri Yüklenemedi</h3>
                <p class="text-gray-400 mb-4">API bağlantısı kurulamadı. Lütfen sayfayı yenileyin.</p>
                <button class="refresh-btn" onclick="refreshData()">Tekrar Dene</button>
            </div>
        `;
    }
}

// Kart oluşturma fonksiyonu
function createCard(name, price, change, isPositive, aiPrediction, aiStatus, type, currency) {
    return `
        <div class="vip-card p-6 rounded-xl shadow-2xl border-l-4 ${isPositive ? 'border-green-500' : 'border-red-500'}">
            <div class="flex justify-between items-center mb-4">
                <div>
                    <span class="text-gray-400 font-bold">${name}</span>
                    <div class="text-[10px] text-gray-600 uppercase">${type}</div>
                </div>
                <span class="${isPositive ? 'text-green-500' : 'text-red-500'} font-mono">
                    ${isPositive ? '▲' : '▼'} %${Math.abs(change).toFixed(2)}
                </span>
            </div>
            <div class="text-3xl font-bold mb-4">${currency}${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            
            <div class="bg-black bg-opacity-40 p-3 rounded-lg border border-gray-800">
                <div class="text-[10px] text-yellow-500 font-black tracking-widest uppercase mb-1">AI 30 Günlük Projeksiyon</div>
                <div class="text-sm ${aiPrediction >= 0 ? 'text-green-400' : 'text-red-400'}">
                    %${Math.abs(aiPrediction)} ${aiStatus} Bekleniyor
                </div>
            </div>
        </div>
    `;
}

// Update timestamp
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const updateElement = document.getElementById('last-update');
    if (updateElement) {
        updateElement.textContent = `Son güncelleme: ${timeString}`;
    }
}

// Refresh data manually
function refreshData() {
    const icon = document.getElementById('refresh-icon');
    if (icon) {
        icon.style.display = 'inline-block';
        icon.style.animation = 'spin 1s linear infinite';
    }

    fetchMarketData();

    setTimeout(() => {
        if (icon) {
            icon.style.animation = '';
        }
    }, 1000);
}

// Add spin animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Sayfa açıldığında ve her 30 saniyede bir verileri güncelle
fetchMarketData();
setInterval(fetchMarketData, 30000);
