const { SQS } = require("aws-sdk");
const axios = require('axios');

// SQS 인스턴스 생성
const sqs = new SQS();

const producer = async (event) => {
  let statusCode = 200;
  let message;

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No body was found",
      }),
    };
  }

  
  // const reqBody = event.body;
  /*
  // const contractAddress = reqBody.contractAddress;
  const contractAddress = '0x0a57e58ce884398ab9a702669a3adc488c6c2688';

  const URL = `https://kip7-api.klaytnapi.com/v1/contract/${contractAddress}/transfer`;

  const data = JSON.stringify({
    "from": "0x8bbb55cabe555f2032e0e46e7f35e6253c601020",
    "to": reqBody.to, // "0xb20786792F1513c76d3eDD995ecdb1242e4Db90f",
    "amount": reqBody.amount //"0x2540be400"
  });
  const config = {
    headers: {
      'x-chain-id': '10001',
      'Authorization': 'Basic S0FTS0NGVTdUVTdLTkxUUjhKVFZQMVBDOnh6UWpkUE9zMWpWazBnd2FRNVBPc0lBcWoxREhxM3U4M25Qd0xNWXE=',
      'Content-Type': 'application/json'
    },
  }
  
  axios.post(URL, data, config)
    .then(function (response) {
      message = JSON.stringify(response.data);
    })
    .catch(function (error) {
      statusCode = error.response.status;
      message = JSON.stringify(error.response.data);
    })
    .finally(function () {
      return {
        statusCode,
        body: message
      };
    });
  */



    /*
      MessageAttributes 관련해서 여기서 찾아보기?
      http://pyrasis.com/book/TheArtOfAmazonWebServices/Chapter30/13

    */
  const { to, amount } = event.body;
  console.log(to);
  try {
    message = await sqs.sendMessage({
        QueueUrl: process.env.QUEUE_URL,
        MessageBody: JSON.stringify(event.body),
        MessageAttributes: {
          // AttributeName: {
          //   StringValue: "Attribute Value",
          //   DataType: "String",
          // },
          to: {
            StringValue: to,
            DataType: "String",
          },
          amount: {
            StringValue: amount,
            DataType: "String",
          },
        },
      })
      .promise();

    // message = "Message accepted!";
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
  /*
  for (const record of event.Records) {
    const messageAttributes = record.messageAttributes;
    console.log(
      "Message Attribute: ",
      messageAttributes.AttributeName.stringValue
    );
    console.log("Message Body: ", record.body);
  }
  */
  for (const record of event.Records) {
    const messageAttributes = record.messageAttributes;
    console.log(
      "Message Attribute: ",
      messageAttributes.AttributeName.stringValue
    );

    const { body } = record;
    console.log("Message Body: ", body);
  }
};

module.exports = {
  producer,
  consumer,
};
