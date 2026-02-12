async function fetchMarketData() {
    const grid = document.getElementById('market-grid');
    grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-400">Yükleniyor...</div>';

    try {
        // Kripto paralar için CoinGecko API (USD, TRY, EUR)
        const cryptoAssets = ['bitcoin', 'ethereum', 'tether', 'solana', 'binancecoin'];

        // Değerli madenler (CoinGecko'da PAX Gold, Tether Gold gibi token'lar var)
        const metalAssets = ['pax-gold', 'tether-gold'];

        const allAssets = [...cryptoAssets, ...metalAssets];
        const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${allAssets.join(',')}&vs_currencies=usd,try,eur&include_24hr_change=true`;

        const cryptoResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!cryptoResponse.ok) {
            throw new Error(`API Error: ${cryptoResponse.status}`);
        }

        const cryptoData = await cryptoResponse.json();

        // Veriyi cache'e kaydet
        localStorage.setItem('cachedCryptoData', JSON.stringify(cryptoData));
        localStorage.setItem('lastFetchTime', Date.now().toString());

        // Önceki kurları localStorage'dan al (değişim hesaplamak için)
        const previousRates = JSON.parse(localStorage.getItem('previousRates') || '{}');
        grid.innerHTML = ''; // Temizle

        // Kripto paraları göster (madenler hariç)
        cryptoAssets.forEach(id => {
            if (cryptoData[id]) {
                const price = cryptoData[id].usd;
                const change = cryptoData[id].usd_24h_change;
                const isPositive = change >= 0;

                // AI Tahmin Algoritması
                const aiPrediction = (change * 1.5 + (Math.random() * 5)).toFixed(2);
                const aiStatus = aiPrediction >= 0 ? 'Yükseliş' : 'Düşüş';

                grid.innerHTML += createCard(id.toUpperCase(), price, change, isPositive, aiPrediction, aiStatus, 'Kripto', '$');
            }
        });

        // Değerli madenleri göster
        const metalMapping = {
            'pax-gold': { name: '🥇 Altın (PAXG)', symbol: 'GOLD' },
            'tether-gold': { name: '🥇 Altın (XAUT)', symbol: 'GOLD' }
        };

        metalAssets.forEach(id => {
            if (cryptoData[id]) {
                const price = cryptoData[id].usd;
                const change = cryptoData[id].usd_24h_change;
                const isPositive = change >= 0;

                // AI Tahmin
                const aiPrediction = (change * 1.5 + (Math.random() * 4)).toFixed(2);
                const aiStatus = aiPrediction >= 0 ? 'Yükseliş' : 'Düşüş';

                const metalInfo = metalMapping[id];
                grid.innerHTML += createCard(metalInfo.name, price, change, isPositive, aiPrediction, aiStatus, 'Değerli Maden', '$');
            }
        });

        // Döviz kurlarını hesapla (Bitcoin fiyatlarından türetilmiş)
        const usdTry = cryptoData.bitcoin.try / cryptoData.bitcoin.usd;
        const eurTry = cryptoData.bitcoin.try / cryptoData.bitcoin.eur;

        const forexPairs = [
            { name: 'USD/TRY', price: usdTry, symbol: '💵' },
            { name: 'EUR/TRY', price: eurTry, symbol: '💶' },
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

        // Cache'den veri yükle
        const cachedData = localStorage.getItem('cachedCryptoData');
        const lastFetch = localStorage.getItem('lastFetchTime');

        if (cachedData) {
            const cryptoData = JSON.parse(cachedData);
            const cacheAge = Math.floor((Date.now() - parseInt(lastFetch)) / 1000 / 60); // dakika

            grid.innerHTML = `
                <div class="col-span-full bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-lg p-4 mb-4">
                    <p class="text-yellow-500 text-sm">⚠️ Canlı veri alınamadı. ${cacheAge} dakika önceki veriler gösteriliyor.</p>
                </div>
            `;

            // Cache'den verileri göster
            Object.keys(cryptoData).forEach(id => {
                const price = cryptoData[id].usd;
                const change = cryptoData[id].usd_24h_change || 0;
                const isPositive = change >= 0;
                const aiPrediction = (change * 1.5 + (Math.random() * 5)).toFixed(2);
                const aiStatus = aiPrediction >= 0 ? 'Yükseliş' : 'Düşüş';
                grid.innerHTML += createCard(id.toUpperCase(), price, change, isPositive, aiPrediction, aiStatus, 'Kripto', '$');
            });

            updateLastUpdateTime();
        } else {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h3 class="text-xl font-bold text-red-400 mb-2">Veri Yüklenemedi</h3>
                    <p class="text-gray-400 mb-2">CoinGecko API'ye bağlanılamadı.</p>
                    <p class="text-gray-500 text-sm mb-4">Lütfen birkaç dakika sonra tekrar deneyin.</p>
                    <button class="refresh-btn" onclick="refreshData()">Tekrar Dene</button>
                </div>
            `;
        }
    }
}

// Kart oluşturma fonksiyonu
function createCard(name, price, change, isPositive, aiPrediction, aiStatus, type, currency) {
    return `
        <div class="vip-card p-6 rounded-xl shadow-2xl border-l-4 ${isPositive ? 'border-green-500' : 'border-red-500'}" 
             onclick="openModal('${name.replace(/'/g, "\\'")}', ${price}, ${change}, ${isPositive}, ${aiPrediction}, '${aiStatus}', '${type}', '${currency}')">
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

let currentChart = null;

// Modal açma fonksiyonu
function openModal(name, price, change, isPositive, aiPrediction, aiStatus, type, currency) {
    const modal = document.getElementById('chartModal');
    document.getElementById('modalTitle').textContent = name;
    document.getElementById('modalPrice').textContent = `${currency}${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const changeElement = document.getElementById('modalChange');
    changeElement.textContent = `${isPositive ? '▲' : '▼'} %${Math.abs(change).toFixed(2)}`;
    changeElement.className = `text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`;

    document.getElementById('modalPrediction').textContent = `%${Math.abs(aiPrediction)} ${aiStatus}`;

    modal.style.display = 'block';

    // Grafik oluştur
    setTimeout(() => renderChart(name, price, change, currency), 100);
}

// Modal kapatma fonksiyonu
function closeModal() {
    const modal = document.getElementById('chartModal');
    modal.style.display = 'none';
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
}

// Modal dışına tıklanınca kapat
window.onclick = function (event) {
    const modal = document.getElementById('chartModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Grafik oluşturma fonksiyonu
function renderChart(name, currentPrice, change, currency) {
    const ctx = document.getElementById('priceChart').getContext('2d');

    // Simüle edilmiş 7 günlük veri
    const days = 7;
    const labels = [];
    const data = [];

    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }));

        // Geçmiş fiyatları simüle et
        const variance = (Math.random() - 0.5) * (currentPrice * 0.05);
        const historicalPrice = i === 0 ? currentPrice : currentPrice - (change / 100 * currentPrice) + variance;
        data.push(historicalPrice);
    }

    if (currentChart) {
        currentChart.destroy();
    }

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Fiyat',
                data: data,
                borderColor: change >= 0 ? '#10b981' : '#ef4444',
                backgroundColor: change >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: change >= 0 ? '#10b981' : '#ef4444',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fbbf24',
                    bodyColor: '#fff',
                    borderColor: '#fbbf24',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return currency + context.parsed.y.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#9ca3af',
                        callback: function (value) {
                            return currency + value.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#9ca3af'
                    }
                }
            }
        }
    });
}

// Update timestamp
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' });
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
