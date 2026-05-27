import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the expected shape of the incoming request
interface TriageRequest {
  customerDescription: string;
  imageUrls: string[];
}

// The Pricebook: We inject this directly into the prompt
const PRICEBOOK = {
  "Base_Callout_Rates": {
    "Standard Hourly Rate (7AM - 6PM)": 150.0,
    "Standard Minimum Charge (Including 1st half hour)": 200.0,
    "Evening Time Minimum Charge (6PM - 9PM)": 350.0,
    "Night Time Minimum Charge (9PM - 6:00AM)": 500.0,
    "Sundays & Public Holiday": 500.0
  },
  "Services_And_Parts": [
    { "Category": "Tapware", "Service": "Tap Service", "Specific_Part": "N/A", "Est_Labour_Hours": 0.5, "Total_Price": 95.0 },
    { "Category": "Bathroom Spindle/Ceramic Disc", "Service": "Wall Top Assembly (Generic) Replacement", "Specific_Part": "Posh Bristol Wall Top Assembly Taps Chrome Lead Free (27892)", "Est_Labour_Hours": 0.5, "Total_Price": 150.0 },
    { "Category": "Bathroom Spindle/Ceramic Disc", "Service": "Shower Set Replacement", "Specific_Part": "Posh Bristol Shower Set Chrome (2205922)", "Est_Labour_Hours": 0.75, "Total_Price": 212.5 },
    { "Category": "Bathroom Spindle/Ceramic Disc", "Service": "Shower Set 1/4 Turn Ceramic Disc", "Specific_Part": "Posh Bristol Shower Set Lever 1/4 Turn Ceramic Disk (2205962)", "Est_Labour_Hours": 0.75, "Total_Price": 302.5 },
    { "Category": "Bathroom Spindle/Ceramic Disc", "Service": "Shower Head Replacement", "Specific_Part": "Standard All Directional & Rose Chrome (1700672)", "Est_Labour_Hours": 0.5, "Total_Price": 105.0 }
  ]
};

export async function POST(req: Request) {
  try {
    // Cast the parsed JSON to our TriageRequest interface
    const body = (await req.json()) as TriageRequest;
    const { customerDescription, imageUrls } = body;

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

// Format the images for OpenAI
    const imageContentBlocks = imageUrls.map((url: string) => ({
      type: "image_url" as const, // <-- Add 'as const' right here
      image_url: { url: url }, 
    }));
    
    // Call the LLM using standard JSON Mode
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" }, // Forces output to be valid JSON
      messages: [
        {
          role: "system",
          content: `You are an expert quoting assistant for a Western Australian plumbing service. 
          Analyze the customer description and photos. Identify the likely problem and generate a triage report.
          
          CRITICAL INSTRUCTION: You must strictly map your suggested repairs to the items in this authorized pricebook:
          ${JSON.stringify(PRICEBOOK, null, 2)}
          
          Always include the appropriate Base Callout Rate as the first line item based on standard business logic.
          
          You MUST respond with a raw JSON object using EXACTLY this schema:
          {
            "classification": "Main issue category string",
            "urgency_score": number between 1 and 5,
            "visual_observations": ["array of specific strings seen in photo"],
            "recommended_line_items": [
              {
                "category": "string",
                "description": "string",
                "quantity": number,
                "estimated_price": number
              }
            ],
            "diagnostic_questions": ["array of 1-2 strings"]
          }`
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Customer notes: "${customerDescription}"` },
            ...imageContentBlocks
          ],
        },
      ],
    });

    // In standard JSON mode, the response is a string that we need to parse
    const rawResponse = completion.choices[0].message.content || "{}";
    const triageResult = JSON.parse(rawResponse);

    return NextResponse.json({ success: true, data: triageResult });

  } catch (error) {
    console.error("Triage Error:", error);
    return NextResponse.json({ error: "Failed to process triage" }, { status: 500 });
  }
}