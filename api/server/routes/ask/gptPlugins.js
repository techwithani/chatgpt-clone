const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { Logtail } = require('@logtail/node');
const { getResponseSender } = require('../endpoints/schemas');
const { validateTools } = require('../../../app');
const { addTitle } = require('../endpoints/openAI');
const { initializeClient } = require('../endpoints/gptPlugins');
const { saveMessage, getConvoTitle, getConvo } = require('../../../models');
const { sendMessage, createOnProgress, formatSteps, formatAction } = require('../../utils');
const {
  handleAbort,
  createAbortController,
  handleAbortError,
  setHeaders,
  requireJwtAuth,
  validateEndpoint,
  buildEndpointOption,
} = require('../../middleware');

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 350,
  handler: function (req) {
    req.socket.end();
  },
});
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

router.post('/abort', requireJwtAuth, handleAbort());

function verifiedRateLimiter(req, res, next) {
  const isPremium = req.user.emailVerified;

  if (isPremium) {
    return next();
  } else {
    limiter(req, res, next);
  }
}

router.post(
  '/',
  requireJwtAuth,
  verifiedRateLimiter,
  validateEndpoint,
  buildEndpointOption,
  setHeaders,
  async (req, res) => {
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
    let userMessageId;
    let responseMessageId;
    let lastSavedTimestamp = 0;
    let saveDelay = 100;
    const newConvo = !conversationId;
    const user = req.user.id;

    const plugin = {
      loading: true,
      inputs: [],
      latest: null,
      outputs: null,
    };

    const addMetadata = (data) => (metadata = data);
    const getIds = (data) => {
      userMessage = data.userMessage;
      userMessageId = userMessage.messageId;
      responseMessageId = data.responseMessageId;
      if (!conversationId) {
        conversationId = data.conversationId;
      }
    };

    const {
      onProgress: progressCallback,
      sendIntermediateMessage,
      getPartialText,
    } = createOnProgress({
      onProgress: ({ text: partialText }) => {
        const currentTimestamp = Date.now();

        if (plugin.loading === true) {
          plugin.loading = false;
        }

        if (currentTimestamp - lastSavedTimestamp > saveDelay) {
          lastSavedTimestamp = currentTimestamp;
          saveMessage({
            messageId: responseMessageId,
            sender: getResponseSender(endpointOption),
            conversationId,
            parentMessageId: overrideParentMessageId || userMessageId,
            text: partialText,
            model: endpointOption.modelOptions.model,
            unfinished: true,
            cancelled: false,
            error: false,
          });
        }

        if (saveDelay < 500) {
          saveDelay = 500;
        }
      },
    });

    const onAgentAction = (action, start = false) => {
      const formattedAction = formatAction(action);
      plugin.inputs.push(formattedAction);
      plugin.latest = formattedAction.plugin;
      if (!start) {
        saveMessage(userMessage);
      }
      sendIntermediateMessage(res, { plugin });
      // console.log('PLUGIN ACTION', formattedAction);
    };

    const onChainEnd = (data) => {
      let { intermediateSteps: steps } = data;
      plugin.outputs = steps && steps[0].action ? formatSteps(steps) : 'An error occurred.';
      plugin.loading = false;
      saveMessage(userMessage);
      sendIntermediateMessage(res, { plugin });
      // console.log('CHAIN END', plugin.outputs);
    };

    const getAbortData = () => ({
      sender: getResponseSender(endpointOption),
      conversationId,
      messageId: responseMessageId,
      parentMessageId: overrideParentMessageId ?? userMessageId,
      text: getPartialText(),
      plugin: { ...plugin, loading: false },
      userMessage,
    });
    const { abortController, onStart } = createAbortController(
      res,
      req,
      endpointOption,
      getAbortData,
    );

    try {
      endpointOption.tools = await validateTools(user, endpointOption.tools);
      const { client, azure, openAIApiKey } = initializeClient(req, endpointOption);

      let response = await client.sendMessage(text, {
        user,
        conversationId,
        parentMessageId,
        overrideParentMessageId,
        getIds,
        onAgentAction,
        onChainEnd,
        onStart,
        addMetadata,
        ...endpointOption,
        onProgress: progressCallback.call(null, {
          res,
          text,
          plugin,
          parentMessageId: overrideParentMessageId || userMessageId,
        }),
        abortController,
      });

      if (overrideParentMessageId) {
        response.parentMessageId = overrideParentMessageId;
      }

      if (metadata) {
        response = { ...response, ...metadata };
      }

      // console.log('CLIENT RESPONSE');
      // console.dir(response, { depth: null });
      console.log(`AI responds to ${req.user.name}: `, response.text);
      logtail.log(`AI responds to ${req.user.name}: ` + response.text, ip);
      logtail.flush();
      response.plugin = { ...plugin, loading: false };
      await saveMessage(response);

      sendMessage(res, {
        title: await getConvoTitle(req.user.id, conversationId),
        final: true,
        conversation: await getConvo(req.user.id, conversationId),
        requestMessage: userMessage,
        responseMessage: response,
      });
      res.end();
      addTitle(req, {
        text,
        newConvo,
        response,
        openAIApiKey,
        parentMessageId,
        azure: !!azure,
      });
    } catch (error) {
      const partialText = getPartialText();

      console.error(error);
      logtail.error(error);
      logtail.flush();

      handleAbortError(res, req, error, {
        partialText,
        conversationId,
        sender: getResponseSender(endpointOption),
        messageId: responseMessageId,
        parentMessageId: userMessageId,
      });
    }
  },
);

module.exports = router;
