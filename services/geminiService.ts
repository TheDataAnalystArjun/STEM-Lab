import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord } from "../types";

// Initialize the client. 
// NOTE: The API key is accessed via process.env.API_KEY as per instructions.
// If process.env.API_KEY is not set in the environment, this will throw an error or fail gracefully in the catch block.
const getAiClient = () => {
    if (!process.env.API_KEY) {
        console.warn("Gemini API Key is missing.");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateAttendanceReport = async (records: AttendanceRecord[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "API Key not configured. Unable to generate AI insights.";
  }

  // Filter for recent records to avoid token limits if the dataset is huge
  // Taking last 50 records for analysis
  const recentRecords = records
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);

  const dataContext = JSON.stringify(recentRecords.map(r => ({
    date: r.date,
    student: r.studentName,
    system: r.systemNumber,
    in: r.checkInTime,
    out: r.checkOutTime,
    duration: r.durationMinutes,
    status: r.status
  })));

  const prompt = `
    Analyze the following lab attendance data (JSON format). 
    Provide a concise summary report covering:
    1. Peak usage times.
    2. Average session duration.
    3. Most active students or systems.
    4. Any anomalies (e.g., very short sessions or forgotten check-outs).
    
    Keep the tone professional and helpful for a lab administrator.
    Use Markdown formatting for the response.

    Data:
    ${dataContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Error generating AI report:", error);
    return "Failed to generate report due to an API error. Please try again later.";
  }
};
