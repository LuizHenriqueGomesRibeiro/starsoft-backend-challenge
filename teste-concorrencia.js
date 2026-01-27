const seatId = process.argv[2];
const token = process.argv[3];

if (!seatId || !token) {
  console.error('❌ Erro: Você precisa passar o seatId e o token!');
  console.log('Exemplo: node teste-concorrencia.js UUID_DO_ASSENTO SEU_TOKEN');
  process.exit(1);
}

const url = `http://localhost:3000/reservations/lock/${seatId}`;

async function rodarTeste() {
  const TOTAL_REQUISICOES = 2000;
  console.log(`🚀 Iniciando ${TOTAL_REQUISICOES} requisições para o assento ${seatId}...`);
  
  const startTimeTotal = Date.now();

  const promessas = Array.from({ length: TOTAL_REQUISICOES }).map(async (_, i) => {
    const start = Date.now();
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const duration = Date.now() - start;
      const data = await res.json();

      return { 
        tentativa: i + 1, 
        instancia: data.instanceId || data.message || 'Erro Desconhecido',
        status: res.status, 
        tempo_ms: duration
      };
    } catch (err) {
      return { tentativa: i + 1, status: 'Erro de Conexão', tempo_ms: 0, instancia: null };
    }
  });

  const resultados = await Promise.all(promessas);
  const totalDuration = Date.now() - startTimeTotal;

  console.table(resultados.map(r => ({ ...r, tempo_ms: `${r.tempo_ms}ms` })));
  
  const sucessos = resultados.filter(r => r.status === 201).length;
  const falhas = resultados.filter(r => r.status >= 400).length;

  console.log(`\n📊 RESUMO DO TESTE:`);
  console.log(`✅ Reservas Criadas: ${sucessos}`);
  console.log(`❌ Bloqueios de Concorrência: ${falhas}`);
  console.log(`⏱️ Tempo total de execução: ${totalDuration}ms`);
}

rodarTeste();