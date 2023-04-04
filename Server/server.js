import express from 'express'; //
import * as dotenv from 'dotenv'; //allows us to get data from .env file
import cors from 'cors' //allows us to make cross origin request
import {Configuration, OpenAIApi} from 'openai'

dotenv.config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors()); //allows us to make a call from the front end
app.use(express.json()); //allows us to parse JSON from the front end to the backend
app.get('/', async (req, res) =>{ //dummy route route
    res.status(200).send({
        message: 'Hello from Enablebot',
    })
    });

app.post('/', async (req, res) => {
    try{
        const prompt = req.body.prompt;
        const response = await openai.createCompletion({  //a function that accepts an object
            model: "gpt-3.5-turbo",
            prompt: `${prompt}`,
            temperature: 0, //means the risk of response 0 being no risk of going beyond what it knows 10 could be a very random and uneducated
            max_tokens: 4000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });
        res.status(200).send({ //sends data back to the frontend
            bot: response.data.choices[0].text
        })
    } catch (error){ //catches errors if response takes longer than timer
        res.status(500).send("Request timed out try again.")
    }
})

app.listen(5000, () => console.log('Server is running on port https://enablebot.onrender.com/'));