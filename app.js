import { useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
  useEffect(() => {
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const fetchData = async () => {
      try {
        const result = await model.generateContent("Hello Gemini");
        console.log(await result.response.text());
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  return <div>Check console for Gemini response</div>;
}

export default App;

