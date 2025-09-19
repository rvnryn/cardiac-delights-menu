import MenuPageLayout from "../components/MenuPageLayout";

export default function RiceToppingsPage() {
  const items = [
    { 
      name: "Bagsilog", 
      price: 170, 
      image: "/Bagnet_Silog.png",
      description: "Crispy bagnet with garlic rice and fried egg"
    },
    { 
      name: "Beef Toppings Rice", 
      price: 175, 
      image: "/Bagnet_Bagoong_Rice.png",
      description: "Tender beef with savory bagoong rice"
    },
    { 
      name: "Beef Sisig Rice w/ Egg", 
      price: 250, 
      image: "/Tapa_Langit_Nawa.png",
      description: "Sizzling beef sisig with rice and egg"
    },
    { 
      name: "Sizzling Bagnet", 
      price: 185, 
      image: "/Kare-Kareng_Bagnet.png",
      description: "Crispy bagnet in rich kare-kare sauce"
    },
    { 
      name: "Tapa Sisig Sizzling Plate", 
      price: 190, 
      image: "/Triple_Bypass.png",
      description: "Sizzling tapa sisig that's dangerously delicious"
    },
    { 
      name: "Sizzling Sisig", 
      price: 175, 
      image: "/High_Blood.png",
      description: "Classic sizzling sisig with onions and chili"
    },
    { 
      name: "Sizzling Bangus", 
      price: 270, 
      image: "/Talong_at_Binagoongan.png",
      description: "Fresh bangus with eggplant and bagoong"
    },
    { 
      name: "Crispy Pata Rice", 
      price: 630, 
      image: "/CPR.png",
      description: "Whole crispy pork leg with rice - CPR special"
    },
    { 
      name: "Crispy Bicol Express Rice", 
      price: 185, 
      image: "/Code_Red.png",
      description: "Spicy Bicol Express with crispy pork and rice"
    },
  ];

  return (
    <MenuPageLayout
      title="RICE TOPPINGS"
      description="Hearty rice meals topped with our signature dishes. Each serving comes with perfectly cooked rice and your choice of delicious toppings."
      items={items}
      bottomSection={{
        title: "Unlimited Rice & Free Soup!",
        description: "All our rice toppings are served with unlimited rice and come with complimentary soup. Perfect for hearty appetites!",
        badges: ["Unlimited Rice", "Free Soup", "Fresh Daily", "Generous Portions"]
      }}
    />
  );
}
