import MenuPageLayout from "../components/MenuPageLayout";

export default function BeveragesPage() {
  const items = [
    { 
      name: "Bottled Water", 
      price: 25, 
      image: "/Bottled_Water.png",
      description: "Pure refreshing water to cleanse your palate"
    },
    { 
      name: "Mountain Dew", 
      price: 50, 
      image: "/Mountain_Dew.png",
      description: "Citrus-flavored carbonated soft drink"
    },
    { 
      name: "Pineapple Juice", 
      price: 60, 
      image: "/Pineapple_Juice.png",
      description: "Fresh tropical pineapple juice"
    },
    { 
      name: "Coke", 
      price: 50, 
      image: "/Coke.png",
      description: "Classic Coca-Cola refreshment"
    },
    { 
      name: "Coke Zero", 
      price: 50, 
      image: "/Coke_Zero.png",
      description: "Zero sugar, same great Coke taste"
    },
    { 
      name: "Cucumber Iced Tea", 
      price: 45, 
      image: "/Cucumber_Iced_Tea.png",
      description: "Refreshing cucumber-infused iced tea"
    },
    { 
      name: "Sprite", 
      price: 50, 
      image: "/Sprite.png",
      description: "Crisp lemon-lime flavored soda"
    },
    { 
      name: "Royal", 
      price: 50, 
      image: "/Royal.png",
      description: "Orange-flavored carbonated drink"
    },
    { 
      name: "House Blend Iced Tea", 
      price: 40, 
      image: "/House_Blend_Iced_Tea.png",
      description: "Our signature house blend iced tea"
    },
  ];

  return (
    <MenuPageLayout
      title="BEVERAGES"
      description="Quench your thirst with our refreshing selection of beverages. From classic sodas to specialty iced teas, we have the perfect drink to complement your meal."
      items={items}
      bottomSection={{
        title: "Always Fresh & Cold!",
        description: "All our beverages are served ice-cold and fresh. Perfect for washing down our hearty meals or enjoying on their own. Free refills available for iced tea!",
        badges: ["Ice Cold", "Fresh Daily", "Free Iced Tea Refills", "No Preservatives"]
      }}
    />
  );
}
