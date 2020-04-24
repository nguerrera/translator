import { CognitiveServicesCredentials } from '@azure/ms-rest-azure-js';
import { TranslatorTextClient, Translator } from '@azure/cognitiveservices-translatortext';

type InputElementId = 'api-endpoint' | 'api-key';
type SelectElementId = 'source-language' | 'target-language';
type TextAreaElementId = 'source-text' | 'target-text';
type ButtonElementId = 'translate-button' | 'swap-button';

let apiEndpointInput: HTMLInputElement;
let apiKeyInput: HTMLInputElement;
let sourceLanguageSelect: HTMLSelectElement;
let targetLanguageSelect: HTMLSelectElement;
let sourceTextArea: HTMLTextAreaElement;
let targetTextArea: HTMLTextAreaElement;
let translator: Translator | undefined;

function getInput(id: InputElementId, changeListener: () => any) {
  const input = document.getElementById(id) as HTMLInputElement;
  input.addEventListener('change', changeListener);
  return input;
}

function getSelect(id: SelectElementId) {
  return document.getElementById(id) as HTMLSelectElement;
}

function handleButton(id: ButtonElementId, listener: () => any) {
  const button = document.getElementById(id) as HTMLButtonElement;
  button.addEventListener('click', listener)
}

function getTextArea(id: TextAreaElementId) {
  return document.getElementById(id) as HTMLTextAreaElement;
}

window.addEventListener('DOMContentLoaded', async () => {
  apiEndpointInput = getInput('api-endpoint', apiOptionsChanged);
  apiKeyInput = getInput('api-key', apiOptionsChanged);
  sourceLanguageSelect = getSelect('source-language');
  targetLanguageSelect = getSelect('target-language');
  sourceTextArea = getTextArea('source-text');
  targetTextArea = getTextArea('target-text');

  handleButton('translate-button', translate);
  handleButton('swap-button', swap);

  await apiOptionsChanged();
});

async function apiOptionsChanged() {
  try {
    const t = newTranslator();
    await updateLanguages(t);

    // wait until after we've fetched all available languages above, which does
    // not require authentication, before reporting that we don't have a key
    // here.
    if (apiKeyInput.value.length == 0) {
      throw 'Error: API key required';
    }

    translator = t;
    targetTextArea.value = '';
  } catch (error) {
    reportError(error);
  }
}

function newTranslator() {
  if (apiEndpointInput.value.length == 0) {
    throw 'Error: API Endpoint required.';
  }

  let key = apiKeyInput.value;
  if (key.length == 0) {
    // we can enumerate available languages without authenticating
    key = '________________________________';
  }

  // avoid useless requests while key is incomplete
  if (key.length != 32) {
    throw 'Error: Invalid API key.';
  }

  const credential = new CognitiveServicesCredentials(key);
  const client = new TranslatorTextClient(credential, apiEndpointInput.value);
  return client.translator;
}

async function updateLanguages(translator: Translator) {
  // Default en -> it for quicker demo, but preserve previous choice if we're reconnecting
  const sourceLanguage = sourceLanguageSelect.value.length == 0 ? 'en' : sourceLanguageSelect.value;
  const targetLanguage = targetLanguageSelect.value.length == 0 ? 'it' : targetLanguageSelect.value;

  // FEEDBACK: any due to https://github.com/Azure/azure-rest-api-specs/issues/9180#issuecomment-618736588
  const languages: any = await translator.languages();

  sourceLanguageSelect.options.length = 0;
  targetLanguageSelect.options.length = 0;

  for (const shortName in languages.translation) {
    const language = languages.translation[shortName];
    const value: string = `${shortName} - ${language.name} - ${language.nativeName}`;
    sourceLanguageSelect.add(newOption(shortName, value));
    targetLanguageSelect.add(newOption(shortName, value));
  }

  sourceLanguageSelect.value = sourceLanguage;
  targetLanguageSelect.value = targetLanguage;
}

function newOption(value: string, text: string) {
  const option = document.createElement('option');
  option.value = value;
  option.text = text;
  return option;
}

function reportError(error: any) {
  console.error(error);
  targetTextArea.value = error;
}

async function translate() {
  if (translator === undefined) {
    return;
  }

  try {
    const result = await translator.translate(
      [targetLanguageSelect.value],
      [{ text: sourceTextArea.value }],
      { from: sourceLanguageSelect.value });

    targetTextArea.value = result![0].translations![0].text!;
  } catch (error) {
    reportError(error);
  }
}

async function swap() {
  const tmp = targetLanguageSelect.value;
  targetLanguageSelect.value = sourceLanguageSelect.value;
  sourceLanguageSelect.value = tmp;
  sourceTextArea.value = targetTextArea.value;
  targetTextArea.value = '';
  await translate();
}
