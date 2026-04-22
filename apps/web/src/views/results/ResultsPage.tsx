import { Badge } from "@/shared/ui";
import { ResultCard } from "./ui/ResultCard";

const results = [
  {
    title: "VetCity",
    description: "Ветеринарная клиника",
    bloodCount: 18,
    plasmaCount: 6,
    img: "/partners/1_mob.png",
  },
  {
    title: "Animal Care",
    description: "Ветеринарная клиника",
    bloodCount: 12,
    plasmaCount: 7,
    img: "/partners/2_mob.png",
  },
  {
    title: "Pet Help Center",
    description: "Ветеринарная клиника",
    bloodCount: 22,
    plasmaCount: 9,
    img: "/partners/3_mob.png",
  },
  {
    title: "GoodVet",
    description: "Ветеринарная клиника",
    bloodCount: 10,
    plasmaCount: 5,
    img: "/partners/4_mob.png",
  },
  {
    title: "BioVet Lab",
    description: "Ветеринарная клиника",
    bloodCount: 17,
    plasmaCount: 10,
    img: "/partners/5_mob.png",
  },
  {
    title: "CityVet Plus",
    description: "Ветеринарная клиника",
    bloodCount: 14,
    plasmaCount: 8,
    img: "/partners/1_mob.png",
  },
  {
    title: "North Animal Clinic",
    description: "Ветеринарная клиника",
    bloodCount: 11,
    plasmaCount: 6,
    img: "/partners/2_mob.png",
  },
  {
    title: "FriendVet",
    description: "Ветеринарная клиника",
    bloodCount: 20,
    plasmaCount: 9,
    img: "/partners/3_mob.png",
  },
  {
    title: "Care Point",
    description: "Ветеринарная клиника",
    bloodCount: 8,
    plasmaCount: 5,
    img: "/partners/4_mob.png",
  },
] as const;

export function ResultsPage() {
  return (
    <main className="flex flex-col pb-5 sm:pb-15 rounded-t-3xl bg-background pt-5 sm:mx-auto sm:max-w-[calc(100%-16px)]">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <div className="flex flex-col items-center">
          <Badge>Донорство</Badge>
          <h1 className="text-4xl font-bold">Наши результаты</h1>
        </div>
        <p className="text-sm text-foreground/70">
          Партнеры, с которыми мы регулярно сотрудничаем, делятся своими
          результатами и фиксируют их на нашей платформе
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 sm:max-w-8xl sm:mx-auto w-full">
        {results.map((result) => (
          <ResultCard
            key={result.title}
            img={result.img}
            title={result.title}
            description={result.description}
            bloodCount={result.bloodCount}
            plasmaCount={result.plasmaCount}
          />
        ))}
      </div>
    </main>
  );
}

export default ResultsPage;
