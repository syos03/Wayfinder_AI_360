/**
 * Google Gemini AI Integration
 * For generating travel plans
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface TripPlanInput {
  origin: string;
  destinations: string[];
  days: number;
  budget: number;
  travelers: number;
  travelStyle: string;
  interests: string[];
  startDate: string;
}

export interface TripPlanOutput {
  title: string;
  itinerary: {
    day: number;
    date: string;
    morning: {
      activities: string[];
      estimatedCost: number;
    };
    afternoon: {
      activities: string[];
      estimatedCost: number;
    };
    evening: {
      activities: string[];
      estimatedCost: number;
    };
    accommodation: string;
    totalDayCost: number;
  }[];
  transportation: {
    type: string;
    details: string;
    cost: number;
  };
  budgetBreakdown: {
    transportation: number;
    accommodation: number;
    food: number;
    activities: number;
    other: number;
    total: number;
  };
  tips: string[];
  warnings: string[];
}

function buildPrompt(input: TripPlanInput): string {
  return `
Bạn là chuyên gia tư vấn du lịch Việt Nam với 20 năm kinh nghiệm. 
Hãy tạo một kế hoạch du lịch chi tiết và thực tế cho khách hàng.

⚠️ QUAN TRỌNG: VIẾT TIẾNG VIỆT CÓ DẤU CHUẨN XUYÊN SUỐT!

THÔNG TIN CHUYẾN ĐI:
- Xuất phát: ${input.origin}
- Điểm đến: ${input.destinations.join(', ')}
- Thời gian: ${input.days} ngày (bắt đầu ${input.startDate})
- Ngân sách: ${input.budget.toLocaleString('vi-VN')} VNĐ/người
- Số người: ${input.travelers} người
- Phong cách: ${input.travelStyle}
- Sở thích: ${input.interests.join(', ') || 'Khám phá tự do'}

YÊU CẦU:
1. Lịch trình cho từng ngày (sáng/chiều/tối) - TỐI ĐA 3-4 hoạt động/buổi
2. Địa điểm ăn uống với giá (CHỈ SỐ, không dấu phẩy)
3. Phương tiện di chuyển với giá (CHỈ SỐ)
4. Chỗ ở phù hợp với giá (CHỈ SỐ)
5. Phân bổ ngân sách (TẤT CẢ là NUMBER)
6. 3-5 tips ngắn gọn
7. 2-3 cảnh báo quan trọng

LƯU Ý QUAN TRỌNG:
- VIẾT TIẾNG VIỆT CÓ DẤU CHUẨN (ă, â, ê, ô, ơ, ư, đ và các dấu thanh)
- Giá cả phải THỰC TẾ theo mức giá Việt Nam năm 2025
- Tổng chi phí KHÔNG ĐƯỢC vượt quá ngân sách
- Lịch trình phải HỢP LÝ về mặt thời gian và địa lý
- Ưu tiên trải nghiệm địa phương, không quá touristy

QUAN TRỌNG: Trả về PURE JSON (không có markdown, không có \`\`\`):
- Tất cả "cost" và "estimatedCost" phải là SỐ (number), KHÔNG có dấu phẩy, KHÔNG có "VNĐ"
- Tất cả string phải dùng dấu nháy kép "
- Không được xuống dòng trong string
- JSON phải hợp lệ 100%

VÍ DỤ OUTPUT (VIẾT TIẾNG VIỆT CÓ DẤU CHUẨN):
{
  "title": "Kế hoạch du lịch ${input.destinations.join(' - ')} ${input.days} ngày",
  "itinerary": [
    {
      "day": 1,
      "date": "${input.startDate}",
      "morning": {"activities": ["Ăn sáng phở tại Hà Nội (60000đ)", "Tham quan Hồ Hoàn Kiếm"], "estimatedCost": 100000},
      "afternoon": {"activities": ["Ăn trưa bún chả (80000đ)", "Khám phá Phố Cổ"], "estimatedCost": 150000},
      "evening": {"activities": ["Ăn tối tại nhà hàng (150000đ)", "Nghỉ ngơi khách sạn"], "estimatedCost": 200000},
      "accommodation": "Khách sạn Paradise 800000đ/đêm",
      "totalDayCost": 1000000
    }
  ],
  "transportation": {"type": "xe khách", "details": "Xe giường nằm Hà Nội - Đà Lạt", "cost": 500000},
  "budgetBreakdown": {"transportation": 500000, "accommodation": 2000000, "food": 1500000, "activities": 500000, "other": 500000, "total": 5000000},
  "tips": ["Mang theo áo ấm", "Đặt vé trước 1 tuần", "Nên đi vào tháng 10-12"],
  "warnings": ["Cẩn thận thời tiết mưa", "Đường núi dốc nguy hiểm"]
}

LƯU Ý: VIẾT TIẾNG VIỆT CÓ DẤU CHUẨN! CHỈ TRẢ VỀ JSON, KHÔNG TEXT KHÁC!
`.trim();
}

function extractJSON(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  
  // Remove ```json and ``` if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  
  // Find JSON object boundaries
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }
  
  // Clean up common JSON issues
  cleaned = cleaned
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/,\s*}/g, '}') // Remove trailing commas
    .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
  
  return cleaned.trim();
}

export async function generateTripPlan(
  input: TripPlanInput
): Promise<TripPlanOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // Use Gemini 2.5 Flash - latest free model
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.2, // Very low for consistent JSON
      topK: 10,
      topP: 0.7,
      maxOutputTokens: 16000, // Increased for longer trips
      responseMimeType: "application/json", // Request JSON response
    },
  });
  const prompt = buildPrompt(input);

  try {
    console.log('🤖 Generating trip plan with Gemini AI...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Received AI response');
    console.log('📄 Response length:', text.length, 'chars');

    // Parse JSON from AI response
    const jsonText = extractJSON(text);
    console.log('📝 Extracted JSON length:', jsonText.length, 'chars');
    
    try {
      const parsed = JSON.parse(jsonText);
      console.log('✅ JSON parsed successfully');
      return parsed as TripPlanOutput;
    } catch (parseError: any) {
      console.error('❌ JSON parse error:', parseError.message);
      console.error('📋 Full JSON output:');
      console.error(jsonText);
      console.error('--- END OF JSON ---');
      throw new Error(`Lỗi xử lý dữ liệu từ AI. Vui lòng thử lại.`);
    }
  } catch (error: any) {
    console.error('❌ Gemini API error:', error);
    
    if (error.message?.includes('API key')) {
      throw new Error('API key không hợp lệ. Vui lòng kiểm tra cấu hình.');
    }
    
    if (error.message?.includes('quota')) {
      throw new Error('Đã hết quota API. Vui lòng thử lại sau.');
    }

    throw new Error('Không thể tạo kế hoạch du lịch. Vui lòng thử lại.');
  }
}

