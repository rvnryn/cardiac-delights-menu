import MenuPageLayout from "../components/MenuPageLayout";

export default function DessertsPage() {
  const items = [
    { 
      name: "Lecheng Saging", 
      price: 140, 
      image: "/Lecheng_Saging.png",
      description: "Creamy leche flan with sweet banana topping"
    },
    { 
      name: "Lecheng Mais", 
      price: 120, 
      image: "/Lecheng_Mais.png",
      description: "Smooth leche flan with sweet corn kernels"
    },
    { 
      name: "Lecheng Coffee Jelly", 
      price: 130, 
      image: "/Lecheng_Coffee_Jelly.png",
      description: "Rich leche flan with coffee jelly cubes"
    },
    { 
      name: "Nagkanda Leche-Leche", 
      price: 180, 
      image: "/Nagkanda_Leche-Leche.png",
      description: "Double leche dessert that's absolutely irresistible"
    },
  ];

  return (
    <MenuPageLayout
      title="DESSERTS"
      description="End your meal on a sweet note with our delicious desserts! Our signature leche desserts are made fresh daily and served chilled. Perfect for sharing or enjoying solo!"
      items={items}
      bottomSection={{
        title: "Sweet Endings!",
        description: "Our leche desserts are made fresh daily using traditional recipes and the finest ingredients. Each dessert is served chilled and perfectly portioned for the ultimate sweet experience!",
        badges: ["Fresh Daily", "Chilled Desserts", "Traditional Recipes", "Perfect Portions"]
      }}
    />
  );
}
