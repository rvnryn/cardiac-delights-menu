import MenuPageLayout from "../components/MenuPageLayout";

export default function ExtrasPage() {
  const riceItems = [
    { 
      name: "Plain Rice", 
      price: 25, 
      image: "/Plain_Rice.png",
      description: "Classic steamed jasmine rice - perfect as extra rice"
    },
    { 
      name: "Garlic Rice", 
      price: 35, 
      image: "/Garlic_Rice.png",
      description: "Fragrant rice with crispy garlic bits"
    },
    { 
      name: "Java Rice", 
      price: 40, 
      image: "/Java_Rice.png",
      description: "Colorful turmeric-infused rice"
    },
    { 
      name: "Bagoong Rice", 
      price: 45, 
      image: "/Bagoong_Rice.png",
      description: "Savory rice with fermented shrimp paste"
    },
    { 
      name: "Sizzling Garlic Rice", 
      price: 50, 
      image: "/Sizzling_Garlic_Rice.png",
      description: "Aromatic garlic rice served on a sizzling plate"
    },
  ];

  const sauceItems = [
    {
      name: "Kare Kare Sauce",
      price: 30,
      image: "/Kare_Kare_Sauce.png",
      description: "Rich peanut sauce perfect for dipping"
    },
    {
      name: "Chili Sauce",
      price: 15,
      image: "/Chili_Sauce.png",
      description: "Spicy chili sauce to add heat to any dish"
    },
  ];

  const eggItems = [
    {
      name: "Egg",
      price: 20,
      image: "/egg.jpg",
      description: "Fresh boiled egg"
    },
  ];

  const sections = [
    {
      title: "Rice Varieties",
      items: riceItems
    },
    {
      title: "Sauces & Condiments",
      items: sauceItems
    },
    {
      title: "Eggs",
      items: eggItems
    }
  ];

  return (
    <MenuPageLayout
      title="EXTRAS"
      description="Complete your meal with our selection of extras! From additional rice servings to flavorful sauces, customize your dining experience to your heart's content."
      sections={sections}
      items={[]} // Not used when sections are provided
      bottomSection={{
        title: "Customize Your Perfect Meal!",
        description: "Mix and match our extras to create your ideal dining experience. All rice is freshly cooked, sauces are made in-house, and everything is served at the perfect temperature!",
        badges: ["Fresh Rice", "House-made Sauces", "Hot & Fresh", "Affordable Add-ons"]
      }}
    />
  );
}
