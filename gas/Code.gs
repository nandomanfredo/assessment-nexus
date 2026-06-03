// ============================================================
// Code.gs — Entry point do webapp Assessment Nexus
// Rota todas as chamadas POST para os handlers adequados
// ============================================================

const WEBAPP_VERSION = '1.0.0';

// ------ doGet: retorna status ou serve CORS preflight ------

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      version: WEBAPP_VERSION,
      timestamp: new Date().toISOString(),
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ------ doPost: roteador principal ------

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action  = payload.action;

    let resultado;
    switch (action) {
      case 'salvarAssessment':
        resultado = salvarAssessment(payload);
        break;
      case 'buscarHistorico':
        resultado = buscarHistorico(payload.empresa);
        break;
      case 'buscarAssessment':
        resultado = buscarAssessmentPorId(payload.id);
        break;
      case 'listarEmpresas':
        resultado = listarEmpresas();
        break;
      case 'deletarAssessment':
        resultado = deletarAssessment(payload.id);
        break;
      case 'gerarRelatorio':
        resultado = gerarRelatorio(payload.id);
        break;
      case 'gerarResumoIA':
        resultado = gerarResumoExecutivo(payload.id);
        break;
      case 'gerarPropostaIA':
        resultado = gerarProposta(payload.id);
        break;
      case 'gerarRoadmapIA':
        resultado = gerarRoadmap(payload.id);
        break;
      default:
        resultado = { erro: 'Ação desconhecida: ' + action };
    }

    return _jsonResponse({ ok: true, ...resultado });

  } catch (err) {
    console.error('doPost error:', err);
    return _jsonResponse({ ok: false, erro: err.message });
  }
}

// ------ helpers ------

function _jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
