import {NextResponse} from 'next/server';
import OPENAI from 'openai';
const systemPrompt = 'You are an AI customer support bot. You are helping Headstarter AI for their AI powered interview support.';

export async function POST(req) {
     const openai = new OPENAI({
          apiKey: process.env.local.OPENAI_API_KEY, 

     });
     const data = await req.json();

     const completion = await openai.chatCompletion({
          messages: [
               {
               role: 'system',
               content: systemPrompt
               }, 
               ...data,
     ],
     model: 'gpt-4o-mini',
     stream: true,
     })

     const stream = new ReadableStream({
          async start(controller) {
               const encoder = new TextEncoder();
               try {
                    for await (const chunk of completion) {
                         const content = chunk.choices[0]?.delta.content;
                         if (content) {
                              controller.enqueue(encoder.encode(content));
                         }
                    }
               }
               catch(error){
                    controller.error(error);
               }
               finally {
                    controller.close();
               }
          }
     })

     return new NextResponse(stream)
}