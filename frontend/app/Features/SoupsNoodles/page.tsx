import MenuPageLayout from "../components/MenuPageLayout";

export default function SoupsNoodlesPage() {
  const items = [
    { 
      name: "Final Destination", 
      price: 270, 
      image: "/Final_Destination.png",
      description: "The ultimate noodle experience - rich and hearty"
    },
    { 
      name: "Asim-Tomatic", 
      price: 260, 
      image: "/Asim-Tomatic.png",
      description: "Tangy and flavorful soup that's automatically delicious"
    },
    { 
      name: "The Goutfather", 
      price: 200, 
      image: "/The Goutfather.png",
      description: "Rich and indulgent soup - the don of all broths"
    },
    { 
      name: "PetmaLOMI", 
      price: 180, 
      image: "/PetmaLOMI.png",
      description: "Thick and hearty lomi noodles in savory broth"
    },
    { 
      name: "For Long Life", 
      price: 230, 
      image: "/For_Long_Life.png",
      description: "Nourishing soup believed to promote longevity"
    },
    { 
      name: "Palabok Overlog", 
      price: 200, 
      image: "/Palabok_Overlog.png",
      description: "Overloaded palabok with all the toppings"
    },
    { 
      name: "Longpia", 
      price: 150, 
      image: "/Longpia.png",
      description: "Fresh spring rolls with crisp vegetables"
    },
    { 
      name: "Rest in Fish", 
      price: 220, 
      image: "/Rest_in_Fish.png",
      description: "Fish-based soup that's to die for"
    },
    { 
      name: "Ensalada", 
      price: 120, 
      image: "/Ensalada.png",
      description: "Fresh mixed salad with house dressing"
    },
  ];

  return (
    <MenuPageLayout
      title="SOUPS & NOODLES"
      description="Warm your soul with our comforting selection of soups and noodles. From hearty broths to fresh salads, each dish is crafted to satisfy your cravings."
      items={items}
      bottomSection={{
        title: "Comfort in Every Bowl!",
        description: "All our soups and noodles are made fresh daily with quality ingredients. Perfect for any weather, served hot and ready to warm your heart.",
        badges: ["Served Hot", "Fresh Daily", "Quality Ingredients", "Generous Portions"]
      }}
    />
  );
}
