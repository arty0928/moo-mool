"use client";

import { Message } from "@/types/Chat";
import PlanListCard from "@/components/planList/PlanListCard";
import PlanListCardSkeleton from "@/components/skeleton/PlanListCardSkeleton";
import TypingMessage from "./TypingMessage";
import { useChatStore } from "@/store/useChatStore";
import QuickReplyList from "./QuickReplyList";
import { convertToPlanDBApiResponse } from "@/utils/planDataConverter";

interface ChatMessageProps {
  message: Message;
  isLastBotMessage?: boolean;
}

export default function ChatMessage({
  message,
  isLastBotMessage,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const { quickReplies } = useChatStore();

  // 최종 요금제 카드 추천 버전
  if (message.type === "plan") {
    return (
      <div className="flex items-start justify-start gap-2 py-2">
        <img
          src="/assets/moono/chatbot-moono.png"
          alt="무너"
          className="mt-1 h-8 w-8 rounded-full"
        />
        <div className="flex flex-col">
          <span className="mb-1 text-xs text-gray-800">무너</span>
          {message.content.trim() !== "" && (
            <TypingMessage fullText={message.content} />
          )}
          <div className="flex w-full max-w-xs flex-col py-3">
            {message.planData ? (
              <PlanListCard
                plan={convertToPlanDBApiResponse(message.planData)}
              />
            ) : (
              <PlanListCardSkeleton />
            )}
          </div>
        </div>
      </div>
    );
  }

  // 사용자 답변 버전
  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-2">
        <div className="max-w-[75%] rounded-tl-2xl rounded-br-2xl rounded-bl-2xl bg-[#FFF3B0] px-3 py-2 text-sm shadow-md">
          {message.content}
        </div>
      </div>
    );
  }

  // 무너 질문 버전
  return (
    <div className="flex items-start justify-start gap-2">
      <img
        src="/assets/moono/chatbot-moono.png"
        alt="무너"
        className="mt-1 h-8 w-8 rounded-full"
      />
      <div className="flex flex-col">
        <span className="mb-1 text-xs text-gray-800">무너</span>
        {isLastBotMessage ? (
          <TypingMessage fullText={message.content} />
        ) : (
          <div className="inline-block max-w-[15rem] min-w-[80px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl bg-white px-3 py-2 text-sm break-words shadow-md">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}
