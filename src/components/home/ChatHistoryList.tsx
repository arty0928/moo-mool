"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/store/useChatStore";
import { useGetRecentChatSessions } from "@/hooks/useGetRecentChatSessions";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { OngoingChatCard } from "./OngoingChatCard";
import { ChatSessionCard } from "./ChatSessionCard";
import { ChatSessionCardSkeleton } from "../skeleton/ChatSessionCardSkeleton";
import { cn } from "@/lib/utils";
import { CarouselApi } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useRouter } from "next/navigation";

export default function ChatHistoryList() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const {
    data: sessions,
    isLoading,
    isFetching,
  } = useGetRecentChatSessions(userId ?? "");

  const { messages, currentQuestionId } = useChatStore();
  // currnetQuestionId가 -1~11 사이이고, message 길이가 2 이상(대화를 시작한 시점)일 때만 progress 표시
  const shouldShowProgress =
    currentQuestionId >= -1 && currentQuestionId < 12 && messages.length >= 2;
  const loading = !userId || isLoading || isFetching;

  const totalItems = (shouldShowProgress ? 1 : 0) + (sessions?.length ?? 0);

  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect); // 이벤트 등록
    onSelect(); // 초기 인덱스 설정

    // ✅ 정리 함수는 직접 명시적으로 작성해야 함
    return () => {
      carouselApi.off("select", onSelect); // 이벤트 해제
    };
  }, [carouselApi]);

  if (status === "unauthenticated")
    return (
      <Card
        onClick={() => router.push("/")}
        className="mx-11 my-2 flex w-[15rem] cursor-pointer flex-col justify-center rounded-xl border border-gray-300 bg-white p-4 shadow-sm md:ml-17">
        <CardHeader className="p-0 pb-1">
          <CardTitle className="truncate text-sm font-semibold text-gray-900">
            아직 대화내역이 없어요
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-1">
          <p className="truncate text-xs text-gray-600">로그인하러 가기</p>
        </CardContent>
      </Card>
    );

  return (
    <section className="relative flex flex-col px-4 pt-6">
      <div className="relative mb-4 h-5 w-full">
        {/* 라인 */}
        <div className="absolute top-1/2 right-0 left-0 z-0 h-[2px] -translate-y-1/2 rounded-full bg-pink-100" />

        {/* dot들 */}
        <div className="relative z-10 flex justify-center gap-x-6">
          {Array.from({ length: totalItems }).map((_, idx) => {
            const isCurrent = currentIndex === idx;

            return (
              <button
                key={`dot-${idx}`}
                className={cn(
                  "h-4 w-4 rounded-full border shadow-sm transition-all duration-200",
                  isCurrent
                    ? "border-pink-500 bg-pink-400"
                    : "border-pink-200 bg-pink-200"
                )}
                onClick={() => carouselApi?.scrollTo(idx)}
              />
            );
          })}
        </div>
      </div>

      <Carousel
        setApi={setCarouselApi}
        className="w-full max-w-full overflow-visible px-2">
        <CarouselContent className="-mx-2 pr-4 pl-2 last:mr-7">
          {/* 진행 중 */}
          {shouldShowProgress &&
            (loading ? (
              <CarouselItem className="basis-[80%]">
                <ChatSessionCardSkeleton />
              </CarouselItem>
            ) : (
              <CarouselItem
                className={cn(
                  "basis-[80%] transition-shadow duration-300",
                  currentIndex === 0 && "shadow-lg"
                )}>
                <OngoingChatCard currentQuestionId={currentQuestionId} />
              </CarouselItem>
            ))}

          {/* 세션 카드 */}
          {loading ? (
            // 로딩 중일 때: 스켈레톤 3개 표시
            Array.from({ length: 3 }).map((_, i) => (
              <CarouselItem key={i} className="basis-[80%]">
                <ChatSessionCardSkeleton />
              </CarouselItem>
            ))
          ) : sessions && sessions.length === 0 ? (
            // 데이터가 없을 때: 커스텀 UI
            <CarouselItem className="mb-3 basis-[100%]">
              <div className="ml-1 flex h-full w-full items-center justify-center rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">
                  최근 대화 내역이 없습니다.
                </p>
              </div>
            </CarouselItem>
          ) : (
            // ✅ 세션이 있을 때: 실제 카드 렌더링
            sessions?.map((s, idx) => {
              const index = shouldShowProgress ? idx + 1 : idx;
              return (
                <CarouselItem
                  key={idx}
                  className={cn(
                    "basis-[80%] transition-shadow duration-300",
                    currentIndex === index && "shadow-lg"
                  )}>
                  <ChatSessionCard
                    id={s.id}
                    summary={s.summary || "요약 내용 없음"}
                    name={s.name}
                  />
                </CarouselItem>
              );
            })
          )}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
