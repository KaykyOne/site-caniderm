const SPREADSHEET_ID = "1JF8mjbEqrmt2xpO39yxppvMJLp6mBDqAxQDQNU9rX1w";

function doGet(e) {
  if (e && e.parameter && e.parameter.teste === "1") {
    return saveLead({
      nome: "Teste direto pela URL",
      whatsapp: "11999999999",
      email: "teste@caniderm.local",
      origem: "Teste doGet",
      pagina: "Apps Script",
      data_envio: new Date().toISOString()
    });
  }

  return jsonResponse({
    ok: true,
    message: "Apps Script da lista Caniderm ativo. Use ?teste=1 para testar gravacao."
  });
}

function doPost(e) {
  const data = e && e.parameter ? e.parameter : {};
  return saveLead(data);
}

function saveLead(data) {
  const lock = LockService.getScriptLock();

  try {
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheets()[0];

    lock.waitLock(10000);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Recebido em",
        "Nome",
        "WhatsApp",
        "Email",
        "Origem",
        "Pagina",
        "Data enviada pelo site"
      ]);
    }

    sheet.appendRow([
      new Date(),
      data.nome || "",
      data.whatsapp || "",
      data.email || "",
      data.origem || "",
      data.pagina || "",
      data.data_envio || ""
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error.message
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (error) {
      // Ignore release errors when the lock was not acquired.
    }
  }
}

function getSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error("Nenhuma planilha ativa. Abra a planilha, use Extensoes > Apps Script, ou preencha SPREADSHEET_ID.");
  }

  return spreadsheet;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
