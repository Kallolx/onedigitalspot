import { useParams } from "react-router-dom";
import { mobileGames } from "@/lib/producs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MobileGameDetails = () => {
  const { id } = useParams<{ id: string }>();
  const game = mobileGames[Number(id)];

  if (!game) {
    return <div className="p-8 text-center text-lg">Game not found.</div>;
  }

  // Example purchase packages (could be dynamic per game)
  const packages = [
    { label: "Small Pack", price: Number(game.price) },
    { label: "Medium Pack", price: Number(game.price) * 2 },
    { label: "Large Pack", price: Number(game.price) * 4 },
  ];

  return (
    <section className="w-full max-w-2xl mx-auto py-8 px-4">
      <Card className="p-0 overflow-hidden mb-6">
        <img
          src={game.image}
          alt={game.title}
          className="w-full aspect-[16/9] object-cover object-center bg-muted"
        />
        <div className="p-4">
          <h1 className="font-bold text-2xl mb-2">{game.title}</h1>
          <div className="mb-2 text-muted-foreground text-sm">Category: {game.category}</div>
          <div className="mb-4 text-base">Rating: {"★".repeat(game.rating)}</div>
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Purchase Packages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {packages.map((pkg, i) => (
                <Card key={i} className="p-4 flex flex-col items-center">
                  <div className="font-bold text-lg mb-1">{pkg.label}</div>
                  <div className="text-primary font-pixel text-xl mb-2">৳{pkg.price}</div>
                  <Button size="sm" className="w-full">Buy Now</Button>
                </Card>
              ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-6">* All purchases are instant delivery. For support, contact our Help Center.</div>
        </div>
      </Card>
    </section>
  );
};

export default MobileGameDetails;
