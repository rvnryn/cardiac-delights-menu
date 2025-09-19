import MenuPageLayout from "../components/MenuPageLayout";

export default function SizzlersPage() {
  const items = [
    { 
      name: "Bagnet Sisig", 
      price: 190, 
      image: "/Bagnet_Sisig.png",
      description: "Crispy bagnet sisig with onions and peppers"
    },
    { 
      name: "Beef Pares", 
      price: 190, 
      image: "/Beef_Pares.png",
      description: "Tender beef pares in sweet soy sauce"
    },
    { 
      name: "Mild Stroke", 
      price: 290, 
      image: "/Mild_Stroke.png",
      description: "Mildly spiced sizzling dish that's heart-stopping"
    },
    { 
      name: "Brain Damage", 
      price: 300, 
      image: "/Brain_Damage.png",
      description: "Intensely flavored dish that'll blow your mind"
    },
    { 
      name: "Last Supper", 
      price: 315, 
      image: "/Last_Supper.png",
      description: "The ultimate sizzling experience - proceed with caution"
    },
    { 
      name: "Sizzling Garlic Rice", 
      price: 195, 
      image: "/Sizzling_Garlic_Rice.png",
      description: "Aromatic garlic rice served sizzling hot"
    },
    { 
      name: "Liemposuction", 
      price: 210, 
      image: "/Liemposuction.png",
      description: "Crispy liempo that'll suck the life out of you"
    },
    { 
      name: "Liemphoma", 
      price: 210, 
      image: "/Liemphoma.png",
      description: "Dangerously addictive crispy pork belly"
    },
    { 
      name: "The Goutfather", 
      price: 250, 
      image: "/The Goutfather.png",
      description: "Rich and indulgent - the don of all sizzlers"
    },
    { 
      name: "Final Destination", 
      price: 270, 
      image: "/Final_Destination.png",
      description: "The end of the line - our most extreme sizzler"
    },
  ];

  return (
    <MenuPageLayout
      title="SIZZLERS"
      description="Hot sizzling plates that arrive at your table still cooking! Each dish is served on a cast iron plate with rice and vegetables. Warning: These dishes are dangerously delicious!"
      items={items}
      bottomSection={{
        title: "Sizzling Hot Warning!",
        description: "All sizzlers are served on extremely hot cast iron plates. Please be careful when handling. Each order comes with rice, vegetables, and our signature sauce.",
        badges: ["Cast Iron Plate", "With Rice", "Fresh Vegetables", "Signature Sauce"]
      }}
    />
  );
}
