import { Configuration, OpenAIApi } from "openai";

async function start(apikey, orgId) {
  const configuration = new Configuration({
    organization: orgId,
    apiKey: apikey,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.listModels();
  const prompt = [
    {
      role: "user",
      content:
        "As an intelligent AI model, if you could be any fictional character, who would you choose and why?",
    },
  ];
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Hello world",
    });
    console.log(completion.data.choices[0].text);
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
  debugger;
}
