const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Percorso dei file da cercare
const pattern = "dist/frontend/browser/chunk-*.js";

// Configurazione per l'offuscatore
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: false, // Disabilitato per evitare problemi con il codice critico
    deadCodeInjection: false, // Disabilitato perché può interferire con SSR
    debugProtection: false,
    disableConsoleOutput: false, // Nasconde i log dal codice obfuscato
    identifierNamesGenerator: "mangled",
    selfDefending: false, // Disabilitato per evitare runtime issues
    stringArray: true,
    stringArrayEncoding: ['none'],
    stringArrayThreshold: 0.8,
    unicodeEscapeSequence: false, // Manteniamo le stringhe leggibili per evitare problemi
  };
  

// Funzione per offuscare i file
async function obfuscateFiles() {
    console.log("Offuscando i file con il pattern:", pattern);
    let files = await glob(pattern)

    if (files.length === 0) {
      console.log("Nessun file trovato con il pattern:", pattern);
      return;
    }

    files.forEach((file) => {
      console.log(`Offuscando il file: ${file}`);

      // Legge il contenuto del file
      const filePath = path.resolve(file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      // Offusca il contenuto
      const obfuscatedCode = JavaScriptObfuscator.obfuscate(fileContent, obfuscationOptions).getObfuscatedCode();

      // Sovrascrive il file con il codice offuscato
      fs.writeFileSync(filePath, obfuscatedCode, 'utf-8');
      console.log(`File offuscato e sovrascritto: ${file}`);
    });

}

// Esegue la funzione
obfuscateFiles();