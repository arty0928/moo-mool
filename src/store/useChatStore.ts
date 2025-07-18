import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Message } from "@/types/Chat";
import { questionTextMap } from "@/lib/chat/chatBotQuestionFlow";
import { quickReplyMap } from "@/lib/chat/quickReplyMap";

// 챗봇 시작 메시지
const initialMessage: Message[] = questionTextMap[0]
  ? [{ role: "bot", content: questionTextMap[0] }]
  : [];

interface ChatStore {
  messages: Message[];
  currentQuestionId: number;
  setCurrentQuestionId: (id: number) => void;
  setMessages: (messages: Message[]) => void;
  appendMessage: (message: Message) => void;
  clearMessages: () => void;
  getLastBotMessage: () => Message | undefined;

  hasRecommended: boolean;
  setHasRecommended: (v: boolean) => void;

  // 선택지 버튼 상태
  quickReplies: string[];
  setQuickReplies: (replies: string[]) => void;

  // ChatInput에 타이핑 하는 상태 추적
  isTyping: boolean;
  setIsTyping: (val: boolean) => void;

  // 채팅 후 summary를 저장하기 위함
  chatSummary: string;
  setChatSummary: (summaryRes: string) => void;

  // 채팅 시에 추천받은 요금제의 planId (DB에 저장되어 있는 정보 가져온 것)
  recommendedPlanId: number;
  setRecommendedPlanId: (planId: number) => void;
}

// 상태 관리
export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: initialMessage,
      currentQuestionId: 0,
      setCurrentQuestionId: (id) =>
        set({
          currentQuestionId: id,
          quickReplies: quickReplyMap[id] || [],
        }),
      setMessages: (messages) => set({ messages }),
      appendMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      clearMessages: () => {
        set({
          messages: initialMessage,
          currentQuestionId: 0,
          hasRecommended: false,
        });
      },
      getLastBotMessage: () => {
        const messages = get().messages;
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].role === "bot") return messages[i];
        }
        return undefined;
      },
      hasRecommended: false,
      setHasRecommended: (v) => set({ hasRecommended: v }),

      // 선택지 버튼 상태 (localStorage 저장 X)
      quickReplies: ["자연스럽게 대화할래", "정확한 추천 받고 싶어"],
      setQuickReplies: (replies) => set({ quickReplies: replies }),

      // typing하는 상태 (localStorage 저장 X)
      isTyping: false,
      setIsTyping: (val) => set({ isTyping: val }),

      // 채팅 후 summary를 저장하기 위함
      chatSummary: "",
      setChatSummary: (summaryRes: string) => set({ chatSummary: summaryRes }),

      // 채팅 시에 추천받은 요금제의 planId (DB에 저장되어 있는 정보 가져온 것)
      recommendedPlanId: 0,
      setRecommendedPlanId: (planId: number) =>
        set({ recommendedPlanId: planId }),
    }),
    {
      name: "chat-storage", // localStorage key
      partialize: (state) => ({
        messages: state.messages,
        currentQuestionId: state.currentQuestionId,
        hasRecommended: state.hasRecommended,
        quickReplies: state.quickReplies,
        chatSummary: state.chatSummary,
        recommendedPlanId: state.recommendedPlanId,
      }),
    }
  )
);
