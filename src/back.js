const express = require("express");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const { google } = require("googleapis");
const fs = require("fs");
const { atualiza_grafico } = require("./atualizaBI");


const app = express();
const upload = multer({ dest: "uploads/" });

const SPREADSHEET_ID = '12WdQ_5MrEa1zKAF_FnkCT9z_LKfF3xCNJ8asMAbzgzk';
const RANGE = 'Página1!A1';

const auth = new google.auth.GoogleAuth({
  keyFile: 'C:\\Users\\davi.s\\OneDrive - levnegocios.com.br\\Documentos\\relatorio socio_economico_fatec\\gothic-brand-436512-g7-990d6f7de0dc.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

app.use(cors());

// Rota para upload da planilha
app.post("/api/upload", upload.single("planilha"), async (req, res) => {
  let filePath;

  try {
    filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      return res.status(400).send("A planilha está vazia.");
    }

    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      resource: {
        values: [Object.keys(data[0]), ...data.map(row => Object.values(row))],
      },
    });

    res.status(200).send("Planilha atualizada com sucesso.");
  } catch (error) {
    console.error("Erro ao processar a planilha:", error);
    res.status(500).send("Erro ao processar a planilha: " + error.message);
  } finally {
    if (filePath) {
      fs.unlinkSync(filePath);
    }
  }
});

// Rota para atualizar gráficos
app.post("/atualiza-graficos", async (req, res) => {
  try {
    const result = await atualiza_grafico();
    res.status(200).json({ message: result }); // Alterado para retornar um objeto JSON
  } catch (error) {
    console.error("Erro ao atualizar gráficos:", error);
    res.status(500).send("Erro ao atualizar gráficos: " + error.message);
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
