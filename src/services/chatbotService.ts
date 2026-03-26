import http from "./http";
import type { ApiResponse } from "./apiTypes";

export interface ProductSuggestion {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface ChatMessageResponse {
  response: string;
  productSuggestions?: ProductSuggestion[];
}

const chatbotService = {
  sendMessage: (message: string) =>
    http.post<ApiResponse<ChatMessageResponse>>("/Chatbot/chat", { message }),
};

export default chatbotService;
