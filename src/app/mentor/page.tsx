"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Slider, { Settings } from "react-slick";
import JSConfetti from "js-confetti";

import { cls } from "@/utils/tailwindCss";
import { Icon } from "@/components/icon";
import Navigation from "@/components/layout/Navigation";
import GradingCard from "./GradingCard";
import { useRouter } from "next/navigation";
import {
  useGetMatchedImage,
  useModifyImage,
  useVerifyImage,
} from "@/state/react-query/image";
import useCheckAccount from "../hooks/useCheckAccount";

const settings: Settings = {
  dots: false,
  arrows: false,
  centerMode: true,
  autoplay: false,
  infinite: false,
  slidesToShow: 1,
  swipe: false,
  centerPadding: "0px",
};

const MentorPage = () => {
  const router = useRouter();
  const jsConfetti = useMemo(() => {
    if (typeof document !== "undefined") {
      return new JSConfetti();
    }
  }, []);
  const { address } = useCheckAccount();
  const { data } = useGetMatchedImage();
  const { mutate: verify } = useVerifyImage(address);
  const { mutate: modify } = useModifyImage(address);
  const sliderRef = useRef<Slider>(null);
  const [isWrongAnswer, setIsWrongAnswer] = useState<boolean>(false);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const handleProfile = () => {
    router.replace("/profile");
  };
  const handleNext = () => {
    sliderRef.current?.slickNext();
  };

  const beforeChange = (currentSlide: number, nextSlide: number) => {
    if (currentSlide === nextSlide) {
      jsConfetti && jsConfetti.addConfetti();
      setTimeout(() => {
        alert("채점 완료");
      }, 1000);
      return;
    }

    data && setCurrentAnswer(data[nextSlide].word);
    setIsWrongAnswer(false);
    setCurrentSlide(currentSlide);
  };

  const onComplete = () => {
    if (!data) return;

    const currentImage = data[currentSlide];
    verify({ imageId: currentImage.id });
    handleNext();
  };

  const handleWrongAnswer = () => {
    setIsWrongAnswer(true);
    setCurrentAnswer("");
  };

  const handleSubmit = () => {
    if (!currentAnswer.length) {
      alert("올바른 답을 입력해주세요.");
      return;
    }

    if (!data) return;

    const currentImage = data[currentSlide];
    modify({ imageId: currentImage.id, word: currentAnswer });
    onComplete();
  };

  useEffect(() => {
    data && setCurrentAnswer(data[0].word);
  }, [data]);

  return (
    <div className="w-full flex flex-col h-full bg-gray-100">
      <div className="px-20">
        <Navigation
          rightItem={
            <button className="w-24 h-24" onClick={handleProfile}>
              <Icon name="User" className="text-24" />
            </button>
          }
        />
      </div>

      <main className="pt-20 flex flex-col">
        <Slider
          className="w-full"
          ref={sliderRef}
          {...settings}
          beforeChange={beforeChange}
        >
          {data?.map((image) => (
            <div key={image.id} className="px-20">
              <GradingCard
                id={image.id}
                img={image.url}
                category={image.category}
                question={`What is the ${image.category}\nin the picture?`}
                answer={currentAnswer}
                date={image.updatedAt}
                isWrongAnswer={isWrongAnswer}
                handleAnswer={setCurrentAnswer}
              />
            </div>
          ))}
        </Slider>

        <div className="flex text-36 justify-center gap-20 py-20">
          <button
            type="button"
            onClick={handleWrongAnswer}
            className="p-16 rounded-full text-red bg-white"
          >
            <Icon name="ClearCircle" />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={cls(
              "p-16 bg-main text-white rounded-full font-bold text-18 leading-21",
              isWrongAnswer ? "visible" : "invisible"
            )}
          >
            제출
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={isWrongAnswer}
            className="p-16 bg-white rounded-full text-blue disabled:bg-gray-200 disabled:text-gray-300"
          >
            <Icon name="CheckCircle" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default MentorPage;
