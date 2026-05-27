import { Button } from "@/shared/ui";
import { ArrowDownRight } from "lucide-react";
import Image from "next/image";

const partners = [
  {
    id: 1,
    src: "/partners/1_mob.png",
  },
  {
    id: 2,
    src: "/partners/2_mob.png",
  },
  {
    id: 3,
    src: "/partners/3_mob.png",
  },
  {
    id: 4,
    src: "/partners/4_mob.png",
  },
  {
    id: 5,
    src: "/partners/5_mob.png",
  },
];

export const PartnersSection = () => {
  return (
    <section className="flex flex-col items-center gap-5 sm:gap-7.5 py-5 sm:py-10 w-full min-w-0 max-w-8xl mx-auto">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <h2 className="text-4xl sm:text-[45px] font-semibold text-typography">Партнёры</h2>
        <p className="text-typography text-sm">
          Мы открыты к сотрудничеству с ветеринарными клиниками, фондами,
          приютами
        </p>
      </div>
      <div className="w-full overflow-hidden">
        <div className="partners-carousel-track flex w-max gap-3">
          {[0, 1].map((groupIndex) => (
            <div
              key={groupIndex}
              className="flex shrink-0 gap-5"
              aria-hidden={groupIndex === 1}
            >
              {partners.map((partner) => (
                <div
                  key={`${groupIndex}-${partner.id}`}
                  className="flex h-18 w-30.5 sm:h-36 sm:w-61 shrink-0 items-center justify-center rounded-lg bg-white p-2.5"
                >
                  <Image
                    src={partner.src}
                    alt={`Partner ${partner.id}`}
                    width={205}
                    height={104}
                    className="max-h-13 object-contain w-25.5 h-13 sm:w-51 sm:min-h-26"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-full px-1 sm:justify-center">
        <Button className="max-sm:flex-1">Стать партнёром</Button>
        <Button size="icon">
          <ArrowDownRight />
        </Button>
      </div>
    </section>
  );
};
