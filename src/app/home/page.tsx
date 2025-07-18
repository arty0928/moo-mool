"use client";
export const dynamic = "force-dynamic";
import { JSX, Suspense, useEffect, useRef, useState } from "react";
import HomeHeader from "@/components/home/HomeHeader";
import HomeRecommendedPlan from "@/components/home/HomeRecommendedPlan";
import PopularPlansList from "@/components/home/PopularPlansList";
import TopGradient from "@/components/planDetail/TopGradient";
import ChatHistoryList from "@/components/home/ChatHistoryList";
import FeatureBannerSlider from "@/components/home/FeatureBannerSlider";
import { useRouter, useSearchParams } from "next/navigation";
import JoinAlertToast from "@/components/nearby/JoinAlertToast";
import { useToast } from "@/components/nearby/use-toast";
import { toast as sonnerToast } from "sonner";
import LoginRequiredToast from "@/components/common/LoginRequiredToast";
import { useSession, signIn } from "next-auth/react";

let toastId: string | number | null = null; // 중복 방지용

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { custom, dismiss } = useToast();
  const socketRef = useRef<WebSocket | null>(null);
  const [redirectPath, setRedirectPath] = useState("");
  const hasShownToast = useRef(false);

  const handleLogin = () => {
    const callbackUrl = redirectPath || "/home";
    signIn("kakao", { callbackUrl });
  };

  useEffect(() => {
    const redirect = searchParams.get("redirect");

    if (status === "unauthenticated" && redirect && !hasShownToast.current) {
      hasShownToast.current = true;
      setRedirectPath(redirect);

      setTimeout(() => {
        try {
          sonnerToast.custom(
            (t) => (
              <LoginRequiredToast
                toastId={t}
                onLoginClick={() => handleLogin()}
              />
            ),
            {
              id: "login-required-toast",
              duration: 5000,
              unstyled: true,
            }
          );
        } catch (error) {
          console.error("Toast 표시 실패:", error);
        }
      }, 100);

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("redirect");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams, status]);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WSS_SERVER_URL!);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ HomePage WebSocket 연결됨");

      socket.send(
        JSON.stringify({
          type: "home_ready",
        })
      );
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("메세지 전달", message);

      if (message.type === "nearby_user_joined") {
        if (toastId === null) {
          toastId = custom((id) => <JoinAlertToast toastId={id} />, {
            duration: 3000,
            onAutoClose: () => (toastId = null),
            onDismiss: () => (toastId = null),
          });
        }
      }
    };
    socket.onerror = (e) => {
      console.error("WebSocket 에러:", e);
    };

    socket.onclose = () => {
      console.log("❌ HomePage WebSocket 연결 종료");
    };

    return () => {
      socket.close();
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center bg-gray-50">
      <TopGradient />
      <section className="z-1 flex h-[85%] w-[90%] flex-col items-center">
        <div className="flex w-full items-center justify-between">
          <Suspense fallback={<div>성향 불러오는 중...</div>}>
            <HomeHeader />
          </Suspense>
        </div>
        <div className="flex w-full flex-col gap-8 py-5">
          <FeatureBannerSlider />
          {/* Suspense로 감싸기 */}
          <div className="flex w-full flex-col">
            <h2 className="pl-4 text-lg font-semibold text-gray-900">
              최근 대화내역
            </h2>
            <ChatHistoryList />
          </div>
          <Suspense fallback={<div>추천 요금제 불러오는 중...</div>}>
            <HomeRecommendedPlan />
          </Suspense>
          <div className="flex w-full flex-col">
            <h2 className="pl-4 text-lg font-semibold text-gray-900">
              요즘 뜨는 요금제
            </h2>
            <PopularPlansList />
          </div>
        </div>
      </section>
    </div>
  );
}
