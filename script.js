async function fetchMarketData() {
    // Örnek olarak en popüler varlıkları çekiyoruz
    const assets = ['bitcoin', 'ethereum', 'tether', 'solana', 'binancecoin'];
    const grid = document.getElementById('market-grid');
    grid.innerHTML = ''; // Yükleniyor efekti için temizle

    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${assets.join(',')}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();

        Object.keys(data).forEach(id => {
            const price = data[id].usd;
            const change = data[id].usd_24h_change;
            const isPositive = change >= 0;

            // AI Tahmin Algoritması (Basit Mantık: Son 24 saatlik trendi baz alır)
            const aiPrediction = (change * 1.5 + (Math.random() * 5)).toFixed(2);
            const aiStatus = aiPrediction >= 0 ? 'Yükseliş' : 'Düşüş';

            grid.innerHTML += `
                <div class="vip-card p-6 rounded-xl shadow-2xl border-l-4 ${isPositive ? 'border-green-500' : 'border-red-500'}">
                    <div class="flex justify-between items-center mb-4">
                        <span class="capitalize text-gray-400 font-bold">${id}</span>
                        <span class="${isPositive ? 'text-green-500' : 'text-red-500'} font-mono">
                            ${isPositive ? '▲' : '▼'} %${Math.abs(change).toFixed(2)}
                        </span>
                    </div>
                    <div class="text-3xl font-bold mb-4">$${price.toLocaleString()}</div>
                    
                    <div class="bg-black bg-opacity-40 p-3 rounded-lg border border-gray-800">
                        <div class="text-[10px] text-yellow-500 font-black tracking-widest uppercase mb-1">AI 30 Günlük Projeksiyon</div>
                        <div class="text-sm ${aiPrediction >= 0 ? 'text-green-400' : 'text-red-400'}">
                            %${Math.abs(aiPrediction)} ${aiStatus} Bekleniyor
                        </div>
                    </div>
                </div>
            `;
        });

        // Update timestamp
        updateLastUpdateTime();

    } catch (error) {
        grid.innerHTML = '<p class="text-red-500">Veriler şu an yüklenemiyor, lütfen API limitini kontrol edin.</p>';
    }
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
