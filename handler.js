const { CaverExtKAS } = require("caver-js-ext-kas");
const { SQS } = require("aws-sdk");

// https://www.daleseo.com/js-dotenv/ 참고
require("dotenv").config({ path: "./.env" });
const chainId = process.env.CHAIN_ID;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const sqs = new SQS();

// Set an authorization through constructor
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey);

/*
  추가하기!
  The example below introduces how to use caver.kct.kip7.
*/

const producer = async (event) => {
  let statusCode = 200;
  let message;

  /*
    요청 Body에 해당 내용이 오나 확인해 볼것
    {
      "contractAddress": "0x32dbcf48cdaa93673a8c642423cb5df4fdf4f469",
      "fromAddress": "0x2FCf7A2bBb08088CcF2e2080c611D3BEC910EbB6",
      "toAddress": "0x2FCf7A2bBb08088CcF2e2080c611D3BEC910EbB6",
      "amount": 1000000000000000000,
      "webhookURL": "https://yourdomain.com/webhook"
    }
  */

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No body was found",
      }),
    };
  }

  try {
    await sqs
      .sendMessage({
        QueueUrl: process.env.QUEUE_URL,
        MessageBody: event.body,
        MessageAttributes: {
          AttributeName: {
            StringValue: "Attribute Value",
            DataType: "String",
          },
        },
      })
      .promise();

    message = "Message accepted!";
  } catch (error) {
    console.log(error);
    message = error;
    statusCode = 500;
  }

  return {
    statusCode,
    body: JSON.stringify({
      message,
    }),
  };
};

// handler Name : jobsWorker

const consumer = async (event) => {
  for (const record of event.Records) {
    const messageAttributes = record.messageAttributes;
    console.log(
      "Message Attribute: ",
      messageAttributes.AttributeName.stringValue
    );
    console.log("Message Body: ", record.body);
  }
};

module.exports = {
  producer,
  consumer,
};
