// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.

const Alexa = require("ask-sdk-core");
const axios = require("axios");

const jokeUrl = "https://api.chucknorris.io/jokes/random";

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "Welcome to humour me skill. This fun-filled skill which will offer one new funny joke everyday. Want to learn more?";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const BuySubscriptionIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "BuySubscriptionIntentHandler" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.YesIntent")
    );
  },
  handle(handlerInput) {
    console.log("Inside BuySubscriptionIntent Handler");

    const locale = Alexa.getLocale(handlerInput.requestEnvelope);
    const skillID =
      handlerInput.requestEnvelope.session.application.applicationId;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return ms.getInSkillProducts(locale).then((result) => {
      const purchasableProducts = result.inSkillProducts.filter(
        (record) =>
          record.entitled === "NOT_ENTITLED" &&
          record.purchasable === "PURCHASABLE"
      );

      console.log(`PRODUCT : ${JSON.stringify(purchasableProducts)}`);

      if (purchasableProducts.length > 0) {
        return handlerInput.responseBuilder
          .addDirective({
            type: "Connections.SendRequest",
            name: "Buy",
            payload: {
              InSkillProduct: {
                productId: skillID,
              },
            },
            token: "correlationToken",
          })
          .getResponse();
      } else {
        return handlerInput.responseBuilder
          .speak(
            "You already have purchased this skill. Please say tell me a joke to provide you a funny joke."
          )
          .getResponse();
      }
    });
  },
};

const BuyResponseHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
        "Connections.Response" &&
      handlerInput.requestEnvelope.request.name === "Buy"
    );
  },

  async handle(handlerInput) {
    var speechText;
    const locale = Alexa.getLocale(handlerInput.requestEnvelope);
    const monetizationClient =
      handlerInput.serviceClientFactory.getMonetizationServiceClient();
    const productId = handlerInput.requestEnvelope.request.payload.productId;

    return monetizationClient.getInSkillProducts(locale).then(async (res) => {
      const product = res.inSkillProducts.filter(
        (record) => record.productId === productId
      );
      console.log(
        `Buy Response PRODUCT Information : ${JSON.stringify(product)}`
      );

      if (handlerInput.requestEnvelope.request.status.code === "200") {
        switch (handlerInput.requestEnvelope.request.payload.purchaseResult) {
          case "ACCEPTED":
            var joke = await fetchJoke();
            speechText = `Here is your Joke: ${joke.value}`;
            break;
          case "DECLINED":
            speechText = "No problem. You can buy it anytime.";
            break;
          case "ALREADY_PURCHASED":
            var joke = await fetchJoke();
            speechText = `Here is your Joke: ${joke.value}`;
            break;
          default:
            speechText = "Something Unexpected happens. Please try again.";
        }
        return handlerInput.responseBuilder.speak(speechText).getResponse();
      }
    });
  },
};

const CancelSubscriptionIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "CancelSubscriptionIntentHandler" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.NoIntent")
    );
  },
  handle(handlerInput) {
    const locale = Alexa.getLocale(handlerInput.requestEnvelope);
    const skillID =
      handlerInput.requestEnvelope.session.application.applicationId;
    const monetizationClient =
      handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return monetizationClient.getInSkillProducts(locale).then((res) => {
      const purchaseProducts = res.inSkillProducts.filter(
        (record) =>
          record.entitled === "ENTITLED" &&
          record.purchasable === "NOT_PURCHASABLE"
      );

      console.log(`PRODUCT : ${JSON.stringify(purchaseProducts)}`);

      if (purchaseProducts.length > 0) {
        return handlerInput.responseBuilder
          .addDirective({
            type: "Connections.SendRequest",
            name: "Cancel",
            payload: {
              InSkillProduct: {
                productId: skillID,
              },
            },
            token: "correlationToken",
          })
          .getResponse();
      } else {
        return handlerInput.responseBuilder
          .speak(
            "It looks like you have not puchased the skill. Please say purchase paid demo to buy skill."
          )
          .getResponse();
      }
    });
  },
};

const CancelResponseHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
        "Connections.Response" &&
      handlerInput.requestEnvelope.request.name === "Cancel"
    );
  },

  handle(handlerInput) {
    const locale = Alexa.getLocale(handlerInput.requestEnvelope);
    const monetizationClient =
      handlerInput.serviceClientFactory.getMonetizationServiceClient();
    const productId = handlerInput.requestEnvelope.request.payload.productId;

    return monetizationClient.getInSkillProducts(locale).then((res) => {
      const product = res.inSkillProducts.filter(
        (record) => record.productId === productId
      );

      console.log(`PRODUCT : ${JSON.stringify(product)}`);

      if (handlerInput.requestEnvelope.request.status.code === "200") {
        let speechText;
        const payload = handlerInput.requestEnvelope.request.payload;

        if (payload.purchaseResult === "ACCEPTED") {
          speechText =
            "We have cancelled your purchase. Thank you for using this skill.";
        } else if (payload.purchaseResult === "DECLINED") {
          speechText = "We are facing some issues in canceling your purchase.";
        } else if (payload.purchaseResult === "NOT_ENTITLED") {
          speechText =
            "There is no purchase happened to cancel. Please say purchase paid demo to buy this skill.";
        }
        return handlerInput.responseBuilder.speak(speechText).getResponse();
      }
      console.log(
        `Connections.Response indicated failure. error: ${handlerInput.requestEnvelope.request.status.message}`
      );

      return handlerInput.responseBuilder
        .speak(
          "There was an error handling your purchase request. Please try again or contact us for help."
        )
        .getResponse();
    });
  },
};

const JokeIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "JokeIntent"
    );
  },
  async handle(handlerInput) {
    var speechText;
    const locale = Alexa.getLocale(handlerInput.requestEnvelope);
    const skillID =
      handlerInput.requestEnvelope.session.application.applicationId;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return ms.getInSkillProducts(locale).then(async (result) => {
      const purchasableProducts = result.inSkillProducts.filter(
        (record) =>
          record.entitled === "ENTITLED" &&
          record.purchasable === "NOT_PURCHASABLE"
      );

      console.log(
        `Joke Purchase Product: ${JSON.stringify(purchasableProducts)}`
      );

      if (purchasableProducts.length > 0) {
        var joke = await fetchJoke();
        speechText = `Here is your joke ${joke.value}`;
        return handlerInput.responseBuilder.speak(speechText).getResponse();
      } else {
        return handlerInput.responseBuilder
          .addDirective({
            type: "Connections.SendRequest",
            name: "Buy",
            payload: {
              InSkillProduct: {
                productId: skillID,
              },
            },
            token: "correlationToken",
          })
          .getResponse();
      }
    });
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "You can say hello to me! How can I help?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Goodbye!";
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  },
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const FallbackHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    console.log("IN FallbackHandler");
    return handlerInput.responseBuilder
      .speak("Sorry, I didn't understand what you meant. Please try again.")
      .reprompt("Sorry, I didn't understand what you meant. Please try again.")
      .getResponse();
  },
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`);
    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const LogResponseInterceptor = {
  process(handlerInput) {
    console.log(
      `RESPONSE = ${JSON.stringify(handlerInput.responseBuilder.getResponse())}`
    );
  },
};

const LogRequestInterceptor = {
  process(handlerInput) {
    console.log(
      `REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`
    );
  },
};

const fetchJoke = async () => {
  try {
    const { data } = await axios.get(jokeUrl);
    console.log(`Joke Data is : $(JSON.stringify(data.value))`);
    return data;
  } catch (error) {
    console.error("Can't fetch Jokes", error);
  }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    JokeIntentHandler,
    BuySubscriptionIntentHandler,
    BuyResponseHandler,
    CancelSubscriptionIntentHandler,
    CancelResponseHandler,
    CancelAndStopIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler,
    FallbackHandler
  )
  .addErrorHandlers(ErrorHandler)
  .addRequestInterceptors(LogRequestInterceptor)
  .addResponseInterceptors(LogResponseInterceptor)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
