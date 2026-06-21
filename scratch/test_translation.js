async function testTranslation() {
  try {
    const text = encodeURIComponent("Réforme de l'éducation : Quels impacts pour la rentrée ?");
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${text}&langpair=fr|en`);
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const json = await res.json();
    console.log("Translation Result:", JSON.stringify(json, null, 2));
  } catch (error) {
    console.error("Translation Failed:", error.message);
  }
}
testTranslation();
