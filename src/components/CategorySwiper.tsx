import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ServiceCard from "@/components/ServiceCard";
import { ChevronRight } from "lucide-react";

interface CategorySwiperProps {
  items: any[];
  isSubscription?: boolean;
  navigationPrevClass: string;
  navigationNextClass: string;
}

const CategorySwiper = ({
  items,
  isSubscription,
  navigationPrevClass,
  navigationNextClass,
}: CategorySwiperProps) => (
  <div className="relative py-4">
    <Swiper
      modules={[Navigation]}
      navigation={{
        prevEl: navigationPrevClass,
        nextEl: navigationNextClass,
      }}
      spaceBetween={16}
      slidesPerView={2}
      breakpoints={{
        640: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
      }}
      className="pb-2"
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