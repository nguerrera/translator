import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
import { TranslatorTextClient, TranslatorTextModels } from "@azure/cognitiveservices-translatortext";

window.addEventListener("DOMContentLoaded", () => init());

function init() {
  document.getElementById("translate-button")!.addEventListener("click", async () => await translate());
  document.getElementById("swap-button")!.addEventListener("click", async () => await swap())
}

async function translate() {
  let apiEndpoint = document.getElementById("api-endpoint") as HTMLInputElement;
  let apiKey = document.getElementById("api-key") as HTMLInputElement;
  let sourceText = document.getElementById("source-text") as HTMLTextAreaElement;
  let targetText = document.getElementById("target-text") as HTMLTextAreaElement;


  try {
    let credentials = new CognitiveServicesCredentials(apiKey.value);
    let client = new TranslatorTextClient(credentials, apiEndpoint.value);

    // FEEDBACK: detect returns DetectItemResult[], which doesn't appear to be
    //           defined correctly, it has only a text property whil the actual
    //           response has language, score, isTranslationSupported,
    //           isTransliterationSupported, and alternatives. I'm having to use
    //           any[] and spelunk around in the debugger to find the
    //           properties;
    let result = await client.translator.detect([{ text: sourceText.value }]) as any[];

    if (result.length == 1) {
      console.log(result);
      targetText.value = "Looks like that's writen in '" + result[0].language +"'.\n\nTranslation support not implemented yet."
    }
  } catch (error) {
    targetText.value = error.toString();
  }
}

async function swap() {
  let sourceText = document.getElementById("source-text") as HTMLTextAreaElement;
  let targetText = document.getElementById("target-text") as HTMLTextAreaElement;

  sourceText.value = targetText.value;
  await translate();
}
