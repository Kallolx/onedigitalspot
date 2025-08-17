import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ServiceCard from "@/components/custom/ServiceCard";
import { ChevronRight } from "lucide-react";

interface CategorySwiperProps {
  items: any[];
  isSubscription?: boolean;
  navigationPrevClass: string;
  navigationNextClass: string;
  autoplay?: boolean;
}

const CategorySwiper = ({
  items,
  isSubscription,
  navigationPrevClass,
  navigationNextClass,
  autoplay = false,
}: CategorySwiperProps) => (
  <div className="relative py-4">
    <Swiper
      modules={[Navigation, Autoplay]}
      navigation={{
        prevEl: navigationPrevClass,
        nextEl: navigationNextClass,
      }}
      autoplay={autoplay ? {
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      } : false}
      speed={1000}
      spaceBetween={16}
      slidesPerView={2}
      breakpoints={{
        640: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
      }}
      className="pb-2"
      loop={items.length > 4}
    >
      {items.map((item, idx) => (
        <SwiperSlide key={idx}>
          <ServiceCard {...item} isSubscription={isSubscription} />
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

export default CategorySwiper;