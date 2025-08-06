const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// OpenAI API 키 (환경변수로 설정 예정)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 루트 경로 테스트용
app.get('/', (req, res) => {
    res.json({ message: '카카오톡 ChatGPT 챗봇이 정상 작동중입니다!' });
});

// ChatGPT API 호출
async function getChatGPTResponse(userMessage) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system", 
                        content: "당신은 학생들의 질문에 친절하고 정확하게 답변하는 선생님입니다."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('ChatGPT API Error:', error);
        return "죄송합니다. 현재 답변을 생성할 수 없습니다.";
    }
}

// 카카오톡 챗봇 응답
app.post('/chatbot', async (req, res) => {
    try {
        const userMessage = req.body.userRequest.utterance;
        const aiResponse = await getChatGPTResponse(userMessage);
        
        res.status(200).json({
            version: "2.0",
            template: {
                outputs: [{
                    simpleText: {
                        text: aiResponse
                    }
                }]
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(200).json({
            version: "2.0",
            template: {
                outputs: [{
                    simpleText: {
                        text: "오류가 발생했습니다. 다시 시도해주세요."
                    }
                }]
            }
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});
