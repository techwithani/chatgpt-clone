const express = require('express');
const router = express.Router();
const { Logtail } = require('@logtail/node');
const { sendMessage, createOnProgress } = require('~/server/utils');
const { saveMessage, getConvoTitle, getConvo } = require('~/models');
const { getResponseSender } = require('~/server/routes/endpoints/schemas');
const { addTitle, initializeClient } = require('~/server/routes/endpoints/openAI');
const {
  handleAbort,
  createAbortController,
  handleAbortError,
  setHeaders,
  validateEndpoint,
  buildEndpointOption,
} = require('~/server/middleware');

var logtail;
try {
  logtail = new Logtail(process.env.LOGTAIL_TOKEN);
} catch {
  logtail = {
    log: () => {},
    info: () => {},
    error: () => {},
    flush: () => {},
  };
}

router.post('/abort', handleAbort());

router.post('/', validateEndpoint, buildEndpointOption, setHeaders, async (req, res) => {
  let {
    text,
    endpointOption,
    conversationId,
    parentMessageId = null,
    overrideParentMessageId = null,
  } = req.body;
  const ip = req.headers['x-forwarded-for'];

  console.log(req.user.name + ': ' + text);
  logtail.log(req.user.name + ': ' + text, ip);

  let metadata;
  let userMessage;
  let promptTokens;
  let userMessageId;
  let responseMessageId;
  let lastSavedTimestamp = 0;
  let saveDelay = 100;
  const sender = getResponseSender(endpointOption);
  const newConvo = !conversationId;
  const user = req.user.id;

  const addMetadata = (data) => (metadata = data);

  const getReqData = (data = {}) => {
    for (let key in data) {
      if (key === 'userMessage') {
        userMessage = data[key];
        userMessageId = data[key].messageId;
      } else if (key === 'responseMessageId') {
        responseMessageId = data[key];
      } else if (key === 'promptTokens') {
        promptTokens = data[key];
      } else if (!conversationId && key === 'conversationId') {
        conversationId = data[key];
      }
    }
  };

  const { onProgress: progressCallback, getPartialText } = createOnProgress({
    onProgress: ({ text: partialText }) => {
      const currentTimestamp = Date.now();

      if (currentTimestamp - lastSavedTimestamp > saveDelay) {
        lastSavedTimestamp = currentTimestamp;
        saveMessage({
          messageId: responseMessageId,
          sender,
          conversationId,
          parentMessageId: overrideParentMessageId ?? userMessageId,
          text: partialText,
          model: endpointOption.modelOptions.model,
          unfinished: true,
          cancelled: false,
          error: false,
          user,
        });
      }

      if (saveDelay < 500) {
        saveDelay = 500;
      }
    },
  });

  const getAbortData = () => ({
    sender,
    conversationId,
    messageId: responseMessageId,
    parentMessageId: overrideParentMessageId ?? userMessageId,
    text: getPartialText(),
    userMessage,
    promptTokens,
  });

  const { abortController, onStart } = createAbortController(req, res, getAbortData);

  try {
    const { client } = await initializeClient({ req, res, endpointOption });
    const messageOptions = {
      user,
      parentMessageId,
      conversationId,
      overrideParentMessageId,
      getReqData,
      onStart,
      addMetadata,
      abortController,
      onProgress: progressCallback.call(null, {
        res,
        text,
        parentMessageId: overrideParentMessageId || userMessageId,
      }),
    };

    let response = await client.sendMessage(text, messageOptions);

    if (overrideParentMessageId) {
      response.parentMessageId = overrideParentMessageId;
    }

    if (metadata) {
      response = { ...response, ...metadata };
    }

    if (client.options.attachments) {
      userMessage.files = client.options.attachments;
      delete userMessage.image_urls;
    }

    console.log(`AI responds to ${req.user.name}: `, response.text);
    logtail.log(`AI responds to ${req.user.name}: ` + response.text, ip);

    logtail.flush();

    sendMessage(res, {
      title: await getConvoTitle(user, conversationId),
      final: true,
      conversation: await getConvo(user, conversationId),
      requestMessage: userMessage,
      responseMessage: response,
    });
    res.end();

    await saveMessage({ ...response, user });
    await saveMessage(userMessage);

    if (parentMessageId === '00000000-0000-0000-0000-000000000000' && newConvo) {
      addTitle(req, {
        text,
        response,
        client,
      });
    }
  } catch (error) {
    const partialText = getPartialText();

    console.error(error);
    logtail.error(error);
    logtail.flush();

    handleAbortError(res, req, error, {
      partialText,
      conversationId,
      sender,
      messageId: responseMessageId,
      parentMessageId: userMessageId ?? parentMessageId,
    });
  }
});

module.exports = router;
