# Build an Alexa Humour-Me skill using Paid Skill feature. 🇺🇸
<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/header._TTH_.png" />

This sample demonstrate how to use new [Paid Skill](https://developer.amazon.com/es-MX/docs/alexa/paid-skills/overview.html) feature of Alexa skills to inform user to purchase skill before using skill.

## Skill Architecture
Each skill consists of two basic parts, a front end and a back end.
The front end is the voice interface, or VUI.
The voice interface is configured through the voice interaction model.
The back end is where the logic of your skill resides.

## Three Options for Skill Setup
There are a number of different ways for you to setup your skill, depending on your experience and what tools you have available.

 * If this is your first skill, choose the [Alexa-Hosted](https://developer.amazon.com/en-US/docs/alexa/hosted-skills/build-a-skill-end-to-end-using-an-alexa-hosted-skill.html) to get started quickly.
 * If you want to manage the backend resources in your own AWS account, you can follow the [AWS-Hosted instructions](https://developer.amazon.com/en-US/docs/alexa/custom-skills/host-a-custom-skill-as-an-aws-lambda-function.html).
 * Developers with the ASK Command Line Interface configured may follow the [ASK CLI](https://developer.amazon.com/en-US/docs/alexa/smapi/quick-start-alexa-skills-kit-command-line-interface.html).
 * If you want to host the backend code in Alexa developer account (Alexa Hosted skill) then you can directly create hosted skill by [importing Github repository](https://developer.amazon.com/en-US/docs/alexa/hosted-skills/alexa-hosted-skills-git-import.html).

---

## Setup to run this demo

**Important:** This sample code showcase how you can use Paid skill feature to give option for user to buy Alexa skill first before using it. Once user purchased this skill and then they can get chuk norris jokes.

First you need to create Paid Skill product which can be done directly in developer console or through ASK CLI commands.

Run below [create-isp-for-vendor](https://developer.amazon.com/en-US/docs/alexa/smapi/ask-cli-command-reference.html#create-isp-for-vendor-subcommand) command if you are using ASK CLI to create Paid skill product
```
ask smapi create-isp-for-vendor paid-manifest.json 
```
Run below [associate-isp-with-skill](https://developer.amazon.com/en-US/docs/alexa/smapi/ask-cli-command-reference.html#associate-isp-with-skill-subcommand) command to associate ISP with with skill. In Paid skill Product ID is the same as skill Id.

```
ask smapi associate-isp-with-skill --product-id <Skill Id> --skill-id <Skill Id>
```


### API documentation & Resources

- [Understand Paid Skill](https://developer.amazon.com/es-MX/docs/alexa/paid-skills/overview.html)
- [Paid Skill APIs](https://developer.amazon.com/es-MX/docs/alexa/paid-skills/reference.html)


