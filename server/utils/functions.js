function turkmenToLatin(text, caseType = "preserve") {
  const cleanText = String(text ?? "");

  const map = {
    Ä: "A",
    ä: "a",
    Ç: "C",
    ç: "c",
    Ň: "N",
    ň: "n",
    Ö: "O",
    ö: "o",
    Ş: "S",
    ş: "s",
    Ü: "U",
    ü: "u",
    Ý: "Y",
    ý: "y",
    Ž: "Z",
    ž: "z",
  };

  const result = cleanText.replace(
    /[ÄäÇçŇňÖöŞşÜüÝýŽž]/g,
    (char) => map[char] || char,
  );

  if (caseType === "uppercase") return result.toUpperCase();
  if (caseType === "lowercase") return result.toLowerCase();

  return result;
}

module.exports = { turkmenToLatin };
