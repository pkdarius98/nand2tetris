const fs = require("fs");

const asmFilePath = process.argv[2];

if (!asmFilePath.endsWith(".asm")) {
  return console.error("Not a asm file");
}

const parentFolderPath = asmFilePath.substring(0, asmFilePath.lastIndexOf("/"));
const fileNameAndExt = asmFilePath.substring(asmFilePath.lastIndexOf("/") + 1);
const fileName = fileNameAndExt.substring(0, fileNameAndExt.lastIndexOf("."));

const getLinesFromFile = (fileName) => {
  const asmFileData = fs.readFileSync(fileName, "utf-8");
  return asmFileData.split("\n");
};

const normalizer = (inLines) => {
  const outLines = [];
  for (let line of inLines) {
    line = line.replace("\r", "").replace(/ /g, "");
    if (line == '' || line.startsWith("//")) {
      continue;
    }
    const nonWhiteSpace = line.replace(/\s/g, "");
    outLines.push(nonWhiteSpace.split("//")[0]);
  }
  return outLines;
};

const parser = (inLines) => {
  const symbolMap = {
    R0: 0,
    SP: 0,
    R1: 1,
    LCL: 1,
    R2: 2,
    ARG: 2,
    R3: 3,
    THIS: 3,
    R4: 4,
    THAT: 4,
    R5: 5,
    R6: 6,
    R7: 7,
    R8: 8,
    R9: 9,
    R10: 10,
    R11: 11,
    R12: 12,
    R13: 13,
    R14: 14,
    R15: 15,
    SCREEN: 16384,
    KBD: 24576,
  };
  const compMap = {
    '0': ["0", "101010"],
    '1': ["0", "111111"],
    '-1': ["0", "111010"],
    'D': ["0", "001100"],
    'A': ["0", "110000"],
    '!D': ["0", "001101"],
    '!A': ["0", "110001"],
    '-D': ["0", "001111"],
    '-A': ["0", "110011"],
    'D+1': ["0", "011111"],
    'A+1': ["0", "110111"],
    'D-1': ["0", "001110"],
    'A-1': ["0", "110010"],
    'D+A': ["0", "000010"],
    'D-A': ["0", "010011"],
    'A-D': ["0", "000111"],
    'D&A': ["0", "000000"],
    'D|A': ["0", "010101"],
    'M': ["1","110000"],
    '!M': ["1","110001"],
    '-M': ["1","110011"],
    'M+1': ["1","110111"],
    'M-1': ["1","110010"],
    'D+M': ["1","000010"],
    'D-M': ["1","010011"],
    'M-D': ["1","000111"],
    'D&M': ["1","000000"],
    'D|M': ["1","010101"],
  };
  const destMap = {
    'null': '000',
    'M': '001',
    'D': '010',
    'DM': '011',
    'MD': '011',
    'A': '100',
    'AM': '101',
    'AD': '110',
    'ADM': '111'
  };
  const jumpMap = {
    'null': '000',
    'JGT': '001',
    'JEQ': '010',
    'JGE': '011',
    'JLT': '100',
    'JNE': '101',
    'JLE': '110',
    'JMP': '111'
  }

  // label
  let numberOfLabels = 0;
  for (let i = 0; i < inLines.length; i++) {
    const line = inLines[i];

    if (line[0] == "(") {
      const label = line.substring(1, line.length - 1);
      if (!symbolMap[label]) {
        symbolMap[label] = i - numberOfLabels++;
      }
    }
  }

  // variable
  let currentAddress = 16;
  for (let i = 0; i < inLines.length; i++) {
    const line = inLines[i];

    // A-instruction
    if (line[0] == "@") {
      const symbol = line.substring(1);
      if (isNaN(+symbol) && symbolMap[symbol] == undefined) {
        symbolMap[symbol] = currentAddress++;
      }
    }
  }

  const outLines = [];
  for (let i = 0; i < inLines.length; i++) {
    const line = inLines[i];
    if (line == '' || line.startsWith("//")) {
      continue;
    }
    if (line[0] == "@") {
      const symbol = line.substring(1);
      if (!isNaN(+symbol)) {
        const bin = Number(symbol).toString(2).padStart(16, "0");
        outLines.push(bin);
      } else {
        const address = symbolMap[symbol];
        const bin = Number(address).toString(2).padStart(16, "0");
        outLines.push(bin);
      }
    } else if (line[0] != "(") {
      if (line.includes("=")) {
        const [dest, comp] = line.split("=");
        const [aBin, compBin]=compMap[comp];
        const destBin = destMap[dest];
        const bin = `111${aBin}${compBin}${destBin}000`
        if (!destBin) {
          console.log(dest)
        }
        outLines.push(bin);
      } else {
        const [comp, jump] = line.split(";");
        const [aBin, compBin]=compMap[comp];
        const jumpBin = jumpMap[jump];
        const bin = `111${aBin}${compBin}000${jumpBin}`
        outLines.push(bin);
      }
    }
  }
  return outLines;
};

let lines = getLinesFromFile(asmFilePath);
lines = normalizer(lines);
lines = parser(lines);
const outFileData = lines.join("\n");

fs.writeFileSync(parentFolderPath + "/" + fileName + ".hack", outFileData)