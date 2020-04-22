import { CognitiveServicesCredentials } from '@azure/ms-rest-azure-js';
import { TranslatorTextClient } from '@azure/cognitiveservices-translatortext';

type InputElementId = 'api-endpoint' | 'api-key' | 'translate-button' | 'swap-button';
type TextAreaElementId = 'source-text' | 'target-text';

function getTextArea(id: TextAreaElementId) {
  return document.getElementById(id) as HTMLTextAreaElement;
}

function getInput(id: InputElementId) {
  return document.getElementById(id) as HTMLInputElement;
}

window.addEventListener('DOMContentLoaded', () => {
  getInput('translate-button').addEventListener('click', async () => await translate());
  getInput('swap-button').addEventListener('click', async () => await swap());
});

async function translate() {
  const apiEndpoint = getInput('api-endpoint');
  const apiKey = getInput('api-key');
  const sourceText = getTextArea('source-text');
  const targetText = getTextArea('target-text');

  try {
    const credential = new CognitiveServicesCredentials(apiKey.value);
    const client = new TranslatorTextClient(credential, apiEndpoint.value);

    // FEEDBACK: any[] due to https://github.com/Azure/azure-rest-api-specs/issues/9180
    const result: any[] = await client.translator.detect([{ text: sourceText.value }]);

    if (result.length == 1) {
      targetText.value =
        `Looks like that's writen in ${result[0].language}.\n` +
        `Translation support is not implemented yet.`;
    }
  } catch (error) {
    targetText.value = error.toString();
  }
}

async function swap() {
  const sourceText = getTextArea('source-text');
  const targetText = getTextArea('target-text');

  sourceText.value = targetText.value;
  await translate()
}
